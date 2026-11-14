import { z } from "zod";
import { catalogCropIds } from "./catalog";

export const DAY = 86_400_000;
export function dateMs(s: string) { return Date.parse(`${s}T00:00:00Z`); }
export function addDays(s: string, days: number) { return new Date(dateMs(s) + days * DAY).toISOString().slice(0, 10); }
export function daysBetween(start: string, end: string) { return Math.round((dateMs(end) - dateMs(start)) / DAY); }
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s => Number.isFinite(dateMs(s)) && new Date(dateMs(s)).toISOString().slice(0, 10) === s, "Fecha inválida");
export const cropId = z.enum(catalogCropIds);
export const origin = z.enum(["declarado", "medido", "estimado", "desconocido"]);
const optionalNumber = (min: number, max: number) => z.number().finite().min(min).max(max).nullable();
export const campaignSchema = z.object({ crop: cropId, start: isoDate, end: isoDate, origin });
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
}).superRefine((f, ctx) => {
  if (f.analysisMode === "regional" && f.current.length === 0) ctx.addIssue({ code: "custom", path: ["current"], message: "Registra al menos una campaña para revisar una secuencia" });
  if (f.waterMm !== null && f.waterOrigin === "desconocido") ctx.addIssue({ code: "custom", path: ["waterOrigin"], message: "Indica la procedencia del agua o deja el dato vacío" });
  if ((f.ph !== null || f.soil !== "desconocido") && f.soilOrigin === "desconocido") ctx.addIssue({ code: "custom", path: ["soilOrigin"], message: "Indica la procedencia del suelo o deja los datos desconocidos" });
});
export type Farm = z.infer<typeof farmSchema>;
export type Campaign = z.infer<typeof campaignSchema>;
export type CropId = z.infer<typeof cropId>;
export const climateQuerySchema = z.object({ lat: z.number().finite().min(-90).max(90), lon: z.number().finite().min(-180).max(180), start: isoDate, end: isoDate }).superRefine((q, ctx) => {
  const days = daysBetween(q.start, q.end);
  if (days < 0 || days > 730) ctx.addIssue({ code: "custom", message: "El periodo debe durar entre 1 y 731 días" });
  if (q.start < "1981-01-01" || dateMs(q.end) > Date.now() - 2 * DAY) ctx.addIssue({ code: "custom", message: "Consulta un periodo histórico desde 1981, terminado al menos hace dos días" });
});
export type ClimateQuery = z.infer<typeof climateQuerySchema>;
export const variables = ["T2M", "T2M_MIN", "T2M_MAX", "PRECTOTCORR"] as const;
export type Variable = typeof variables[number];
export type ClimateDay = { date: string } & Record<Variable, number | null>;
export type Climate = {
  days: ClimateDay[]; units: Record<Variable, string>; source: string; url: string;
  retrievedAt: string; version: string; sources: string[]; timeStandard: string; fillValue: number;
  query: ClimateQuery; missing: Record<Variable, number>; warnings: string[]; spatialSupport: string;
};
export function newGlobalFarm(): Farm {
  return { name: "Mi terreno", lat: NaN, lon: NaN, areaHa: null, soil: "desconocido", ph: null, soilOrigin: "desconocido", irrigation: "desconocido", waterMm: null, waterOrigin: "desconocido", priority: "diversidad", excluded: [], illustrative: false, start: "2024-01-01", horizonDays: 366, analysisMode: "climate", regionProfileId: null, history: [], current: [], alternatives: [] };
}
