import { expect, test } from "@playwright/test";

// Farmer priorities re-order the Virú demo live; rapid changes across sliders must all apply.
test("priority sliders re-order the options live and keep every change", async ({ page }, info) => {
  test.setTimeout(90_000);
  await page.goto("/");
  await page.getByRole("button", { name: "Probar demo de Virú" }).click();
  const card = page.locator(".priority-card");
  await expect(card).toBeVisible({ timeout: 60_000 });
  await expect(card).toContainText("Exploration, not a recommendation · No regional agronomist validation yet");
  await expect(card.locator(".formula")).toContainText("score = Σ wᵢ·sᵢ / Σ wᵢ");

  const sliders = card.locator(".slider input");
  const set = async (w: number[]) => { for (const [i, v] of w.entries()) await sliders.nth(i).fill(String(v)); };
  const order = () => card.locator(".ranking .strategy-chip");

  await set([100, 0, 0]);
  await expect(card).toContainText("Pesos actuales: agua 100, suelo 0, diversidad 0.");
  await expect(order()).toHaveText(["C", "B", "A"]);
  await expect(card.locator(".ranking li").first()).toContainText("score 1.00");
  if (info.project.name === "desktop") await card.screenshot({ path: "docs/evidence/priorities-water-only.png" });

  await set([0, 100, 50]);
  await expect(card).toContainText("Pesos actuales: agua 0, suelo 100, diversidad 50.");
  await expect(order()).toHaveText(["B", "C", "A"]);
  if (info.project.name === "desktop") await card.screenshot({ path: "docs/evidence/priorities-soil-diversity.png" });

  await set([0, 0, 0]);
  await expect(card.locator(".notice")).toContainText("mueve al menos un control");
});
