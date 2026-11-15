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
    { id: "legume", label: { es: "Leguminosa (fija nitrógeno)", en: "Legume (fixes nitrogen)" },
      value: i.hasLegume ? { es: `Sí · ${legumes.map(c => c.names.es).join(", ")}`, en: `Yes · ${legumes.map(c => c.names.en).join(", ")}` } : { es: "No", en: "No" },
      good: i.hasLegume,
      why: { es: "Las leguminosas en rotación aumentan la fijación biológica de nitrógeno.", en: "Legumes in a rotation increase biological nitrogen fixation." },
      source: diversification },
    { id: "families", label: { es: "Familias de cultivos", en: "Crop families" },
      value: { es: String(i.families), en: String(i.families) }, good: i.families > 1,
      why: { es: "Cultivos de familias distintas exploran otras capas del suelo y diversifican su vida biológica.", en: "Crops from different families explore other soil layers and diversify soil life." },
      source: diversification },
    { id: "repeat", label: { es: "Mismo cultivo seguido", en: "Same crop in a row" },
      value: repeated && repeatedName ? { es: `${repeated.run}× ${repeatedName.names.es}`, en: `${repeated.run}× ${repeatedName.names.en}` } : { es: "Nunca", en: "Never" },
      good: !repeated,
      why: { es: "Rotar evita que plagas y enfermedades propias de un cultivo pasen al siguiente.", en: "Rotating prevents crop-specific pests and diseases carrying over to the next crop." },
      source: diversification },
    { id: "uncropped", label: { es: "Días con suelo sin cultivo", en: "Days with uncropped soil" },
      value: i.uncroppedDays === null ? { es: "No calculable", en: "Not computable" } : { es: `${i.uncroppedDays} días`, en: `${i.uncroppedDays} days` },
      good: null,
      why: { es: "Sin cultivo ni cobertura, el suelo queda expuesto: la cobertura lo protege en los periodos sin siembra.", en: "Without a crop or cover the soil is exposed; cover protects it during fallow periods." },
      source: { label: "FAO · Soil organic cover", url: FAO_SOIL_COVER } },
  ];
}
