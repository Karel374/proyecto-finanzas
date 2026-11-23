/**
 * Cuentas y saldos (sección 15). Funciones puras: reciben totales ya sumados y devuelven resultados.
 */
import { compararFechas, fechaConDiaAjustado, sumarMeses, type FechaISO } from "@/lib/fechas";

export type TipoCuenta = "EFECTIVO" | "BANCO" | "BILLETERA" | "TARJETA_CREDITO";
export type MetodoPago = "EFECTIVO" | "DEBITO" | "CREDITO" | "TRANSFERENCIA";

export const ETIQUETAS_TIPO_CUENTA: Record<TipoCuenta, string> = {
  EFECTIVO: "Efectivo",
  BANCO: "Banco",
  BILLETERA: "Billetera digital",
  TARJETA_CREDITO: "Tarjeta de crédito",
};

/** El método de pago se completa solo según el tipo de cuenta (sección 5). */
export function metodoPagoDeCuenta(tipo: TipoCuenta): MetodoPago {
  switch (tipo) {
    case "EFECTIVO":
      return "EFECTIVO";
    case "BANCO":
      return "DEBITO";
    case "BILLETERA":
      return "TRANSFERENCIA";
    case "TARJETA_CREDITO":
      return "CREDITO";
  }
}

export function esPasivo(tipo: TipoCuenta): boolean {
  return tipo === "TARJETA_CREDITO";
}

/** Totales de una cuenta desde su fecha de saldo inicial, en centavos. */
export type TotalesCuenta = {
  ingresos: number;
  gastos: number;
  entradas: number; // transferencias que entran
  salidas: number; // transferencias que salen
};

/**
 * Saldo de una cuenta (sección 15): inicial + ingresos − gastos + entradas − salidas.
 * En una tarjeta de crédito el saldo es la deuda acumulada, así que los signos se invierten:
 * un gasto con la tarjeta aumenta la deuda y un pago (transferencia que entra) la baja.
 */
export function calcularSaldo(
  tipo: TipoCuenta,
  saldoInicialCentavos: number,
  totales: TotalesCuenta,
): number {
  const movimientoNeto = totales.ingresos - totales.gastos + totales.entradas - totales.salidas;
  return esPasivo(tipo) ? saldoInicialCentavos - movimientoNeto : saldoInicialCentavos + movimientoNeto;
}

/** Próxima fecha de pago de una tarjeta, hoy incluido. El día 31 cae el último día de meses más cortos. */
export function proximoPago(diaPago: number, hoyISO: FechaISO): FechaISO {
  const [anio, mes] = hoyISO.split("-").map(Number);
  const esteMes = fechaConDiaAjustado(anio, mes, diaPago);
  if (compararFechas(esteMes, hoyISO) >= 0) return esteMes;
  const siguiente = sumarMeses(`${hoyISO.slice(0, 7)}-01`, 1);
  const [anioSig, mesSig] = siguiente.split("-").map(Number);
  return fechaConDiaAjustado(anioSig, mesSig, diaPago);
}

export type CuentaConSaldo = {
  id: string;
  nombre: string;
  tipo: TipoCuenta;
  saldoCentavos: number;
  diaPago: number | null;
};

export type ResumenCuentas = {
  /** Efectivo, banco y billeteras. */
  disponibleCentavos: number;
  /** Lo que se debe en tarjetas (las tarjetas con saldo a favor no restan). */
  deudaTarjetasCentavos: number;
  /** Tarjetas con deuda y día de pago, de la fecha más cercana a la más lejana. */
  proximosPagos: { cuentaId: string; nombre: string; fecha: FechaISO; montoCentavos: number }[];
};

export function resumirCuentas(cuentas: readonly CuentaConSaldo[], hoyISO: FechaISO): ResumenCuentas {
  let disponibleCentavos = 0;
  let deudaTarjetasCentavos = 0;
  const proximosPagos: ResumenCuentas["proximosPagos"] = [];

  for (const cuenta of cuentas) {
    if (!esPasivo(cuenta.tipo)) {
      disponibleCentavos += cuenta.saldoCentavos;
      continue;
    }
    if (cuenta.saldoCentavos <= 0) continue;
    deudaTarjetasCentavos += cuenta.saldoCentavos;
    if (cuenta.diaPago !== null) {
      proximosPagos.push({
        cuentaId: cuenta.id,
        nombre: cuenta.nombre,
        fecha: proximoPago(cuenta.diaPago, hoyISO),
        montoCentavos: cuenta.saldoCentavos,
      });
    }
  }

  proximosPagos.sort((a, b) => compararFechas(a.fecha, b.fecha));
  return { disponibleCentavos, deudaTarjetasCentavos, proximosPagos };
}

/**
 * Al cuadrar con el banco (sección 15): diferencia = saldo real − saldo calculado.
 * Si hay diferencia, el ajuste es un movimiento que la deja en cero: en una cuenta de activo,
 * una diferencia positiva es un ingreso; en una tarjeta, una deuda real mayor es un gasto.
 */
export function ajusteParaCuadrar(
  tipo: TipoCuenta,
  saldoCalculadoCentavos: number,
  saldoRealCentavos: number,
): { diferenciaCentavos: number; ajuste: { tipo: "GASTO" | "INGRESO"; montoCentavos: number } | null } {
  const diferenciaCentavos = saldoRealCentavos - saldoCalculadoCentavos;
  if (diferenciaCentavos === 0) return { diferenciaCentavos, ajuste: null };
  const subeElSaldo = diferenciaCentavos > 0;
  const tipoAjuste = esPasivo(tipo) ? (subeElSaldo ? "GASTO" : "INGRESO") : subeElSaldo ? "INGRESO" : "GASTO";
  return { diferenciaCentavos, ajuste: { tipo: tipoAjuste, montoCentavos: Math.abs(diferenciaCentavos) } };
}
