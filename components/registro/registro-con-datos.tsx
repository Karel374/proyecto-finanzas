import { datosDelFormulario } from "@/lib/datos/movimientos";
import { listarPlantillas } from "@/lib/datos/plantillas";
import { generarRecurrentesDelUsuario } from "@/lib/datos/recurrentes";

import { PanelRegistro } from "./panel-registro";

/** Carga en el servidor lo que necesita el panel de registro y lo entrega al panel del navegador. */
export async function RegistroConDatos() {
  const [datos, plantillas] = await Promise.all([datosDelFormulario(), listarPlantillas()]);
  return <PanelRegistro datos={datos} plantillas={plantillas} />;
}

/**
 * Respaldo del cron (sección 7): al abrir la app se generan los recurrentes pendientes del usuario,
 * por si el cron del día falló. La generación no duplica, así que correrla de más no hace daño.
 */
export async function RespaldoRecurrentes() {
  await generarRecurrentesDelUsuario();
  return null;
}
