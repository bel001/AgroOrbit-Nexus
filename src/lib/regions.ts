import { z } from "zod";

export const regionalRuleSchema = z.object({
  id: z.string().min(1), cropId: z.string().min(1), variety: z.string().min(1),
  kind: z.enum(["sowing-window", "soil-ph", "temperature", "water-budget"]),
  validFrom: z.iso.date(), validTo: z.iso.date(), source: z.url(),
  assumptions: z.array(z.string()).min(1), parameters: z.record(z.string(), z.union([z.number(), z.string(), z.array(z.number())])),
}).refine(r => r.validFrom <= r.validTo, "Periodo de regla invertido");
// Bounding boxes are declared areas of applicability, never administrative/cadastral boundaries.
export const regionProfileSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), version: z.string().min(1),
  names: z.record(z.string(), z.string()), countryCodes: z.array(z.string().regex(/^[A-Z]{2}$/)),
  bounds: z.object({ west: z.number().min(-180).max(180), east: z.number().min(-180).max(180), south: z.number().min(-90).max(90), north: z.number().min(-90).max(90) }),
  status: z.enum(["illustrative", "reviewed"]),
  validation: z.object({ reviewedAt: z.iso.date(), reviewer: z.string().min(1), evidenceUrl: z.url(), limitations: z.array(z.string()).min(1) }).nullable(),
  cropIds: z.array(z.string()), sources: z.array(z.url()).min(1),
  rules: z.array(regionalRuleSchema).default([]),
  scenario: z.object({ horizonDays: z.number().int().positive(), offsets: z.array(z.number().int().nonnegative()), durations: z.record(z.string(), z.number().int().positive()), sequences: z.array(z.object({ id: z.string(), name: z.string(), crops: z.array(z.string()) })) }).nullable(),
}).superRefine((r, ctx) => {
  if (r.bounds.south > r.bounds.north) ctx.addIssue({ code: "custom", message: "Latitudes de cobertura invertidas" });
  if (r.rules.some(rule => !r.cropIds.includes(rule.cropId))) ctx.addIssue({ code: "custom", message: "Regla con cultivo fuera del perfil" });
  if (r.status === "reviewed" && !r.validation) ctx.addIssue({ code: "custom", message: "Un perfil revisado necesita evidencia y responsable" });
  if (r.scenario && r.scenario.sequences.some(s => s.crops.length !== r.scenario!.offsets.length || s.crops.some(c => !r.cropIds.includes(c) || !r.scenario!.durations[c]))) ctx.addIssue({ code: "custom", message: "Escenario sin cultivos, duraciones o ciclos consistentes" });
});
export type RegionProfile = z.infer<typeof regionProfileSchema>;
export const regionProfiles: RegionProfile[] = [regionProfileSchema.parse({
  id: "pe-viru-demo", version: "2026-11-14", names: { es: "Virú · piloto ilustrativo", en: "Viru · illustrative pilot" }, countryCodes: ["PE"],
  bounds: { west: -78.9, east: -78.5, south: -8.6, north: -8.2 }, status: "illustrative", validation: null,
  cropIds: ["maize", "bean", "sorghum"], sources: ["https://www.fao.org/4/s2022e/s2022e07.htm"],
  scenario: { horizonDays: 540, offsets: [0, 180, 360], durations: { maize: 150, bean: 100, sorghum: 125 }, sequences: [
    { id: "B", name: "Alternancia con leguminosa", crops: ["maize", "bean", "maize"] },
    { id: "C", name: "Tres especies candidatas", crops: ["maize", "sorghum", "bean"] },
  ] },
})];

export function containsLocation(bounds: RegionProfile["bounds"], lat: number, lon: number) {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= bounds.south && lat <= bounds.north &&
    (bounds.west <= bounds.east ? lon >= bounds.west && lon <= bounds.east : lon >= bounds.west || lon <= bounds.east);
}
export function resolveCoverage(input: { lat: number; lon: number; regionProfileId: string | null; analysisMode: "climate" | "regional"; illustrative: boolean; horizonDays: number }) {
  const profile = regionProfiles.find(r => r.id === input.regionProfileId && containsLocation(r.bounds, input.lat, input.lon)) ?? null;
  const demoAllowed = input.analysisMode === "regional" && input.illustrative && profile?.status === "illustrative" && profile.scenario?.horizonDays === input.horizonDays;
  return {
    level: input.analysisMode === "climate" ? "climate-only" as const : "partial" as const,
    profile: profile ? { id: profile.id, version: profile.version, names: profile.names, status: profile.status, validation: profile.validation, sources: profile.sources } : null,
    recommendationsAllowed: false,
    demoAllowed: Boolean(demoAllowed),
    missing: ["Reglas agronómicas revisadas para la región, variedad y periodo", "Balance hídrico y características locales del suelo"],
    reason: profile ? "Perfil de demostración sin validación agronómica. No genera recomendaciones." : "Sin perfil regional aplicable a estas coordenadas. Solo clima y comprobaciones descriptivas de registros aportados.",
  };
}
