import { describe, expect, it } from "vitest";

import {
  describirRegla,
  ocurrenciasEntre,
  ocurrenciasPendientes,
  pendientesDelMes,
  reglaValida,
  type ReglaRecurrente,
} from "@/lib/calculos/recurrentes";

const mensual = (diaMes: number, extra: Partial<ReglaRecurrente> = {}): ReglaRecurrente => ({
  frecuencia: "MENSUAL",
  diaSemana: null,
  diaMes,
  mes: null,
  fechaInicio: "2026-01-01",
  fechaFin: null,
  activo: true,
  ultimaGenerada: null,
  ...extra,
});

describe("recurrente mensual", () => {
  it("un recurrente del día 31 cae el 30 de noviembre (criterio de la fase 4)", () => {
    expect(ocurrenciasEntre(mensual(31), "2026-11-01", "2026-11-30")).toEqual(["2026-11-30"]);
  });

  it("del 31 cae el último día de cada mes corto", () => {
    expect(ocurrenciasEntre(mensual(31), "2026-01-01", "2026-04-30")).toEqual([
      "2026-01-31",
      "2026-02-28",
      "2026-03-31",
      "2026-04-30",
    ]);
  });

  it("el 29 de febrero existe en año bisiesto", () => {
    expect(ocurrenciasEntre(mensual(30), "2028-02-01", "2028-02-29")).toEqual(["2028-02-29"]);
  });

  it("no genera antes de fechaInicio ni después de fechaFin", () => {
    const regla = mensual(15, { fechaInicio: "2026-03-20", fechaFin: "2026-06-10" });
    expect(ocurrenciasEntre(regla, "2026-01-01", "2026-12-31")).toEqual(["2026-04-15", "2026-05-15"]);
  });

  it("cruza de año", () => {
    expect(ocurrenciasEntre(mensual(5), "2026-11-01", "2027-02-28")).toEqual([
      "2026-11-05",
      "2026-12-05",
      "2027-01-05",
      "2027-02-05",
    ]);
  });
});

describe("recurrente semanal y anual", () => {
  it("semanal: cada lunes del tramo", () => {
    const regla: ReglaRecurrente = { ...mensual(1), frecuencia: "SEMANAL", diaSemana: 1, diaMes: null };
    // Noviembre de 2026 empieza en domingo: los lunes son 2, 9, 16, 23 y 30.
    expect(ocurrenciasEntre(regla, "2026-11-01", "2026-11-30")).toEqual([
      "2026-11-02",
      "2026-11-09",
      "2026-11-16",
      "2026-11-23",
      "2026-11-30",
    ]);
  });

  it("semanal: si el tramo empieza ese mismo día, lo incluye", () => {
    const regla: ReglaRecurrente = { ...mensual(1), frecuencia: "SEMANAL", diaSemana: 7, diaMes: null };
    expect(ocurrenciasEntre(regla, "2026-11-22", "2026-11-29")).toEqual(["2026-11-22", "2026-11-29"]);
  });

  it("anual: el 29 de febrero pasa al 28 en años no bisiestos", () => {
    const regla: ReglaRecurrente = { ...mensual(29), frecuencia: "ANUAL", mes: 2 };
    expect(ocurrenciasEntre(regla, "2026-01-01", "2028-12-31")).toEqual([
      "2026-02-28",
      "2027-02-28",
      "2028-02-29",
    ]);
  });
});

describe("pendientes de generar", () => {
  it("sin ultimaGenerada, genera desde fechaInicio hasta hoy", () => {
    const regla = mensual(10, { fechaInicio: "2026-09-01" });
    expect(ocurrenciasPendientes(regla, "2026-11-22")).toEqual(["2026-09-10", "2026-10-10", "2026-11-10"]);
  });

  it("con ultimaGenerada, solo lo posterior: correr dos veces el mismo día no repite", () => {
    const regla = mensual(10, { ultimaGenerada: "2026-11-22" });
    expect(ocurrenciasPendientes(regla, "2026-11-22")).toEqual([]);
  });

  it("si el cron falló varios días, recupera lo que faltó", () => {
    const regla = mensual(20, { ultimaGenerada: "2026-10-15" });
    expect(ocurrenciasPendientes(regla, "2026-11-22")).toEqual(["2026-10-20", "2026-11-20"]);
  });

  it("una regla en pausa no genera", () => {
    expect(ocurrenciasPendientes(mensual(10, { activo: false }), "2026-11-22")).toEqual([]);
  });

  it("una regla que empieza en el futuro no genera todavía", () => {
    expect(ocurrenciasPendientes(mensual(10, { fechaInicio: "2026-12-01" }), "2026-11-22")).toEqual([]);
  });

  it("pendientes del mes: las que faltan desde mañana hasta fin de mes", () => {
    expect(pendientesDelMes(mensual(30), "2026-11-22", "2026-11-30")).toEqual(["2026-11-30"]);
    expect(pendientesDelMes(mensual(5), "2026-11-22", "2026-11-30")).toEqual([]);
    expect(pendientesDelMes(mensual(30, { activo: false }), "2026-11-22", "2026-11-30")).toEqual([]);
  });
});

describe("validación y descripción", () => {
  it("cada frecuencia exige sus campos", () => {
    expect(reglaValida({ frecuencia: "SEMANAL", diaSemana: 8, diaMes: null, mes: null })).toBe(false);
    expect(reglaValida({ frecuencia: "MENSUAL", diaSemana: null, diaMes: 0, mes: null })).toBe(false);
    expect(reglaValida({ frecuencia: "ANUAL", diaSemana: null, diaMes: 10, mes: null })).toBe(false);
    expect(reglaValida({ frecuencia: "ANUAL", diaSemana: null, diaMes: 10, mes: 12 })).toBe(true);
    expect(() => ocurrenciasEntre({ ...mensual(1), diaMes: null }, "2026-01-01", "2026-01-31")).toThrow();
  });

  it("describe la regla en español", () => {
    expect(describirRegla({ frecuencia: "MENSUAL", diaSemana: null, diaMes: 31, mes: null })).toBe(
      "Cada mes, el día 31",
    );
    expect(describirRegla({ frecuencia: "SEMANAL", diaSemana: 5, diaMes: null, mes: null })).toBe(
      "Cada viernes",
    );
    expect(describirRegla({ frecuencia: "ANUAL", diaSemana: null, diaMes: 15, mes: 3 })).toBe(
      "Cada año, el 15 de marzo",
    );
  });
});
