import { describe, expect, it } from "vitest";

import { accesoDesarrolloActivo } from "@/lib/auth/acceso-desarrollo";
import { atributoTema, esquemaTema } from "@/lib/tema";

describe("acceso de desarrollo (sección 2)", () => {
  it("solo existe con NODE_ENV=development y ACCESO_DESARROLLO=true", () => {
    expect(accesoDesarrolloActivo({ NODE_ENV: "development", ACCESO_DESARROLLO: true })).toBe(true);
  });

  it.each([
    ["production", true],
    ["test", true],
    ["development", false],
    ["production", false],
  ])("no existe con NODE_ENV=%s y ACCESO_DESARROLLO=%s", (NODE_ENV, ACCESO_DESARROLLO) => {
    expect(accesoDesarrolloActivo({ NODE_ENV, ACCESO_DESARROLLO })).toBe(false);
  });
});

describe("tema", () => {
  it("claro y oscuro ponen su atributo; sistema no pone ninguno", () => {
    expect(atributoTema("CLARO")).toBe("claro");
    expect(atributoTema("OSCURO")).toBe("oscuro");
    expect(atributoTema("SISTEMA")).toBeNull();
  });

  it("el esquema rechaza valores que no son tema", () => {
    expect(esquemaTema.safeParse("OSCURO").success).toBe(true);
    expect(esquemaTema.safeParse("oscuro").success).toBe(false);
    expect(esquemaTema.safeParse(undefined).success).toBe(false);
  });
});
