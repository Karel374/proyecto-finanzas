/**
 * Dinero en centavos enteros y su formato (sección 6). Ningún monto usa decimales de punto flotante:
 * se guarda, se suma y se compara en centavos, y solo se convierte a dólares al mostrarlo.
 */
import { z } from "zod";

/** $1.000.000,00: el máximo de un movimiento (lo exige también un CHECK en la base). */
export const MONTO_MAXIMO_CENTAVOS = 100_000_000;

/** Lo que muestra una métrica que divide para cero, en lugar de un número engañoso. */
export const SIN_DATOS = "Sin datos";

/** Signo menos tipográfico (U+2212), el que pide la sección 3 para los gastos. */
export const SIGNO_MENOS = "−";

const formatoDolares = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatoUnDecimal = new Intl.NumberFormat("es-EC", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function exigirEntero(centavos: number, nombre = "El monto"): void {
  if (!Number.isSafeInteger(centavos)) {
    throw new Error(`${nombre} debe ser un entero en centavos: ${centavos}`);
  }
}

/** 123450 → "$1.234,50". Un negativo lleva el signo − delante del símbolo: "−$45,00". */
export function formatearDolares(centavos: number): string {
  exigirEntero(centavos);
  const texto = formatoDolares.format(Math.abs(centavos) / 100);
  return centavos < 0 ? `${SIGNO_MENOS}${texto}` : texto;
}

/**
 * Monto de un movimiento con su signo, para que nunca dependa solo del color (sección 3):
 * gasto → "−$45,00", ingreso → "+$45,00".
 */
export function formatearMovimiento(centavos: number, tipo: "GASTO" | "INGRESO"): string {
  exigirEntero(centavos);
  const texto = formatoDolares.format(Math.abs(centavos) / 100);
  return `${tipo === "GASTO" ? SIGNO_MENOS : "+"}${texto}`;
}

/** 12.5 → "12,5 %". null (métrica sin datos) → "Sin datos". El espacio no se corta al final de línea. */
export function formatearPorcentaje(valor: number | null): string {
  if (valor === null || !Number.isFinite(valor)) return SIN_DATOS;
  const texto = formatoUnDecimal.format(Math.abs(valor));
  return `${valor < 0 && Math.abs(valor) >= 0.05 ? SIGNO_MENOS : ""}${texto} %`;
}

/** División de dinero redondeada al centavo más cercano. null si el divisor es cero. */
export function dividirCentavos(centavos: number, divisor: number): number | null {
  exigirEntero(centavos);
  if (divisor === 0 || !Number.isFinite(divisor)) return null;
  return Math.round(centavos / divisor);
}

/** (parte ÷ total) × 100. null si el total es cero: la pantalla muestra "Sin datos". */
export function porcentaje(parte: number, total: number): number | null {
  if (total === 0) return null;
  return (parte / total) * 100;
}

/** Variación porcentual (fórmula 4). null si el anterior es cero: la pantalla muestra "Nuevo". */
export function variacion(actual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return ((actual - anterior) / Math.abs(anterior)) * 100;
}

/** Suma de centavos que falla si algún sumando no es entero. */
export function sumarCentavos(montos: readonly number[]): number {
  let total = 0;
  for (const monto of montos) {
    exigirEntero(monto);
    total += monto;
  }
  exigirEntero(total, "La suma");
  return total;
}

function sinSeparadorDeMiles(parte: string, separador: "." | ","): string | null {
  const grupos = separador === "." ? /^\d{1,3}(\.\d{3})*$/ : /^\d{1,3}(,\d{3})*$/;
  if (/^\d+$/.test(parte)) return parte;
  return grupos.test(parte) ? parte.split(separador).join("") : null;
}

/**
 * Convierte lo que escribe el usuario en centavos sin pasar por punto flotante. Reglas:
 * - con coma y punto, el último que aparece es el decimal ("1.234,56" y "1,234.56");
 * - solo con coma, la coma es decimal, como se escribe en Ecuador ("45,50"; "12,345" se rechaza);
 * - solo con punto, es de miles si separa grupos de tres ("1.234", "1.000.000") y si no, decimal ("45.50").
 * Devuelve null si no es un monto válido o tiene más de dos decimales.
 */
export function textoACentavos(texto: string): number | null {
  const limpio = texto.trim().replace(/\s|\$/g, "");
  if (!/^[\d.,]+$/.test(limpio)) return null;

  const ultimaComa = limpio.lastIndexOf(",");
  const ultimoPunto = limpio.lastIndexOf(".");
  let entera: string | null;
  let decimales = "";

  if (ultimaComa >= 0 && ultimoPunto >= 0) {
    const decimalEsComa = ultimaComa > ultimoPunto;
    const corte = Math.max(ultimaComa, ultimoPunto);
    entera = sinSeparadorDeMiles(limpio.slice(0, corte), decimalEsComa ? "." : ",");
    decimales = limpio.slice(corte + 1);
    if (decimales === "") return null;
  } else if (ultimaComa >= 0 || (ultimoPunto >= 0 && !/^\d{1,3}(\.\d{3})+$/.test(limpio))) {
    const partes = limpio.split(ultimaComa >= 0 ? "," : ".");
    if (partes.length !== 2 || partes[1] === "") return null;
    [entera, decimales] = partes;
  } else {
    entera = sinSeparadorDeMiles(limpio, ".");
  }

  if (entera === null || !/^\d{1,12}$/.test(entera) || !/^\d{0,2}$/.test(decimales)) return null;
  return Number(entera) * 100 + Number(decimales.padEnd(2, "0"));
}

/**
 * Centavos → texto para un campo editable: 123450 → "1234,50". Sin separador de miles, así
 * `textoACentavos` lo vuelve a leer igual.
 */
export function centavosATexto(centavos: number): string {
  exigirEntero(centavos);
  const absoluto = Math.abs(centavos);
  const texto = `${Math.floor(absoluto / 100)},${String(absoluto % 100).padStart(2, "0")}`;
  return centavos < 0 ? `-${texto}` : texto;
}

/**
 * Monto de un formulario: mayor que cero, máximo dos decimales y hasta $1.000.000 (sección 6).
 * Recibe el texto del campo y entrega centavos enteros.
 */
export const esquemaMonto = z.string().transform((texto, contexto) => {
  const centavos = textoACentavos(texto);
  if (centavos === null || centavos <= 0) {
    contexto.addIssue({ code: "custom", message: "Ingresa un monto mayor que cero" });
    return z.NEVER;
  }
  if (centavos > MONTO_MAXIMO_CENTAVOS) {
    contexto.addIssue({ code: "custom", message: "El monto máximo es $1.000.000,00" });
    return z.NEVER;
  }
  return centavos;
});
