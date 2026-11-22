import type { NextAuthOptions } from "next-auth";
import type { Provider } from "next-auth/providers/index";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { crearAdaptadorAuth, obtenerUsuarioDesarrollo } from "@/lib/datos/adaptador-auth";
import { obtenerEnv } from "@/lib/env";

import { accesoDesarrolloActivo, ID_PROVEEDOR_DESARROLLO } from "./acceso-desarrollo";

/** Proveedores activos según el entorno: Google si tiene sus claves, desarrollo solo si la regla lo permite. */
export function proveedoresActivos(): { google: boolean; desarrollo: boolean } {
  const env = obtenerEnv();
  return {
    google: env.GOOGLE_CLIENT_ID !== undefined && env.GOOGLE_CLIENT_SECRET !== undefined,
    desarrollo: accesoDesarrolloActivo(env),
  };
}

function construirProveedores(): Provider[] {
  const env = obtenerEnv();
  const activos = proveedoresActivos();
  const proveedores: Provider[] = [];

  if (activos.google && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    proveedores.push(
      GoogleProvider({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }),
    );
  }

  // Fuera de desarrollo este proveedor no se registra: no existe ni su botón ni su ruta.
  if (activos.desarrollo) {
    proveedores.push(
      CredentialsProvider({
        id: ID_PROVEEDOR_DESARROLLO,
        name: "Desarrollador",
        credentials: {},
        async authorize() {
          // Se vuelve a comprobar por si el entorno cambió desde que se construyó la lista.
          if (!accesoDesarrolloActivo(obtenerEnv())) return null;
          return obtenerUsuarioDesarrollo();
        },
      }),
    );
  }

  return proveedores;
}

export function opcionesAuth(): NextAuthOptions {
  const env = obtenerEnv();
  return {
    adapter: crearAdaptadorAuth(),
    // JWT porque el proveedor de credenciales no funciona con sesiones guardadas en la base (sección 25).
    session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
    secret: env.NEXTAUTH_SECRET,
    providers: construirProveedores(),
    pages: { signIn: "/ingresar", error: "/ingresar" },
    callbacks: {
      jwt({ token, user }) {
        if (user) token.sub = user.id;
        return token;
      },
      session({ session, token }) {
        if (token.sub) session.user.id = token.sub;
        return session;
      },
    },
  };
}
