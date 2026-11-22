/**
 * Fechas de la app (sección 6). Una fecha de calendario es siempre el texto `AAAA-MM-DD`.
 * "Hoy" se calcula en America/Guayaquil, nunca con la hora del servidor; todo el resto de la
 * aritmética se hace en UTC sobre fechas sin hora, así el resultado no depende de dónde corra el código.
 * La semana va de lunes a domingo; el mes y el año son calendario.
 */
import { tz } from "@date-fns/tz";
import {
  addDays,
  addMonths,
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  getDaysInMonth,
  getISODay,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";

export const ZONA_ECUADOR = "America/Guayaquil";

/** Fecha de calendario `AAAA-MM-DD`. */
export type FechaISO = string;

const UTC = tz("UTC");
const ECUADOR = tz(ZONA_ECUADOR);
const PATRON = "yyyy-MM-dd";

function aFecha(fecha: FechaISO): Date {
  if (!esFechaISO(fecha)) throw new Error(`Fecha inválida: ${fecha}`);
  return parse(fecha, PATRON, new Date(), { in: UTC });
}

function aISO(fecha: Date): FechaISO {
  return format(fecha, PATRON, { in: UTC });
}

/** true si el texto es una fecha `AAAA-MM-DD` que existe en el calendario (rechaza 2026-02-30). */
export function esFechaISO(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = parse(texto, PATRON, new Date(), { in: UTC });
  return isValid(fecha) && format(fecha, PATRON, { in: UTC }) === texto;
}

// ───────────── Hoy y conversión con la base ─────────────

/** Fecha de calendario de un instante, vista desde Ecuador. Sin argumento: hoy en Ecuador. */
export function fechaEnEcuador(instante: Date = new Date()): FechaISO {
  return format(instante, PATRON, { in: ECUADOR });
}

/** Hoy en Ecuador. Alias de `fechaEnEcuador()` para que el código se lea mejor. */
export function hoy(instante: Date = new Date()): FechaISO {
  return fechaEnEcuador(instante);
}

/** `AAAA-MM-DD` → el Date que Prisma guarda en una columna DATE (medianoche UTC). */
export function aColumnaDate(fecha: FechaISO): Date {
  if (!esFechaISO(fecha)) throw new Error(`Fecha inválida: ${fecha}`);
  return new Date(`${fecha}T00:00:00Z`);
}

/** Date leído de una columna DATE → `AAAA-MM-DD`. */
export function deColumnaDate(fecha: Date): FechaISO {
  return fecha.toISOString().slice(0, 10);
}

// ───────────── Aritmética ─────────────

export function sumarDias(fecha: FechaISO, dias: number): FechaISO {
  return aISO(addDays(aFecha(fecha), dias, { in: UTC }));
}

/** Suma meses; si el día no existe en el mes de llegada, queda en su último día (31 ene + 1 → 28 feb). */
export function sumarMeses(fecha: FechaISO, meses: number): FechaISO {
  return aISO(addMonths(aFecha(fecha), meses, { in: UTC }));
}

/** Suma años; el 29 de febrero pasa al 28 en un año no bisiesto. */
export function sumarAnios(fecha: FechaISO, anios: number): FechaISO {
  return aISO(addYears(aFecha(fecha), anios, { in: UTC }));
}

/** Días entre dos fechas contando las dos puntas: del 1 al 1 es 1 día. Si `hasta` es anterior, 0. */
export function diasEntre(desde: FechaISO, hasta: FechaISO): number {
  return Math.max(0, differenceInCalendarDays(aFecha(hasta), aFecha(desde), { in: UTC }) + 1);
}

/** Compara dos fechas: negativo si a < b, 0 si son iguales, positivo si a > b. */
export function compararFechas(a: FechaISO, b: FechaISO): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** 1 = lunes … 7 = domingo. */
export function diaDeLaSemana(fecha: FechaISO): number {
  return getISODay(aFecha(fecha), { in: UTC });
}

// ───────────── Semanas, meses y años ─────────────

export function inicioDeSemana(fecha: FechaISO): FechaISO {
  return aISO(startOfWeek(aFecha(fecha), { weekStartsOn: 1, in: UTC }));
}

export function finDeSemana(fecha: FechaISO): FechaISO {
  return aISO(endOfWeek(aFecha(fecha), { weekStartsOn: 1, in: UTC }));
}

export function inicioDeMes(fecha: FechaISO): FechaISO {
  return aISO(startOfMonth(aFecha(fecha), { in: UTC }));
}

export function finDeMes(fecha: FechaISO): FechaISO {
  return aISO(endOfMonth(aFecha(fecha), { in: UTC }));
}

export function inicioDeAnio(fecha: FechaISO): FechaISO {
  return `${fecha.slice(0, 4)}-01-01`;
}

export function finDeAnio(fecha: FechaISO): FechaISO {
  return `${fecha.slice(0, 4)}-12-31`;
}

/** Mes `AAAA-MM` de una fecha, el formato de `Presupuesto.vigenteDesde` y `RevisionMensual.mes`. */
export function mesDe(fecha: FechaISO): string {
  return fecha.slice(0, 7);
}

export function esBisiesto(anio: number): boolean {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
}

/** Días del mes (1 a 12): 28, 29, 30 o 31. */
export function diasDelMes(anio: number, mes: number): number {
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) throw new Error(`Mes inválido: ${mes}`);
  return getDaysInMonth(new Date(Date.UTC(anio, mes - 1, 1)), { in: UTC });
}

/**
 * Fecha de un día del mes que puede no existir: el día 31 en noviembre cae el 30,
 * y el 29 de febrero cae el 28 en un año no bisiesto (regla de recurrentes, sección 7).
 */
export function fechaConDiaAjustado(anio: number, mes: number, dia: number): FechaISO {
  if (!Number.isInteger(dia) || dia < 1 || dia > 31) throw new Error(`Día inválido: ${dia}`);
  const diaReal = Math.min(dia, diasDelMes(anio, mes));
  return `${String(anio).padStart(4, "0")}-${String(mes).padStart(2, "0")}-${String(diaReal).padStart(2, "0")}`;
}

// ───────────── Períodos de los filtros ─────────────

export const TIPOS_PERIODO = ["HOY", "SEMANA", "MES", "ANIO", "RANGO"] as const;
export type TipoPeriodo = (typeof TIPOS_PERIODO)[number];

export const ETIQUETAS_PERIODO: Record<TipoPeriodo, string> = {
  HOY: "Hoy",
  SEMANA: "Esta semana",
  MES: "Este mes",
  ANIO: "Este año",
  RANGO: "Rango personalizado",
};

/** Período con sus dos puntas incluidas. */
export type Periodo = { tipo: TipoPeriodo; desde: FechaISO; hasta: FechaISO };

/** Período que contiene a `referencia` (por defecto hoy). Para RANGO se pasan las dos fechas. */
export function periodo(
  tipo: TipoPeriodo,
  referencia: FechaISO,
  rango?: { desde: FechaISO; hasta: FechaISO },
): Periodo {
  switch (tipo) {
    case "HOY":
      return { tipo, desde: referencia, hasta: referencia };
    case "SEMANA":
      return { tipo, desde: inicioDeSemana(referencia), hasta: finDeSemana(referencia) };
    case "MES":
      return { tipo, desde: inicioDeMes(referencia), hasta: finDeMes(referencia) };
    case "ANIO":
      return { tipo, desde: inicioDeAnio(referencia), hasta: finDeAnio(referencia) };
    case "RANGO": {
      if (!rango) throw new Error("Un rango personalizado necesita sus dos fechas");
      const { desde, hasta } = rango;
      if (!esFechaISO(desde) || !esFechaISO(hasta)) throw new Error("Fechas del rango inválidas");
      if (compararFechas(desde, hasta) > 0) throw new Error("El rango termina antes de empezar");
      return { tipo, desde, hasta };
    }
  }
}

/** Días del período. */
export function diasDelPeriodo(p: Periodo): number {
  return diasEntre(p.desde, p.hasta);
}

/** true si hoy cae dentro del período. */
export function estaEnCurso(p: Periodo, hoyISO: FechaISO): boolean {
  return compararFechas(p.desde, hoyISO) <= 0 && compararFechas(hoyISO, p.hasta) <= 0;
}

/**
 * Días que cuenta el promedio diario (fórmula 2): en un período en curso, los transcurridos
 * contando hoy; en uno cerrado, todos sus días; en uno que no empieza, 0.
 */
export function diasTranscurridos(p: Periodo, hoyISO: FechaISO): number {
  if (compararFechas(hoyISO, p.desde) < 0) return 0;
  if (estaEnCurso(p, hoyISO)) return diasEntre(p.desde, hoyISO);
  return diasDelPeriodo(p);
}

/** Días que faltan para terminar el período, sin contar hoy (la r de la fórmula 3). */
export function diasRestantes(p: Periodo, hoyISO: FechaISO): number {
  if (compararFechas(hoyISO, p.desde) < 0) return diasDelPeriodo(p);
  if (!estaEnCurso(p, hoyISO)) return 0;
  return diasEntre(hoyISO, p.hasta) - 1;
}

/**
 * Período con el que se compara (fórmula 4). Un período en curso se compara con el mismo tramo
 * del anterior: si hoy es 15, del 1 al 15 de este mes contra del 1 al 15 del mes pasado
 * (si el mes pasado es más corto, hasta su último día). Un período cerrado se compara entero.
 * Un rango se compara con otro de igual largo justo antes.
 */
export function periodoAnterior(p: Periodo, hoyISO: FechaISO): Periodo {
  const enCurso = estaEnCurso(p, hoyISO);
  const corte = (desde: FechaISO, hastaCompleto: FechaISO): FechaISO => {
    if (!enCurso) return hastaCompleto;
    const tramo = sumarDias(desde, diasEntre(p.desde, hoyISO) - 1);
    return compararFechas(tramo, hastaCompleto) > 0 ? hastaCompleto : tramo;
  };

  switch (p.tipo) {
    case "HOY": {
      const ayer = sumarDias(p.desde, -1);
      return { tipo: p.tipo, desde: ayer, hasta: ayer };
    }
    case "SEMANA": {
      const desde = sumarDias(p.desde, -7);
      return { tipo: p.tipo, desde, hasta: corte(desde, sumarDias(p.hasta, -7)) };
    }
    case "MES": {
      const desde = sumarMeses(p.desde, -1);
      return { tipo: p.tipo, desde, hasta: corte(desde, finDeMes(desde)) };
    }
    case "ANIO": {
      const desde = sumarAnios(p.desde, -1);
      const hastaCompleto = finDeAnio(desde);
      if (!enCurso) return { tipo: p.tipo, desde, hasta: hastaCompleto };
      // Mismo día del año pasado; el 29 de febrero pasa al 28.
      return { tipo: p.tipo, desde, hasta: sumarAnios(hoyISO, -1) };
    }
    case "RANGO": {
      const largo = diasDelPeriodo(p);
      const hasta = sumarDias(p.desde, -1);
      return { tipo: p.tipo, desde: sumarDias(hasta, -(largo - 1)), hasta };
    }
  }
}

// ───────────── Validación del movimiento ─────────────

/** Una fecha de movimiento va desde hace 5 años hasta hoy (sección 6). */
export function limitesFechaMovimiento(hoyISO: FechaISO): { minima: FechaISO; maxima: FechaISO } {
  return { minima: sumarAnios(hoyISO, -5), maxima: hoyISO };
}

/** Ayer en Ecuador, para el atajo "Ayer" del formulario. */
export function ayer(hoyISO: FechaISO): FechaISO {
  return aISO(subDays(aFecha(hoyISO), 1, { in: UTC }));
}

// ───────────── Formato ─────────────

const formatoCorto = new Intl.DateTimeFormat("es-EC", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const formatoDia = new Intl.DateTimeFormat("es-EC", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** "22 nov 2026". */
export function formatearFecha(fecha: FechaISO): string {
  return formatoCorto.format(aFecha(fecha)).replace(/\./g, "");
}

/** "domingo, 22 de noviembre": cabecera de los grupos por día en Movimientos. */
export function formatearDia(fecha: FechaISO): string {
  return formatoDia.format(aFecha(fecha));
}
