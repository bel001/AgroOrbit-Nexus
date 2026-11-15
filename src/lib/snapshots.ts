// Server-side module: only the API route imports it, so the stored series never reach the browser bundle.
import demoFile from "../data/power-viru-demo.json";
import historyFile from "../data/power-viru-1991-2023.json";
import { fetchClimate, normalizePower, normalizeStoredSeries } from "./power";
import type { Climate, ClimateQuery } from "./model";

/**
 * Stored, unmodified NASA POWER responses for the Virú demo point (server only, never shipped to the browser).
 * - demo: the exact query of the illustrative demo (2024-01-01 → 2025-06-23).
 * - history: 1991-01-01 → 2023-12-31, for the 1991–2020 baseline and the El Niño seasons.
 * Refresh with scripts/snapshot-viru-demo.mjs and scripts/snapshot-viru-history.mjs.
 */
type Stored = { query: ClimateQuery; url: string; retrievedAt: string; raw: unknown };
export const demoSnapshot = demoFile as Stored;
export const historySnapshot = historyFile as Stored;

export function historyClimate(): Climate {
  return normalizeStoredSeries(historySnapshot.raw, historySnapshot.query, historySnapshot.retrievedAt);
}

const sameQuery = (a: ClimateQuery, b: ClimateQuery) => a.lat === b.lat && a.lon === b.lon && a.start === b.start && a.end === b.end;
/**
 * Live NASA POWER first. Only for the exact demo query, an unavailable or slow API falls back to the
 * stored response, which is labelled as such; any other query keeps failing honestly.
 */
export async function fetchClimateWithSnapshot(q: ClimateQuery, fetcher: typeof fetch = fetch): Promise<Climate> {
  const covered = sameQuery(q, demoSnapshot.query);
  try { return await fetchClimate(q, fetcher, covered ? 8_000 : 25_000); }
  catch (e) {
    if (!covered) throw e;
    const climate = normalizePower(demoSnapshot.raw, q, demoSnapshot.retrievedAt);
    const reason = e instanceof Error ? e.message : "NASA POWER no respondió";
    return { ...climate, snapshot: { retrievedAt: demoSnapshot.retrievedAt, reason },
      warnings: [`Datos NASA POWER guardados localmente el ${demoSnapshot.retrievedAt.slice(0, 10)} para la demo; la consulta en vivo no estuvo disponible.`, ...climate.warnings] };
  }
}

/** Stored daily series 1991-01-01 → 2025-06-23 (history + demo) for the El Niño replay; Virú demo only. */
export function viruDailySeries() {
  const demo = normalizeStoredSeries(demoSnapshot.raw, demoSnapshot.query, demoSnapshot.retrievedAt);
  return [...historyClimate().days, ...demo.days];
}
