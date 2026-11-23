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
  {
    // Dentro de lib/datos/, los módulos de cada entidad usan el cliente del usuario (cliente.ts),
    // que filtra solo por usuarioId. El cliente crudo queda para la infraestructura.
    files: ["lib/datos/**"],
    ignores: [
      "lib/datos/prisma.ts",
      "lib/datos/cliente.ts",
      "lib/datos/siembra.ts",
      "lib/datos/adaptador-auth.ts",
      "lib/datos/tareas.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "./prisma",
                "@/lib/datos/prisma",
                "@/generated/prisma/client",
                "**/generated/prisma/client",
              ],
              allowTypeImports: true,
              message: "Usa datosDelUsuario() de ./cliente: filtra por el usuario de la sesión sin olvidos.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "generated/**", "next-env.d.ts"]),
]);

export default eslintConfig;
