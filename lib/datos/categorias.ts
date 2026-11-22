import { datosDelUsuario } from "./cliente";

/** Categorías del usuario de la sesión, en el orden de la sección 4. */
export async function listarCategorias(opciones: { incluirArchivadas?: boolean } = {}) {
  const db = await datosDelUsuario();
  return db.categoria.findMany({
    where: opciones.incluirArchivadas ? {} : { archivada: false },
    orderBy: [{ tipo: "asc" }, { orden: "asc" }],
  });
}

/** Una categoría del usuario de la sesión. Si es de otro usuario, devuelve null como si no existiera. */
export async function obtenerCategoria(id: string) {
  const db = await datosDelUsuario();
  return db.categoria.findUnique({ where: { id } });
}
