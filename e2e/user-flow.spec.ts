import { expect, test } from "@playwright/test";

// Recorrido de un usuario con su propio terreno (no la demo): fricciones detectadas en la revisión de usabilidad.
test("terreno propio: errores visibles, modo conservado, campañas sensatas y alternativa propia", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/");

  // 1. Consultar sin ubicación: mensaje claro y visible en pantalla.
  await page.getByRole("button", { name: "Consultar clima NASA", exact: true }).click();
  const alert = page.getByRole("alert").filter({ hasText: "Falta la ubicación del terreno" });
  await expect(alert).toBeInViewport();

  // 2. Elegir "Revisar mis registros" y luego mover el punto no debe volver a "Solo clima".
  await page.getByLabel("Latitud", { exact: true }).fill("-16.399");
  await page.getByLabel("Longitud", { exact: true }).fill("-71.537");
  await expect(alert).toHaveCount(0);
  await page.locator("label", { hasText: "Revisar mis registros" }).click();
  await expect(page.getByRole("radio", { name: /Revisar mis registros/ })).toBeChecked();
  await page.getByLabel("Latitud", { exact: true }).fill("-16.4");
  await expect(page.getByRole("radio", { name: /Revisar mis registros/ })).toBeChecked();

  // 3. Un ciclo nuevo empieza con duración y procedencia razonables.
  await page.getByRole("button", { name: "Añadir ciclo para completar" }).click();
  const start = await page.getByLabel("Siembra", { exact: true }).first().inputValue();
  const end = await page.getByLabel("Cosecha", { exact: true }).first().inputValue();
  expect((Date.parse(end) - Date.parse(start)) / 86_400_000).toBeGreaterThanOrEqual(90);
  await expect(page.locator(".campaign-row.current select").nth(1)).toHaveValue("declarado");

  // 4. Error de validación legible (sin nombres internos) y visible.
  await page.getByLabel("Nombre del terreno").fill("");
  await page.getByRole("button", { name: "Consultar clima y comparar" }).click();
  const validation = page.getByRole("alert").filter({ hasText: "Nombre del terreno" });
  await expect(validation).toBeInViewport();
  await expect(validation).not.toContainText("current:");
  await page.getByLabel("Nombre del terreno").fill("Mi chacra");

  // 5. Alternativa propia para comparar fuera de Virú.
  await page.getByRole("button", { name: "Añadir alternativa" }).click();
  await page.getByLabel("B · ciclo 1").selectOption("bean");
  await page.getByRole("button", { name: "Consultar clima y comparar" }).click();
  const table = page.getByRole("table", { name: /Comparación descriptiva de estrategias/ });
  await expect(table).toBeVisible({ timeout: 60_000 });
  await expect(table.getByRole("columnheader")).toHaveCount(3);
  await expect(table).toContainText("Alternativa B");
  await expect(table).toContainText("Las alternativas propias son escenarios tuyos");
});
