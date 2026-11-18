import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { obtenerEnv } from "@/lib/env";

/**
 * Cliente único de Prisma. Solo los módulos de `lib/datos/` pueden importarlo
 * (lo impone ESLint); el resto de la app pide datos a esta capa.
 */
const globalConPrisma = globalThis as unknown as { prisma?: PrismaClient };

function crearCliente(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: obtenerEnv().DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalConPrisma.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") {
  globalConPrisma.prisma = prisma;
}
