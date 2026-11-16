import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { evidencePath } from "./evidence";

test("el mapa base bloqueado no impide cargar la capa ESA", async ({ page }, info) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  // Controlled failure: keep OSM requests pending. The ESA PNG is a recorded service response.
  await page.route("https://tile.openstreetmap.org/**", () => {});
  const tile = await readFile("docs/evidence/global/worldcover-tile.png");
  let requests = 0;
  await page.route("https://titiler.terrascope.be/**", async route => { requests++; await route.fulfill({ contentType: "image/png", body: tile }); });
  await page.goto("/?lang=es");
  await page.getByLabel("Mostrar cobertura terrestre ESA · 2021").check();
  await expect.poll(() => requests).toBeGreaterThan(0);
  await expect(page.getByText("Capa ESA: datos recibidos; pueden quedar teselas pendientes.", { exact: true })).toBeVisible();
  await page.getByLabel("Latitud", { exact: true }).fill("-8.42");
  await page.getByLabel("Longitud", { exact: true }).fill("-78.75");
  await expect(page.locator(".cell-legend")).toBeVisible();
  expect(errors).toEqual([]);
  await page.locator(".map-wrap").screenshot({ path: evidencePath(`map-loading/${info.project.name}.png`) });
});
