import { describe, expect, it } from "vitest";

import { parsearEnv } from "@/lib/env";

const base = {
  NODE_ENV: "development",
  DATABASE_URL: "postgresql://usuario:clave@localhost:5433/finanzas",
  NEXTAUTH_SECRET: "x".repeat(32),
  CRON_SECRET: "y".repeat(16),
};

describe("parsearEnv", () => {
  it("acepta una configuración mínima válida", () => {
    const env = parsearEnv(base);
    expect(env.DATABASE_URL).toBe(base.DATABASE_URL);
    expect(env.ACCESO_DESARROLLO).toBe(false);
  });

  it("falla si falta DATABASE_URL y lo dice en español", () => {
    const { DATABASE_URL: _omitida, ...sinBase } = base;
    expect(() => parsearEnv(sinBase)).toThrow(/Variables de entorno.*\n.*DATABASE_URL: Falta esta variable/);
  });

  it("trata una clave vacía como faltante", () => {
    expect(() => parsearEnv({ ...base, NEXTAUTH_SECRET: "" })).toThrow(
      /NEXTAUTH_SECRET: Falta esta variable/,
    );
  });

  it("rechaza una URL que no es de PostgreSQL", () => {
    expect(() => parsearEnv({ ...base, DATABASE_URL: "mysql://localhost/db" })).toThrow(
      /DATABASE_URL: Debe ser una URL de PostgreSQL/,
    );
  });

  it("rechaza secretos cortos", () => {
    expect(() => parsearEnv({ ...base, CRON_SECRET: "corto" })).toThrow(/CRON_SECRET/);
  });

  it("convierte ACCESO_DESARROLLO en booleano y solo acepta true o false", () => {
    expect(parsearEnv({ ...base, ACCESO_DESARROLLO: "true" }).ACCESO_DESARROLLO).toBe(true);
    expect(parsearEnv({ ...base, ACCESO_DESARROLLO: "" }).ACCESO_DESARROLLO).toBe(false);
    expect(() => parsearEnv({ ...base, ACCESO_DESARROLLO: "si" })).toThrow(/ACCESO_DESARROLLO/);
  });

  it("exige las dos claves de Google juntas", () => {
    expect(() => parsearEnv({ ...base, GOOGLE_CLIENT_ID: "id" })).toThrow(/GOOGLE_CLIENT_SECRET/);
    expect(parsearEnv({ ...base, GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "s" }).GOOGLE_CLIENT_ID).toBe(
      "id",
    );
  });
});
