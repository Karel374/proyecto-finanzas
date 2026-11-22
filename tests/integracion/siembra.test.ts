/**
 * Siembra por usuario contra PostgreSQL real (sección 2): un usuario nuevo ya tiene
 * 15 categorías, sus ajustes, la cuenta Efectivo y las 71 ideas semilla.
 */
import { afterAll, describe, expect, it } from "vitest";

import { crearAdaptadorAuth, EMAIL_DESARROLLO, obtenerUsuarioDesarrollo } from "@/lib/datos/adaptador-auth";
import { prisma } from "@/lib/datos/prisma";
import { crearUsuarioConSiembra, sembrarUsuario } from "@/lib/datos/siembra";

const correo = () => `siembra-${crypto.randomUUID()}@ejemplo.test`;

async function contar(usuarioId: string) {
  const [categorias, ajustes, cuentas, ideas] = await Promise.all([
    prisma.categoria.count({ where: { usuarioId } }),
    prisma.ajustes.count({ where: { usuarioId } }),
    prisma.cuenta.findMany({ where: { usuarioId } }),
    prisma.ideaIngreso.count({ where: { usuarioId, esSemilla: true } }),
  ]);
  return { categorias, ajustes, cuentas, ideas };
}

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@ejemplo.test" } } });
  await prisma.$disconnect();
});

describe("siembra por usuario", () => {
  it("un usuario nuevo tiene 15 categorías, sus ajustes, la cuenta Efectivo y 71 ideas", async () => {
    const usuario = await crearUsuarioConSiembra({ email: correo(), name: "Ana" });
    const { categorias, ajustes, cuentas, ideas } = await contar(usuario.id);

    expect(categorias).toBe(15);
    expect(ajustes).toBe(1);
    expect(cuentas).toHaveLength(1);
    expect(cuentas[0]).toMatchObject({ nombre: "Efectivo", tipo: "EFECTIVO", saldoInicialCentavos: 0 });
    expect(ideas).toBe(71);
  });

  it("los ajustes arrancan con los valores por defecto de la sección 23", async () => {
    const usuario = await crearUsuarioConSiembra({ email: correo() });
    const ajustes = await prisma.ajustes.findUniqueOrThrow({ where: { usuarioId: usuario.id } });

    expect(ajustes.tema).toBe("SISTEMA");
    expect(ajustes.umbralHormigaCentavos).toBe(500);
    expect(ajustes.mesesFondoObjetivo).toBe(6);
    expect(ajustes.metaIngresoExtraCentavos).toBeNull();
    expect(ajustes.cargasFamiliares).toBe(0);
    expect(ajustes.multiplicadorIndependencia).toBe(25);
    expect(ajustes.aporteIess.toString()).toBe("9.45");
    expect(ajustes.diaRevision).toBe(1);
    expect(ajustes.porcentajeNoFacturable.toString()).toBe("30");
    expect(ajustes.colchonImprevistos.toString()).toBe("20");
    expect(ajustes.limiteCoberturaBancosCentavos).toBe(3_200_000);
    expect(ajustes.distribucionObjetivo).toMatchObject({ MODERADO: { etfsGlobales: 40 } });
    expect(ajustes.plantillasMensaje).toHaveProperty("contacto");
    expect(ajustes.plantillasMensaje).toHaveProperty("propuesta");
  });

  it("sembrar dos veces al mismo usuario no duplica nada", async () => {
    const usuario = await crearUsuarioConSiembra({ email: correo() });
    await prisma.$transaction((tx) => sembrarUsuario(tx, usuario.id));
    const { categorias, ajustes, cuentas, ideas } = await contar(usuario.id);
    expect({ categorias, ajustes, cuentas: cuentas.length, ideas }).toEqual({
      categorias: 15,
      ajustes: 1,
      cuentas: 1,
      ideas: 71,
    });
  });

  it("si la siembra falla, el usuario tampoco queda creado", async () => {
    const email = correo();
    // Se fuerza un error después de sembrar, dentro de la misma transacción.
    await expect(
      prisma.$transaction(async (tx) => {
        const usuario = await tx.user.create({ data: { email } });
        await sembrarUsuario(tx, usuario.id);
        throw new Error("fallo simulado después de sembrar");
      }),
    ).rejects.toThrow("fallo simulado");
    expect(await prisma.user.count({ where: { email } })).toBe(0);
  });

  it("el adaptador de Auth.js siembra al crear el usuario (entrada con Google)", async () => {
    const adaptador = crearAdaptadorAuth();
    const usuario = await adaptador.createUser!({
      email: correo(),
      name: "Usuario de Google",
      emailVerified: null,
      image: null,
    });
    const { categorias, ideas } = await contar(usuario.id);
    expect(categorias).toBe(15);
    expect(ideas).toBe(71);
  });

  it("el usuario de desarrollo pasa por la misma siembra y no se duplica", async () => {
    await prisma.user.deleteMany({ where: { email: EMAIL_DESARROLLO } });
    const primero = await obtenerUsuarioDesarrollo();
    const segundo = await obtenerUsuarioDesarrollo();
    expect(segundo.id).toBe(primero.id);
    const { categorias, cuentas, ideas } = await contar(primero.id);
    expect({ categorias, cuentas: cuentas.length, ideas }).toEqual({ categorias: 15, cuentas: 1, ideas: 71 });
    await prisma.user.delete({ where: { id: primero.id } });
  });
});
