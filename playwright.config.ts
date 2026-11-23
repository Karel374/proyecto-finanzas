import { defineConfig, devices } from "@playwright/test";

const PUERTO = 3100;

/**
 * Pruebas de extremo a extremo (sección 2). Levantan `next dev` con el acceso de desarrollo,
 * que solo existe en desarrollo, y manejan la app con un navegador real.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    locale: "es-EC",
    timezoneId: "America/Guayaquil",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 } } },
  ],
  webServer: {
    command: `npx next dev -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}/ingresar`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { ACCESO_DESARROLLO: "true", NEXTAUTH_URL: `http://localhost:${PUERTO}` },
  },
});
