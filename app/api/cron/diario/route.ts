import { timingSafeEqual } from "node:crypto";

import { tareasDiarias } from "@/lib/datos/tareas";
import { obtenerEnv } from "@/lib/env";
import { hoy } from "@/lib/fechas";

/** Compara en tiempo constante para no filtrar el secreto por cuánto tarda la respuesta. */
function secretoValido(cabecera: string | null): boolean {
  const esperado = Buffer.from(`Bearer ${obtenerEnv().CRON_SECRET}`);
  const recibido = Buffer.from(cabecera ?? "");
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado);
}

/**
 * Cron diario a las 00:05 de Ecuador (05:05 UTC, ver vercel.json). Vercel manda
 * `Authorization: Bearer <CRON_SECRET>`; sin él la ruta responde 401.
 * Genera los recurrentes; la foto mensual del patrimonio y los avisos llegan en fases posteriores.
 */
export async function GET(request: Request) {
  if (!secretoValido(request.headers.get("authorization"))) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const fecha = hoy();
  const resultado = await tareasDiarias(fecha);
  return Response.json({ fecha, ...resultado });
}
