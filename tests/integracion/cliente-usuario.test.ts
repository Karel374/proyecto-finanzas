/**
 * El cliente del usuario (lib/datos/cliente.ts) impone el filtro por usuarioId en cada operación,
 * contra PostgreSQL real. Es la garantía de que un usuario no puede leer ni tocar datos de otro.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { aplicarUsuario, clienteDelUsuario } from "@/lib/datos/cliente";
import { prisma } from "@/lib/datos/prisma";
import { crearUsuarioConSiembra } from "@/lib/datos/siembra";

let ana: string;
let beto: string;
let categoriaDeBeto: string;
let cuentaDeBeto: string;

beforeAll(async () => {
  const [a, b] = await Promise.all([
    crearUsuarioConSiembra({ email: `cliente-a-${crypto.randomUUID()}@ejemplo.test` }),
    crearUsuarioConSiembra({ email: `cliente-b-${crypto.randomUUID()}@ejemplo.test` }),
  ]);
  ana = a.id;
  beto = b.id;
  categoriaDeBeto = (await prisma.categoria.findFirstOrThrow({ where: { usuarioId: beto } })).id;
  cuentaDeBeto = (await prisma.cuenta.findFirstOrThrow({ where: { usuarioId: beto } })).id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@ejemplo.test" } } });
  await prisma.$disconnect();
});

describe("lecturas", () => {
  it("findMany y count solo ven los datos del usuario", async () => {
    const db = clienteDelUsuario(ana);
    const categorias = await db.categoria.findMany();
    expect(categorias).toHaveLength(15);
    expect(categorias.every((c) => c.usuarioId === ana)).toBe(true);
    expect(await db.ideaIngreso.count()).toBe(71);
  });

  it("findUnique por id de otro usuario devuelve null", async () => {
    const db = clienteDelUsuario(ana);
    expect(await db.categoria.findUnique({ where: { id: categoriaDeBeto } })).toBeNull();
    expect(await db.cuenta.findFirst({ where: { id: cuentaDeBeto } })).toBeNull();
  });

  it("aunque el llamador pida explícitamente el usuarioId de otro, se impone el de la sesión", async () => {
    const db = clienteDelUsuario(ana);
    expect(await db.categoria.findMany({ where: { usuarioId: beto } })).toHaveLength(15);
    const todas = await db.categoria.findMany({ where: { usuarioId: beto } });
    expect(todas.every((c) => c.usuarioId === ana)).toBe(true);
  });

  it("aggregate y groupBy también filtran", async () => {
    const db = clienteDelUsuario(ana);
    const suma = await db.categoria.aggregate({ _count: { _all: true } });
    expect(suma._count._all).toBe(15);
    const porTipo = await db.categoria.groupBy({ by: ["tipo"], _count: { _all: true } });
    expect(porTipo.reduce((total, grupo) => total + grupo._count._all, 0)).toBe(15);
  });
});

describe("escrituras", () => {
  it("create fuerza el usuarioId de la sesión aunque se mande otro", async () => {
    const db = clienteDelUsuario(ana);
    const creada = await db.categoria.create({
      data: { usuarioId: beto, nombre: "Mascotas", tipo: "GASTO", clase: "DESEO", orden: 11 },
    });
    expect(creada.usuarioId).toBe(ana);
    await db.categoria.delete({ where: { id: creada.id } });
  });

  it("createMany fuerza el usuarioId en cada fila", async () => {
    const db = clienteDelUsuario(ana);
    await db.escenario.createMany({
      data: [
        { usuarioId: beto, nombre: "Escenario 1", parametros: {} },
        { usuarioId: beto, nombre: "Escenario 2", parametros: {} },
      ],
    });
    expect(await prisma.escenario.count({ where: { usuarioId: ana } })).toBe(2);
    expect(await prisma.escenario.count({ where: { usuarioId: beto } })).toBe(0);
  });

  it("update y delete de un registro ajeno fallan como 'no encontrado'", async () => {
    const db = clienteDelUsuario(ana);
    await expect(
      db.categoria.update({ where: { id: categoriaDeBeto }, data: { nombre: "Hackeada" } }),
    ).rejects.toMatchObject({ code: "P2025" });
    await expect(db.cuenta.delete({ where: { id: cuentaDeBeto } })).rejects.toMatchObject({ code: "P2025" });

    const intacta = await prisma.categoria.findUniqueOrThrow({ where: { id: categoriaDeBeto } });
    expect(intacta.nombre).not.toBe("Hackeada");
  });

  it("updateMany y deleteMany sin filtro no tocan a otros usuarios", async () => {
    const db = clienteDelUsuario(ana);
    const actualizadas = await db.ajustes.updateMany({ data: { umbralHormigaCentavos: 800 } });
    expect(actualizadas.count).toBe(1);
    expect(
      (await prisma.ajustes.findUniqueOrThrow({ where: { usuarioId: beto } })).umbralHormigaCentavos,
    ).toBe(500);

    const borradas = await db.escenario.deleteMany();
    expect(borradas.count).toBe(2);
  });

  it("upsert busca y crea dentro del usuario", async () => {
    const db = clienteDelUsuario(ana);
    const perfil = await db.perfilProfesional.upsert({
      where: { usuarioId: beto },
      create: { usuarioId: beto, profesion: "Ingeniería" },
      update: { profesion: "Ingeniería" },
    });
    expect(perfil.usuarioId).toBe(ana);
    expect(await prisma.perfilProfesional.count({ where: { usuarioId: beto } })).toBe(0);
  });
});

describe("modelos globales", () => {
  it("las tablas sin datos por usuario no se pueden usar con el cliente del usuario", async () => {
    const db = clienteDelUsuario(ana);
    await expect(db.user.findMany()).rejects.toThrow("no tiene datos por usuario");
    await expect(db.parametrosSRI.findMany()).rejects.toThrow("no tiene datos por usuario");
  });

  it("no se puede crear un cliente sin usuario", () => {
    expect(() => clienteDelUsuario("")).toThrow();
  });
});

describe("aplicarUsuario", () => {
  it("rechaza operaciones que no conoce, en vez de dejarlas pasar sin filtro", () => {
    expect(() => aplicarUsuario("$queryRaw", {}, ana)).toThrow("Operación no permitida");
  });
});
