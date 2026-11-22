"use server";

import { cookies } from "next/headers";

import { accion } from "@/lib/acciones";
import { guardarTema } from "@/lib/datos/ajustes";
import { COOKIE_TEMA, esquemaTema } from "@/lib/tema";

/** Guarda el tema en Ajustes y en la cookie que lo pinta antes de cargar la página. */
export const cambiarTema = accion(esquemaTema, async (tema) => {
  await guardarTema(tema);
  (await cookies()).set(COOKIE_TEMA, tema, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
});
