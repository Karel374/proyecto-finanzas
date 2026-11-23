import { describe, expect, it } from "vitest";

import { agruparPorDia, promedioSiEsInusual, totales } from "@/lib/calculos/movimientos";

describe("totales", () => {
  it("suma ingresos y gastos por separado y calcula el balance", () => {
    expect(
      totales([
        { tipo: "INGRESO", montoCentavos: 50_000 },
        { tipo: "GASTO", montoCentavos: 350 },
        { tipo: "GASTO", montoCentavos: 1_200 },
      ]),
    ).toEqual({ ingresosCentavos: 50_000, gastosCentavos: 1_550, balanceCentavos: 48_450 });
  });

  it("sin movimientos todo es cero", () => {
    expect(totales([])).toEqual({ ingresosCentavos: 0, gastosCentavos: 0, balanceCentavos: 0 });
  });
});

describe("agruparPorDia", () => {
  it("agrupa en el orden recibido y calcula el subtotal de cada día", () => {
    const grupos = agruparPorDia([
      { id: "c", fecha: "2026-11-22", tipo: "GASTO" as const, montoCentavos: 350 },
      { id: "b", fecha: "2026-11-22", tipo: "INGRESO" as const, montoCentavos: 1_000 },
      { id: "a", fecha: "2026-11-21", tipo: "GASTO" as const, montoCentavos: 200 },
    ]);
    expect(grupos.map((g) => [g.fecha, g.subtotalCentavos, g.movimientos.map((m) => m.id)])).toEqual([
      ["2026-11-22", 650, ["c", "b"]],
      ["2026-11-21", -200, ["a"]],
    ]);
  });
});

describe("aviso de gasto inusual (sección 6)", () => {
  const previos = [5_000, 6_000, 7_000]; // promedio $60

  it("un gasto de más de 5 veces el promedio pide confirmación", () => {
    expect(promedioSiEsInusual(45_000, previos)).toBe(6_000);
  });

  it("justo 5 veces el promedio no avisa", () => {
    expect(promedioSiEsInusual(30_000, previos)).toBeNull();
    expect(promedioSiEsInusual(30_001, previos)).toBe(6_000);
  });

  it("con menos de 3 gastos previos no hay promedio confiable", () => {
    expect(promedioSiEsInusual(1_000_000, [100, 200])).toBeNull();
  });
});
