/**
 * Verifica contra PostgreSQL real que las restricciones de la migración existen:
 * CHECK, índices únicos (normales y parciales) y borrado en cascada.
 * Requiere la base levantada (docker compose up) y migrada.
 */
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/datos/prisma";

const fecha = (iso: string) => new Date(`${iso}T00:00:00Z`);

let usuarioId: string;
let cuentaId: string;
let cuenta2Id: string;
let categoriaId: string;

beforeEach(async () => {
  const usuario = await prisma.user.create({
    data: { email: `prueba-${crypto.randomUUID()}@ejemplo.test`, name: "Usuario de prueba" },
  });
  usuarioId = usuario.id;
  const [efectivo, banco] = await Promise.all([
    prisma.cuenta.create({
      data: { usuarioId, nombre: "Efectivo", tipo: "EFECTIVO", fechaSaldoInicial: fecha("2026-01-01") },
    }),
    prisma.cuenta.create({
      data: { usuarioId, nombre: "Banco", tipo: "BANCO", fechaSaldoInicial: fecha("2026-01-01") },
    }),
  ]);
  cuentaId = efectivo.id;
  cuenta2Id = banco.id;
  const categoria = await prisma.categoria.create({
    data: { usuarioId, nombre: "Alimentación", tipo: "GASTO", clase: "NECESIDAD", colorSlot: 1, orden: 1 },
  });
  categoriaId = categoria.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@ejemplo.test" } } });
  await prisma.$disconnect();
});

const movimiento = (montoCentavos: number) => ({
  usuarioId,
  tipo: "GASTO" as const,
  montoCentavos,
  categoriaId,
  cuentaId,
  fecha: fecha("2026-11-10"),
  metodoPago: "EFECTIVO" as const,
});

describe("restricciones CHECK", () => {
  it("rechaza un movimiento con monto cero o negativo", async () => {
    await expect(prisma.movimiento.create({ data: movimiento(0) })).rejects.toThrow();
    await expect(prisma.movimiento.create({ data: movimiento(-100) })).rejects.toThrow();
    await expect(prisma.movimiento.create({ data: movimiento(1) })).resolves.toBeDefined();
  });

  it("rechaza un movimiento de más de $1.000.000", async () => {
    await expect(prisma.movimiento.create({ data: movimiento(100_000_001) })).rejects.toThrow();
    await expect(prisma.movimiento.create({ data: movimiento(100_000_000) })).resolves.toBeDefined();
  });

  it("rechaza un presupuesto con monto cero", async () => {
    await expect(
      prisma.presupuesto.create({
        data: { usuarioId, categoriaId, montoMensualCentavos: 0, vigenteDesde: "2026-11" },
      }),
    ).rejects.toThrow();
  });

  it("rechaza un recurrente con monto cero", async () => {
    await expect(
      prisma.recurrente.create({
        data: {
          usuarioId,
          tipo: "GASTO",
          montoCentavos: 0,
          categoriaId,
          cuentaId,
          frecuencia: "MENSUAL",
          diaMes: 31,
          fechaInicio: fecha("2026-01-01"),
        },
      }),
    ).rejects.toThrow();
  });
});

describe("transferencias", () => {
  const transferencia = (datos: { cuentaOrigenId?: string; cuentaDestinoId?: string; deudaId?: string }) =>
    prisma.transferencia.create({
      data: { usuarioId, montoCentavos: 1000, fecha: fecha("2026-11-10"), ...datos },
    });

  it("acepta dos cuentas distintas y rechaza la misma cuenta", async () => {
    await expect(
      transferencia({ cuentaOrigenId: cuentaId, cuentaDestinoId: cuenta2Id }),
    ).resolves.toBeDefined();
    await expect(transferencia({ cuentaOrigenId: cuentaId, cuentaDestinoId: cuentaId })).rejects.toThrow();
  });

  it("rechaza una sola cuenta sin contraparte", async () => {
    await expect(transferencia({ cuentaOrigenId: cuentaId })).rejects.toThrow();
  });

  it("acepta una sola cuenta cuando es el pago de capital de una deuda", async () => {
    const deuda = await prisma.deuda.create({
      data: {
        usuarioId,
        nombre: "Préstamo educativo",
        tipo: "EDUCATIVA",
        montoOriginalCentavos: 500_000,
        saldoCentavos: 400_000,
        tasaAnual: "12.5",
        cuotaCentavos: 20_000,
        diaPago: 15,
        fechaInicio: fecha("2026-01-15"),
      },
    });
    await expect(transferencia({ cuentaOrigenId: cuentaId, deudaId: deuda.id })).resolves.toBeDefined();
  });
});

describe("índices únicos", () => {
  it("un recurrente no puede generar dos movimientos en la misma fecha", async () => {
    const recurrente = await prisma.recurrente.create({
      data: {
        usuarioId,
        tipo: "GASTO",
        montoCentavos: 1500,
        categoriaId,
        cuentaId,
        frecuencia: "MENSUAL",
        diaMes: 30,
        fechaInicio: fecha("2026-01-01"),
      },
    });
    const ocurrencia = { ...movimiento(1500), recurrenteId: recurrente.id, fecha: fecha("2026-11-30") };
    await prisma.movimiento.create({ data: ocurrencia });
    await expect(prisma.movimiento.create({ data: ocurrencia })).rejects.toThrow();
  });

  it("solo existe una meta de fondo de emergencia por usuario", async () => {
    const meta = (esFondoEmergencia: boolean) => ({
      usuarioId,
      nombre: esFondoEmergencia ? "Fondo de emergencia" : "Laptop",
      montoObjetivoCentavos: 100_000,
      fechaObjetivo: fecha("2027-06-30"),
      esFondoEmergencia,
    });
    await prisma.meta.create({ data: meta(true) });
    await expect(prisma.meta.create({ data: meta(true) })).rejects.toThrow();
    await expect(prisma.meta.create({ data: meta(false) })).resolves.toBeDefined();
    await expect(prisma.meta.create({ data: meta(false) })).resolves.toBeDefined();
  });

  it("una sola foto automática por mes, las manuales sin límite", async () => {
    const foto = (manual: boolean) => ({
      usuarioId,
      fecha: fecha("2026-11-01"),
      mes: "2026-11",
      activosPorTipo: {},
      pasivosPorTipo: {},
      netoCentavos: 0,
      manual,
    });
    await prisma.fotoPatrimonio.create({ data: foto(false) });
    await expect(prisma.fotoPatrimonio.create({ data: foto(false) })).rejects.toThrow();
    await expect(prisma.fotoPatrimonio.create({ data: foto(true) })).resolves.toBeDefined();
    await expect(prisma.fotoPatrimonio.create({ data: foto(true) })).resolves.toBeDefined();
  });
});

describe("borrado", () => {
  it("una categoría con movimientos no se puede borrar", async () => {
    await prisma.movimiento.create({ data: movimiento(500) });
    await expect(prisma.categoria.delete({ where: { id: categoriaId } })).rejects.toThrow();
  });

  it("borrar el usuario borra todos sus datos en cascada", async () => {
    await prisma.movimiento.create({ data: movimiento(500) });
    await prisma.user.delete({ where: { id: usuarioId } });
    const [movimientos, categorias, cuentas] = await Promise.all([
      prisma.movimiento.count({ where: { usuarioId } }),
      prisma.categoria.count({ where: { usuarioId } }),
      prisma.cuenta.count({ where: { usuarioId } }),
    ]);
    expect(movimientos + categorias + cuentas).toBe(0);
  });
});
