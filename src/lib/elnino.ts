import { addDays, daysBetween, type Campaign, type Climate, type ClimateDay } from "./model";
import { campaignClimate } from "./water";
import { toM3PerHa } from "./bottom-line";
import type { Strategy } from "./rotations";

/**
 * El Niño stress test (historical replay, not a forecast).
 *
 * Each sequence keeps its calendar (day offsets from the horizon start) and is replayed with real
 * NASA POWER daily temperatures starting on 1 January of:
 *   - every year 1991…2019 except the event years 1997 and 2016 → baseline (27 seasons, each ending inside
 *     1991–2020; the events are excluded so they are not compared against themselves),
 *   - 1997, 2016 and 2023 → seasons covering the 1997–98, 2016–17 and 2023 El Niño events.
 * For each season the FAO-56 crop water demand (ETc = Kc × Hargreaves ET0) is recomputed. Because Kc and
 * the calendar are fixed, the change versus the baseline mean is the extra water the sequence would have
 * needed from the ET0 change alone.
 *
 * Anomaly rule (data only, no external threshold): a season is anomalous when its ETc lies outside the
 * minimum–maximum range of the 27 baseline seasons; otherwise "no anomaly in these data".
 * Heat days are not computed: no sourced, crop-specific heat threshold has been verified.
 */
export const EVENTS = [
  { id: "1997-98", startYear: 1997, label: "1997–98" },
  { id: "2016-17", startYear: 2016, label: "2016–17" },
  { id: "2023", startYear: 2023, label: "2023" },
] as const;
export const BASELINE_START_YEARS = Array.from({ length: 29 }, (_, i) => 1991 + i)
  .filter(y => !EVENTS.some(e => e.startYear === y));

export type EventResult = {
  event: string; label: string; etcMm: number | null; deltaM3PerHa: number | null; deltaPct: number | null;
  anomaly: "above" | "below" | "none" | "no-data";
};
export type StrategyStress = {
  id: string; name: string;
  baseline: { meanMm: number; minMm: number; maxMm: number; seasons: number } | null;
  events: EventResult[];
  sentence: { es: string; en: string };
};
export type StressTest = {
  method: string; anomalyRule: string; heatDays: string; source: string; period: string;
  strategies: StrategyStress[];
};

/** Replays the sequence's calendar on another year (same day offsets from 1 January). */
export function shiftCampaigns(campaigns: Campaign[], horizonStart: string, startYear: number): Campaign[] {
  const target = `${startYear}-01-01`;
  return campaigns.map(c => ({ ...c, start: addDays(target, daysBetween(horizonStart, c.start)), end: addDays(target, daysBetween(horizonStart, c.end)) }));
}

function seasonEtc(campaigns: Campaign[], climate: Climate): number | null {
  let total = 0;
  for (const c of campaigns) {
    const r = campaignClimate(c, climate);
    if (r.etcMm === null) return null;
    total += r.etcMm;
  }
  return total;
}

const fmt = (x: number, lang: "es" | "en") => Math.round(x).toLocaleString(lang === "es" ? "es-PE" : "en-US");

export function stressTest(strategies: Strategy[], days: ClimateDay[], lat: number): StressTest | null {
  if (!strategies.length || !days.length) return null;
  const climate = { days, query: { lat, lon: 0, start: days[0].date, end: days.at(-1)!.date } } as Climate;
  const results: StrategyStress[] = strategies.filter(s => s.status !== "Incompatible").map(s => {
    const horizonStart = s.horizon.start;
    const base = BASELINE_START_YEARS.map(y => seasonEtc(shiftCampaigns(s.campaigns, horizonStart, y), climate)).filter((v): v is number => v !== null);
    const baseline = base.length ? { meanMm: base.reduce((a, b) => a + b, 0) / base.length, minMm: Math.min(...base), maxMm: Math.max(...base), seasons: base.length } : null;
    const events: EventResult[] = EVENTS.map(e => {
      const etc = seasonEtc(shiftCampaigns(s.campaigns, horizonStart, e.startYear), climate);
      if (etc === null || !baseline) return { event: e.id, label: e.label, etcMm: etc, deltaM3PerHa: null, deltaPct: null, anomaly: "no-data" };
      const anomaly = etc > baseline.maxMm ? "above" : etc < baseline.minMm ? "below" : "none";
      return { event: e.id, label: e.label, etcMm: etc, deltaM3PerHa: toM3PerHa(etc - baseline.meanMm), deltaPct: (etc / baseline.meanMm - 1) * 100, anomaly };
    });
    const sentence = (lang: "es" | "en") => {
      if (!baseline) return lang === "en" ? `${s.id}: no complete baseline in the stored data.` : `${s.id}: sin línea base completa en los datos guardados.`;
      const parts = events.map(e => {
        if (e.anomaly === "no-data") return lang === "en" ? `${e.label}: no data` : `${e.label}: sin datos`;
        const sign = e.deltaM3PerHa! >= 0 ? "+" : "−";
        const amount = `${sign}${fmt(Math.abs(e.deltaM3PerHa!), lang)} m³/ha`;
        if (e.anomaly === "none") return lang === "en" ? `${e.label}: ${amount}, within the 1991–2020 range (no anomaly in these data)` : `${e.label}: ${amount}, dentro del rango 1991–2020 (sin anomalía en estos datos)`;
        return lang === "en" ? `${e.label}: ${amount}, ${e.anomaly === "above" ? "above" : "below"} every 1991–2020 season` : `${e.label}: ${amount}, ${e.anomaly === "above" ? "por encima" : "por debajo"} de todas las temporadas 1991–2020`;
      });
      return `${s.id}: ${parts.join("; ")}.`;
    };
    return { id: s.id, name: s.name, baseline, events, sentence: { es: sentence("es"), en: sentence("en") } };
  });
  return {
    method: "Same calendar replayed with NASA POWER daily temperatures; ETc = Kc × Hargreaves ET0 (FAO-56). Change vs. the mean of 27 baseline seasons starting 1991–2019, excluding the 1997 and 2016 event seasons.",
    anomalyRule: "Anomalous only if outside the min–max of the 27 baseline seasons.",
    heatDays: "Not computed: no sourced crop-specific heat threshold verified.",
    source: "NASA POWER Daily API v2.10.3, AG community, stored series 1991-01-01…2025-06-23",
    period: "baseline 1991–2020",
    strategies: results,
  };
}
