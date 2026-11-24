import { describe, expect, it } from "vitest";

import {
  desvioEn,
  limitar,
  mezclar,
  muestrearTrayecto,
  pendienteEn,
  rutaSvg,
  type Tramo,
} from "@/lib/landing/trayecto";

const TRAMOS: Tramo[] = [
  { inicio: 0, fin: 1000, tipo: "recto" },
  { inicio: 1000, fin: 3000, tipo: "caotico" },
  { inicio: 3000, fin: 5000, tipo: "recto" },
];

describe("desvioEn", () => {
  it("es cero en los tramos rectos y fuera de todo tramo", () => {
    expect(desvioEn(500, TRAMOS, 80)).toBe(0);
    expect(desvioEn(4000, TRAMOS, 80)).toBe(0);
    expect(desvioEn(9000, TRAMOS, 80)).toBe(0);
  });

  it("entra y sale recto del tramo caótico", () => {
    expect(Math.abs(desvioEn(1000, TRAMOS, 80))).toBeLessThan(1e-9);
    expect(Math.abs(desvioEn(3000, TRAMOS, 80))).toBeLessThan(1e-9);
  });

  it("zigzaguea dentro del tramo caótico sin pasarse de la amplitud", () => {
    const valores = Array.from({ length: 400 }, (_, i) => desvioEn(1000 + i * 5, TRAMOS, 80));
    expect(Math.max(...valores.map(Math.abs))).toBeLessThanOrEqual(80);
    expect(valores.some((v) => v > 10)).toBe(true);
    expect(valores.some((v) => v < -10)).toBe(true);
  });

  it("ignora un tramo mal formado", () => {
    expect(desvioEn(10, [{ inicio: 10, fin: 10, tipo: "caotico" }], 80)).toBe(0);
  });
});

describe("muestrearTrayecto", () => {
  it("cubre el rango completo sobre el carril", () => {
    const puntos = muestrearTrayecto(0, 100, TRAMOS, { carril: 50, amplitud: 80, paso: 10 });
    expect(puntos[0]).toEqual({ x: 50, y: 0 });
    expect(puntos.at(-1)).toEqual({ x: 50, y: 100 });
    expect(puntos).toHaveLength(11);
  });

  it("devuelve vacío si el rango está invertido", () => {
    expect(muestrearTrayecto(100, 0, TRAMOS, { carril: 0, amplitud: 0 })).toEqual([]);
  });

  it("nunca usa un paso menor a 1 px", () => {
    expect(muestrearTrayecto(0, 3, [], { carril: 0, amplitud: 0, paso: 0 })).toHaveLength(4);
  });
});

describe("rutaSvg", () => {
  it("une los puntos con coordenadas redondeadas", () => {
    expect(
      rutaSvg([
        { x: 1.234, y: 0 },
        { x: 2, y: 5.06 },
      ]),
    ).toBe("M1.2 0L2 5.1");
  });
});

describe("pendienteEn", () => {
  it("es cero donde la línea va recta", () => {
    expect(pendienteEn(500, TRAMOS, 80)).toBe(0);
  });

  it("cambia dentro del tramo caótico", () => {
    expect(pendienteEn(2000, TRAMOS, 80)).not.toBe(0);
  });
});

describe("ayudas numéricas", () => {
  it("limitar y mezclar", () => {
    expect(limitar(5, 0, 1)).toBe(1);
    expect(limitar(-5, 0, 1)).toBe(0);
    expect(mezclar(10, 20, 0.25)).toBe(12.5);
  });
});
