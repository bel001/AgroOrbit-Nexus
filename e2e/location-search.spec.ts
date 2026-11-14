import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("buscar una localidad real y ajustar el terreno sin consultar clima", async ({ page }, info) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  let analysisRequests = 0; page.on("request", r => { if (r.url().includes("/api/analyze")) analysisRequests++; });
  await page.goto("/");
  await page.getByLabel("Busca una localidad o código postal").fill("Virú, Perú");
  if (info.project.name === "desktop") await page.getByLabel("Busca una localidad o código postal").press("Enter");
  else await page.getByRole("button", { name: "Buscar lugar", exact: true }).click();
  const results = page.getByRole("list", { name: "Localidades encontradas" });
  await expect(results).toBeVisible({ timeout: 20_000 });
  await results.getByRole("button").filter({ hasText: "La Libertad" }).first().click();
  await expect(page.getByLabel("Latitud", { exact: true })).toHaveValue(/-8\.4/);
  await expect(page.getByLabel("Longitud", { exact: true })).toHaveValue(/-78\.7/);
  await expect(page.getByText(/seleccionada\. Acerca el mapa/)).toBeVisible();
  expect(analysisRequests).toBe(0);
  await page.getByRole("group", { name: "Encontrar el terreno" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `docs/evidence/search/${info.project.name}.png` });
  const a11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(a11y.violations.map(v => v.id)).toEqual([]); expect(errors).toEqual([]);
});

test("GPS con permiso y error de búsqueda gestionados", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: -0.5, longitude: 36.5, accuracy: 30 });
  await page.goto("/"); await page.getByRole("button", { name: "Usar mi ubicación", exact: true }).click();
  await expect(page.getByLabel("Latitud", { exact: true })).toHaveValue("-0.5");
  await expect(page.getByText(/Precisión aproximada: 30 m/)).toBeVisible();
  await page.route("**/api/locations?*", route => route.fulfill({ status: 502, json: { error: "Buscador no disponible. Usa el mapa o las coordenadas." } }));
  await page.getByLabel("Busca una localidad o código postal").fill("Nairobi");
  await page.getByRole("button", { name: "Buscar lugar", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Buscador no disponible" })).toBeVisible();
  await expect(page.getByLabel("Latitud", { exact: true })).toHaveValue("-0.5");
});

test("GPS denegado no modifica el terreno", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "geolocation", { value: { getCurrentPosition: (_success: unknown, error: (e: { code: number }) => void) => error({ code: 1 }) } }));
  await page.goto("/"); await page.getByRole("button", { name: "Usar mi ubicación", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Permiso de ubicación denegado" })).toBeVisible();
  await expect(page.getByLabel("Latitud", { exact: true })).toHaveValue("");
});
