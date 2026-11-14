import { z } from "zod";
export const FAO_CYCLES = "https://www.fao.org/4/s2022e/s2022e07.htm";
export const FAO56 = "https://www.fao.org/4/X0490E/X0490E00.htm";
export const cropDefinitionSchema = z.object({ name: z.string().min(1), names: z.record(z.string(), z.string().min(1)), species: z.string().min(1), family: z.string().min(1), taxonomySource: z.url(), days: z.tuple([z.number().int().positive(), z.number().int().positive()]), source: z.url(), applicability: z.string().min(1) }).refine(c => c.days[0] <= c.days[1], "Rango de ciclo invertido");
export function createCropCatalog(definitions: unknown) {
  return z.record(z.string().regex(/^[a-z0-9-]+$/), cropDefinitionSchema).parse(definitions);
}
// General facts are separate from regional varieties, calendars and scenario durations.
export const catalog = createCropCatalog({
  maize: { name: "Maíz grano", names: { es: "Maíz grano", en: "Grain maize" }, species: "Zea mays", family: "Poaceae", taxonomySource: "https://www.kew.org/plants/maize", days: [125, 180], source: FAO_CYCLES, applicability: "Referencia general; no demuestra aptitud de una región o variedad" },
  bean: { name: "Frijol seco", names: { es: "Frijol seco", en: "Dry bean" }, species: "Phaseolus vulgaris", family: "Fabaceae", taxonomySource: "https://www.kew.org/plants/common-bean", days: [95, 110], source: FAO_CYCLES, applicability: "Referencia general; necesita evaluación regional independiente" },
  sorghum: { name: "Sorgo", names: { es: "Sorgo", en: "Sorghum" }, species: "Sorghum bicolor", family: "Poaceae", taxonomySource: "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A422090-1", days: [120, 130], source: FAO_CYCLES, applicability: "Especie de catálogo, sin recomendación geográfica implícita" },
});
export const catalogCropIds = Object.keys(catalog) as [string, ...string[]];
