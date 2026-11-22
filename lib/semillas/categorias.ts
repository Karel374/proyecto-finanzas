/**
 * Las 15 categorías con las que arranca cada usuario (sección 4).
 * El color no se guarda: sale de `colorSlot` (gastos e ingresos tienen su propia paleta)
 * o de `sistema` para las dos categorías de sistema. Otros no tiene slot y va en gris.
 */

export type CategoriaSemilla = {
  nombre: string;
  tipo: "GASTO" | "INGRESO";
  clase: "NECESIDAD" | "DESEO" | null;
  colorSlot: number | null;
  sistema: "INTERESES_COMISIONES" | "RENDIMIENTOS" | null;
  orden: number;
};

export const CATEGORIAS_SEMILLA: readonly CategoriaSemilla[] = [
  // Gastos (orden de la tabla: es el que mantiene distinguibles los colores vecinos)
  { nombre: "Alimentación", tipo: "GASTO", clase: "NECESIDAD", colorSlot: 1, sistema: null, orden: 1 },
  { nombre: "Transporte", tipo: "GASTO", clase: "NECESIDAD", colorSlot: 2, sistema: null, orden: 2 },
  {
    nombre: "Vivienda y servicios",
    tipo: "GASTO",
    clase: "NECESIDAD",
    colorSlot: 3,
    sistema: null,
    orden: 3,
  },
  { nombre: "Salud", tipo: "GASTO", clase: "NECESIDAD", colorSlot: 4, sistema: null, orden: 4 },
  { nombre: "Entretenimiento", tipo: "GASTO", clase: "DESEO", colorSlot: 5, sistema: null, orden: 5 },
  { nombre: "Suscripciones", tipo: "GASTO", clase: "DESEO", colorSlot: 6, sistema: null, orden: 6 },
  { nombre: "Ropa", tipo: "GASTO", clase: "DESEO", colorSlot: 7, sistema: null, orden: 7 },
  { nombre: "Tecnología", tipo: "GASTO", clase: "DESEO", colorSlot: 8, sistema: null, orden: 8 },
  { nombre: "Otros", tipo: "GASTO", clase: "DESEO", colorSlot: null, sistema: null, orden: 9 },
  {
    nombre: "Intereses y comisiones",
    tipo: "GASTO",
    clase: "NECESIDAD",
    colorSlot: null,
    sistema: "INTERESES_COMISIONES",
    orden: 10,
  },
  // Ingresos
  { nombre: "Pasantía o sueldo", tipo: "INGRESO", clase: null, colorSlot: 1, sistema: null, orden: 1 },
  { nombre: "Freelance", tipo: "INGRESO", clase: null, colorSlot: 2, sistema: null, orden: 2 },
  { nombre: "Ventas", tipo: "INGRESO", clase: null, colorSlot: 3, sistema: null, orden: 3 },
  { nombre: "Otros", tipo: "INGRESO", clase: null, colorSlot: null, sistema: null, orden: 4 },
  {
    nombre: "Rendimientos",
    tipo: "INGRESO",
    clase: null,
    colorSlot: null,
    sistema: "RENDIMIENTOS",
    orden: 5,
  },
];
