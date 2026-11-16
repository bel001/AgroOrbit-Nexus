import { z } from "zod";
import { catalogCropIds } from "./catalog";
import { parcelSchema } from "./parcel";

export const DAY = 86_400_000;
export function dateMs(s: string) { return Date.parse(`${s}T00:00:00Z`); }
export function addDays(s: string, days: number) { return new Date(dateMs(s) + days * DAY).toISOString().slice(0, 10); }
export function daysBetween(start: string, end: string) { return Math.round((dateMs(end) - dateMs(start)) / DAY); }
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s => Number.isFinite(dateMs(s)) && new Date(dateMs(s)).toISOString().slice(0, 10) === s, "Fecha inválida");
export const cropId = z.enum(catalogCropIds);
export const origin = z.enum(["declarado", "medido", "estimado", "desconocido"]);
const optionalNumber = (min: number, max: number) => z.number().finite().min(min).max(max).nullable();
export const campaignSchema = z.object({ crop: cropId, start: isoDate, end: isoDate, origin, variety: z.string().trim().max(100).optional() });
export const alternativeSchema = z.object({ name: z.string().trim().min(1).max(60), campaigns: z.array(campaignSchema).min(1).max(12) });
export type Alternative = z.infer<typeof alternativeSchema>;
export const farmSchema = z.object({
  name: z.string().trim().min(1).max(80), lat: z.number().finite().min(-90).max(90), lon: z.number().finite().min(-180).max(180),
  areaHa: optionalNumber(0.001, 1_000_000), soil: z.enum(["desconocido", "arenoso", "franco", "arcilloso"]),
  ph: optionalNumber(0, 14), soilOrigin: origin, irrigation: z.enum(["desconocido", "secano", "goteo", "gravedad"]),
  waterMm: optionalNumber(0, 100_000), waterOrigin: origin,
  priority: z.enum(["diversidad", "agua", "continuidad"]), excluded: z.array(cropId).max(100),
  illustrative: z.boolean(), start: isoDate, horizonDays: z.number().int().min(30).max(731),
  analysisMode: z.enum(["climate", "regional"]).default("climate"), regionProfileId: z.string().max(80).nullable().default(null),
  history: z.array(campaignSchema).max(12), current: z.array(campaignSchema).max(12),
  // Escenarios que propone el propio usuario para comparar con su secuencia A; no son recomendaciones.
  alternatives: z.array(alternativeSchema).max(2).default([]),
  etoMethod: z.enum(["hargreaves", "penman-monteith"]).optional(),
  parcel: parcelSchema.optional(),
  soilDetails: z.object({ drainage: z.enum(["desconocido", "bueno", "limitado"]), organicMatterPct: optionalNumber(0, 100), salinityDsM: optionalNumber(0, 100), sampledOn: isoDate.nullable(), reference: z.string().trim().max(300) }).optional(),
  waterScenario: z.object({ effectiveRainPct: optionalNumber(0, 100), efficiencyPct: z.number().finite().gt(0).max(100).nullable(), origin, reference: z.string().trim().max(300) }).optional(),
}).superRefine((f, ctx) => {
  if (f.analysisMode === "regional" && f.current.length === 0) ctx.addIssue({ code: "custom", path: ["current"], message: "Registra al menos una campaña para revisar una secuencia" });
  if (f.waterMm !== null && f.waterOrigin === "desconocido") ctx.addIssue({ code: "custom", path: ["waterOrigin"], message: "Indica la procedencia del agua o deja el dato vacío" });
  if ((f.ph !== null || f.soil !== "desconocido") && f.soilOrigin === "desconocido") ctx.addIssue({ code: "custom", path: ["soilOrigin"], message: "Indica la procedencia del suelo o deja los datos desconocidos" });
  if (f.waterScenario && (f.waterScenario.effectiveRainPct !== null || f.waterScenario.efficiencyPct !== null) && (f.waterScenario.origin === "desconocido" || !f.waterScenario.reference)) ctx.addIssue({ code: "custom", path: ["waterScenario"], message: "Documenta la procedencia y referencia de los supuestos de agua" });
  if (f.soilDetails && (f.soilDetails.organicMatterPct !== null || f.soilDetails.salinityDsM !== null) && (f.soilOrigin === "desconocido" || !f.soilDetails.reference || !f.soilDetails.sampledOn)) ctx.addIssue({ code: "custom", path: ["soilDetails"], message: "Indica procedencia, fuente y fecha del análisis de suelo" });
});
export type Farm = z.infer<typeof farmSchema>;
export type Campaign = z.infer<typeof campaignSchema>;
export type CropId = z.infer<typeof cropId>;
export const climateQuerySchema = z.object({ lat: z.number().finite().min(-90).max(90), lon: z.number().finite().min(-180).max(180), start: isoDate, end: isoDate, extended: z.boolean().optional() }).superRefine((q, ctx) => {
  const days = daysBetween(q.start, q.end);
  if (days < 0 || days > 730) ctx.addIssue({ code: "custom", message: "El periodo debe durar entre 1 y 731 días" });
  if (q.start < "1981-01-01" || dateMs(q.end) > Date.now() - 2 * DAY) ctx.addIssue({ code: "custom", message: "Consulta un periodo histórico desde 1981, terminado al menos hace dos días" });
});
export type ClimateQuery = z.infer<typeof climateQuerySchema>;
export const variables = ["T2M", "T2M_MIN", "T2M_MAX", "PRECTOTCORR"] as const;
export const waterVariables = ["ALLSKY_SFC_SW_DWN", "T2MDEW", "WS2M", "PS"] as const;
export type WaterVariable = typeof waterVariables[number];
export type Variable = typeof variables[number];
export type ClimateDay = { date: string } & Record<Variable, number | null> & Partial<Record<WaterVariable, number | null>>;
export type Climate = {
  days: ClimateDay[]; units: Record<Variable, string>; source: string; url: string;
  retrievedAt: string; version: string; sources: string[]; timeStandard: string; fillValue: number;
  query: ClimateQuery; missing: Record<Variable, number>; warnings: string[]; spatialSupport: string;
  elevationM?: number | null;
  waterWeather?: { units: Record<WaterVariable, string>; missing: Record<WaterVariable, number>; spatialSupport: string };
  /** Present only when a stored NASA POWER response replaced an unavailable live request. */
  snapshot?: { retrievedAt: string; reason: string };
};
/** NASA POWER daily data arrive with a few days of latency (checked 2026-11-15: last valid day = today − 3). */
export const POWER_LATENCY_DAYS = 3;
/** The most recent period of `days` days that NASA POWER is expected to have complete. */
export function latestPeriod(days = 365, today: Date = new Date()) {
  const todayIso = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0, 10);
  const end = addDays(todayIso, -POWER_LATENCY_DAYS);
  return { start: addDays(end, -(days - 1)), horizonDays: days, end };
}
export function newGlobalFarm(): Farm {
  return { name: "Mi terreno", lat: NaN, lon: NaN, areaHa: null, soil: "desconocido", ph: null, soilOrigin: "desconocido", irrigation: "desconocido", waterMm: null, waterOrigin: "desconocido", priority: "diversidad", excluded: [], illustrative: false, start: "2024-01-01", horizonDays: 366, analysisMode: "climate", regionProfileId: null, history: [], current: [], alternatives: [] };
}
