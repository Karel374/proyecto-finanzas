/**
 * Trayecto de la moneda en la landing: una línea vertical que la moneda dibuja al bajar.
 * En el tramo "caótico" la línea zigzaguea (el dinero que se escapa); en los demás va recta.
 * Funciones puras: reciben medidas en píxeles del documento y no tocan el DOM.
 */

export type TipoTramo = "recto" | "caotico";

export interface Tramo {
  /** Altura del documento, en px, donde empieza el tramo. */
  inicio: number;
  /** Altura donde termina; debe ser mayor que `inicio`. */
  fin: number;
  tipo: TipoTramo;
}

export interface Punto {
  x: number;
  y: number;
}

/** Ruido determinista y suave: suma de senos con periodos que no se repiten entre sí. */
function ruido(y: number): number {
  return (Math.sin(y / 61) * 0.55 + Math.sin(y / 23 + 1.7) * 0.25 + Math.sin(y / 137 + 0.4) * 0.45) / 1.25;
}

/**
 * Desvío horizontal de la línea, en px respecto a su carril, a la altura `y` del documento.
 * En un tramo caótico la amplitud nace y muere en sus bordes, así la línea entra y sale recta.
 */
export function desvioEn(y: number, tramos: readonly Tramo[], amplitud: number): number {
  const tramo = tramos.find((t) => y >= t.inicio && y <= t.fin);
  if (!tramo || tramo.tipo === "recto" || tramo.fin <= tramo.inicio) return 0;
  const avance = (y - tramo.inicio) / (tramo.fin - tramo.inicio);
  const envolvente = Math.sin(Math.PI * avance) ** 2;
  return amplitud * envolvente * ruido(y);
}

/** Puntos de la línea desde `desde` hasta `hasta`, cada `paso` px, sobre el carril `carril`. */
export function muestrearTrayecto(
  desde: number,
  hasta: number,
  tramos: readonly Tramo[],
  opciones: { carril: number; amplitud: number; paso?: number },
): Punto[] {
  const paso = Math.max(1, opciones.paso ?? 6);
  const puntos: Punto[] = [];
  if (hasta <= desde) return puntos;
  for (let y = desde; y < hasta; y += paso) {
    puntos.push({ x: opciones.carril + desvioEn(y, tramos, opciones.amplitud), y });
  }
  puntos.push({ x: opciones.carril + desvioEn(hasta, tramos, opciones.amplitud), y: hasta });
  return puntos;
}

/** Atributo `d` de un path SVG que une los puntos, con coordenadas redondeadas a décimas. */
export function rutaSvg(puntos: readonly Punto[]): string {
  return puntos
    .map((p, i) => `${i === 0 ? "M" : "L"}${Math.round(p.x * 10) / 10} ${Math.round(p.y * 10) / 10}`)
    .join("");
}

/** Pendiente de la línea (dx/dy) en `y`: inclina la moneda hacia donde gira el trazo. */
export function pendienteEn(y: number, tramos: readonly Tramo[], amplitud: number): number {
  const h = 2;
  return (desvioEn(y + h, tramos, amplitud) - desvioEn(y - h, tramos, amplitud)) / (2 * h);
}

/** Limita `valor` al rango [min, max]. */
export function limitar(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}

/** Interpolación lineal entre `a` y `b`. */
export function mezclar(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
