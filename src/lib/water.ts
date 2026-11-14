import { catalog, FAO56 } from "./catalog";
import { addDays, daysBetween, type Campaign, type Climate, type ClimateDay, type CropId } from "./model";

/**
 * Estimaciones hídricas y térmicas a partir de la serie NASA POWER ya consultada.
 *
 * - ETo: Hargreaves, FAO-56 cap. 3, ec. 52, con Ra de la ec. 21 (solo Tmin, Tmax y latitud).
 * - ETc: Kc × ETo con la curva de Kc de FAO-56 (fig. 25), valores de la tabla 12 y
 *   proporciones de etapas de la tabla 11, escaladas a la duración de cada campaña.
 * - Grados-día: método promedio, ((Tmax + Tmin) / 2 − Tbase) acotado a ≥ 0.
 *
 * Son estimaciones de demanda en condiciones estándar (cultivo sano, sin estrés,
 * Kc sin ajuste climático ec. 62). No son mediciones ni necesidades de riego validadas.
 */

const GSC = 0.082; // Constante solar, MJ m⁻² min⁻¹ (FAO-56 ec. 21)
const MJ_TO_MM = 0.408; // Conversión de radiación a lámina equivalente (FAO-56 ec. 20)

/** Radiación extraterrestre diaria (MJ m⁻² día⁻¹), FAO-56 ec. 21, 23, 24 y 25. */
export function extraterrestrialRadiation(latDeg: number, dayOfYear: number) {
  const phi = (latDeg * Math.PI) / 180;
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI * dayOfYear) / 365);
  const delta = 0.409 * Math.sin((2 * Math.PI * dayOfYear) / 365 - 1.39);
  // Acotado para latitudes polares, donde la ec. 25 no está definida (noche o día polar).
  const cosWs = Math.min(1, Math.max(-1, -Math.tan(phi) * Math.tan(delta)));
  const ws = Math.acos(cosWs);
  return ((24 * 60) / Math.PI) * GSC * dr *
    (ws * Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.sin(ws));
}

export function dayOfYear(isoDate: string) {
  const year = Number(isoDate.slice(0, 4));
  return daysBetween(`${year}-01-01`, isoDate) + 1;
}

/** ETo de Hargreaves (mm/día), FAO-56 ec. 52. Devuelve null si falta un dato. */
export function hargreavesEto(day: Pick<ClimateDay, "date" | "T2M_MIN" | "T2M_MAX">, latDeg: number) {
  if (day.T2M_MIN === null || day.T2M_MAX === null) return null;
  const tmean = (day.T2M_MAX + day.T2M_MIN) / 2;
  const range = Math.max(0, day.T2M_MAX - day.T2M_MIN);
  const ra = extraterrestrialRadiation(latDeg, dayOfYear(day.date)) * MJ_TO_MM;
  return Math.max(0, 0.0023 * (tmean + 17.8) * Math.sqrt(range) * ra);
}

/** Kc del día según la curva por etapas de FAO-56 (fig. 25). `t` = días desde siembra. */
export function kcOnDay(crop: CropId, t: number, length: number) {
  const w = catalog[crop].waterUse;
  if (!w) return null;
  const total = w.stages.reduce((a, b) => a + b, 0);
  const [ini, dev, mid] = w.stages.map(s => (s / total) * length);
  if (t < ini) return w.kc.ini;
  if (t < ini + dev) return w.kc.ini + ((t - ini) / dev) * (w.kc.mid - w.kc.ini);
  if (t < ini + dev + mid) return w.kc.mid;
  const late = length - ini - dev - mid;
  return w.kc.mid + (Math.min(late, t - ini - dev - mid) / late) * (w.kc.end - w.kc.mid);
}

export type CampaignClimate = {
  crop: CropId; start: string; end: string; days: number;
  etoMm: number | null; etcMm: number | null; rainMm: number | null;
  grossDeficitMm: number | null; gddBaseC: number | null; gdd: number | null;
  daysWithEto: number; daysWithRain: number; complete: boolean;
};

export function campaignClimate(c: Campaign, climate: Climate): CampaignClimate {
  const byDate = new Map(climate.days.map(d => [d.date, d]));
  const length = daysBetween(c.start, c.end);
  const base = catalog[c.crop].gddBaseC;
  let eto = 0, etc = 0, rain = 0, gdd = 0, daysWithEto = 0, daysWithRain = 0, daysWithT = 0;
  for (let t = 0; t < length; t++) {
    const day = byDate.get(addDays(c.start, t));
    if (!day) continue;
    const e = hargreavesEto(day, climate.query.lat);
    const kc = kcOnDay(c.crop, t, length);
    if (e !== null) { eto += e; daysWithEto++; if (kc !== null) etc += kc * e; }
    if (day.PRECTOTCORR !== null) { rain += day.PRECTOTCORR; daysWithRain++; }
    if (base !== null && day.T2M_MIN !== null && day.T2M_MAX !== null) {
      gdd += Math.max(0, (day.T2M_MAX + day.T2M_MIN) / 2 - base); daysWithT++;
    }
  }
  const complete = length > 0 && daysWithEto === length && daysWithRain === length;
  const etcMm = complete && catalog[c.crop].waterUse ? etc : null;
  const rainMm = complete ? rain : null;
  return {
    crop: c.crop, start: c.start, end: c.end, days: length,
    etoMm: complete ? eto : null, etcMm, rainMm,
    grossDeficitMm: etcMm !== null && rainMm !== null ? Math.max(0, etcMm - rainMm) : null,
    gddBaseC: base, gdd: base !== null && daysWithT === length && length > 0 ? gdd : null,
    daysWithEto, daysWithRain, complete,
  };
}

export type WaterBalance = {
  campaigns: CampaignClimate[];
  etcMm: number | null; rainMm: number | null; grossDeficitMm: number | null;
  method: string; assumptions: string[]; source: string;
};

export function waterBalance(campaigns: Campaign[], climate: Climate): WaterBalance {
  const rows = campaigns.map(c => campaignClimate(c, climate));
  const sum = (k: "etcMm" | "rainMm" | "grossDeficitMm") =>
    rows.every(r => r[k] !== null) ? rows.reduce((a, r) => a + (r[k] as number), 0) : null;
  return {
    campaigns: rows, etcMm: sum("etcMm"), rainMm: sum("rainMm"), grossDeficitMm: sum("grossDeficitMm"),
    method: "ETo Hargreaves (FAO-56 ec. 52) × Kc por etapas (FAO-56 fig. 25, tablas 11-12); déficit bruto = máx(0, ETc − precipitación de grilla) por campaña.",
    assumptions: [
      "Kc genéricos de FAO-56 para clima subhúmedo, sin ajuste climático (ec. 62) ni por frecuencia de humedecimiento.",
      "Etapas escaladas a la duración de cada campaña; no son etapas fenológicas observadas.",
      "Hargreaves puede sobrestimar ETo en zonas húmedas o costeras con nubosidad; Penman-Monteith con datos locales es preferible.",
      "La precipitación total no es lluvia efectiva: el déficit bruto subestima la necesidad de riego y no incluye eficiencia de aplicación ni lavado de sales.",
      "Demanda de un cultivo sano sin estrés; no es una necesidad de riego validada para la parcela.",
    ],
    source: FAO56,
  };
}
