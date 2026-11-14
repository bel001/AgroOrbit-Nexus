import { z } from "zod";
export const FAO_CYCLES = "https://www.fao.org/4/s2022e/s2022e07.htm";
export const FAO56 = "https://www.fao.org/4/X0490E/X0490E00.htm";
// McMaster & Wilhelm (1997), Agric. For. Meteorol. 87:291-300 — método promedio de grados-día.
export const GDD_METHOD = "https://doi.org/10.1016/S0168-1923(97)00027-0";
const waterUseSchema = z.object({
  kc: z.object({ ini: z.number().positive(), mid: z.number().positive(), end: z.number().positive() }),
  stages: z.tuple([z.number().positive(), z.number().positive(), z.number().positive(), z.number().positive()]),
  source: z.string().min(1),
}).nullable();
export const cropDefinitionSchema = z.object({ name: z.string().min(1), names: z.record(z.string(), z.string().min(1)), species: z.string().min(1), family: z.string().min(1), taxonomySource: z.url(), days: z.tuple([z.number().int().positive(), z.number().int().positive()]), source: z.url(), applicability: z.string().min(1), waterUse: waterUseSchema.default(null), gddBaseC: z.number().nullable().default(null), gddSource: z.string().nullable().default(null) }).refine(c => c.days[0] <= c.days[1], "Rango de ciclo invertido");
export function createCropCatalog(definitions: unknown) {
  return z.record(z.string().regex(/^[a-z0-9-]+$/), cropDefinitionSchema).parse(definitions);
}
// General facts are separate from regional varieties, calendars and scenario durations.
export const catalog = createCropCatalog({
  maize: { name: "Maíz grano", names: { es: "Maíz grano", en: "Grain maize" }, species: "Zea mays", family: "Poaceae", taxonomySource: "https://www.kew.org/plants/maize", days: [125, 180], source: FAO_CYCLES, applicability: "Referencia general; no demuestra aptitud de una región o variedad", waterUse: { kc: { ini: 0.3, mid: 1.2, end: 0.35 }, stages: [30, 50, 60, 40], source: "FAO-56 tabla 12 (maíz grano, cosecha en seco) y tabla 11 (etapas 30/50/60/40)" }, gddBaseC: 10, gddSource: GDD_METHOD },
  bean: { name: "Frijol seco", names: { es: "Frijol seco", en: "Dry bean" }, species: "Phaseolus vulgaris", family: "Fabaceae", taxonomySource: "https://www.kew.org/plants/common-bean", days: [95, 110], source: FAO_CYCLES, applicability: "Referencia general; necesita evaluación regional independiente", waterUse: { kc: { ini: 0.4, mid: 1.15, end: 0.35 }, stages: [20, 30, 40, 20], source: "FAO-56 tabla 12 (frijol seco) y tabla 11 (etapas 20/30/40/20)" }, gddBaseC: null, gddSource: null },
  sorghum: { name: "Sorgo", names: { es: "Sorgo", en: "Sorghum" }, species: "Sorghum bicolor", family: "Poaceae", taxonomySource: "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A422090-1", days: [120, 130], source: FAO_CYCLES, applicability: "Especie de catálogo, sin recomendación geográfica implícita", waterUse: { kc: { ini: 0.3, mid: 1.05, end: 0.55 }, stages: [20, 35, 40, 30], source: "FAO-56 tabla 12 (sorgo grano; Kc medio 1,00–1,10, se usa 1,05) y tabla 11 (etapas 20/35/40/30)" }, gddBaseC: 10, gddSource: GDD_METHOD },
});
export const catalogCropIds = Object.keys(catalog) as [string, ...string[]];
