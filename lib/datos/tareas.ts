import type { FechaISO } from "@/lib/fechas";

import { clienteDelUsuario } from "./cliente";
import { prisma } from "./prisma";
import { generarRecurrentes } from "./recurrentes";

/**
 * Tareas del cron diario (sección 2). Es infraestructura: recorre a todos los usuarios con
 * recurrentes activos y, para cada uno, trabaja con su propio cliente del usuario.
 * Un error con un usuario no detiene a los demás.
 */
export async function tareasDiarias(hoyISO: FechaISO) {
  const usuarios = await prisma.recurrente.findMany({
    where: { activo: true },
    distinct: ["usuarioId"],
    select: { usuarioId: true },
  });

  let movimientosCreados = 0;
  const errores: string[] = [];
  for (const { usuarioId } of usuarios) {
    try {
      movimientosCreados += await generarRecurrentes(clienteDelUsuario(usuarioId), hoyISO);
    } catch (error) {
      console.error(`Cron: falló la generación de recurrentes de ${usuarioId}`, error);
      errores.push(usuarioId);
    }
  }
  return { usuarios: usuarios.length, movimientosCreados, errores: errores.length };
}
