import { describe, expect, it } from "vitest";

import {
  dividirCentavos,
  esquemaMonto,
  formatearDolares,
  formatearMovimiento,
  formatearPorcentaje,
  MONTO_MAXIMO_CENTAVOS,
  porcentaje,
  SIN_DATOS,
  sumarCentavos,
  textoACentavos,
  variacion,
} from "@/lib/dinero";

// Espacio que no se corta, el que va entre la cifra y el símbolo de porcentaje.
const NBSP = " ";

describe("formatearDolares (decisión de la sección 25: el formato se verifica con una prueba)", () => {
  it.each([
    [0, "$0,00"],
    [5, "$0,05"],
    [350, "$3,50"],
    [123450, "$1.234,50"],
    [100_000_000, "$1.000.000,00"],
  ])("%i centavos → %s", (centavos, esperado) => {
    expect(formatearDolares(centavos)).toBe(esperado);
  });

  it("un negativo lleva el signo − delante del símbolo", () => {
    expect(formatearDolares(-4500)).toBe("−$45,00");
  });

  it("rechaza montos que no son centavos enteros", () => {
    expect(() => formatearDolares(45.5)).toThrow();
    expect(() => formatearDolares(Number.NaN)).toThrow();
  });
});

describe("formatearMovimiento", () => {
  it("el gasto lleva − y el ingreso +, nunca depende solo del color", () => {
    expect(formatearMovimiento(4500, "GASTO")).toBe("−$45,00");
    expect(formatearMovimiento(4500, "INGRESO")).toBe("+$45,00");
  });
});

describe("formatearPorcentaje", () => {
  it("muestra un decimal con coma y el símbolo separado", () => {
    expect(formatearPorcentaje(12.5)).toBe(`12,5${NBSP}%`);
    expect(formatearPorcentaje(40)).toBe(`40,0${NBSP}%`);
    expect(formatearPorcentaje(33.333)).toBe(`33,3${NBSP}%`);
  });

  it("los negativos llevan el signo −, salvo los que redondean a cero", () => {
    expect(formatearPorcentaje(-8.25)).toBe(`−8,3${NBSP}%`);
    expect(formatearPorcentaje(-0.01)).toBe(`0,0${NBSP}%`);
  });

  it("sin datos muestra 'Sin datos'", () => {
    expect(formatearPorcentaje(null)).toBe(SIN_DATOS);
    expect(formatearPorcentaje(Number.POSITIVE_INFINITY)).toBe(SIN_DATOS);
  });
});

describe("divisiones de dinero", () => {
  it("redondean al centavo más cercano", () => {
    expect(dividirCentavos(1000, 3)).toBe(333);
    expect(dividirCentavos(2000, 3)).toBe(667);
    expect(dividirCentavos(5, 2)).toBe(3);
  });

  it("dividir para cero da null, que la pantalla muestra como 'Sin datos'", () => {
    expect(dividirCentavos(1000, 0)).toBeNull();
    expect(porcentaje(10, 0)).toBeNull();
  });

  it("porcentaje calcula parte sobre total", () => {
    expect(porcentaje(25, 200)).toBe(12.5);
  });

  it("variación frente al anterior, null si el anterior es cero ('Nuevo')", () => {
    expect(variacion(140, 100)).toBe(40);
    expect(variacion(50, 100)).toBe(-50);
    expect(variacion(100, 0)).toBeNull();
  });

  it("sumarCentavos suma enteros y rechaza decimales", () => {
    expect(sumarCentavos([350, 1250, 5])).toBe(1605);
    expect(sumarCentavos([])).toBe(0);
    expect(() => sumarCentavos([1, 0.5])).toThrow();
  });

  it("0,1 + 0,2 en centavos da exacto 30", () => {
    expect(sumarCentavos([10, 20])).toBe(30);
  });
});

describe("textoACentavos", () => {
  it.each([
    ["45", 4500],
    ["45,5", 4550],
    ["45,50", 4550],
    ["45.50", 4550],
    ["0,05", 5],
    ["$3,50", 350],
    [" 12 ", 1200],
    ["1.234,56", 123456],
    ["1,234.56", 123456],
    ["1.234", 123400],
    ["1.000.000", 100_000_000],
  ])("%s → %i", (texto, centavos) => {
    expect(textoACentavos(texto)).toBe(centavos);
  });

  it.each(["", "abc", "-5", "4,555,5", "12,345", "45,555", "1..2", "45,", "45.5.5", "1.234,"])(
    "rechaza %j",
    (texto) => {
      expect(textoACentavos(texto)).toBeNull();
    },
  );
});

describe("esquemaMonto (validación del movimiento, sección 6)", () => {
  it("acepta un monto válido y entrega centavos", () => {
    expect(esquemaMonto.parse("3,50")).toBe(350);
    expect(esquemaMonto.parse("1000000")).toBe(MONTO_MAXIMO_CENTAVOS);
  });

  it.each(["0", "0,00", "abc", "", "12,345"])("rechaza %j con el mensaje de la especificación", (texto) => {
    const resultado = esquemaMonto.safeParse(texto);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe("Ingresa un monto mayor que cero");
    }
  });

  it("rechaza más de $1.000.000", () => {
    const resultado = esquemaMonto.safeParse("1000000,01");
    expect(resultado.success).toBe(false);
  });
});
