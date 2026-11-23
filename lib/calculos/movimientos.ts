/**
 * Cálculos sobre listas de movimientos (sección 7). Funciones puras.
 */
import type { FechaISO } from "@/lib/fechas";

export type TipoMovimiento = "GASTO" | "INGRESO";

type ConMonto = { tipo: TipoMovimiento; montoCentavos: number };

/** Ingresos, gastos y balance de un conjunto de movimientos. Las transferencias no entran aquí. */
export function totales(movimientos: readonly ConMonto[]): {
  ingresosCentavos: number;
  gastosCentavos: number;
  balanceCentavos: number;
} {
  let ingresosCentavos = 0;
  let gastosCentavos = 0;
  for (const { tipo, montoCentavos } of movimientos) {
    if (tipo === "INGRESO") ingresosCentavos += montoCentavos;
    else gastosCentavos += montoCentavos;
  }
  return { ingresosCentavos, gastosCentavos, balanceCentavos: ingresosCentavos - gastosCentavos };
}

/**
 * Agrupa por día, conservando el orden de entrada (la lista llega ordenada: más reciente primero
 * y, dentro del día, el último registrado primero). Cada grupo lleva su subtotal: ingresos − gastos.
 */
export function agruparPorDia<T extends ConMonto & { fecha: FechaISO }>(
  movimientos: readonly T[],
): { fecha: FechaISO; subtotalCentavos: number; movimientos: T[] }[] {
  const grupos: { fecha: FechaISO; subtotalCentavos: number; movimientos: T[] }[] = [];
  for (const movimiento of movimientos) {
    let grupo = grupos.at(-1);
    if (!grupo || grupo.fecha !== movimiento.fecha) {
      grupo = { fecha: movimiento.fecha, subtotalCentavos: 0, movimientos: [] };
      grupos.push(grupo);
    }
    grupo.movimientos.push(movimiento);
    grupo.subtotalCentavos +=
      movimiento.tipo === "INGRESO" ? movimiento.montoCentavos : -movimiento.montoCentavos;
  }
  return grupos;
}

/** Movimientos mínimos de la categoría para que el aviso de gasto inusual tenga sentido. */
export const MINIMO_PARA_AVISO_INUSUAL = 3;

/**
 * Aviso de monto inusual (sección 6): un gasto que supera 5 veces el promedio de su categoría
 * en los últimos 3 meses pide confirmación. Devuelve el promedio si hay que avisar, o null.
 * Sin al menos 3 gastos previos en la categoría no hay promedio confiable y no se avisa.
 */
export function promedioSiEsInusual(montoCentavos: number, gastosPrevios: readonly number[]): number | null {
  if (gastosPrevios.length < MINIMO_PARA_AVISO_INUSUAL) return null;
  const promedio = Math.round(
    gastosPrevios.reduce((total, monto) => total + monto, 0) / gastosPrevios.length,
  );
  return montoCentavos > promedio * 5 ? promedio : null;
}

/** Cuántas plantillas de registro admite Ajustes (sección 7). */
export const MAXIMO_PLANTILLAS = 6;
