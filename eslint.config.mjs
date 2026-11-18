import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
      ],
      // Ninguna consulta a la base fuera de lib/datos/ (sección 2).
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/generated/prisma/client",
                "**/generated/prisma/client",
                "@prisma/client",
                "@prisma/adapter-pg",
              ],
              message: "Solo lib/datos/ consulta la base. Pide los datos a esa capa.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["lib/datos/**", "prisma/**", "tests/integracion/**"],
    rules: { "no-restricted-imports": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "generated/**", "next-env.d.ts"]),
]);

export default eslintConfig;
