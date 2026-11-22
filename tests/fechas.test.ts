import { describe, expect, it } from "vitest";

import { aColumnaDate, fechaEnEcuador } from "@/lib/fechas";

describe("fechaEnEcuador", () => {
  it("antes de las 05:00 UTC todavía es el día anterior en Ecuador (UTC−5)", () => {
    expect(fechaEnEcuador(new Date("2026-12-01T04:59:59Z"))).toBe("2026-11-30");
    expect(fechaEnEcuador(new Date("2026-12-01T05:00:00Z"))).toBe("2026-12-01");
  });
});

describe("aColumnaDate", () => {
  it("convierte AAAA-MM-DD en medianoche UTC", () => {
    expect(aColumnaDate("2026-11-22").toISOString()).toBe("2026-11-22T00:00:00.000Z");
  });

  it("rechaza formatos que no son AAAA-MM-DD", () => {
    expect(() => aColumnaDate("22/11/2026")).toThrow();
  });
});
