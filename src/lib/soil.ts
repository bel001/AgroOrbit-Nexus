import { catalog } from "./catalog";
import { soilIndicators } from "./priorities";
import type { Strategy } from "./rotations";

/**
 * Soil-health card: four indicators read directly from each sequence. They describe the plan,
 * not measured soil; each carries why it matters and an official source.
 */
export const FAO_DIVERSIFICATION = "https://www.fao.org/conservation-agriculture/in-practice/species-diversification/en/";
export const FAO_SOIL_COVER = "https://www.fao.org/conservation-agriculture/in-practice/soil-organic-cover/en/";

export type Bilingual = { es: string; en: string };
export type SoilIndicator = {
  id: "legume" | "families" | "repeat" | "uncropped";
  label: Bilingual; value: Bilingual; good: boolean | null; why: Bilingual; source: { label: string; url: string };
};

const dominantRepeatedCrop = (s: Strategy) => {
  const sorted = [...s.campaigns].sort((a, b) => a.start.localeCompare(b.start));
  let best: { crop: string; run: number } | null = null, run = 0;
  for (let i = 0; i < sorted.length; i++) {
    run = i > 0 && sorted[i].crop === sorted[i - 1].crop ? run + 1 : 1;
    if (run > 1 && (!best || run > best.run)) best = { crop: sorted[i].crop, run };
  }
  return best;
};

export function soilCard(s: Strategy): SoilIndicator[] {
  const i = soilIndicators(s);
  const repeated = dominantRepeatedCrop(s);
  const repeatedName = repeated ? catalog[repeated.crop as keyof typeof catalog] : null;
  const legumes = [...new Set(s.campaigns.filter(c => catalog[c.crop].family === "Fabaceae").map(c => catalog[c.crop]))];
  const diversification = { label: "FAO · Species diversification", url: FAO_DIVERSIFICATION };
  return [
    { id: "legume", label: { es: "Presencia de leguminosa", en: "Legume present" },
      value: i.hasLegume ? { es: `Sí · ${legumes.map(c => c.names.es).join(", ")}`, en: `Yes · ${legumes.map(c => c.names.en).join(", ")}` } : { es: "No", en: "No" },
      good: i.hasLegume,
      why: { es: "Su potencial de fijación depende de especie, simbiosis y manejo. Este plan no mide nitrógeno fijado ni fertilidad.", en: "Fixation potential depends on species, symbiosis and management. This plan does not measure fixed nitrogen or fertility." },
      source: diversification },
    { id: "families", label: { es: "Familias de cultivos", en: "Crop families" },
      value: { es: String(i.families), en: String(i.families) }, good: i.families > 1,
      why: { es: "Describe diversidad taxonómica del plan; funciones radiculares y biología del suelo requieren observación local.", en: "Describes the plan's taxonomic diversity; root functions and soil biology require local observations." },
      source: diversification },
    { id: "repeat", label: { es: "Mismo cultivo seguido", en: "Same crop in a row" },
      value: repeated && repeatedName ? { es: `${repeated.run}× ${repeatedName.names.es}`, en: `${repeated.run}× ${repeatedName.names.en}` } : { es: "Nunca", en: "Never" },
      good: !repeated,
      why: { es: "La repetición orienta qué revisar con un agrónomo. Cambiar de cultivo no demuestra cortar una plaga sin identificar hospedantes y manejo.", en: "Repetition guides agronomic review. Changing crops does not prove a pest-cycle break without host and management evidence." },
      source: diversification },
    { id: "uncropped", label: { es: "Días sin cultivo registrado", en: "Days without a recorded crop" },
      value: i.uncroppedDays === null ? { es: "No calculable", en: "Not computable" } : { es: `${i.uncroppedDays} días`, en: `${i.uncroppedDays} days` },
      good: null,
      why: { es: "No equivale a suelo desnudo: se desconoce la cobertura de residuos o cultivos no registrados. Verificarla en campo.", en: "Does not mean bare soil: residues or unrecorded cover crops are unknown. Check coverage in the field." },
      source: { label: "FAO · Soil organic cover", url: FAO_SOIL_COVER } },
  ];
}
