import { usuarioIdActual } from "@/lib/auth/sesion";

import { prisma } from "./prisma";

/** Nombre y conteos de lo sembrado para el usuario de la sesión. Lo usa el panel de bienvenida. */
export async function resumenDelUsuario() {
  const usuarioId = await usuarioIdActual();
  const [usuario, ajustes, categorias, cuentas, ideas] = await Promise.all([
    prisma.user.findUnique({ where: { id: usuarioId }, select: { name: true, email: true } }),
    prisma.ajustes.findUnique({ where: { usuarioId }, select: { nombre: true, tema: true } }),
    prisma.categoria.count({ where: { usuarioId, archivada: false } }),
    prisma.cuenta.findMany({ where: { usuarioId, archivada: false }, select: { nombre: true } }),
    prisma.ideaIngreso.count({ where: { usuarioId } }),
  ]);
  return {
    nombre: ajustes?.nombre ?? usuario?.name ?? usuario?.email ?? "",
    tema: ajustes?.tema ?? "SISTEMA",
    categorias,
    cuentas: cuentas.map((cuenta) => cuenta.nombre),
    ideas,
  };
}
