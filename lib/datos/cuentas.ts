import { usuarioIdActual } from "@/lib/auth/sesion";

import { prisma } from "./prisma";

/** Cuentas activas del usuario de la sesión. */
export async function listarCuentas() {
  const usuarioId = await usuarioIdActual();
  return prisma.cuenta.findMany({ where: { usuarioId, archivada: false }, orderBy: { nombre: "asc" } });
}

/** Una cuenta del usuario de la sesión. Si es de otro usuario, devuelve null como si no existiera. */
export async function obtenerCuenta(id: string) {
  const usuarioId = await usuarioIdActual();
  return prisma.cuenta.findFirst({ where: { id, usuarioId } });
}
