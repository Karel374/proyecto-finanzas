import type { NextConfig } from "next";

import { obtenerEnv } from "./lib/env";

// Valida las variables de entorno al arrancar `next dev` y `next build`:
// si falta una clave, la app no arranca (sección 2).
obtenerEnv();

const nextConfig: NextConfig = {
  // Evita que `next dev` genere archivos de instrucciones (AGENTS.md) en el proyecto.
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
