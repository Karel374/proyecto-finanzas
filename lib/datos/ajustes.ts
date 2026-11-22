import type { Tema } from "@/generated/prisma/client";
import { usuarioIdActual } from "@/lib/auth/sesion";

import { prisma } from "./prisma";

/** Ajustes del usuario de la sesión (uno por usuario, creado en la siembra). */
export async function obtenerAjustes() {
  const usuarioId = await usuarioIdActual();
  return prisma.ajustes.findUnique({ where: { usuarioId } });
}

/** Cambia el tema del usuario de la sesión. */
export async function guardarTema(tema: Tema) {
  const usuarioId = await usuarioIdActual();
  await prisma.ajustes.update({ where: { usuarioId }, data: { tema } });
}
