"use server";

import { cookies } from "next/headers";

import { guardarTema } from "@/lib/datos/ajustes";
import { COOKIE_TEMA, esquemaTema } from "@/lib/tema";

export type ResultadoAccion = { ok: true } | { ok: false; error: string };

/** Guarda el tema en Ajustes y en la cookie que lo pinta antes de cargar la página. */
export async function cambiarTema(valor: unknown): Promise<ResultadoAccion> {
  const resultado = esquemaTema.safeParse(valor);
  if (!resultado.success) return { ok: false, error: "Tema no válido" };

  await guardarTema(resultado.data);
  (await cookies()).set(COOKIE_TEMA, resultado.data, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return { ok: true };
}
