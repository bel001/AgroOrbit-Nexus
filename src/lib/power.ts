import { z } from "zod";
import { addDays, climateQuerySchema, daysBetween, variables, waterVariables, type Climate, type ClimateQuery, type ClimateDay } from "./model";

const powerSchema = z.object({
  header: z.object({ fill_value: z.number(), api: z.object({ version: z.string() }), sources: z.array(z.string()), time_standard: z.string() }),
  parameters: z.record(z.string(), z.object({ units: z.string(), longname: z.string() })),
  properties: z.object({ parameter: z.record(z.string(), z.record(z.string(), z.number().nullable())) }),
  geometry: z.object({ coordinates: z.array(z.number()) }).optional(),
});
export function powerUrl(input: ClimateQuery) {
  return buildPowerUrl(climateQuerySchema.parse(input));
}
function buildPowerUrl(q: ClimateQuery) {
  const url = new URL("https://power.larc.nasa.gov/api/temporal/daily/point");
  url.search = new URLSearchParams({ parameters: [...variables, ...(q.extended ? waterVariables : [])].join(","), community: "AG", longitude: String(q.lon), latitude: String(q.lat), start: q.start.replaceAll("-", ""), end: q.end.replaceAll("-", ""), format: "JSON", "time-standard": "LST" }).toString();
  return url.toString();
}
export function normalizePower(raw: unknown, input: ClimateQuery, retrievedAt = new Date().toISOString()): Climate {
  return normalizeSeries(raw, climateQuerySchema.parse(input), retrievedAt);
}
/**
 * Same NASA contract checks without the 731-day limit of user queries.
 * Only for stored long series (e.g. the 1991–2023 baseline); never for user input.
 */
export function normalizeStoredSeries(raw: unknown, query: ClimateQuery, retrievedAt: string): Climate {
  if (!(query.start < query.end) || query.start < "1981-01-01") throw new Error("Serie almacenada con fechas inválidas");
  return normalizeSeries(raw, query, retrievedAt);
}
function normalizeSeries(raw: unknown, query: ClimateQuery, retrievedAt: string): Climate {
  const data = powerSchema.parse(raw);
  if (data.header.time_standard !== "LST") throw new Error("NASA devolvió una escala temporal inesperada");
  for (const v of variables) {
    const expected = v === "PRECTOTCORR" ? "mm/day" : "C";
    if (data.parameters[v]?.units !== expected || !data.properties.parameter[v]) throw new Error(`Variable o unidad NASA inesperada: ${v}`);
  }
  const missing = { T2M: 0, T2M_MIN: 0, T2M_MAX: 0, PRECTOTCORR: 0 };
  const waterMissing = { ALLSKY_SFC_SW_DWN: 0, T2MDEW: 0, WS2M: 0, PS: 0 };
  const waterUnits = { ALLSKY_SFC_SW_DWN: "MJ/m^2/day", T2MDEW: "C", WS2M: "m/s", PS: "kPa" };
  if (query.extended) for (const v of waterVariables) {
    if (data.parameters[v]?.units !== waterUnits[v] || !data.properties.parameter[v]) throw new Error(`Variable o unidad NASA inesperada: ${v}`);
  }
  const days: ClimateDay[] = [];
  for (let i = 0; i <= daysBetween(query.start, query.end); i++) {
    const date = addDays(query.start, i);
    const row = { date } as ClimateDay;
    for (const v of variables) {
      const n = data.properties.parameter[v][date.replaceAll("-", "")];
      row[v] = typeof n === "number" && Number.isFinite(n) && n !== data.header.fill_value && (v !== "PRECTOTCORR" || n >= 0) ? n : null;
      if (row[v] === null) missing[v]++;
    }
    if (row.T2M_MIN !== null && row.T2M_MAX !== null && row.T2M_MIN > row.T2M_MAX) throw new Error("Serie NASA inconsistente: mínima mayor que máxima");
    if (query.extended) for (const v of waterVariables) {
      const value = data.properties.parameter[v][date.replaceAll("-", "")];
      row[v] = typeof value === "number" && Number.isFinite(value) && value !== data.header.fill_value && (v === "T2MDEW" || value >= 0) && (v !== "PS" || value > 0) ? value : null;
      if (row[v] === null) waterMissing[v]++;
    }
    days.push(row);
  }
  if (variables.every(v => missing[v] === days.length)) throw new Error("NASA no entregó observaciones válidas para este periodo");
  return { days, missing, query, units: Object.fromEntries(variables.map(v => [v, data.parameters[v].units])) as Climate["units"], source: "NASA POWER Daily · comunidad AG", url: buildPowerUrl(query), retrievedAt, version: data.header.api.version, sources: data.header.sources, timeStandard: data.header.time_standard, fillValue: data.header.fill_value,
    ...(query.extended ? { elevationM: data.geometry?.coordinates[2] ?? null, waterWeather: { units: waterUnits, missing: waterMissing, spatialSupport: "Radiación y meteorología tienen soporte espacial propio del producto NASA; no son mediciones de parcela." } } : {}),
    spatialSupport: "Meteorología MERRA-2 de grilla regional; soporte nativo dependiente del producto. No representa mediciones de la parcela.",
    warnings: ["Clima histórico; no es un pronóstico ni una medición del predio.", "La precipitación no equivale al agua utilizable ni al riego.", ...(variables.some(v => missing[v] > 0) ? ["Hay fechas o valores ausentes. Totales parciales identificados."] : [])] };
}

// Caché acotada para consultas idénticas; no se redondean coordenadas hacia una grilla supuesta.
const cache = new Map<string, { expires: number; value: Climate }>();
const inFlight = new Map<string, Promise<Climate>>();
export async function fetchClimate(q: ClimateQuery, fetcher: typeof fetch = fetch, timeoutMs = 25_000): Promise<Climate> {
  const url = powerUrl(q);
  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) return cached.value;
  const pending = inFlight.get(url);
  if (pending) return pending;
  if (inFlight.size >= 4) throw new Error("Hay varias consultas NASA en curso. Reintenta en unos segundos.");
  const task = (async () => {
    const response = await fetcher(url, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`NASA POWER no disponible (HTTP ${response.status}). Reintenta más tarde.`);
    const value = normalizePower(await response.json(), q);
    if (cache.size >= 64) cache.delete(cache.keys().next().value!);
    cache.set(url, { value, expires: Date.now() + 86_400_000 });
    return value;
  })();
  inFlight.set(url, task);
  try { return await task; } finally { inFlight.delete(url); }
}
export function monthlyClimate(c: Climate) {
  const months = new Map<string, ClimateDay[]>();
  for (const d of c.days) { const key = d.date.slice(0, 7); months.set(key, [...(months.get(key) ?? []), d]); }
  return [...months].map(([month, days]) => {
    const t = days.flatMap(d => d.T2M === null ? [] : [d.T2M]);
    const p = days.flatMap(d => d.PRECTOTCORR === null ? [] : [d.PRECTOTCORR]);
    return { month, temperature: t.length ? t.reduce((a, b) => a + b, 0) / t.length : null, rain: p.length ? p.reduce((a, b) => a + b, 0) : null, validTemperature: t.length, validRain: p.length, days: days.length };
  });
}

/** Totals are absent when no observation is available; a partial sum is explicitly identified. */
export function rainfallSummary(days: ClimateDay[]) {
  const values = days.flatMap(d => d.PRECTOTCORR === null ? [] : [d.PRECTOTCORR]);
  return { totalMm: values.length ? values.reduce((a, b) => a + b, 0) : null,
    validDays: values.length, requestedDays: days.length, partial: values.length > 0 && values.length < days.length };
}
