/**
 * Semilla global: parámetros del SRI de 2026 (sección 22). Se puede correr varias veces.
 * La siembra por usuario (categorías, ajustes, cuenta Efectivo, ideas) llega en la fase 2.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("Falta DATABASE_URL para sembrar la base");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const parametros2026 = {
  anio: 2026,
  canastaCentavos: 82180,
  // Cargas familiares → canastas. La clave "5" vale para 5 cargas o más.
  tablaCanastas: { "0": 7, "1": 9, "2": 11, "3": 14, "4": 17, "5": 20 },
  porcentajeRebaja: "18.00",
  baseExentaCentavos: 1220800,
  fuente: "Prensa de febrero de 2026 (El Universo, Primicias, Vistazo, El Mercurio). Confirmar en sri.gob.ec",
  fechaVerificacion: new Date("2026-02-06T00:00:00Z"),
};

async function main() {
  await prisma.parametrosSRI.upsert({
    where: { anio: parametros2026.anio },
    update: {},
    create: parametros2026,
  });
  console.log("Semilla aplicada: parámetros del SRI 2026");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
