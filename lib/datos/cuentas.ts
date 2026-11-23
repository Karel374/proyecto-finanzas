import { ErrorDeAccion } from "@/lib/acciones";
import {
  ajusteParaCuadrar,
  calcularSaldo,
  metodoPagoDeCuenta,
  resumirCuentas,
  type CuentaConSaldo,
  type TipoCuenta,
} from "@/lib/calculos/cuentas";
import { aColumnaDate, deColumnaDate, hoy } from "@/lib/fechas";

import { datosDelUsuario, DEL_USUARIO, type ClienteDelUsuario } from "./cliente";

type Cuenta = Awaited<ReturnType<ClienteDelUsuario["cuenta"]["findFirstOrThrow"]>>;

/** Totales de una cuenta desde su fecha de saldo inicial, y su saldo (deuda, si es tarjeta). */
async function saldoDe(db: ClienteDelUsuario, cuenta: Cuenta): Promise<number> {
  const desde = cuenta.fechaSaldoInicial;
  const [porTipo, entradas, salidas] = await Promise.all([
    db.movimiento.groupBy({
      by: ["tipo"],
      where: { cuentaId: cuenta.id, fecha: { gte: desde } },
      _sum: { montoCentavos: true },
    }),
    db.transferencia.aggregate({
      where: { cuentaDestinoId: cuenta.id, fecha: { gte: desde } },
      _sum: { montoCentavos: true },
    }),
    db.transferencia.aggregate({
      where: { cuentaOrigenId: cuenta.id, fecha: { gte: desde } },
      _sum: { montoCentavos: true },
    }),
  ]);
  const suma = (tipo: "GASTO" | "INGRESO") =>
    porTipo.find((grupo) => grupo.tipo === tipo)?._sum.montoCentavos ?? 0;

  return calcularSaldo(cuenta.tipo, cuenta.saldoInicialCentavos, {
    ingresos: suma("INGRESO"),
    gastos: suma("GASTO"),
    entradas: entradas._sum.montoCentavos ?? 0,
    salidas: salidas._sum.montoCentavos ?? 0,
  });
}

/** Cuentas activas del usuario de la sesión, sin saldos (para selectores). */
export async function listarCuentas() {
  const db = await datosDelUsuario();
  return db.cuenta.findMany({ where: { archivada: false }, orderBy: [{ tipo: "asc" }, { nombre: "asc" }] });
}

/** Una cuenta del usuario de la sesión. Si es de otro usuario, devuelve null como si no existiera. */
export async function obtenerCuenta(id: string) {
  const db = await datosDelUsuario();
  return db.cuenta.findUnique({ where: { id } });
}

/** Cuentas activas con su saldo, más el resumen de la vista de Cuentas (sección 15). */
export async function cuentasConSaldos() {
  const db = await datosDelUsuario();
  const cuentas = await db.cuenta.findMany({
    where: { archivada: false },
    orderBy: [{ tipo: "asc" }, { nombre: "asc" }],
  });
  const saldos = await Promise.all(cuentas.map((cuenta) => saldoDe(db, cuenta)));
  const conSaldo = cuentas.map((cuenta, i) => ({
    id: cuenta.id,
    nombre: cuenta.nombre,
    tipo: cuenta.tipo as TipoCuenta,
    institucion: cuenta.institucion,
    saldoCentavos: saldos[i],
    cupoCentavos: cuenta.cupoCentavos,
    diaCorte: cuenta.diaCorte,
    diaPago: cuenta.diaPago,
    fechaSaldoInicial: deColumnaDate(cuenta.fechaSaldoInicial),
  }));
  const resumen = resumirCuentas(conSaldo satisfies CuentaConSaldo[], hoy());
  return { cuentas: conSaldo, resumen };
}

type DatosCuenta = {
  nombre: string;
  tipo: TipoCuenta;
  institucion: string | null;
  saldoInicial: number;
  fechaSaldoInicial: string;
  cupo: number | null;
  diaCorte: number | null;
  diaPago: number | null;
};

export async function crearCuenta(datos: DatosCuenta) {
  const db = await datosDelUsuario();
  return db.cuenta.create({
    data: {
      usuarioId: DEL_USUARIO,
      nombre: datos.nombre,
      tipo: datos.tipo,
      institucion: datos.institucion,
      saldoInicialCentavos: datos.saldoInicial,
      fechaSaldoInicial: aColumnaDate(datos.fechaSaldoInicial),
      cupoCentavos: datos.cupo,
      diaCorte: datos.diaCorte,
      diaPago: datos.diaPago,
    },
  });
}

/** Edita nombre, institución y datos de tarjeta. El tipo y el saldo inicial no cambian. */
export async function editarCuenta(datos: {
  id: string;
  nombre: string;
  institucion: string | null;
  cupo: number | null;
  diaCorte: number | null;
  diaPago: number | null;
}) {
  const db = await datosDelUsuario();
  const cuenta = await db.cuenta.findUnique({ where: { id: datos.id } });
  if (!cuenta) throw new ErrorDeAccion("NO_ENCONTRADO", "No se encontró la cuenta");
  const esTarjeta = cuenta.tipo === "TARJETA_CREDITO";
  return db.cuenta.update({
    where: { id: datos.id },
    data: {
      nombre: datos.nombre,
      institucion: datos.institucion,
      cupoCentavos: esTarjeta ? datos.cupo : null,
      diaCorte: esTarjeta ? datos.diaCorte : null,
      diaPago: esTarjeta ? datos.diaPago : null,
    },
  });
}

/** Archiva una cuenta: deja de aparecer en el formulario y conserva su historial. */
export async function archivarCuenta(id: string) {
  const db = await datosDelUsuario();
  const activas = await db.cuenta.count({ where: { archivada: false } });
  const cuenta = await db.cuenta.findUnique({ where: { id } });
  if (!cuenta || cuenta.archivada) throw new ErrorDeAccion("NO_ENCONTRADO", "No se encontró la cuenta");
  if (activas <= 1) throw new ErrorDeAccion("EN_USO", "Necesitas al menos una cuenta activa");
  await db.cuenta.update({ where: { id }, data: { archivada: true } });
}

/**
 * Cuadrar con el banco (sección 15): guarda el saldo real y la diferencia. Si se pide, crea un
 * movimiento de ajuste marcado como tal que deja el saldo de la app igual al real.
 */
export async function cuadrarCuenta(datos: { cuentaId: string; saldoReal: number; crearAjuste: boolean }) {
  const db = await datosDelUsuario();
  const cuenta = await db.cuenta.findUnique({ where: { id: datos.cuentaId } });
  if (!cuenta || cuenta.archivada) throw new ErrorDeAccion("NO_ENCONTRADO", "No se encontró la cuenta");

  const calculado = await saldoDe(db, cuenta);
  const { diferenciaCentavos, ajuste } = ajusteParaCuadrar(cuenta.tipo, calculado, datos.saldoReal);
  const fecha = aColumnaDate(hoy());

  await db.$transaction(async (tx) => {
    if (ajuste && datos.crearAjuste) {
      const categoria = await categoriaDeAjuste(tx, ajuste.tipo);
      await tx.movimiento.create({
        data: {
          usuarioId: DEL_USUARIO,
          tipo: ajuste.tipo,
          montoCentavos: ajuste.montoCentavos,
          categoriaId: categoria.id,
          cuentaId: cuenta.id,
          fecha,
          nota: "Ajuste al cuadrar con el banco",
          metodoPago: metodoPagoDeCuenta(cuenta.tipo),
          esAjuste: true,
        },
      });
    }
    await tx.conciliacion.create({
      data: {
        usuarioId: DEL_USUARIO,
        cuentaId: cuenta.id,
        fecha,
        saldoRealCentavos: datos.saldoReal,
        diferenciaCentavos,
        resuelta: diferenciaCentavos === 0 || datos.crearAjuste,
      },
    });
  });

  return {
    saldoCalculadoCentavos: calculado,
    diferenciaCentavos,
    ajusteCreado: Boolean(ajuste && datos.crearAjuste),
  };
}

/** Los ajustes van a "Otros" de su tipo; si el usuario la renombró, a la última categoría no de sistema. */
async function categoriaDeAjuste(db: Pick<ClienteDelUsuario, "categoria">, tipo: "GASTO" | "INGRESO") {
  const otros = await db.categoria.findFirst({ where: { tipo, nombre: "Otros", sistema: null } });
  if (otros) return otros;
  const ultima = await db.categoria.findFirst({ where: { tipo, sistema: null }, orderBy: { orden: "desc" } });
  if (!ultima) throw new ErrorDeAccion("INESPERADO", "No hay categorías para registrar el ajuste");
  return ultima;
}
