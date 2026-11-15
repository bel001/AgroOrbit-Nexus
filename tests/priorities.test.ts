import { describe, expect, it } from "vitest";
import raw from "../src/data/power-viru-demo.json";
import { normalizePower } from "@/lib/power";
import { compareStrategies } from "@/lib/rotations";
import { exampleFarm } from "@/lib/examples/viru";
import { criteria, normalise, rankStrategies, soilIndicators } from "@/lib/priorities";

const climate = normalizePower(raw.raw, raw.query, raw.retrievedAt);
const demo = () => compareStrategies(exampleFarm, climate);
const order = (w: { water: number; soil: number; diversity: number }) => rankStrategies(demo(), w).ranked.map(r => r.strategy.id);

describe("Normalisation", () => {
  it("maps the best value to 1 and the worst to 0 in either direction", () => {
    expect(normalise([10, 20, 30], true)).toEqual([0, 0.5, 1]);
    expect(normalise([10, 20, 30], false)).toEqual([1, 0.5, 0]);
  });
  it("gives 1 to every option when all values are equal (none is worse)", () => {
    expect(normalise([5, 5], false)).toEqual([1, 1]);
  });
});

describe("Farmer priorities on the Virú demo (real NASA snapshot)", () => {
  it("derives soil indicators from the sequences", () => {
    const [a, b, c] = demo().map(soilIndicators);
    expect(a).toMatchObject({ hasLegume: false, families: 1, maxRepeat: 3 });
    expect(b).toMatchObject({ hasLegume: true, families: 2, maxRepeat: 1 });
    expect(c).toMatchObject({ hasLegume: true, families: 2, maxRepeat: 1 });
  });
  it("water-only priority orders by FAO-56 crop water demand (lowest first)", () => {
    const s = demo();
    const byDemand = [...s].sort((x, y) => x.water!.etcMm! - y.water!.etcMm!).map(x => x.id);
    expect(order({ water: 100, soil: 0, diversity: 0 })).toEqual(byDemand);
  });
  it("monoculture A is last whenever diversity matters", () => {
    expect(order({ water: 0, soil: 0, diversity: 100 }).at(-1)).toBe("A");
  });
  it("scores stay within 0–1 and the formula is a weighted mean", () => {
    const r = rankStrategies(demo(), { water: 30, soil: 70, diversity: 0 });
    for (const x of r.ranked) {
      expect(x.score).toBeGreaterThanOrEqual(0); expect(x.score).toBeLessThanOrEqual(1);
      expect(x.score).toBeCloseTo((30 * x.parts.water! + 70 * x.parts.soil!) / 100, 10);
    }
    expect(r.usedCriteria).toEqual(["water", "soil"]);
  });
  it("ties share a rank and each option explains its place with numbers", () => {
    const r = rankStrategies(demo(), { water: 0, soil: 0, diversity: 100 });
    const b = r.ranked.find(x => x.strategy.id === "B")!, c = r.ranked.find(x => x.strategy.id === "C")!;
    expect(b.rank).toBe(c.rank);
    expect(c.why).toMatch(/2 crop families/);
    expect(c.why).toMatch(/includes a legume/);
  });
  it("all weights at 0 produce no ordering, only a note", () => {
    const r = rankStrategies(demo(), { water: 0, soil: 0, diversity: 0 });
    expect(r.note).toMatch(/mueve al menos un control/);
    expect(r.ranked.every(x => x.score === 0 && x.why.startsWith("Not ranked"))).toBe(true);
  });
});

describe("Missing data and incompatible options", () => {
  it("drops the water criterion when there is no complete water balance, and says why", () => {
    const s = compareStrategies(exampleFarm, null);
    expect(criteria(s).find(c => c.id === "water")!.available).toBe(false);
    const r = rankStrategies(s, { water: 100, soil: 50, diversity: 0 });
    expect(r.usedCriteria).toEqual(["soil"]);
    expect(r.note).toMatch(/water/);
  });
  it("never ranks an incompatible option", () => {
    const f = structuredClone(exampleFarm); f.excluded = ["bean"];
    const r = rankStrategies(compareStrategies(f, climate), { water: 50, soil: 50, diversity: 50 });
    expect(r.ranked.map(x => x.strategy.id)).toEqual(["A"]);
    expect(r.excluded.map(x => x.strategy.id)).toEqual(["B", "C"]);
  });
});

describe("Explanations", () => {
  it("does not claim a strongest criterion for an option that scores 0 on all used criteria", () => {
    const a = rankStrategies(demo(), { water: 100, soil: 0, diversity: 0 }).ranked.find(x => x.strategy.id === "A")!;
    expect(a.score).toBe(0);
    expect(a.why).not.toMatch(/strongest/);
  });
});
