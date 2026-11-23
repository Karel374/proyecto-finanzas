import { expect, test, type Page } from "@playwright/test";

/** Entra con el acceso de desarrollo, como lo haría el usuario en su computadora. */
async function entrar(page: Page) {
  await page.goto("/ingresar");
  await page.getByRole("button", { name: "Entrar como desarrollador" }).click();
  // `next dev` compila cada página la primera vez que se pide: en la CI eso puede pasar de 5 s.
  await expect(page.getByRole("navigation", { name: "Secciones" })).toBeVisible({ timeout: 30_000 });
}

/** Un monto distinto en cada corrida, para encontrar la fila sin confundirla con otras. */
function montoUnico() {
  const centavos = 100 + Math.floor(Math.random() * 800);
  return { texto: `${Math.floor(centavos / 100)},${String(centavos % 100).padStart(2, "0")}`, centavos };
}

test.beforeEach(async ({ page }) => {
  await entrar(page);
  await page.goto("/movimientos");
  await expect(page.getByRole("heading", { name: "Movimientos", level: 1 })).toBeVisible({ timeout: 30_000 });
  // Los atajos de teclado existen cuando la página terminó de cargar su JavaScript.
  await page.waitForLoadState("networkidle");
});

/** Abre el panel con N y espera a que el cursor esté en el monto. */
async function abrirPanel(page: Page) {
  await page.keyboard.press("n");
  await expect(page.getByLabel("Monto")).toBeFocused();
}

test("un gasto se registra solo con teclado en menos de 10 segundos (criterio de la fase 4)", async ({
  page,
}) => {
  const { texto } = montoUnico();
  const inicio = Date.now();

  // N abre el panel con el cursor en el monto; la categoría ya está preseleccionada; Enter guarda.
  await page.keyboard.press("n");
  const monto = page.getByLabel("Monto");
  await expect(monto).toBeFocused();
  await page.keyboard.type(texto);
  await page.keyboard.press("Enter");

  await expect(page.getByRole("status").filter({ hasText: "Gasto registrado" })).toBeVisible();
  const duracion = Date.now() - inicio;

  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("cell", { name: `−$${texto}` }).first()).toBeVisible();
  expect(duracion).toBeLessThan(10_000);
});

test("Shift + Enter guarda y deja el panel abierto con el monto vacío", async ({ page }) => {
  await abrirPanel(page);
  await page.keyboard.type(montoUnico().texto);
  await page.keyboard.press("Shift+Enter");

  await expect(page.getByRole("status").filter({ hasText: "Gasto registrado" })).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("Monto")).toHaveValue("");
  await expect(page.getByLabel("Monto")).toBeFocused();

  // Esc cierra cualquier panel (sección 3).
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("un monto inválido muestra el mensaje de la especificación y no guarda", async ({ page }) => {
  await abrirPanel(page);
  await page.keyboard.type("0");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog").getByText("Ingresa un monto mayor que cero")).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("borrar un movimiento ofrece deshacer", async ({ page }) => {
  const { texto } = montoUnico();
  await abrirPanel(page);
  await page.keyboard.type(texto);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeHidden();

  await page
    .getByRole("button", { name: `Borrar −$${texto}` })
    .first()
    .click();
  const aviso = page.getByRole("status").filter({ hasText: "Se borró" });
  await expect(aviso).toBeVisible();
  await aviso.getByRole("button", { name: "Deshacer" }).click();
  await expect(page.getByRole("cell", { name: `−$${texto}` }).first()).toBeVisible();
});

test("la tecla / enfoca el buscador de movimientos", async ({ page }) => {
  await page.keyboard.press("/");
  await expect(page.getByRole("searchbox")).toBeFocused();
});
