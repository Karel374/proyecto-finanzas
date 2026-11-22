/**
 * Fechas en la hora de Ecuador (sección 6). La fase 3 completa este módulo con semanas y períodos.
 */

export const ZONA_ECUADOR = "America/Guayaquil";

const formatoISO = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_ECUADOR,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Fecha de calendario `AAAA-MM-DD` de un instante, vista desde Ecuador. */
export function fechaEnEcuador(instante: Date = new Date()): string {
  return formatoISO.format(instante);
}

/** Convierte `AAAA-MM-DD` en el Date que Prisma guarda en una columna DATE (medianoche UTC). */
export function aColumnaDate(fechaISO: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) {
    throw new Error(`Fecha inválida: ${fechaISO}`);
  }
  return new Date(`${fechaISO}T00:00:00Z`);
}
