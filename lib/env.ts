import { z } from "zod";

/** Convierte "" en undefined para que una clave vacía en .env cuente como ausente. */
const opcional = <T extends z.ZodType>(esquema: T) =>
  z.preprocess((valor) => (valor === "" ? undefined : valor), esquema.optional());

const requerido = <T extends z.ZodType>(esquema: T) =>
  z.preprocess((valor) => (valor === "" ? undefined : valor), esquema);

export const esquemaEnv = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: requerido(z.string().regex(/^postgres(ql)?:\/\//, "Debe ser una URL de PostgreSQL")),
    NEXTAUTH_SECRET: requerido(z.string().min(32, "Debe tener al menos 32 caracteres")),
    NEXTAUTH_URL: opcional(z.url()),
    GOOGLE_CLIENT_ID: opcional(z.string()),
    GOOGLE_CLIENT_SECRET: opcional(z.string()),
    ACCESO_DESARROLLO: z
      .preprocess((valor) => (valor === "" ? undefined : valor), z.enum(["true", "false"]).default("false"))
      .transform((valor) => valor === "true"),
    CRON_SECRET: requerido(z.string().min(16, "Debe tener al menos 16 caracteres")),
    SENTRY_DSN: opcional(z.url()),
  })
  .superRefine((env, ctx) => {
    const conId = env.GOOGLE_CLIENT_ID !== undefined;
    const conSecreto = env.GOOGLE_CLIENT_SECRET !== undefined;
    if (conId !== conSecreto) {
      ctx.addIssue({
        code: "custom",
        path: [conId ? "GOOGLE_CLIENT_SECRET" : "GOOGLE_CLIENT_ID"],
        message: "Google necesita GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET juntos",
      });
    }
  });

export type Env = z.infer<typeof esquemaEnv>;

/** Valida un conjunto de variables y lanza un error en español con todas las claves que fallan. */
export function parsearEnv(fuente: Record<string, string | undefined>): Env {
  const resultado = esquemaEnv.safeParse(fuente);
  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((problema) => {
        const clave = problema.path.join(".") || "(raíz)";
        const falta = problema.code === "invalid_type" && (fuente[clave] ?? "") === "";
        const mensaje = falta ? "Falta esta variable" : problema.message;
        return `  - ${clave}: ${mensaje}`;
      })
      .join("\n");
    throw new Error(`Variables de entorno inválidas o faltantes:\n${detalle}`);
  }
  return resultado.data;
}

let envEnCache: Env | undefined;

/** Variables de entorno validadas. La primera llamada valida; si falta una clave, la app no arranca. */
export function obtenerEnv(): Env {
  envEnCache ??= parsearEnv(process.env);
  return envEnCache;
}
