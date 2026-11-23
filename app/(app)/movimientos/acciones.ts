"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { accion } from "@/lib/acciones";
import {
  borrarMovimiento,
  crearMovimiento,
  editarMovimiento,
  restaurarMovimiento,
  type MovimientoBorrado,
} from "@/lib/datos/movimientos";
import { borrarPlantilla, crearPlantilla, usarPlantilla } from "@/lib/datos/plantillas";
import {
  borrarRecurrente,
  crearRecurrente,
  editarRecurrente,
  pausarRecurrente,
} from "@/lib/datos/recurrentes";
import { crearTransferencia } from "@/lib/datos/transferencias";
import {
  esquemaEditarMovimiento,
  esquemaId,
  esquemaMovimiento,
  esquemaPausarRecurrente,
  esquemaPlantilla,
  esquemaRecurrente,
  esquemaTransferencia,
  TIPOS_MOVIMIENTO,
} from "@/lib/esquemas";

/** Cada escritura refresca la página actual para que el cambio se vea enseguida. */
function conRefresco<T>(hacer: () => Promise<T>) {
  return async () => {
    const resultado = await hacer();
    refresh();
    return resultado;
  };
}

export const registrarMovimiento = accion(esquemaMovimiento, (datos) =>
  conRefresco(() => crearMovimiento(datos))(),
);

export const actualizarMovimiento = accion(esquemaEditarMovimiento, ({ id, ...datos }) =>
  conRefresco(() => editarMovimiento(id, datos))(),
);

export const eliminarMovimiento = accion(esquemaId, ({ id }) => conRefresco(() => borrarMovimiento(id))());

const esquemaCopia = z.object({
  id: z.string().min(1),
  tipo: z.enum(TIPOS_MOVIMIENTO),
  montoCentavos: z.number().int().positive(),
  categoriaId: z.string().min(1),
  cuentaId: z.string().min(1),
  fecha: z.string(),
  nota: z.string().max(140).nullable(),
  recurrenteId: z.string().nullable(),
  planIngresoId: z.string().nullable(),
  creadoEn: z.string(),
}) satisfies z.ZodType<MovimientoBorrado>;

export const deshacerBorrado = accion(esquemaCopia, (copia) =>
  conRefresco(() => restaurarMovimiento(copia))(),
);

export const registrarTransferencia = accion(esquemaTransferencia, (datos) =>
  conRefresco(() => crearTransferencia(datos))(),
);

export const guardarPlantilla = accion(esquemaPlantilla, (datos) =>
  conRefresco(() => crearPlantilla(datos))(),
);

export const quitarPlantilla = accion(esquemaId, ({ id }) => conRefresco(() => borrarPlantilla(id))());

export const registrarConPlantilla = accion(esquemaId, ({ id }) => conRefresco(() => usarPlantilla(id))());

export const guardarRecurrente = accion(esquemaRecurrente, (datos) =>
  conRefresco(() => crearRecurrente(datos))(),
);

/** Los errores de campo llegan como "datos.monto": el formulario quita el prefijo. */
const esquemaEditarRecurrente = z.object({ id: z.string().min(1), datos: esquemaRecurrente });

export const actualizarRecurrente = accion(esquemaEditarRecurrente, ({ id, datos }) =>
  conRefresco(() => editarRecurrente(id, datos))(),
);

export const cambiarEstadoRecurrente = accion(esquemaPausarRecurrente, ({ id, activo }) =>
  conRefresco(() => pausarRecurrente(id, activo))(),
);

export const eliminarRecurrente = accion(esquemaId, ({ id }) => conRefresco(() => borrarRecurrente(id))());
