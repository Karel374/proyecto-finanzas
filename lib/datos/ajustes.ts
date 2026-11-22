import type { TemaApp } from "@/lib/tema";

import { datosDelUsuario } from "./cliente";

/** Ajustes del usuario de la sesión (uno por usuario, creado en la siembra). */
export async function obtenerAjustes() {
  const db = await datosDelUsuario();
  return db.ajustes.findFirst();
}

/** Cambia el tema del usuario de la sesión. */
export async function guardarTema(tema: TemaApp) {
  const db = await datosDelUsuario();
  await db.ajustes.updateMany({ data: { tema } });
}
