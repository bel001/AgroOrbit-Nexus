import { z } from "zod";
import { addDays, daysBetween, isoDate } from "./model";

export const MODIS_API = "https://modis.ornl.gov/rst/api/v1";
export const MODIS_GUIDE = "https://lpdaac.usgs.gov/documents/103/MOD13_User_Guide_V6.pdf";
export const vegetationQuerySchema = z.object({ lat: z.number().finite().min(-90).max(90), lon: z.number().finite().min(-180).max(180), start: isoDate, end: isoDate }).refine(q => q.start >= "2000-02-18" && daysBetween(q.start, q.end) >= 0 && daysBetween(q.start, q.end) <= 119 && q.end < new Date().toISOString().slice(0, 10), "Elige un periodo histórico MODIS de hasta 120 días desde 2000-02-18");
export type VegetationQuery = z.infer<typeof vegetationQuerySchema>;
const BANDS = { ndvi: "250m_16_days_NDVI", reliability: "250m_16_days_pixel_reliability", qa: "250m_16_days_VI_Quality", observed: "250m_16_days_composite_day_of_the_year" };
const dateSchema = z.object({ calendar_date: isoDate, modis_date: z.string().regex(/^A\d{7}$/) }).refine(d => {
  const year = Number(d.modis_date.slice(1, 5)), day = Number(d.modis_date.slice(5));
  return year >= 2000 && day >= 1 && day <= 366 && addDays(`${year}-01-01`, day - 1) === d.calendar_date;
}, "Fecha de compuesto MODIS inconsistente");
const rowSchema = dateSchema.safeExtend({ band: z.string(), tile: z.string(), proc_date: z.string(), data: z.array(z.number().finite().nullable()).length(1) });
const subsetSchema = z.object({ latitude: z.number(), longitude: z.number(), cellsize: z.number().min(200).max(300), nrows: z.literal(1), ncols: z.literal(1), xllcorner: z.coerce.number().finite(), yllcorner: z.coerce.number().finite(), subset: z.array(rowSchema).max(200) });
const bandsSchema = z.object({ bands: z.array(z.object({ band: z.string(), units: z.string(), scale_factor: z.string().optional(), fill_value: z.string(), valid_range: z.string() })) });
export type ModisDate = z.infer<typeof dateSchema>;

export function validateVegetationBands(raw: unknown) {
  const bands = bandsSchema.parse(raw).bands;
  const ndvi = bands.find(b => b.band === BANDS.ndvi);
  if (!ndvi || Number(ndvi.scale_factor) !== 0.0001 || Number(ndvi.fill_value) !== -3000 || ndvi.valid_range !== "-2000 to 10000" || ![BANDS.qa, BANDS.reliability, BANDS.observed].every(id => bands.some(b => b.band === id))) throw new Error("Contrato MODIS inesperado: no se verificaron escala, rango y bandas de calidad");
  return bands;
}

export function vegetationQuality(reliability: number | null, qa: number | null) {
  if (reliability !== 0 || qa === null || !Number.isInteger(qa) || qa < 0 || qa > 65534) return false;
  return (qa & 3) === 0 && ((qa >> 2) & 15) <= 2 && ((qa >> 6) & 3) !== 3 &&
    (qa & (1 << 8)) === 0 && (qa & (1 << 10)) === 0 && ((qa >> 11) & 7) === 1 && (qa & (1 << 14)) === 0 && (qa & (1 << 15)) === 0;
}
export function normalizeVegetation(raw: unknown, query: VegetationQuery, dates: ModisDate[]) {
  const data = subsetSchema.parse(raw);
  if (data.latitude !== query.lat || data.longitude !== query.lon) throw new Error("La respuesta MODIS pertenece a otra ubicación");
  if (new Set(data.subset.map(r => `${r.modis_date}/${r.band}`)).size !== data.subset.length) throw new Error("Banda MODIS duplicada");
  const observations = dates.map(date => {
    const rows = data.subset.filter(r => r.modis_date === date.modis_date);
    const get = (band: string) => {
      const selected = rows.filter(r => r.band === band);
      if (selected.length > 1) throw new Error("Banda MODIS duplicada");
      if (selected[0] && selected[0].calendar_date !== date.calendar_date) throw new Error("Fecha MODIS inconsistente");
      return selected[0] ?? null;
    };
    const value = get(BANDS.ndvi), qa = get(BANDS.qa), reliability = get(BANDS.reliability), day = get(BANDS.observed);
    if (value && [qa, reliability, day].some(row => row && row.tile !== value.tile)) throw new Error("Bandas MODIS de teselas diferentes");
    const rawValue = value?.data[0] ?? null, rawQa = qa?.data[0] ?? null, reliabilityRank = reliability?.data[0] ?? null;
    const doy = day?.data[0] ?? null;
    const candidateDate = doy !== null && Number.isInteger(doy) && doy >= 1 && doy <= 366 ? addDays(`${date.calendar_date.slice(0, 4)}-01-01`, doy - 1) : null;
    const end = [addDays(date.calendar_date, 15), `${date.calendar_date.slice(0, 4)}-12-31`].sort()[0];
    const observedDate = candidateDate && candidateDate >= date.calendar_date && candidateDate <= end ? candidateDate : null;
    const qualityAccepted = vegetationQuality(reliabilityRank, rawQa);
    const valid = qualityAccepted && rawValue !== null && Number.isInteger(rawValue) && rawValue >= -2000 && rawValue <= 10000 && observedDate !== null;
    return { date: date.calendar_date, compositeEnd: end, observedDate, ndvi: valid ? rawValue! * 0.0001 : null, rawValue, qa: rawQa, reliability: reliabilityRank,
      valid, reason: valid ? "Aceptada por contrato de calidad" : "Ausente, fuera de rango, fecha no verificable o calidad rechazada", tile: value?.tile ?? null, processedAt: value?.proc_date ?? null };
  });
  const validCount = observations.filter(o => o.valid).length;
  return { query, product: "MOD13Q1", collectionVersion: null, providerApiVersion: "v1", nominalResolutionM: 250,
    grid: { cellSizeM: data.cellsize, nrows: 1, ncols: 1, xllcorner: data.xllcorner, yllcorner: data.yllcorner, projection: "MODIS Sinusoidal" }, observations,
    validCount, totalCount: observations.length, validFraction: observations.length ? validCount / observations.length : null,
    interpretation: "Descripción de un píxel del entorno. Sin equivalencia fenológica validada, no se calculan tendencias entre campañas ni causas de cambio.",
    limitations: ["Píxel nominal de 250 m: puede mezclar parcelas, cultivos y otras coberturas; no se agrega el polígono dibujado.", "Compuestos de hasta 16 días; la fecha de observación seleccionada puede diferir del inicio del compuesto.", "El servicio no declara la versión de colección; se conserva como desconocida. Se verifican bandas, escala y rango, con QA según la guía MOD13 Collection 6.", "NDVI no identifica especies, fertilidad, plagas, degradación ni rendimiento. No interviene en restricciones ni ranking."] };
}

const cache = new Map<string, { expires: number; value: Vegetation }>();
const pending = new Map<string, Promise<Vegetation>>();
export async function fetchVegetation(input: VegetationQuery, fetcher: typeof fetch = fetch): Promise<Vegetation> {
  const q = vegetationQuerySchema.parse(input), key = JSON.stringify(q);
  const cached = cache.get(key); if (cached && cached.expires > Date.now()) return cached.value;
  const active = pending.get(key); if (active) return active;
  if (pending.size >= 2) throw new Error("Hay consultas MODIS en curso. Reintenta en unos segundos.");
  const task = (async () => {
    const signal = AbortSignal.timeout(30_000);
    const get = async (url: string) => { const r = await fetcher(url, { signal, headers: { Accept: "application/json" } }); if (!r.ok) throw new Error(`MODIS no disponible (HTTP ${r.status})`); return r.json(); };
    const datesUrl = `${MODIS_API}/MOD13Q1/dates?${new URLSearchParams({ latitude: String(q.lat), longitude: String(q.lon) })}`;
    const bandsUrl = `${MODIS_API}/MOD13Q1/bands`;
    const [datesRaw, bandsRaw] = await Promise.all([get(datesUrl), get(bandsUrl)]);
    const bands = validateVegetationBands(bandsRaw);
    const dates = z.object({ dates: z.array(dateSchema) }).parse(datesRaw).dates.filter(d => d.calendar_date >= q.start && d.calendar_date <= q.end).sort((a, b) => a.calendar_date.localeCompare(b.calendar_date));
    if (!dates.length) throw new Error("No hay compuestos MODIS publicados para esa ubicación y periodo");
    if (dates.length > 10 || new Set(dates.map(d => d.modis_date)).size !== dates.length) throw new Error("Fechas MODIS inesperadas");
    const subsetUrl = `${MODIS_API}/MOD13Q1/subset?${new URLSearchParams({ latitude: String(q.lat), longitude: String(q.lon), startDate: dates[0].modis_date, endDate: dates.at(-1)!.modis_date, kmAboveBelow: "0", kmLeftRight: "0" })}`;
    const result = { ...normalizeVegetation(await get(subsetUrl), q, dates), bands, retrievedAt: new Date().toISOString(), source: "NASA MODIS Terra · ORNL DAAC TESViS", urls: { subset: subsetUrl, dates: datesUrl, bands: bandsUrl }, documentation: "https://modis.ornl.gov/data/modis_webservice.html", qualityGuide: MODIS_GUIDE,
      qualityRule: "Reliability=0; MODLAND=00; usefulness≤2; aerosol≠high; no adjacent/mixed cloud, snow or shadow; land mask=001. Fill, invalid date and out-of-range NDVI → null." };
    if (cache.size >= 32) cache.delete(cache.keys().next().value!);
    cache.set(key, { expires: Date.now() + 86_400_000, value: result }); return result;
  })();
  pending.set(key, task); try { return await task; } finally { pending.delete(key); }
}
export type Vegetation = ReturnType<typeof normalizeVegetation> & { bands: ReturnType<typeof validateVegetationBands>; retrievedAt: string; source: string; urls: { subset: string; dates: string; bands: string }; documentation: string; qualityGuide: string; qualityRule: string };
