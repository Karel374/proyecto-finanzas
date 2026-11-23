import { ErrorDeAccion } from "@/lib/acciones";
import type { TipoMovimiento } from "@/lib/calculos/movimientos";

import type { ClienteDelUsuario } from "./cliente";

/**
 * Valida que la categoría y la cuenta que llegan del formulario sean del usuario, estén activas y
 * la categoría sea del tipo del movimiento. Como se buscan con el cliente del usuario, un id de otro
 * usuario no se encuentra: así un movimiento nunca puede apuntar a datos ajenos.
 */
export async function validarCategoriaYCuenta(
  db: ClienteDelUsuario,
  tipo: TipoMovimiento,
  categoriaId: string,
  cuentaId: string,
) {
  const [categoria, cuenta] = await Promise.all([
    db.categoria.findUnique({ where: { id: categoriaId } }),
    db.cuenta.findUnique({ where: { id: cuentaId } }),
  ]);
  if (!categoria || categoria.archivada || categoria.tipo !== tipo) {
    throw new ErrorDeAccion("VALIDACION", "Elige una categoría", "categoriaId");
  }
  if (!cuenta || cuenta.archivada) {
    throw new ErrorDeAccion("VALIDACION", "Elige la cuenta", "cuentaId");
  }
  return { categoria, cuenta };
}

/** Valida una cuenta activa del usuario para una transferencia. */
export async function validarCuentaActiva(db: ClienteDelUsuario, cuentaId: string, campo: string) {
  const cuenta = await db.cuenta.findUnique({ where: { id: cuentaId } });
  if (!cuenta || cuenta.archivada) {
    throw new ErrorDeAccion("VALIDACION", "Elige la cuenta", campo);
  }
  return cuenta;
}
