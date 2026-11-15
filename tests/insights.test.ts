import { describe, expect, it } from "vitest";
import hist from "../src/data/power-viru-1991-2023.json";
import demo from "../src/data/power-viru-demo.json";
import { normalizeStoredSeries } from "@/lib/power";
import { buildReport, compareStrategies } from "@/lib/rotations";
import { exampleFarm } from "@/lib/examples/viru";
import { newGlobalFarm } from "@/lib/model";
import { soilCard, FAO_DIVERSIFICATION, FAO_SOIL_COVER } from "@/lib/soil";
import { bottomLine, toM3PerHa } from "@/lib/bottom-line";
import { BASELINE_START_YEARS, EVENTS, shiftCampaigns, stressTest } from "@/lib/elnino";
import { cellSizeKm, powerCell } from "@/lib/grid";

const demoClimate = normalizeStoredSeries(demo.raw, demo.query, demo.retrievedAt);
const series = [...normalizeStoredSeries(hist.raw, hist.query, hist.retrievedAt).days, ...demoClimate.days];
const strategies = () => compareStrategies(exampleFarm, demoClimate);

describe("Water units", () => {
  it("converts 1 mm to 10 m³/ha", () => { expect(toM3PerHa(1)).toBe(10); expect(toM3PerHa(139.2)).toBeCloseTo(1392); });
});

describe("Soil health card", () => {
  it("reads the four indicators from each sequence, each with a reason and an FAO source", () => {
    const [a, , c] = strategies().map(soilCard);
    expect(a.map(x => x.id)).toEqual(["legume", "families", "repeat", "uncropped"]);
    expect(a.find(x => x.id === "legume")!.value.en).toBe("No");
    expect(a.find(x => x.id === "repeat")!.value.en).toBe("3× Grain maize");
    expect(c.find(x => x.id === "legume")!.value.en).toBe("Yes · Dry bean");
    expect(c.find(x => x.id === "repeat")!.value.en).toBe("Never");
    expect(c.find(x => x.id === "uncropped")!.value.en).toBe("130 days");
    for (const ind of [...a, ...c]) {
      expect(ind.why.en.length).toBeGreaterThan(20);
      expect([FAO_DIVERSIFICATION, FAO_SOIL_COVER]).toContain(ind.source.url);
    }
  });
});

describe("Bottom line", () => {
  it("compares the lowest-demand option with A using the computed numbers", () => {
    const s = strategies();
    const line = bottomLine(s)!;
    const diff = s[0].water!.etcMm! - s[2].water!.etcMm!;
    expect(line.en).toContain(`C needs ~${(Math.round(toM3PerHa(diff) / 10) * 10).toLocaleString("en-US")} m³/ha less water than A`);
    expect(line.en).toContain("uses 2 crop families and breaks the maize cycle");
    expect(line.es).toContain("corta el ciclo del maíz");
  });
  it("says nothing without water data or without a second option", () => {
    expect(bottomLine(compareStrategies(exampleFarm, null))).toBeNull();
    expect(bottomLine(strategies().slice(0, 1))).toBeNull();
  });
});

describe("NASA POWER grid cell", () => {
  it("matches the bounds verified against the API at the Virú demo point", () => {
    expect(powerCell(-8.42, -78.75)).toMatchObject({ south: -8.75, north: -8.25, west: -79.0625, east: -78.4375 });
  });
  it("puts neighbouring probe points in the same or the next cell like the API did", () => {
    const base = powerCell(-8.42, -78.75);
    expect(powerCell(-8.26, -78.75)).toEqual(base);
    expect(powerCell(-8.24, -78.75)).not.toEqual(base);
    expect(powerCell(-8.42, -78.44)).toEqual(base);
    expect(powerCell(-8.42, -78.43)).not.toEqual(base);
  });
  it("reports an approximate cell size of ~56 × ~69 km near Virú", () => {
    const k = cellSizeKm(-8.5);
    expect(k.northSouth).toBeCloseTo(55.7, 0); expect(k.eastWest).toBeCloseTo(68.8, 0);
  });
});

describe("El Niño stress test (historical replay)", () => {
  it("excludes the event seasons from the 27-season baseline", () => {
    expect(BASELINE_START_YEARS).toHaveLength(27);
    expect(BASELINE_START_YEARS).not.toContain(1997);
    expect(BASELINE_START_YEARS).not.toContain(2016);
  });
  it("replays the same day offsets on another year, keeping each cycle length (2024 is a leap year)", () => {
    const [c] = shiftCampaigns([{ crop: "maize", start: "2024-01-01", end: "2024-05-30", origin: "estimado" }], "2024-01-01", 1997);
    expect(c.start).toBe("1997-01-01"); expect(c.end).toBe("1997-05-31");
  });
  it("computes every season from real data and only calls an anomaly when outside the baseline range", () => {
    const r = stressTest(strategies(), series, -8.42)!;
    expect(r.strategies.map(s => s.id)).toEqual(["A", "B", "C"]);
    for (const s of r.strategies) {
      expect(s.baseline!.seasons).toBe(27);
      expect(s.events.map(e => e.event)).toEqual(EVENTS.map(e => e.id));
      for (const e of s.events) {
        expect(e.etcMm).not.toBeNull();
        const outside = e.etcMm! > s.baseline!.maxMm || e.etcMm! < s.baseline!.minMm;
        expect(e.anomaly === "none").toBe(!outside);
        expect(e.deltaM3PerHa).toBeCloseTo(toM3PerHa(e.etcMm! - s.baseline!.meanMm), 6);
      }
    }
    // What the data say at Virú: 1997–98 above every baseline season; 2016–17 and 2023 within range.
    expect(r.strategies.every(s => s.events[0].anomaly === "above")).toBe(true);
    expect(r.strategies.every(s => s.events[1].anomaly === "none" && s.events[2].anomaly === "none")).toBe(true);
    expect(r.strategies[0].sentence.en).toContain("no anomaly in these data");
    expect(r.heatDays).toMatch(/Not computed/);
  });
  it("is only attached to the Virú demo report, never to other locations", () => {
    expect(buildReport(exampleFarm, demoClimate, series).stressTest?.strategies).toHaveLength(3);
    const elsewhere = { ...newGlobalFarm(), lat: 10, lon: 10, analysisMode: "regional" as const, current: exampleFarm.current };
    expect(buildReport(elsewhere, null, series).stressTest).toBeNull();
  });
});
