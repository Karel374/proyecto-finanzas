/**
 * Server Actions con validación Zod y errores tipados (sección 2, "Lecturas y escrituras").
 * Toda acción recibe `unknown`, porque lo que llega del navegador no es confiable, lo valida con
 * su esquema y responde siempre con un `Resultado`: nunca lanza un error hacia la interfaz.
 */
import { z } from "zod";

/** CONFIRMAR: la acción necesita que el usuario confirme algo (por ejemplo, un monto inusual). */
export type CodigoError =
  "VALIDACION" | "CONFIRMAR" | "NO_ENCONTRADO" | "DUPLICADO" | "EN_USO" | "INESPERADO";

export type Resultado<T = void> =
  { ok: true; datos: T } | { ok: false; codigo: CodigoError; error: string; campos?: Record<string, string> };

/** Error que una acción lanza a propósito para responder con un mensaje y código concretos. */
export class ErrorDeAccion extends Error {
  constructor(
    readonly codigo: CodigoError,
    mensaje: string,
    /** Campo del formulario al que pertenece el error, para mostrarlo debajo de él. */
    readonly campo?: string,
  ) {
    super(mensaje);
    this.name = "ErrorDeAccion";
  }
}

/** Primer mensaje de cada campo con error, para mostrarlo debajo del campo. */
export function camposConError(error: z.ZodError): Record<string, string> {
  const campos: Record<string, string> = {};
  for (const problema of error.issues) {
    const clave = problema.path.join(".") || "_";
    campos[clave] ??= problema.message;
  }
  return campos;
}

/** Códigos de error de Prisma, leídos sin importar Prisma para no acoplar la interfaz a la base. */
function codigoPrisma(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const codigo = (error as { code: unknown }).code;
    return typeof codigo === "string" ? codigo : undefined;
  }
  return undefined;
}

/** Traduce cualquier error a un resultado fallido con mensaje en español. */
export function aResultadoFallido(error: unknown): Extract<Resultado, { ok: false }> {
  if (error instanceof ErrorDeAccion) {
    return error.campo
      ? { ok: false, codigo: error.codigo, error: error.message, campos: { [error.campo]: error.message } }
      : { ok: false, codigo: error.codigo, error: error.message };
  }
  switch (codigoPrisma(error)) {
    case "P2025":
      return { ok: false, codigo: "NO_ENCONTRADO", error: "No se encontró el registro" };
    case "P2002":
      return { ok: false, codigo: "DUPLICADO", error: "Ya existe un registro con esos datos" };
    case "P2003":
      return { ok: false, codigo: "EN_USO", error: "No se puede borrar porque otros datos lo usan" };
  }
  console.error(error);
  return { ok: false, codigo: "INESPERADO", error: "Algo salió mal. Intenta de nuevo." };
}

/**
 * Arma una acción: valida la entrada con el esquema y ejecuta `hacer` con los datos ya tipados.
 * Uso: `export const crearX = accion(esquemaX, async (datos) => { ... })` en un archivo "use server".
 */
export function accion<E extends z.ZodType, T>(
  esquema: E,
  hacer: (datos: z.output<E>) => Promise<T>,
): (entrada: unknown) => Promise<Resultado<T>> {
  return async (entrada) => {
    const validado = esquema.safeParse(entrada);
    if (!validado.success) {
      const campos = camposConError(validado.error);
      return {
        ok: false,
        codigo: "VALIDACION",
        error: Object.values(campos)[0] ?? "Datos no válidos",
        campos,
      };
    }
    try {
      return { ok: true, datos: await hacer(validado.data) };
    } catch (error) {
      // Las redirecciones y el notFound() de Next viajan como errores: no se tragan.
      if (esErrorDeNavegacion(error)) throw error;
      return aResultadoFallido(error);
    }
  };
}

function esErrorDeNavegacion(error: unknown): boolean {
  const digest =
    typeof error === "object" && error !== null ? (error as { digest?: unknown }).digest : undefined;
  return (
    typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_HTTP_ERROR"))
  );
}
