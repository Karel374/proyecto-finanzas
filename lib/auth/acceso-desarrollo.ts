/**
 * Regla del acceso de desarrollo (sección 2): el botón y su proveedor existen solo si
 * NODE_ENV es "development" y ACCESO_DESARROLLO vale true. Si falta cualquiera de las dos, no existe.
 */
export const ID_PROVEEDOR_DESARROLLO = "desarrollo";

export function accesoDesarrolloActivo(env: { NODE_ENV: string; ACCESO_DESARROLLO: boolean }): boolean {
  return env.NODE_ENV === "development" && env.ACCESO_DESARROLLO;
}
