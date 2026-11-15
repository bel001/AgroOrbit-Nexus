import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// The jury view: English UI, Virú demo, every new insight present and honest.
test("English Virú demo: bottom line, water in m³/ha, soil cards, El Niño and the NASA cell", async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/?lang=en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Compare crop rotations by water, soil and risk, before you plant.");
  await expect(page.getByText("Built for agricultural extension agents who review rotation options with farmers.", { exact: false }).first()).toBeVisible();
  await page.getByRole("button", { name: "Try the Virú demo" }).click();

  const bottom = page.locator(".bottom-line");
  await expect(bottom).toBeVisible({ timeout: 60_000 });
  await expect(bottom).toContainText(/C needs ~[\d,]+ m³\/ha less water than A \(\d+ mm\), uses 2 crop families and breaks the maize cycle\./);
  await expect(bottom).toContainText("Exploration, not a recommendation · No regional agronomist validation yet");

  // Virú water context with official sources.
  await expect(page.getByRole("heading", { name: "In Virú, water arrives by canal, not by rain" })).toBeVisible();
  await expect(page.getByRole("link", { name: "gob.pe · Chavimochic" })).toHaveAttribute("href", /gob\.pe\/institucion\/chavimochic/);

  // Water card: m³/ha headline, no soles without a tariff, soles only with a user tariff.
  const water = page.locator(".water-card");
  await expect(water.locator(".m3")).toHaveCount(3);
  for (const value of await water.locator(".water-value").allInnerTexts()) expect(value).not.toContain("S/");
  await water.getByLabel("Your water tariff (S/ per m³, optional)").fill("0.1");
  await expect(water.locator(".water-value small").first()).toContainText("≈ S/ ");
  await water.getByLabel("Your water tariff (S/ per m³, optional)").fill("");
  await expect(water.locator(".water-value small").first()).not.toContainText("≈ S/ ");

  // Soil-health cards with sources.
  await expect(page.locator(".soil-card")).toHaveCount(3);
  await expect(page.locator(".soil-card").first().getByRole("link", { name: "FAO · Species diversification" }).first()).toHaveAttribute("href", /fao\.org/);

  // El Niño table: anomalies only where the data show them.
  const elnino = page.getByRole("region", { name: "El Niño table" });
  await expect(elnino.getByRole("row")).toHaveCount(4);
  await expect(elnino).toContainText("above the 1991–2020 range");
  await expect(elnino).toContainText("no anomaly in these data");
  await expect(page.locator(".elnino-card")).toContainText("Heat days: not computed");

  // Honest map: NASA cell legend.
  await expect(page.locator(".cell-legend")).toContainText("NASA data represents this whole area, not just your field.");

  if (info.project.name === "desktop") {
    await page.locator("#rotaciones").screenshot({ path: "docs/evidence/step4-en.png" });
    await page.locator(".map-frame").screenshot({ path: "docs/evidence/map-cell-en.png" });
  }
  const a11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(a11y.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target.join(" ")).slice(0, 3) }))).toEqual([]);
  expect(errors).toEqual([]);
});
