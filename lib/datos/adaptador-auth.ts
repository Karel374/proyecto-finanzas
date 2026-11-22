import type { Adapter, AdapterAccount, AdapterUser } from "next-auth/adapters";

import type { User } from "@/generated/prisma/client";

import { prisma } from "./prisma";
import { crearUsuarioConSiembra } from "./siembra";

/**
 * Adaptador de NextAuth hecho a medida. Se usa en lugar del adaptador oficial de Prisma
 * para que crear un usuario y sembrar sus datos ocurran en la misma transacción.
 * Con sesiones JWT, NextAuth no usa los métodos de sesión ni de tokens de verificación.
 */

function aAdapterUser(usuario: User): AdapterUser {
  return {
    id: usuario.id,
    name: usuario.name,
    email: usuario.email ?? "",
    emailVerified: usuario.emailVerified,
    image: usuario.image,
  };
}

export function crearAdaptadorAuth(): Adapter {
  return {
    async createUser(datos: Omit<AdapterUser, "id">) {
      const usuario = await crearUsuarioConSiembra({
        email: datos.email || null,
        name: datos.name,
        image: datos.image,
        emailVerified: datos.emailVerified,
      });
      return aAdapterUser(usuario);
    },

    async getUser(id) {
      const usuario = await prisma.user.findUnique({ where: { id } });
      return usuario ? aAdapterUser(usuario) : null;
    },

    async getUserByEmail(email) {
      const usuario = await prisma.user.findUnique({ where: { email } });
      return usuario ? aAdapterUser(usuario) : null;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const cuenta = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true },
      });
      return cuenta ? aAdapterUser(cuenta.user) : null;
    },

    async updateUser({ id, name, email, image, emailVerified }) {
      const usuario = await prisma.user.update({
        where: { id },
        data: { name, email, image, emailVerified },
      });
      return aAdapterUser(usuario);
    },

    async linkAccount(cuenta: AdapterAccount) {
      await prisma.account.create({
        data: {
          userId: cuenta.userId,
          type: cuenta.type,
          provider: cuenta.provider,
          providerAccountId: cuenta.providerAccountId,
          refresh_token: cuenta.refresh_token ?? null,
          access_token: cuenta.access_token ?? null,
          expires_at: cuenta.expires_at ?? null,
          token_type: cuenta.token_type ?? null,
          scope: cuenta.scope ?? null,
          id_token: cuenta.id_token ?? null,
          session_state: typeof cuenta.session_state === "string" ? cuenta.session_state : null,
        },
      });
    },
  };
}

/** Correo fijo del usuario de prueba del acceso de desarrollo. */
export const EMAIL_DESARROLLO = "desarrollo@finanzas.local";

/**
 * Devuelve el usuario de prueba del acceso de desarrollo; lo crea y lo siembra la primera vez,
 * igual que a cualquier usuario nuevo (sección 2).
 */
export async function obtenerUsuarioDesarrollo(): Promise<AdapterUser> {
  const existente = await prisma.user.findUnique({ where: { email: EMAIL_DESARROLLO } });
  if (existente) return aAdapterUser(existente);
  const nuevo = await crearUsuarioConSiembra({ email: EMAIL_DESARROLLO, name: "Desarrollador" });
  return aAdapterUser(nuevo);
}
