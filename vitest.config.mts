import "dotenv/config";

import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const raiz = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "@": raiz },
  },
  test: {
    coverage: {
      provider: "v8",
      include: ["lib/calculos/**", "lib/reglas/**", "lib/insights/**", "lib/dinero.ts", "lib/fechas.ts"],
      // Definición de terminado: al menos 80 % en lib/calculos y lib/reglas.
      thresholds: {
        "lib/calculos/**": { lines: 80, functions: 80, branches: 80, statements: 80 },
        "lib/reglas/**": { lines: 80, functions: 80, branches: 80, statements: 80 },
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unidad",
          environment: "node",
          include: ["tests/**/*.test.ts"],
          exclude: ["tests/integracion/**", "tests/produccion/**"],
        },
      },
      {
        extends: true,
        test: {
          name: "produccion",
          environment: "node",
          include: ["tests/produccion/**/*.test.ts"],
          testTimeout: 20_000,
        },
      },
      {
        extends: true,
        test: {
          name: "integracion",
          environment: "node",
          include: ["tests/integracion/**/*.test.ts"],
          // Comparten una sola base: un archivo a la vez.
          fileParallelism: false,
          testTimeout: 20_000,
        },
      },
    ],
  },
});
