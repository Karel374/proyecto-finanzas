import { obtenerSesion } from "@/lib/auth/sesion";

import { datosDelUsuario } from "./cliente";

/** Nombre y conteos de lo sembrado para el usuario de la sesión. Lo usa el panel de bienvenida. */
export async function resumenDelUsuario() {
  const [db, sesion] = await Promise.all([datosDelUsuario(), obtenerSesion()]);
  const [ajustes, categorias, cuentas, ideas] = await Promise.all([
    db.ajustes.findFirst({ select: { nombre: true, tema: true } }),
    db.categoria.count({ where: { archivada: false } }),
    db.cuenta.findMany({ where: { archivada: false }, select: { nombre: true } }),
    db.ideaIngreso.count(),
  ]);
  return {
    nombre: ajustes?.nombre ?? sesion?.user?.name ?? sesion?.user?.email ?? "",
    tema: ajustes?.tema ?? "SISTEMA",
    categorias,
    cuentas: cuentas.map((cuenta) => cuenta.nombre),
    ideas,
  };
}
