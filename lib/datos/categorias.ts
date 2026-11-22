import { usuarioIdActual } from "@/lib/auth/sesion";

import { prisma } from "./prisma";

/** Categorías del usuario de la sesión, en el orden de la sección 4. */
export async function listarCategorias(opciones: { incluirArchivadas?: boolean } = {}) {
  const usuarioId = await usuarioIdActual();
  return prisma.categoria.findMany({
    where: { usuarioId, ...(opciones.incluirArchivadas ? {} : { archivada: false }) },
    orderBy: [{ tipo: "asc" }, { orden: "asc" }],
  });
}

/** Una categoría del usuario de la sesión. Si es de otro usuario, devuelve null como si no existiera. */
export async function obtenerCategoria(id: string) {
  const usuarioId = await usuarioIdActual();
  return prisma.categoria.findFirst({ where: { id, usuarioId } });
}
