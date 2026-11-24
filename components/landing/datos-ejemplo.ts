/**
 * Datos de ejemplo de la landing. Son inventados para demostrar la app y la página lo dice
 * ("Datos de ejemplo"); nunca se presentan como datos de usuarios reales.
 * Los colores y el orden son los de la sección 4: el anillo sigue el orden de la tabla, no el tamaño.
 */
export type GajoEjemplo = { categoria: string; centavos: number; color: string };

export const INGRESO_EJEMPLO_CENTAVOS = 170_000;

export const GASTOS_EJEMPLO: readonly GajoEjemplo[] = [
  { categoria: "Alimentación", centavos: 31_240, color: "var(--cat-1)" },
  { categoria: "Transporte", centavos: 9_600, color: "var(--cat-2)" },
  { categoria: "Vivienda y servicios", centavos: 38_000, color: "var(--cat-3)" },
  { categoria: "Salud", centavos: 4_550, color: "var(--cat-4)" },
  { categoria: "Entretenimiento", centavos: 8_400, color: "var(--cat-5)" },
  { categoria: "Suscripciones", centavos: 2_397, color: "var(--cat-6)" },
  { categoria: "Ropa", centavos: 6_000, color: "var(--cat-7)" },
  { categoria: "Tecnología", centavos: 3_500, color: "var(--cat-8)" },
  { categoria: "Otros", centavos: 1_820, color: "var(--cat-otros)" },
];

/** Índice del gajo que se levanta en el tercer acto. */
export const GAJO_RECOMENDACION = 4;

/** Promedio de Entretenimiento de los últimos meses: $84 es 40 % más (ejemplo de la sección 1). */
export const PROMEDIO_RECOMENDACION_CENTAVOS = 6_000;

export const GASTO_TOTAL_EJEMPLO_CENTAVOS = GASTOS_EJEMPLO.reduce((total, gajo) => total + gajo.centavos, 0);
export const DISPONIBLE_EJEMPLO_CENTAVOS = INGRESO_EJEMPLO_CENTAVOS - GASTO_TOTAL_EJEMPLO_CENTAVOS;
