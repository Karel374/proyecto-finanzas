/**
 * Cuentas, movimientos, transferencias, plantillas y recurrentes contra PostgreSQL real (fase 4).
 * Se reemplaza solo la sesión; la capa lib/datos corre igual que en la app.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const sesion = vi.hoisted(() => ({ usuarioId: "" }));
vi.mock("@/lib/auth/sesion", () => ({
  usuarioIdActual: async () => sesion.usuarioId,
  obtenerSesion: async () => ({ user: { id: sesion.usuarioId } }),
}));
// refresh() solo existe dentro de una petición de Next: aquí no hace nada.
vi.mock("next/cache", () => ({ refresh: () => {} }));

import { clienteDelUsuario } from "@/lib/datos/cliente";
import { crearCuenta, cuadrarCuenta, cuentasConSaldos, archivarCuenta } from "@/lib/datos/cuentas";
import {
  borrarMovimiento,
  crearMovimiento,
  datosDelFormulario,
  listarMovimientos,
  restaurarMovimiento,
} from "@/lib/datos/movimientos";
import { crearPlantilla, listarPlantillas, usarPlantilla } from "@/lib/datos/plantillas";
import { prisma } from "@/lib/datos/prisma";
import { crearRecurrente, generarRecurrentes, pausarRecurrente } from "@/lib/datos/recurrentes";
import { crearUsuarioConSiembra } from "@/lib/datos/siembra";
import { tareasDiarias } from "@/lib/datos/tareas";
import { crearTransferencia } from "@/lib/datos/transferencias";
import { esquemaFiltrosMovimientos } from "@/lib/esquemas";
import { hoy } from "@/lib/fechas";

let usuario: string;
let otro: string;
let efectivo: string;
let alimentacion: string;
let sueldo: string;

const filtrosDelMes = esquemaFiltrosMovimientos.parse({});

async function nuevoUsuario() {
  const creado = await crearUsuarioConSiembra({ email: `fase4-${crypto.randomUUID()}@ejemplo.test` });
  return creado.id;
}

beforeAll(async () => {
  [usuario, otro] = await Promise.all([nuevoUsuario(), nuevoUsuario()]);
});

beforeEach(async () => {
  sesion.usuarioId = usuario;
  const db = clienteDelUsuario(usuario);
  // Cada prueba empieza sin movimientos, transferencias ni recurrentes.
  await db.movimiento.deleteMany();
  await db.transferencia.deleteMany();
  await db.recurrente.deleteMany();
  await db.conciliacion.deleteMany();
  await db.cuenta.deleteMany({ where: { nombre: { not: "Efectivo" } } });
  await db.ajustes.updateMany({ data: { plantillas: [] } });
  efectivo = (await db.cuenta.findFirstOrThrow({ where: { nombre: "Efectivo" } })).id;
  alimentacion = (await db.categoria.findFirstOrThrow({ where: { nombre: "Alimentación" } })).id;
  sueldo = (await db.categoria.findFirstOrThrow({ where: { nombre: "Pasantía o sueldo" } })).id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@ejemplo.test" } } });
  await prisma.$disconnect();
});

const gasto = (monto: number, extra: Partial<Parameters<typeof crearMovimiento>[0]> = {}) =>
  crearMovimiento({
    tipo: "GASTO",
    monto,
    categoriaId: alimentacion,
    cuentaId: efectivo,
    fecha: hoy(),
    nota: null,
    confirmarInusual: false,
    ...extra,
  });

describe("transferencias (criterio de la fase 4)", () => {
  it("una transferencia no cambia ingresos ni gastos, y mueve el saldo entre las cuentas", async () => {
    const banco = await crearCuenta({
      nombre: "Pichincha",
      tipo: "BANCO",
      institucion: null,
      saldoInicial: 100_000,
      fechaSaldoInicial: hoy(),
      cupo: null,
      diaCorte: null,
      diaPago: null,
    });
    await crearMovimiento({
      tipo: "INGRESO",
      monto: 50_000,
      categoriaId: sueldo,
      cuentaId: banco.id,
      fecha: hoy(),
      nota: null,
      confirmarInusual: false,
    });
    await gasto(1_500);

    const antes = await listarMovimientos(filtrosDelMes);
    const saldosAntes = await cuentasConSaldos();

    await crearTransferencia({
      cuentaOrigenId: banco.id,
      cuentaDestinoId: efectivo,
      monto: 20_000,
      fecha: hoy(),
      nota: "Cajero",
    });

    const despues = await listarMovimientos(filtrosDelMes);
    const saldosDespues = await cuentasConSaldos();

    expect(despues.resumen).toEqual(antes.resumen);
    expect(despues.cantidad).toBe(antes.cantidad);
    expect(saldosDespues.resumen.disponibleCentavos).toBe(saldosAntes.resumen.disponibleCentavos);

    const saldo = (lista: typeof saldosDespues, id: string) =>
      lista.cuentas.find((c) => c.id === id)!.saldoCentavos;
    expect(saldo(saldosDespues, banco.id)).toBe(saldo(saldosAntes, banco.id) - 20_000);
    expect(saldo(saldosDespues, efectivo)).toBe(saldo(saldosAntes, efectivo) + 20_000);
  });

  it("no se puede transferir a la misma cuenta ni a una cuenta de otro usuario", async () => {
    await expect(
      crearTransferencia({
        cuentaOrigenId: efectivo,
        cuentaDestinoId: efectivo,
        monto: 100,
        fecha: hoy(),
        nota: null,
      }),
    ).rejects.toMatchObject({ codigo: "VALIDACION" });

    const cuentaAjena = await prisma.cuenta.findFirstOrThrow({ where: { usuarioId: otro } });
    await expect(
      crearTransferencia({
        cuentaOrigenId: efectivo,
        cuentaDestinoId: cuentaAjena.id,
        monto: 100,
        fecha: hoy(),
        nota: null,
      }),
    ).rejects.toMatchObject({ codigo: "VALIDACION", campo: "cuentaDestinoId" });
  });

  it("pagar la tarjeta baja su deuda", async () => {
    const tarjeta = await crearCuenta({
      nombre: "Visa",
      tipo: "TARJETA_CREDITO",
      institucion: null,
      saldoInicial: 30_000,
      fechaSaldoInicial: hoy(),
      cupo: 100_000,
      diaCorte: 5,
      diaPago: 20,
    });
    await crearTransferencia({
      cuentaOrigenId: efectivo,
      cuentaDestinoId: tarjeta.id,
      monto: 10_000,
      fecha: hoy(),
      nota: null,
    });
    const { cuentas, resumen } = await cuentasConSaldos();
    expect(cuentas.find((c) => c.id === tarjeta.id)?.saldoCentavos).toBe(20_000);
    expect(resumen.deudaTarjetasCentavos).toBe(20_000);
  });
});

describe("recurrentes y cron (criterios de la fase 4)", () => {
  const reglaMensual31 = () => ({
    tipo: "GASTO" as const,
    monto: 35_000,
    categoriaId: alimentacion,
    cuentaId: efectivo,
    nota: "Arriendo",
    frecuencia: "MENSUAL" as const,
    diaSemana: null,
    diaMes: 31,
    mes: null,
    fechaInicio: "2026-11-01",
    fechaFin: null,
  });

  /** Regla guardada sin generar nada, para que la prueba no dependa de la fecha real. */
  async function reglaSinGenerar(diaMes: number) {
    const regla = await clienteDelUsuario(usuario).recurrente.create({
      data: {
        usuarioId: "",
        tipo: "GASTO",
        montoCentavos: 35_000,
        categoriaId: alimentacion,
        cuentaId: efectivo,
        nota: "Arriendo",
        frecuencia: "MENSUAL",
        diaMes,
        fechaInicio: new Date("2026-11-01T00:00:00Z"),
      },
    });
    return regla.id;
  }

  const fechasDe = async (recurrenteId: string) =>
    (await prisma.movimiento.findMany({ where: { recurrenteId }, orderBy: { fecha: "asc" } })).map((m) =>
      m.fecha.toISOString().slice(0, 10),
    );

  it("un recurrente del día 31 cae el 30 de noviembre", async () => {
    const id = await reglaSinGenerar(31);
    await generarRecurrentes(clienteDelUsuario(usuario), "2026-11-30");
    expect(await fechasDe(id)).toEqual(["2026-11-30"]);
  });

  it("correr el cron dos veces no duplica nada", async () => {
    const id = await reglaSinGenerar(1);
    const primera = await tareasDiarias("2027-01-15");
    const segunda = await tareasDiarias("2027-01-15");
    expect(primera.movimientosCreados).toBeGreaterThanOrEqual(3);
    expect(segunda.movimientosCreados).toBe(0);
    expect(await fechasDe(id)).toEqual(["2026-11-01", "2026-12-01", "2027-01-01"]);
  });

  it("aunque dos ejecuciones se crucen, la base no deja duplicar una fecha", async () => {
    const id = await reglaSinGenerar(1);
    await Promise.all([
      generarRecurrentes(clienteDelUsuario(usuario), "2026-12-15"),
      generarRecurrentes(clienteDelUsuario(usuario), "2026-12-15"),
    ]);
    expect(await prisma.movimiento.count({ where: { recurrenteId: id } })).toBe(2);
  });

  it("al reactivar un recurrente en pausa no se crean los meses que estuvo pausado", async () => {
    const id = await reglaSinGenerar(1);
    await generarRecurrentes(clienteDelUsuario(usuario), "2026-11-15");
    const antes = await prisma.movimiento.count({ where: { recurrenteId: id } });
    await pausarRecurrente(id, false);
    await generarRecurrentes(clienteDelUsuario(usuario), "2027-03-15");
    expect(await prisma.movimiento.count({ where: { recurrenteId: id } })).toBe(antes);

    await pausarRecurrente(id, true); // ultimaGenerada salta a hoy
    const regla = await prisma.recurrente.findUniqueOrThrow({ where: { id } });
    expect(regla.ultimaGenerada?.toISOString().slice(0, 10)).toBe(hoy());
  });

  it("los movimientos generados llevan su recurrente y el método de pago de la cuenta", async () => {
    const { id } = await crearRecurrente({ ...reglaMensual31(), diaMes: 1 });
    const movimiento = await prisma.movimiento.findFirstOrThrow({ where: { recurrenteId: id } });
    expect(movimiento).toMatchObject({ metodoPago: "EFECTIVO", nota: "Arriendo", montoCentavos: 35_000 });
    const pagina = await listarMovimientos(esquemaFiltrosMovimientos.parse({ periodo: "ANIO" }));
    expect(pagina.movimientos.find((m) => m.id === movimiento.id)?.automatico).toBe(true);
  });
});

describe("movimientos", () => {
  it("rechaza una categoría de otro tipo, archivada o de otro usuario", async () => {
    await expect(gasto(100, { categoriaId: sueldo })).rejects.toMatchObject({ campo: "categoriaId" });

    const ajena = await prisma.categoria.findFirstOrThrow({ where: { usuarioId: otro, tipo: "GASTO" } });
    await expect(gasto(100, { categoriaId: ajena.id })).rejects.toMatchObject({ campo: "categoriaId" });

    const cuentaAjena = await prisma.cuenta.findFirstOrThrow({ where: { usuarioId: otro } });
    await expect(gasto(100, { cuentaId: cuentaAjena.id })).rejects.toMatchObject({ campo: "cuentaId" });
  });

  it("completa el método de pago según la cuenta y recuerda la última categoría y cuenta", async () => {
    const { id } = await gasto(350);
    expect((await prisma.movimiento.findUniqueOrThrow({ where: { id } })).metodoPago).toBe("EFECTIVO");
    const formulario = await datosDelFormulario();
    expect(formulario.ultimas).toMatchObject({ GASTO: alimentacion, cuenta: efectivo });
  });

  it("un gasto de más de 5 veces el promedio de su categoría pide confirmación", async () => {
    await gasto(5_000);
    await gasto(6_000);
    await gasto(7_000);
    await expect(gasto(45_000)).rejects.toMatchObject({
      codigo: "CONFIRMAR",
      message: "¿Seguro que son $450,00? Sueles gastar $60,00 en Alimentación",
    });
    await expect(gasto(45_000, { confirmarInusual: true })).resolves.toHaveProperty("id");
  });

  it("borrar y deshacer deja el movimiento igual que antes", async () => {
    const { id } = await gasto(1_234, { nota: "Almuerzo" });
    const copia = await borrarMovimiento(id);
    expect(await prisma.movimiento.count({ where: { id } })).toBe(0);
    await restaurarMovimiento(copia);
    const restaurado = await prisma.movimiento.findUniqueOrThrow({ where: { id } });
    expect(restaurado).toMatchObject({ montoCentavos: 1_234, nota: "Almuerzo" });
    expect(restaurado.creadoEn.toISOString()).toBe(copia.creadoEn);
  });

  it("la lista filtra por tipo y texto, y los totales son del resultado filtrado", async () => {
    await gasto(350, { nota: "Almuerzo" });
    await gasto(1_200, { nota: "Supermercado" });
    await crearMovimiento({
      tipo: "INGRESO",
      monto: 40_000,
      categoriaId: sueldo,
      cuentaId: efectivo,
      fecha: hoy(),
      nota: null,
      confirmarInusual: false,
    });

    const todo = await listarMovimientos(filtrosDelMes);
    expect(todo.resumen).toEqual({
      ingresosCentavos: 40_000,
      gastosCentavos: 1_550,
      balanceCentavos: 38_450,
    });

    const soloAlmuerzo = await listarMovimientos(esquemaFiltrosMovimientos.parse({ texto: "almu" }));
    expect(soloAlmuerzo.movimientos.map((m) => m.nota)).toEqual(["Almuerzo"]);
    expect(soloAlmuerzo.resumen.gastosCentavos).toBe(350);

    const soloGastos = await listarMovimientos(esquemaFiltrosMovimientos.parse({ tipo: "GASTO" }));
    expect(soloGastos.cantidad).toBe(2);
    // Orden: fecha más reciente y, dentro del día, el último registrado primero.
    expect(soloGastos.movimientos.map((m) => m.nota)).toEqual(["Supermercado", "Almuerzo"]);
  });
});

describe("plantillas", () => {
  it("guardan el movimiento con fecha de hoy y admiten hasta 6", async () => {
    const plantilla = await crearPlantilla({
      nombre: "Almuerzo",
      tipo: "GASTO",
      monto: 350,
      categoriaId: alimentacion,
      cuentaId: efectivo,
      nota: "Almuerzo",
    });
    const { id } = await usarPlantilla(plantilla.id);
    const movimiento = await prisma.movimiento.findUniqueOrThrow({ where: { id } });
    expect(movimiento.fecha.toISOString().slice(0, 10)).toBe(hoy());
    expect(movimiento.montoCentavos).toBe(350);

    for (let i = 2; i <= 6; i++) {
      await crearPlantilla({
        nombre: `P${i}`,
        tipo: "GASTO",
        monto: 100,
        categoriaId: alimentacion,
        cuentaId: efectivo,
        nota: null,
      });
    }
    expect(await listarPlantillas()).toHaveLength(6);
    await expect(
      crearPlantilla({
        nombre: "P7",
        tipo: "GASTO",
        monto: 100,
        categoriaId: alimentacion,
        cuentaId: efectivo,
        nota: null,
      }),
    ).rejects.toMatchObject({ codigo: "VALIDACION" });
  });
});

describe("cuadrar con el banco", () => {
  it("guarda la diferencia y, si se pide, crea un ajuste que deja el saldo igual al real", async () => {
    await gasto(1_000);
    const { cuentas } = await cuentasConSaldos();
    const saldoApp = cuentas.find((c) => c.id === efectivo)!.saldoCentavos;

    const resultado = await cuadrarCuenta({
      cuentaId: efectivo,
      saldoReal: saldoApp + 250,
      crearAjuste: true,
    });
    expect(resultado).toMatchObject({ diferenciaCentavos: 250, ajusteCreado: true });

    const despues = (await cuentasConSaldos()).cuentas.find((c) => c.id === efectivo)!.saldoCentavos;
    expect(despues).toBe(saldoApp + 250);
    const ajuste = await prisma.movimiento.findFirstOrThrow({
      where: { usuarioId: usuario, esAjuste: true },
    });
    expect(ajuste).toMatchObject({ tipo: "INGRESO", montoCentavos: 250 });
    const conciliacion = await prisma.conciliacion.findFirstOrThrow({ where: { usuarioId: usuario } });
    expect(conciliacion).toMatchObject({ diferenciaCentavos: 250, resuelta: true });
  });

  it("sin ajuste, la diferencia queda sin resolver (alimenta la regla R22)", async () => {
    await cuadrarCuenta({ cuentaId: efectivo, saldoReal: 9_999, crearAjuste: false });
    const conciliacion = await prisma.conciliacion.findFirstOrThrow({ where: { usuarioId: usuario } });
    expect(conciliacion.resuelta).toBe(false);
  });
});

describe("cuentas", () => {
  it("no se puede archivar la última cuenta activa", async () => {
    await expect(archivarCuenta(efectivo)).rejects.toMatchObject({ codigo: "EN_USO" });
  });
});
