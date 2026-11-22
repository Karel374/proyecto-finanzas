import { describe, expect, it } from "vitest";
import { z } from "zod";

import { accion, aResultadoFallido, ErrorDeAccion } from "@/lib/acciones";
import { esquemaMonto } from "@/lib/dinero";

const esquema = z.object({
  monto: esquemaMonto,
  nota: z.string().max(140, "La nota admite hasta 140 caracteres"),
});

describe("accion()", () => {
  it("valida la entrada y entrega los datos ya transformados", async () => {
    const registrar = accion(esquema, async (datos) => datos.monto * 2);
    expect(await registrar({ monto: "3,50", nota: "Almuerzo" })).toEqual({ ok: true, datos: 700 });
  });

  it("con datos inválidos responde VALIDACION con el mensaje de cada campo", async () => {
    let llamada = false;
    const registrar = accion(esquema, async () => {
      llamada = true;
    });
    const resultado = await registrar({ monto: "0", nota: "x".repeat(141) });
    expect(llamada).toBe(false);
    expect(resultado).toEqual({
      ok: false,
      codigo: "VALIDACION",
      error: "Ingresa un monto mayor que cero",
      campos: { monto: "Ingresa un monto mayor que cero", nota: "La nota admite hasta 140 caracteres" },
    });
  });

  it("una entrada que no es objeto también se rechaza sin lanzar", async () => {
    const resultado = await accion(esquema, async () => 1)("basura");
    expect(resultado.ok).toBe(false);
  });

  it("un ErrorDeAccion se responde con su código y mensaje", async () => {
    const resultado = await accion(z.string(), async () => {
      throw new ErrorDeAccion("EN_USO", "La categoría tiene movimientos");
    })("x");
    expect(resultado).toEqual({ ok: false, codigo: "EN_USO", error: "La categoría tiene movimientos" });
  });

  it("las redirecciones de Next no se tragan", async () => {
    const redireccion = Object.assign(new Error("NEXT_REDIRECT"), {
      digest: "NEXT_REDIRECT;replace;/ingresar;307;",
    });
    await expect(
      accion(z.string(), async () => {
        throw redireccion;
      })("x"),
    ).rejects.toBe(redireccion);
  });
});

describe("aResultadoFallido", () => {
  it.each([
    ["P2025", "NO_ENCONTRADO"],
    ["P2002", "DUPLICADO"],
    ["P2003", "EN_USO"],
  ])("el error %s de Prisma se traduce a %s", (code, codigo) => {
    expect(aResultadoFallido({ code })).toMatchObject({ ok: false, codigo });
  });

  it("cualquier otro error es INESPERADO, con un mensaje que no filtra detalles", () => {
    const original = console.error;
    console.error = () => {};
    try {
      expect(aResultadoFallido(new Error("conexión rechazada en 10.0.0.5"))).toEqual({
        ok: false,
        codigo: "INESPERADO",
        error: "Algo salió mal. Intenta de nuevo.",
      });
    } finally {
      console.error = original;
    }
  });
});
