import { catalog } from "./catalog";
import { soilIndicators } from "./priorities";
import type { Strategy } from "./rotations";
import type { Bilingual } from "./soil";

/** 1 mm of water over one hectare = 10 m³. */
export const M3_PER_HA_PER_MM = 10;
export const toM3PerHa = (mm: number) => mm * M3_PER_HA_PER_MM;
const roundTo = (n: number, step: number) => Math.round(n / step) * step;
const n = (x: number, lang: "es" | "en") => x.toLocaleString(lang === "es" ? "es-PE" : "en-US");

function repeatedCrop(s: Strategy) {
  const sorted = [...s.campaigns].sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < sorted.length; i++) if (sorted[i].crop === sorted[i - 1].crop) return sorted[i].crop;
  return null;
}

/**
 * One data-generated comparison sentence: the option with the lowest FAO-56 water demand against the
 * farmer's own sequence (A). Returns null when there is nothing to compare or no complete water data.
 */
export function bottomLine(strategies: Strategy[]): Bilingual | null {
  const options = strategies.filter(s => s.status !== "Incompatible" && s.water?.etcMm != null);
  const base = options.find(s => s.id === "A");
  if (!base || options.length < 2) return null;
  const best = [...options].sort((a, b) => a.water!.etcMm! - b.water!.etcMm!)[0];
  const sentence = (lang: "es" | "en") => {
    if (best.id === base.id) return lang === "en"
      ? `A already has the lowest estimated water demand of the options compared (~${n(roundTo(toM3PerHa(base.water!.etcMm!), 10), lang)} m³/ha).`
      : `A ya tiene la menor demanda de agua estimada entre las opciones comparadas (~${n(roundTo(toM3PerHa(base.water!.etcMm!), 10), lang)} m³/ha).`;
    const diffMm = base.water!.etcMm! - best.water!.etcMm!;
    const m3 = n(roundTo(toM3PerHa(diffMm), 10), lang);
    const fam = soilIndicators(best).families;
    const crop = repeatedCrop(base);
    const breaks = crop && !best.campaigns.some((c, i, arr) => i > 0 && c.crop === crop && arr[i - 1].crop === crop);
    const cropName = crop ? catalog[crop].names[lang === "en" ? "en" : "es"].toLowerCase() : "";
    return lang === "en"
      ? `${best.id} needs ~${m3} m³/ha less water than A (${n(Math.round(diffMm), lang)} mm), uses ${fam} crop ${fam === 1 ? "family" : "families"}${breaks ? ` and breaks the ${cropName.replace(/^grain /, "")} cycle` : ""}.`
      : `${best.id} necesita ~${m3} m³/ha menos agua que A (${n(Math.round(diffMm), lang)} mm), usa ${fam} ${fam === 1 ? "familia" : "familias"} de cultivos${breaks ? ` y corta el ciclo del ${cropName.replace(/ grano$/, "")}` : ""}.`;
  };
  return { es: sentence("es"), en: sentence("en") };
}
