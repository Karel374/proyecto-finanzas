import { describe, expect, it } from "vitest";

import {
  ajusteParaCuadrar,
  calcularSaldo,
  metodoPagoDeCuenta,
  proximoPago,
  resumirCuentas,
} from "@/lib/calculos/cuentas";

const sinMovimientos = { ingresos: 0, gastos: 0, entradas: 0, salidas: 0 };

describe("saldo de una cuenta (sección 15)", () => {
  it("activo: inicial + ingresos − gastos + entradas − salidas", () => {
    expect(
      calcularSaldo("BANCO", 10_000, { ingresos: 50_000, gastos: 12_000, entradas: 3_000, salidas: 20_000 }),
    ).toBe(31_000);
  });

  it("sin movimientos, el saldo es el inicial", () => {
    expect(calcularSaldo("EFECTIVO", 2_500, sinMovimientos)).toBe(2_500);
  });

  it("tarjeta: el saldo es la deuda, sube con gastos y baja con pagos", () => {
    // Debía $100, gastó $40 con la tarjeta y pagó $60 desde el banco (transferencia que entra).
    expect(
      calcularSaldo("TARJETA_CREDITO", 10_000, { ...sinMovimientos, gastos: 4_000, entradas: 6_000 }),
    ).toBe(8_000);
  });

  it("tarjeta: un avance en efectivo (transferencia que sale) aumenta la deuda", () => {
    expect(calcularSaldo("TARJETA_CREDITO", 0, { ...sinMovimientos, salidas: 5_000 })).toBe(5_000);
  });
});

describe("una transferencia no cambia el total del dinero (criterio de la fase 4)", () => {
  it("mover $200 del banco al efectivo deja igual la suma de los dos saldos", () => {
    const antes =
      calcularSaldo("BANCO", 100_000, sinMovimientos) + calcularSaldo("EFECTIVO", 5_000, sinMovimientos);
    const despues =
      calcularSaldo("BANCO", 100_000, { ...sinMovimientos, salidas: 20_000 }) +
      calcularSaldo("EFECTIVO", 5_000, { ...sinMovimientos, entradas: 20_000 });
    expect(despues).toBe(antes);
  });

  it("pagar la tarjeta baja el banco y la deuda por igual", () => {
    const banco = calcularSaldo("BANCO", 100_000, { ...sinMovimientos, salidas: 30_000 });
    const deuda = calcularSaldo("TARJETA_CREDITO", 30_000, { ...sinMovimientos, entradas: 30_000 });
    expect(banco).toBe(70_000);
    expect(deuda).toBe(0);
  });
});

describe("método de pago automático", () => {
  it.each([
    ["EFECTIVO", "EFECTIVO"],
    ["BANCO", "DEBITO"],
    ["BILLETERA", "TRANSFERENCIA"],
    ["TARJETA_CREDITO", "CREDITO"],
  ] as const)("%s → %s", (tipo, metodo) => {
    expect(metodoPagoDeCuenta(tipo)).toBe(metodo);
  });
});

describe("próximo pago de tarjeta", () => {
  it("si el día de pago no pasó, es este mes; si pasó, el siguiente", () => {
    expect(proximoPago(25, "2026-11-22")).toBe("2026-11-25");
    expect(proximoPago(22, "2026-11-22")).toBe("2026-11-22");
    expect(proximoPago(10, "2026-11-22")).toBe("2026-12-10");
  });

  it("el día 31 cae el último día de un mes corto y cruza de año", () => {
    expect(proximoPago(31, "2026-11-05")).toBe("2026-11-30");
    expect(proximoPago(5, "2026-12-20")).toBe("2027-01-05");
    expect(proximoPago(31, "2027-02-01")).toBe("2027-02-28");
  });
});

describe("resumen de cuentas", () => {
  it("separa lo disponible de lo que se debe y ordena los próximos pagos", () => {
    const resumen = resumirCuentas(
      [
        { id: "e", nombre: "Efectivo", tipo: "EFECTIVO", saldoCentavos: 4_000, diaPago: null },
        { id: "b", nombre: "Banco", tipo: "BANCO", saldoCentavos: 150_000, diaPago: null },
        { id: "w", nombre: "Billetera", tipo: "BILLETERA", saldoCentavos: 1_000, diaPago: null },
        { id: "t1", nombre: "Visa", tipo: "TARJETA_CREDITO", saldoCentavos: 30_000, diaPago: 28 },
        { id: "t2", nombre: "Master", tipo: "TARJETA_CREDITO", saldoCentavos: 10_000, diaPago: 25 },
        { id: "t3", nombre: "Sin deuda", tipo: "TARJETA_CREDITO", saldoCentavos: 0, diaPago: 1 },
      ],
      "2026-11-22",
    );
    expect(resumen.disponibleCentavos).toBe(155_000);
    expect(resumen.deudaTarjetasCentavos).toBe(40_000);
    expect(resumen.proximosPagos.map((p) => [p.nombre, p.fecha])).toEqual([
      ["Master", "2026-11-25"],
      ["Visa", "2026-11-28"],
    ]);
  });

  it("una tarjeta con saldo a favor no resta de la deuda ni aparece en pagos", () => {
    const resumen = resumirCuentas(
      [{ id: "t", nombre: "Visa", tipo: "TARJETA_CREDITO", saldoCentavos: -2_000, diaPago: 10 }],
      "2026-11-22",
    );
    expect(resumen).toEqual({ disponibleCentavos: 0, deudaTarjetasCentavos: 0, proximosPagos: [] });
  });
});

describe("cuadrar con el banco", () => {
  it("sin diferencia no hay ajuste", () => {
    expect(ajusteParaCuadrar("BANCO", 10_000, 10_000)).toEqual({ diferenciaCentavos: 0, ajuste: null });
  });

  it("en una cuenta de activo, más dinero real es un ingreso y menos es un gasto", () => {
    expect(ajusteParaCuadrar("BANCO", 10_000, 10_500)).toEqual({
      diferenciaCentavos: 500,
      ajuste: { tipo: "INGRESO", montoCentavos: 500 },
    });
    expect(ajusteParaCuadrar("EFECTIVO", 10_000, 9_000)).toEqual({
      diferenciaCentavos: -1_000,
      ajuste: { tipo: "GASTO", montoCentavos: 1_000 },
    });
  });

  it("en una tarjeta, más deuda real es un gasto y menos es un ingreso", () => {
    expect(ajusteParaCuadrar("TARJETA_CREDITO", 20_000, 21_000).ajuste).toEqual({
      tipo: "GASTO",
      montoCentavos: 1_000,
    });
    expect(ajusteParaCuadrar("TARJETA_CREDITO", 20_000, 19_000).ajuste).toEqual({
      tipo: "INGRESO",
      montoCentavos: 1_000,
    });
  });

  it("el ajuste deja el saldo calculado igual al real", () => {
    for (const [tipo, calculado, real] of [
      ["BANCO", 10_000, 12_345],
      ["BANCO", 10_000, 7_000],
      ["TARJETA_CREDITO", 5_000, 8_000],
      ["TARJETA_CREDITO", 5_000, 1_000],
    ] as const) {
      const { ajuste } = ajusteParaCuadrar(tipo, calculado, real);
      const totales = {
        ...sinMovimientos,
        ingresos: ajuste?.tipo === "INGRESO" ? ajuste.montoCentavos : 0,
        gastos: ajuste?.tipo === "GASTO" ? ajuste.montoCentavos : 0,
      };
      expect(calcularSaldo(tipo, calculado, totales)).toBe(real);
    }
  });
});
