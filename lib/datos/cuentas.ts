import { datosDelUsuario } from "./cliente";

/** Cuentas activas del usuario de la sesión. */
export async function listarCuentas() {
  const db = await datosDelUsuario();
  return db.cuenta.findMany({ where: { archivada: false }, orderBy: { nombre: "asc" } });
}

/** Una cuenta del usuario de la sesión. Si es de otro usuario, devuelve null como si no existiera. */
export async function obtenerCuenta(id: string) {
  const db = await datosDelUsuario();
  return db.cuenta.findUnique({ where: { id } });
}
