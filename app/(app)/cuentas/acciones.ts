"use server";

import { refresh } from "next/cache";

import { accion } from "@/lib/acciones";
import { archivarCuenta, crearCuenta, cuadrarCuenta, editarCuenta } from "@/lib/datos/cuentas";
import { borrarTransferencia } from "@/lib/datos/transferencias";
import { esquemaCuadrar, esquemaCuenta, esquemaEditarCuenta, esquemaId } from "@/lib/esquemas";

export const agregarCuenta = accion(esquemaCuenta, async (datos) => {
  const cuenta = await crearCuenta(datos);
  refresh();
  return { id: cuenta.id };
});

export const actualizarCuenta = accion(esquemaEditarCuenta, async (datos) => {
  await editarCuenta(datos);
  refresh();
});

export const archivar = accion(esquemaId, async ({ id }) => {
  await archivarCuenta(id);
  refresh();
});

export const cuadrar = accion(esquemaCuadrar, async (datos) => {
  const resultado = await cuadrarCuenta(datos);
  refresh();
  return resultado;
});

export const eliminarTransferencia = accion(esquemaId, async ({ id }) => {
  await borrarTransferencia(id);
  refresh();
});
