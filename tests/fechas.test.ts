import { describe, expect, it } from "vitest";

import {
  aColumnaDate,
  ayer,
  deColumnaDate,
  diaDeLaSemana,
  diasDelMes,
  diasEntre,
  diasRestantes,
  diasTranscurridos,
  esBisiesto,
  esFechaISO,
  estaEnCurso,
  fechaConDiaAjustado,
  fechaEnEcuador,
  finDeMes,
  finDeSemana,
  formatearDia,
  formatearFecha,
  hoy,
  inicioDeSemana,
  limitesFechaMovimiento,
  mesDe,
  periodo,
  periodoAnterior,
  sumarAnios,
  sumarDias,
  sumarMeses,
} from "@/lib/fechas";

describe("semana de lunes a domingo (criterio de la fase 3)", () => {
  // Noviembre de 2026: el lunes 16 y el domingo 22 cierran una semana.
  it.each([
    ["2026-11-16", "2026-11-16", "2026-11-22"], // lunes: empieza su propia semana
    ["2026-11-19", "2026-11-16", "2026-11-22"], // jueves
    ["2026-11-22", "2026-11-16", "2026-11-22"], // domingo: es el último día, no el primero
    ["2026-11-23", "2026-11-23", "2026-11-29"], // el lunes siguiente abre otra semana
  ])("%s está en la semana del %s al %s", (fecha, lunes, domingo) => {
    expect(inicioDeSemana(fecha)).toBe(lunes);
    expect(finDeSemana(fecha)).toBe(domingo);
  });

  it("una semana que cruza de mes y de año", () => {
    expect(inicioDeSemana("2027-01-01")).toBe("2026-12-28");
    expect(finDeSemana("2026-12-28")).toBe("2027-01-03");
  });

  it("numera los días con 1 = lunes y 7 = domingo", () => {
    expect(diaDeLaSemana("2026-11-16")).toBe(1);
    expect(diaDeLaSemana("2026-11-22")).toBe(7);
  });

  it("el período Esta semana va de lunes a domingo y tiene 7 días", () => {
    const semana = periodo("SEMANA", "2026-11-18");
    expect(semana).toEqual({ tipo: "SEMANA", desde: "2026-11-16", hasta: "2026-11-22" });
    expect(diasEntre(semana.desde, semana.hasta)).toBe(7);
  });
});

describe("zona de Ecuador cerca de medianoche (criterio de la fase 3)", () => {
  // Ecuador está en UTC−5 todo el año, sin horario de verano.
  it("a las 23:59 de Ecuador todavía es el mismo día, aunque en UTC ya sea el siguiente", () => {
    expect(fechaEnEcuador(new Date("2026-12-01T04:59:59Z"))).toBe("2026-11-30");
  });

  it("a las 00:00 de Ecuador ya es el día siguiente", () => {
    expect(fechaEnEcuador(new Date("2026-12-01T05:00:00Z"))).toBe("2026-12-01");
  });

  it("el cambio de año también ocurre a la medianoche de Ecuador", () => {
    expect(hoy(new Date("2027-01-01T04:30:00Z"))).toBe("2026-12-31");
    expect(hoy(new Date("2027-01-01T05:00:00Z"))).toBe("2027-01-01");
  });

  it("el cron de las 00:05 de Ecuador (05:05 UTC) ve el día nuevo", () => {
    expect(hoy(new Date("2026-11-30T05:05:00Z"))).toBe("2026-11-30");
  });

  it("no hay horario de verano: en julio sigue siendo UTC−5", () => {
    expect(hoy(new Date("2026-07-15T04:59:00Z"))).toBe("2026-07-14");
    expect(hoy(new Date("2026-07-15T05:00:00Z"))).toBe("2026-07-15");
  });
});

describe("meses de 28, 29, 30 y 31 días (criterio de la fase 3)", () => {
  it.each([
    [2026, 2, 28],
    [2028, 2, 29],
    [2026, 11, 30],
    [2026, 12, 31],
    [2026, 1, 31],
    [2026, 4, 30],
  ])("%i-%i tiene %i días", (anio, mes, dias) => {
    expect(diasDelMes(anio, mes)).toBe(dias);
  });

  it("los bisiestos siguen la regla de los siglos", () => {
    expect(esBisiesto(2028)).toBe(true);
    expect(esBisiesto(2026)).toBe(false);
    expect(esBisiesto(2100)).toBe(false);
    expect(esBisiesto(2000)).toBe(true);
  });

  it.each([
    [2026, 11, 31, "2026-11-30"], // un recurrente del día 31 cae el 30 de noviembre
    [2026, 2, 31, "2026-02-28"],
    [2028, 2, 31, "2028-02-29"],
    [2026, 2, 29, "2026-02-28"], // el 29 de febrero pasa al 28 en un año no bisiesto
    [2026, 12, 31, "2026-12-31"],
    [2026, 4, 15, "2026-04-15"],
  ])("el día %i-%i-%i se ajusta a %s", (anio, mes, dia, esperado) => {
    expect(fechaConDiaAjustado(anio, mes, dia)).toBe(esperado);
  });

  it.each([
    ["2026-02-10", "2026-02-28"],
    ["2028-02-10", "2028-02-29"],
    ["2026-11-10", "2026-11-30"],
    ["2026-12-10", "2026-12-31"],
  ])("el mes de %s termina el %s", (fecha, ultimo) => {
    expect(finDeMes(fecha)).toBe(ultimo);
    expect(periodo("MES", fecha).hasta).toBe(ultimo);
  });

  it("sumar un mes al 31 de enero queda en el último día de febrero", () => {
    expect(sumarMeses("2026-01-31", 1)).toBe("2026-02-28");
    expect(sumarMeses("2028-01-31", 1)).toBe("2028-02-29");
  });

  it("sumar un año al 29 de febrero queda en el 28", () => {
    expect(sumarAnios("2028-02-29", 1)).toBe("2029-02-28");
  });

  it("rechaza meses y días fuera de rango", () => {
    expect(() => diasDelMes(2026, 13)).toThrow();
    expect(() => fechaConDiaAjustado(2026, 1, 0)).toThrow();
  });
});

describe("fechas ISO y columnas DATE", () => {
  it("valida que la fecha exista en el calendario", () => {
    expect(esFechaISO("2026-11-22")).toBe(true);
    expect(esFechaISO("2028-02-29")).toBe(true);
    expect(esFechaISO("2026-02-29")).toBe(false);
    expect(esFechaISO("2026-11-31")).toBe(false);
    expect(esFechaISO("22/11/2026")).toBe(false);
  });

  it("ida y vuelta con la columna DATE de PostgreSQL", () => {
    const columna = aColumnaDate("2026-11-22");
    expect(columna.toISOString()).toBe("2026-11-22T00:00:00.000Z");
    expect(deColumnaDate(columna)).toBe("2026-11-22");
    expect(() => aColumnaDate("2026-02-30")).toThrow();
  });

  it("suma días cruzando meses y años", () => {
    expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(sumarDias("2026-03-01", -1)).toBe("2026-02-28");
    expect(ayer("2026-01-01")).toBe("2025-12-31");
  });

  it("cuenta días con las dos puntas incluidas", () => {
    expect(diasEntre("2026-11-01", "2026-11-01")).toBe(1);
    expect(diasEntre("2026-11-01", "2026-11-30")).toBe(30);
    expect(diasEntre("2026-11-30", "2026-11-01")).toBe(0);
  });

  it("toma el mes AAAA-MM", () => {
    expect(mesDe("2026-11-22")).toBe("2026-11");
  });
});

describe("períodos", () => {
  const hoyISO = "2026-11-15";

  it("arma Hoy, Este mes, Este año y un rango", () => {
    expect(periodo("HOY", hoyISO)).toEqual({ tipo: "HOY", desde: hoyISO, hasta: hoyISO });
    expect(periodo("MES", hoyISO)).toEqual({ tipo: "MES", desde: "2026-11-01", hasta: "2026-11-30" });
    expect(periodo("ANIO", hoyISO)).toEqual({ tipo: "ANIO", desde: "2026-01-01", hasta: "2026-12-31" });
    expect(periodo("RANGO", hoyISO, { desde: "2026-10-01", hasta: "2026-10-10" })).toEqual({
      tipo: "RANGO",
      desde: "2026-10-01",
      hasta: "2026-10-10",
    });
  });

  it("un rango necesita fechas válidas y en orden", () => {
    expect(() => periodo("RANGO", hoyISO)).toThrow();
    expect(() => periodo("RANGO", hoyISO, { desde: "2026-10-10", hasta: "2026-10-01" })).toThrow();
    expect(() => periodo("RANGO", hoyISO, { desde: "2026-02-30", hasta: "2026-03-01" })).toThrow();
  });

  it("días transcurridos y restantes de un mes en curso (fórmulas 2 y 3)", () => {
    const mes = periodo("MES", hoyISO);
    expect(estaEnCurso(mes, hoyISO)).toBe(true);
    expect(diasTranscurridos(mes, hoyISO)).toBe(15); // contando hoy
    expect(diasRestantes(mes, hoyISO)).toBe(15); // sin contar hoy
  });

  it("un período cerrado cuenta todos sus días; uno futuro, ninguno", () => {
    const octubre = periodo("MES", "2026-10-05");
    expect(diasTranscurridos(octubre, hoyISO)).toBe(31);
    expect(diasRestantes(octubre, hoyISO)).toBe(0);

    const diciembre = periodo("MES", "2026-12-05");
    expect(diasTranscurridos(diciembre, hoyISO)).toBe(0);
    expect(diasRestantes(diciembre, hoyISO)).toBe(31);
  });

  it("el último día del mes no le quedan días restantes", () => {
    const mes = periodo("MES", "2026-11-30");
    expect(diasTranscurridos(mes, "2026-11-30")).toBe(30);
    expect(diasRestantes(mes, "2026-11-30")).toBe(0);
  });
});

describe("período anterior para comparar (fórmula 4)", () => {
  it("un mes en curso se compara con los mismos días del mes anterior", () => {
    const anterior = periodoAnterior(periodo("MES", "2026-11-15"), "2026-11-15");
    expect(anterior).toEqual({ tipo: "MES", desde: "2026-10-01", hasta: "2026-10-15" });
  });

  it("si el mes anterior es más corto, el tramo termina en su último día", () => {
    const anterior = periodoAnterior(periodo("MES", "2026-03-31"), "2026-03-31");
    expect(anterior).toEqual({ tipo: "MES", desde: "2026-02-01", hasta: "2026-02-28" });
  });

  it("un mes cerrado se compara con el mes anterior completo", () => {
    const anterior = periodoAnterior(periodo("MES", "2026-10-10"), "2026-11-15");
    expect(anterior).toEqual({ tipo: "MES", desde: "2026-09-01", hasta: "2026-09-30" });
  });

  it("hoy se compara con ayer", () => {
    expect(periodoAnterior(periodo("HOY", "2026-11-01"), "2026-11-01")).toEqual({
      tipo: "HOY",
      desde: "2026-10-31",
      hasta: "2026-10-31",
    });
  });

  it("una semana en curso se compara con el mismo tramo de la semana pasada", () => {
    // Miércoles 18: de lunes a miércoles contra lunes a miércoles anteriores.
    const anterior = periodoAnterior(periodo("SEMANA", "2026-11-18"), "2026-11-18");
    expect(anterior).toEqual({ tipo: "SEMANA", desde: "2026-11-09", hasta: "2026-11-11" });
  });

  it("una semana cerrada se compara con la semana anterior completa", () => {
    const anterior = periodoAnterior(periodo("SEMANA", "2026-11-04"), "2026-11-18");
    expect(anterior).toEqual({ tipo: "SEMANA", desde: "2026-10-26", hasta: "2026-11-01" });
  });

  it("un año en curso se compara hasta el mismo día del año pasado", () => {
    expect(periodoAnterior(periodo("ANIO", "2026-11-15"), "2026-11-15")).toEqual({
      tipo: "ANIO",
      desde: "2025-01-01",
      hasta: "2025-11-15",
    });
    expect(periodoAnterior(periodo("ANIO", "2028-02-29"), "2028-02-29").hasta).toBe("2027-02-28");
  });

  it("un año cerrado se compara con el año anterior completo", () => {
    expect(periodoAnterior(periodo("ANIO", "2025-06-01"), "2026-11-15")).toEqual({
      tipo: "ANIO",
      desde: "2024-01-01",
      hasta: "2024-12-31",
    });
  });

  it("un rango se compara con otro de igual largo justo antes", () => {
    const rango = periodo("RANGO", "2026-11-15", { desde: "2026-10-11", hasta: "2026-10-20" });
    expect(periodoAnterior(rango, "2026-11-15")).toEqual({
      tipo: "RANGO",
      desde: "2026-10-01",
      hasta: "2026-10-10",
    });
  });
});

describe("validación y formato", () => {
  it("una fecha de movimiento va desde hace 5 años hasta hoy", () => {
    expect(limitesFechaMovimiento("2026-11-22")).toEqual({ minima: "2021-11-22", maxima: "2026-11-22" });
  });

  it("formatea fechas en español", () => {
    expect(formatearFecha("2026-11-22")).toBe("22 nov 2026");
    expect(formatearDia("2026-11-22")).toBe("domingo, 22 de noviembre");
  });
});
