import type { CropId } from "./model";
export const FAO_CYCLES = "https://www.fao.org/4/s2022e/s2022e07.htm";
export const FAO56 = "https://www.fao.org/4/X0490E/X0490E00.htm";
export const catalog: Record<CropId, { name: string; species: string; family: string; taxonomySource: string; days: [number, number]; scenarioDays: number; source: string; applicability: string }> = {
  maize: { name: "Maíz grano", species: "Zea mays", family: "Poaceae", taxonomySource: "https://www.kew.org/plants/maize", days: [125, 180], scenarioDays: 150, source: FAO_CYCLES, applicability: "Rango general FAO, tabla 6; variedad y calendario de La Libertad pendientes" },
  bean: { name: "Frijol seco", species: "Phaseolus vulgaris", family: "Fabaceae", taxonomySource: "https://www.kew.org/plants/common-bean", days: [95, 110], scenarioDays: 100, source: FAO_CYCLES, applicability: "Rango general FAO, tabla 6; sin validación local" },
  sorghum: { name: "Sorgo", species: "Sorghum bicolor", family: "Poaceae", taxonomySource: "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A422090-1", days: [120, 130], scenarioDays: 125, source: FAO_CYCLES, applicability: "Candidato de exploración, sin selección regional confirmada" },
};
