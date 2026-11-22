import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { cache } from "react";

import { opcionesAuth } from "./opciones";

/** Sesión de la petición actual. Se calcula una vez por petición. */
export const obtenerSesion = cache(() => getServerSession(opcionesAuth()));

/** Id del usuario de la sesión. Sin sesión manda a /ingresar, así que nunca devuelve vacío. */
export async function usuarioIdActual(): Promise<string> {
  const sesion = await obtenerSesion();
  const id = sesion?.user?.id;
  if (!id) redirect("/ingresar");
  return id;
}
