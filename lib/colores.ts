/**
 * Color de una categoría (sección 4). Devuelve la variable CSS, que cambia sola con el tema.
 * Gastos e ingresos comparten la paleta por slot; sin slot es gris ("Otros" o una categoría nueva
 * sin color libre); las dos de sistema tienen su color propio.
 */
export function colorDeCategoria(categoria: {
  colorSlot: number | null;
  sistema: "INTERESES_COMISIONES" | "RENDIMIENTOS" | null;
}): string {
  if (categoria.sistema === "INTERESES_COMISIONES") return "var(--cat-intereses)";
  if (categoria.sistema === "RENDIMIENTOS") return "var(--cat-rendimientos)";
  if (categoria.colorSlot && categoria.colorSlot >= 1 && categoria.colorSlot <= 8) {
    return `var(--cat-${categoria.colorSlot})`;
  }
  return "var(--cat-otros)";
}
