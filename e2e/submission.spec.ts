import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("presentación inglesa de siete diapositivas accesible e imprimible", async ({ page }, info) => {
  await page.goto("/submission/index.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("section.slide")).toHaveCount(7);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("AgroOrbit Nexus");
  await page.getByRole("navigation", { name: "Slide navigation" }).getByRole("link", { name: "6", exact: true }).click();
  await expect(page.locator("#slide-6")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(result.violations.map(v => v.id)).toEqual([]);
  await page.screenshot({ path: `docs/evidence/submission-${info.project.name}.png`, fullPage: true });
  if (info.project.name === "desktop") {
    const pdf = await page.pdf({ path: "docs/evidence/submission-seven-slides.pdf", printBackground: true, preferCSSPageSize: true });
    // Chromium emits uncompressed page dictionaries. Count Page, excluding Pages.
    expect(pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length).toBe(7);
  }
});
