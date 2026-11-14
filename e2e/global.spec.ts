import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("análisis global en ambos hemisferios sin alternativas peruanas", async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Mapa mundial.", exact: false })).toBeVisible();
  await expect(page.getByLabel("Latitud", { exact: true })).toHaveValue("");
  for (const point of [{ lat: "36.75", lon: "-119.75" }, { lat: "30.75", lon: "75.75" }, { lat: "-34.5", lon: "146.5" }]) {
    await page.getByLabel("Latitud", { exact: true }).fill(point.lat);
    await page.getByLabel("Longitud", { exact: true }).fill(point.lon);
    await page.getByRole("button", { name: "Consultar clima NASA", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Clima histórico · NASA POWER" })).toBeVisible({ timeout: 60_000 });
    const sourceUrl = new URL((await page.getByRole("link", { name: "Abrir consulta de origen NASA" }).getAttribute("href"))!);
    expect(sourceUrl.searchParams.get("latitude")).toBe(point.lat); expect(sourceUrl.searchParams.get("longitude")).toBe(point.lon);
    await expect(page.getByText("Informe climático global.", { exact: false })).toBeVisible();
    await expect(page.getByRole("table", { name: "Comparación descriptiva de estrategias.", exact: false })).toHaveCount(0);
    const download = page.waitForEvent("download"); await page.getByRole("button", { name: "Descargar JSON" }).click();
    await (await download).saveAs(`docs/evidence/global/report-${info.project.name}-${point.lat}.json`);
  }
  const a11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(a11y.violations.map(v => v.id)).toEqual([]);
  await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `docs/evidence/global/${info.project.name}.png`, fullPage: true });
});

test("capa WorldCover real, opcional, con año y atribución", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Una vista real verifica la integración del servicio; otras vistas verifican el flujo global");
  await page.goto("/");
  const responsePromise = page.waitForResponse(r => r.url().includes("titiler.terrascope.be/wms") && r.status() === 200 && (r.headers()["content-type"] ?? "").includes("image/png"), { timeout: 60_000 });
  await page.getByLabel("Mostrar cobertura terrestre ESA · 2021").check();
  const response = await responsePromise; expect((await response.body()).byteLength).toBeGreaterThan(0);
  await expect(page.getByText("Capa ESA: datos recibidos; pueden quedar teselas pendientes.", { exact: true })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText("ESA WorldCover v200", { exact: false })).toBeVisible();
  await page.getByRole("region", { name: "Mapa mundial.", exact: false }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "docs/evidence/global/worldcover-map.png" });
  await page.getByLabel("Mostrar cobertura terrestre ESA · 2021").uncheck();
});
