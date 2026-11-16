import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { buildReport } from "../src/lib/rotations";
import { normalizePower, normalizeStoredSeries } from "../src/lib/power";
import { exampleFarm } from "../src/lib/examples/viru";
import { addDays, type Farm } from "../src/lib/model";
import demo from "../src/data/power-viru-demo.json" with { type: "json" };
import historyFile from "../src/data/power-viru-1991-2023.json" with { type: "json" };
import cusco from "../docs/evidence/revision-2026-11-15/power-pm-cusco.json" with { type: "json" };
import vegetation from "../docs/evidence/revision-2026-11-15/modis-normalized.json" with { type: "json" };
import { evidencePath } from "./evidence";

test.use({ reducedMotion: "reduce" });
const climates = [demo, cusco].map(f => normalizePower(f.raw, f.query, f.retrievedAt));
const history = [...normalizeStoredSeries(historyFile.raw, historyFile.query, historyFile.retrievedAt).days, ...climates[0].days];
async function setup(page: Page, missingRain = false) {
  await page.route("https://tile.openstreetmap.org/**", route => route.fulfill({ status: 200, contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6bP8AAAAASUVORK5CYII=", "base64") }));
  await page.route("**/api/analyze", async route => {
    const f = route.request().postDataJSON() as Farm;
    const match = climates.find(c => c.query.lat === f.lat && c.query.lon === f.lon && c.query.start <= f.start && c.query.end >= addDays(f.start, f.horizonDays - 1));
    const c = match ? structuredClone(match) : null;
    if (missingRain && c) { c.days.forEach(d => d.PRECTOTCORR = null); c.missing.PRECTOTCORR = c.days.length; }
    await route.fulfill({ json: { report: buildReport(f, c, history), climateError: c ? null : "Sin serie para esta prueba controlada" } });
  });
}
async function runDemo(page: Page) {
  await page.goto("/?lang=es");
  await page.getByRole("button", { name: "Probar demo de Virú", exact: true }).click();
  await expect(page.locator(".comparison")).toBeVisible();
}
async function importProfile(page: Page, value: unknown) {
  await page.getByLabel("Archivo de perfil JSON").setInputFiles({ name: "perfil.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(value)) });
}
async function downloaded(page: Page, button: string) {
  const waiting = page.waitForEvent("download");
  await page.getByRole("button", { name: button, exact: true }).click();
  const download = await waiting;
  return JSON.parse(await readFile((await download.path())!, "utf8"));
}

test("todas las opciones incompatibles conservan informe y pantalla", async ({ page }, info) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await setup(page); await runDemo(page);
  await page.getByText("Suelo, agua y preferencias (opcional)", { exact: true }).click();
  await page.locator(".exclusions").getByRole("checkbox", { name: "Maíz grano", exact: true }).check();
  await page.getByRole("button", { name: "Consultar clima y comparar", exact: true }).click();
  await expect(page.locator(".comparison .status.bad")).toHaveCount(3);
  await expect(page.locator(".elnino-card")).toHaveCount(0);
  await expect(page.locator(".priority-card")).toContainText("No hay opciones compatibles");
  const report = await downloaded(page, "Descargar JSON");
  expect(report.stressTest).toBeNull(); expect(errors).toEqual([]);
  await page.screenshot({ path: evidencePath(`reliability/incompatible-${info.project.name}.png`) });
});

test("lluvia ausente no aparece como cero", async ({ page }) => {
  await setup(page, true); await runDemo(page);
  await expect(page.locator(".kpi").last()).toContainText("Sin datos");
  await expect(page.locator(".kpi").last()).not.toContainText("0 mm");
  expect((await downloaded(page, "Descargar JSON")).climate.missing.PRECTOTCORR).toBe(540);
});

test("borrador recuperable, perfil exportable e importación sin resultados confiados", async ({ page }) => {
  await setup(page); await runDemo(page);
  await page.getByLabel("Nombre del terreno").fill("Chacra recuperable");
  await expect(page.locator(".session-controls")).toContainText("Borrador guardado");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("agroorbit-draft-v1")!).farm.name)).toBe("Chacra recuperable");
  await page.reload(); await expect(page.getByLabel("Nombre del terreno")).toHaveValue("Chacra recuperable");
  await expect(page.locator(".comparison")).toHaveCount(0);
  const profile = await downloaded(page, "Guardar perfil JSON");
  profile.input.name = "Perfil importado"; profile.strategies = [{ status: "Viable" }]; profile.recommendationsAllowed = true;
  await importProfile(page, profile); await expect(page.getByLabel("Nombre del terreno")).toHaveValue("Perfil importado");
  await page.getByRole("button", { name: "Consultar clima y comparar", exact: true }).click();
  await expect(page.locator(".comparison .status-secondary")).toHaveCount(3);
  expect((await downloaded(page, "Descargar JSON")).coverage.recommendationsAllowed).toBe(false);
  await page.getByRole("button", { name: "Borrar borrador local" }).click();
  expect(await page.evaluate(() => localStorage.getItem("agroorbit-draft-v1"))).toBeNull();
});

test("un JSON inválido conserva los datos del usuario", async ({ page }) => {
  await setup(page); await runDemo(page);
  await page.getByLabel("Archivo de perfil JSON").setInputFiles({ name: "invalido.json", mimeType: "application/json", buffer: Buffer.from("{") });
  await expect(page.getByRole("alert").filter({ hasText: "No se pudo importar" })).toBeVisible();
  await expect(page.getByLabel("Nombre del terreno")).toHaveValue(exampleFarm.name);
});

test("polígono accesible con área, persistencia y rechazo de cruces", async ({ page }) => {
  await setup(page); await page.goto("/?lang=es");
  await page.getByText("Introducir vértices o GeoJSON", { exact: true }).click();
  const input = page.getByLabel("Coordenadas del polígono");
  await input.fill("-71.970,-13.520\n-71.969,-13.519\n-71.969,-13.520\n-71.970,-13.519");
  await page.getByRole("button", { name: "Aplicar vértices" }).click();
  await expect(page.locator(".parcel-controls [role=alert]")).toBeVisible();
  await input.fill("-71.970,-13.520\n-71.969,-13.520\n-71.969,-13.519\n-71.970,-13.519");
  await page.getByRole("button", { name: "Aplicar vértices" }).click();
  await expect(page.locator(".parcel-controls")).toContainText("Superficie aproximada");
  expect(Number(await page.getByLabel("Área (ha, opcional)").inputValue())).toBeGreaterThan(1);
  const profile = await downloaded(page, "Guardar perfil JSON"); expect(profile.input.parcel.vertices).toHaveLength(4);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("agroorbit-draft-v1")!).farm.parcel?.vertices.length)).toBe(4);
  await page.reload(); await expect(page.locator(".parcel-controls")).toContainText("Superficie aproximada");
});

test("Penman–Monteith con datos de Cusco y expediente agronómico pendiente", async ({ page }) => {
  await setup(page); await page.goto("/?lang=es");
  await importProfile(page, { ...exampleFarm, name: "Caso Cusco", lat: cusco.query.lat, lon: cusco.query.lon, regionProfileId: null, illustrative: false, horizonDays: 31, etoMethod: "penman-monteith", history: [], current: [{ crop: "maize", variety: "Sin revisión regional", start: "2024-01-01", end: "2024-02-01", origin: "declarado" }] });
  await page.getByRole("button", { name: "Consultar clima y comparar", exact: true }).click();
  await expect(page.locator(".comparison .status-secondary")).toHaveCount(1);
  const report = await downloaded(page, "Descargar JSON");
  expect(report.strategies[0].water.method).toContain("Penman-Monteith"); expect(report.strategies[0].water.etcMm).toBeGreaterThan(0); expect(report.stressTest).toBeNull();
  const dossier = await downloaded(page, "Descargar expediente para revisión"); expect(dossier.review.status).toBe("pending"); expect(dossier.review.reviewer).toBeNull();
});

test("NDVI con calidad y procedencia se exporta como contexto", async ({ page }) => {
  await setup(page);
  await page.route("**/api/vegetation?**", route => route.fulfill({ json: { vegetation } }));
  await runDemo(page);
  await page.getByText("Vegetación del entorno · NASA MODIS (opcional)", { exact: true }).click();
  await page.getByLabel("Fin de la serie NDVI").fill("2024-02-02");
  await page.getByRole("button", { name: "Consultar NDVI del entorno" }).click();
  await expect(page.locator(".vegetation-results")).toContainText("3/3 observaciones");
  await expect(page.getByRole("region", { name: "Tabla de observaciones NDVI" })).toContainText("0.4758");
  const report = await downloaded(page, "Descargar JSON"); expect(report.vegetation.observations).toHaveLength(3); expect(report.coverage.recommendationsAllowed).toBe(false);
});

test("caída de MODIS conserva el comparador", async ({ page }) => {
  await setup(page); await page.route("**/api/vegetation?**", route => route.fulfill({ status: 502, json: { error: "Fallo simulado" } }));
  await runDemo(page);
  await page.getByText("Vegetación del entorno · NASA MODIS (opcional)", { exact: true }).click();
  await page.getByRole("button", { name: "Consultar NDVI del entorno" }).click();
  await expect(page.locator(".vegetation-monitor [role=alert]")).toBeVisible();
  await expect(page.locator(".comparison")).toBeVisible(); expect((await downloaded(page, "Descargar JSON")).vegetation).toBeNull();
});

test("flujo accesible sin desborde ni errores de aplicación", async ({ page }, info) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await setup(page); await runDemo(page);
  await page.getByText("Vegetación del entorno · NASA MODIS (opcional)", { exact: true }).click();
  await page.getByText("Introducir vértices o GeoJSON", { exact: true }).click();
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(result.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false); expect(errors).toEqual([]);
  await page.screenshot({ path: evidencePath(`reliability/flow-${info.project.name}.png`), fullPage: true });
});
