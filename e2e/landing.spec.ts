import { expect, test } from "@playwright/test";

/** Landing pública (fase 4b): se entiende, su acción funciona y nada depende de la animación. */

test("la landing dice qué es y lleva a entrar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Cada dólar, abierto en partes." })).toBeVisible({
    timeout: 30_000,
  });
  // Sin claves de Google en las pruebas, la acción principal lleva a la pantalla de ingreso.
  await page.getByRole("main").getByRole("link", { name: "Entrar" }).first().click();
  await expect(page).toHaveURL(/\/ingresar$/);
});

test("con 'reducir movimiento' se ven los tres actos sin animación", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const pregunta of ["¿Cuánto me queda?", "¿En qué se me va?", "¿Qué debería hacer?"]) {
    await expect(page.getByRole("heading", { name: pregunta })).toBeVisible({ timeout: 30_000 });
  }
  // La moneda viajera no se dibuja: cada sección muestra su moneda quieta.
  await expect(page.locator("html")).not.toHaveAttribute("data-moneda-viajera", "activa");
});

test("los montos de la demostración dicen que son de ejemplo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Datos de ejemplo").first()).toBeAttached({ timeout: 30_000 });
});

test("el primer Tab ofrece saltar al contenido", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
});

test("con sesión, / lleva directo al panel", async ({ page }) => {
  await page.goto("/ingresar");
  await page.getByRole("button", { name: "Entrar como desarrollador" }).click();
  await expect(page).toHaveURL(/\/panel$/, { timeout: 30_000 });
  await page.goto("/");
  await expect(page).toHaveURL(/\/panel$/);
});
