import { expect, test } from "@playwright/test";

/** Landing de Kanomics (fase 4b): se entiende, su acción funciona y nada depende de la animación. */

test("la landing dice qué es y lleva a entrar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Kanomics" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "El dinero no se pierde. Se escapa." })).toBeAttached();
  // Sin claves de Google en las pruebas, la acción principal lleva a la pantalla de ingreso.
  await page.getByRole("main").getByRole("link", { name: "Entrar" }).first().click();
  await expect(page).toHaveURL(/\/ingresar$/);
});

test("la versión en inglés existe y enlaza de vuelta al español", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: "Money doesn't get lost. It leaks." })).toBeAttached({
    timeout: 30_000,
  });
  await expect(page.locator("[lang='en']").first()).toBeAttached();
  await page.getByRole("link", { name: "ES", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("con 'reducir movimiento' todo se ve sin animación ni entrada", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-entrada", "pendiente");
  for (const titulo of ["Que cada dólar tenga un destino.", "Tus números son tuyos."]) {
    const encabezado = page.getByRole("heading", { name: titulo });
    await encabezado.scrollIntoViewIfNeeded();
    await expect(encabezado).toBeVisible({ timeout: 30_000 });
  }
  await expect(page.locator("html")).not.toHaveAttribute("data-anima");
});

test("los montos de muestra dicen que son de ejemplo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Datos de ejemplo").first()).toBeAttached({ timeout: 30_000 });
});

test("el primer Tab ofrece saltar al contenido", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
});

test("con sesión, / y /en llevan directo al panel", async ({ page }) => {
  await page.goto("/ingresar");
  await page.getByRole("button", { name: "Entrar como desarrollador" }).click();
  await expect(page).toHaveURL(/\/panel$/, { timeout: 30_000 });
  await page.goto("/");
  await expect(page).toHaveURL(/\/panel$/);
  await page.goto("/en");
  await expect(page).toHaveURL(/\/panel$/);
});
