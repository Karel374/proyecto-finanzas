import type { Prisma } from "@/generated/prisma/client";
import { aColumnaDate, fechaEnEcuador } from "@/lib/fechas";
import { DISTRIBUCION_OBJETIVO_SEMILLA, PLANTILLAS_MENSAJE_SEMILLA } from "@/lib/semillas/ajustes";
import { CATEGORIAS_SEMILLA } from "@/lib/semillas/categorias";
import { IDEAS_SEMILLA } from "@/lib/semillas/ideas";

import { prisma } from "./prisma";

/**
 * Siembra por usuario (sección 2): categorías, ajustes por defecto, cuenta Efectivo e ideas semilla.
 * Corre dentro de la transacción que recibe. Si el usuario ya tiene Ajustes, no hace nada,
 * así que llamarla dos veces no duplica datos.
 */
export async function sembrarUsuario(tx: Prisma.TransactionClient, usuarioId: string): Promise<void> {
  const yaSembrado = await tx.ajustes.findUnique({ where: { usuarioId }, select: { id: true } });
  if (yaSembrado) return;

  await tx.categoria.createMany({
    data: CATEGORIAS_SEMILLA.map((categoria) => ({ ...categoria, usuarioId })),
  });

  await tx.ajustes.create({
    data: {
      usuarioId,
      distribucionObjetivo: DISTRIBUCION_OBJETIVO_SEMILLA,
      plantillasMensaje: PLANTILLAS_MENSAJE_SEMILLA,
    },
  });

  await tx.cuenta.create({
    data: {
      usuarioId,
      nombre: "Efectivo",
      tipo: "EFECTIVO",
      saldoInicialCentavos: 0,
      fechaSaldoInicial: aColumnaDate(fechaEnEcuador()),
    },
  });

  await tx.ideaIngreso.createMany({
    data: IDEAS_SEMILLA.map((idea) => ({ ...idea, usuarioId, esSemilla: true })),
  });
}

type DatosUsuarioNuevo = {
  email: string | null;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
};

/** Crea un usuario y lo siembra en una sola transacción: o queda completo, o no queda. */
export async function crearUsuarioConSiembra(datos: DatosUsuarioNuevo) {
  return prisma.$transaction(async (tx) => {
    const usuario = await tx.user.create({
      data: {
        email: datos.email,
        name: datos.name ?? null,
        image: datos.image ?? null,
        emailVerified: datos.emailVerified ?? null,
      },
    });
    await sembrarUsuario(tx, usuario.id);
    return usuario;
  });
}
