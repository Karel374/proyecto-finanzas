import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "fantasma" | "peligro";

const ESTILOS: Record<Variante, string> = {
  // Solo hay un botón primario por pantalla (sección 3).
  primario: "bg-acento text-sobre-acento hover:opacity-90",
  secundario: "border-borde bg-superficie text-texto hover:bg-superficie-2 border",
  fantasma: "text-texto-2 hover:bg-superficie-2 hover:text-texto",
  peligro: "text-gasto hover:bg-gasto-fondo",
};

export function clasesBoton(variante: Variante = "secundario", tamano: "normal" | "chico" = "normal") {
  return `inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento disabled:cursor-not-allowed disabled:opacity-60 ${
    tamano === "chico" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"
  } ${ESTILOS[variante]}`;
}

export function Boton({
  variante = "secundario",
  tamano = "normal",
  className = "",
  type = "button",
  ...resto
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; tamano?: "normal" | "chico" }) {
  return <button type={type} className={`${clasesBoton(variante, tamano)} ${className}`} {...resto} />;
}
