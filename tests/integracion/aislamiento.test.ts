/**
 * Un usuario no puede leer datos de otro (criterio de la fase 2).
 * Se reemplaza solo la sesión: la capa lib/datos corre igual que en la app, contra PostgreSQL real.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const sesion = vi.hoisted(() => ({ usuarioId: "" }));

vi.mock("@/lib/auth/sesion", () => ({
  usuarioIdActual: async () => sesion.usuarioId,
  obtenerSesion: async () => ({ user: { id: sesion.usuarioId } }),
}));

import { guardarTema, obtenerAjustes } from "@/lib/datos/ajustes";
import { listarCategorias, obtenerCategoria } from "@/lib/datos/categorias";
import { listarCuentas, obtenerCuenta } from "@/lib/datos/cuentas";
import { prisma } from "@/lib/datos/prisma";
import { crearUsuarioConSiembra } from "@/lib/datos/siembra";
import { resumenDelUsuario } from "@/lib/datos/usuario";

let ana: string;
let beto: string;

beforeAll(async () => {
  const [usuarioA, usuarioB] = await Promise.all([
    crearUsuarioConSiembra({ email: `ana-${crypto.randomUUID()}@ejemplo.test`, name: "Ana" }),
    crearUsuarioConSiembra({ email: `beto-${crypto.randomUUID()}@ejemplo.test`, name: "Beto" }),
  ]);
  ana = usuarioA.id;
  beto = usuarioB.id;
});

beforeEach(() => {
  sesion.usuarioId = ana;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@ejemplo.test" } } });
  await prisma.$disconnect();
});

describe("aislamiento entre usuarios", () => {
  it("las listas solo traen datos del usuario de la sesión", async () => {
    const categorias = await listarCategorias({ incluirArchivadas: true });
    const cuentas = await listarCuentas();
    expect(categorias).toHaveLength(15);
    expect(categorias.every((c) => c.usuarioId === ana)).toBe(true);
    expect(cuentas.every((c) => c.usuarioId === ana)).toBe(true);
  });

  it("pedir una categoría o cuenta de otro usuario por su id devuelve null", async () => {
    const categoriaDeBeto = await prisma.categoria.findFirstOrThrow({ where: { usuarioId: beto } });
    const cuentaDeBeto = await prisma.cuenta.findFirstOrThrow({ where: { usuarioId: beto } });

    expect(await obtenerCategoria(categoriaDeBeto.id)).toBeNull();
    expect(await obtenerCuenta(cuentaDeBeto.id)).toBeNull();

    sesion.usuarioId = beto;
    expect(await obtenerCategoria(categoriaDeBeto.id)).not.toBeNull();
  });

  it("cambiar el tema solo toca los ajustes del usuario de la sesión", async () => {
    await guardarTema("OSCURO");
    expect((await obtenerAjustes())?.tema).toBe("OSCURO");

    sesion.usuarioId = beto;
    expect((await obtenerAjustes())?.tema).toBe("SISTEMA");
  });

  it("el resumen del inicio es el del usuario de la sesión", async () => {
    sesion.usuarioId = beto;
    const resumen = await resumenDelUsuario();
    expect(resumen.nombre).toBe("Beto");
    expect(resumen).toMatchObject({ categorias: 15, cuentas: ["Efectivo"], ideas: 71 });
  });
});
