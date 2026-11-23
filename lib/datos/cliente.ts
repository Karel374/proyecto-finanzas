import { cache } from "react";

import { usuarioIdActual } from "@/lib/auth/sesion";

import { prisma } from "./prisma";

/**
 * Cliente de la base atado a un usuario (sección 2, "Separación por usuario").
 *
 * Toda operación sobre un modelo con `usuarioId` pasa por aquí y recibe el filtro sin que quien
 * consulta tenga que acordarse:
 * - lecturas, actualizaciones y borrados agregan `usuarioId` a su `where`, así un id de otro
 *   usuario se comporta como si no existiera;
 * - las creaciones fuerzan `usuarioId`, aunque el llamador mande otro.
 *
 * Los modelos sin datos por usuario (los de Auth.js y ParametrosSRI) no se pueden usar con este
 * cliente: se consultan desde los módulos de infraestructura, con el cliente crudo.
 *
 * Límite conocido: las escrituras anidadas (crear hijos dentro de un `create`) no reciben el filtro.
 * Por eso la capa de datos crea cada registro con su propia llamada.
 */

const MODELOS_GLOBALES = new Set(["User", "Account", "Session", "VerificationToken", "ParametrosSRI"]);

const OPERACIONES_CON_WHERE = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "updateManyAndReturn",
  "delete",
  "deleteMany",
]);

type Argumentos = Record<string, unknown>;

function conWhere(args: Argumentos, usuarioId: string): Argumentos {
  const where = (args.where ?? {}) as Argumentos;
  return { ...args, where: { ...where, usuarioId } };
}

function conDato(dato: unknown, usuarioId: string): Argumentos {
  return { ...(dato as Argumentos), usuarioId };
}

/** Devuelve los argumentos de la operación con el usuario puesto. Exportada para probarla sola. */
export function aplicarUsuario(operacion: string, args: Argumentos, usuarioId: string): Argumentos {
  if (OPERACIONES_CON_WHERE.has(operacion)) return conWhere(args, usuarioId);

  switch (operacion) {
    case "create":
      return { ...args, data: conDato(args.data, usuarioId) };
    case "createMany":
    case "createManyAndReturn": {
      const datos = Array.isArray(args.data) ? args.data : [args.data];
      return { ...args, data: datos.map((dato) => conDato(dato, usuarioId)) };
    }
    case "upsert":
      return { ...conWhere(args, usuarioId), create: conDato(args.create, usuarioId) };
    default:
      throw new Error(`Operación no permitida en la capa de datos: ${operacion}`);
  }
}

export function clienteDelUsuario(usuarioId: string) {
  if (!usuarioId) throw new Error("La capa de datos necesita el usuario de la sesión");

  return prisma.$extends({
    name: "filtro-por-usuario",
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          if (MODELOS_GLOBALES.has(model)) {
            throw new Error(`${model} no tiene datos por usuario; consúltalo fuera del cliente del usuario`);
          }
          return query(aplicarUsuario(operation, args as Argumentos, usuarioId) as typeof args);
        },
      },
    },
  });
}

export type ClienteDelUsuario = ReturnType<typeof clienteDelUsuario>;

/**
 * Valor para el campo `usuarioId` de un `create`: los tipos de Prisma lo piden, pero el cliente del
 * usuario siempre lo reemplaza por el de la sesión. Usar esta constante deja claro que no se elige aquí.
 */
export const DEL_USUARIO = "";

/** Cliente del usuario de la sesión actual. Se crea una vez por petición. */
export const datosDelUsuario = cache(async (): Promise<ClienteDelUsuario> => {
  return clienteDelUsuario(await usuarioIdActual());
});
