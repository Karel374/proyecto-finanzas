/**
 * Prueba sobre el build de producción (sección 2): el botón de desarrollo no aparece y su ruta da 404,
 * aunque ACCESO_DESARROLLO valga true. Requiere `npm run build` antes.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { setTimeout as esperar } from "node:timers/promises";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PUERTO = 3999;
const BASE = `http://localhost:${PUERTO}`;
let servidor: ChildProcess;

beforeAll(async () => {
  if (!existsSync(".next/BUILD_ID")) {
    throw new Error("No hay build de producción. Corre `npm run build` antes de esta prueba.");
  }
  servidor = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PUERTO)], {
    env: { ...process.env, NODE_ENV: "production", ACCESO_DESARROLLO: "true" },
    stdio: "ignore",
  });

  for (let intento = 0; intento < 60; intento++) {
    try {
      const respuesta = await fetch(`${BASE}/ingresar`);
      if (respuesta.ok) return;
    } catch {
      // Todavía no escucha.
    }
    await esperar(500);
  }
  throw new Error("El servidor de producción no arrancó a tiempo");
}, 60_000);

afterAll(() => {
  servidor?.kill();
});

describe("build de producción", () => {
  it("la página de ingreso no muestra el botón de desarrollo", async () => {
    const html = await (await fetch(`${BASE}/ingresar`)).text();
    expect(html).toContain("Finanzas personales");
    expect(html).not.toContain("Entrar como desarrollador");
  });

  it("NextAuth no lista el proveedor de desarrollo", async () => {
    const proveedores = (await (await fetch(`${BASE}/api/auth/providers`)).json()) as Record<string, unknown>;
    expect(Object.keys(proveedores)).not.toContain("desarrollo");
  });

  it("las rutas del proveedor de desarrollo responden 404", async () => {
    expect((await fetch(`${BASE}/api/auth/signin/desarrollo`, { redirect: "manual" })).status).toBe(404);
    expect(
      (await fetch(`${BASE}/api/auth/callback/desarrollo`, { method: "POST", redirect: "manual" })).status,
    ).toBe(404);
  });

  it("el cron diario rechaza a quien no trae CRON_SECRET", async () => {
    expect((await fetch(`${BASE}/api/cron/diario`)).status).toBe(401);
    const otro = await fetch(`${BASE}/api/cron/diario`, {
      headers: { authorization: "Bearer no-es-el-secreto" },
    });
    expect(otro.status).toBe(401);
  });

  it("con CRON_SECRET el cron corre y dice qué hizo", async () => {
    const respuesta = await fetch(`${BASE}/api/cron/diario`, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });
    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toMatchObject({ errores: 0 });
  });

  it("sin sesión, / muestra la landing pública", async () => {
    const respuesta = await fetch(`${BASE}/`, { redirect: "manual" });
    expect(respuesta.status).toBe(200);
    expect(await respuesta.text()).toContain("Cada dólar, abierto en partes.");
  });

  it("sin sesión, el panel manda a /ingresar", async () => {
    const respuesta = await fetch(`${BASE}/panel`, { redirect: "manual" });
    expect(respuesta.status).toBe(307);
    expect(respuesta.headers.get("location")).toContain("/ingresar");
  });
});
