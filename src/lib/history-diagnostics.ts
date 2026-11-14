import { catalog } from "./catalog";
import { daysBetween, type Campaign } from "./model";

export function diagnoseHistory(campaigns: Campaign[]) {
  const sorted = [...campaigns].sort((a, b) => a.start.localeCompare(b.start));
  const unknownOrigins = sorted.filter(c => c.origin === "desconocido").length;
  const invalidDates = sorted.some((c, i) => c.start >= c.end || (i > 0 && c.start < sorted[i - 1].end));
  const interpretable = sorted.length > 0 && unknownOrigins === 0 && !invalidDates;
  const counts = new Map<string, number>();
  let sameCropTransitions = 0, sameFamilyTransitions = 0, maxRun = 0, run = 0;
  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i]; counts.set(c.crop, (counts.get(c.crop) ?? 0) + 1);
    const same = i > 0 && c.crop === sorted[i - 1].crop;
    run = same ? run + 1 : 1; maxRun = Math.max(maxRun, run);
    if (same) sameCropTransitions++;
    if (i > 0 && catalog[c.crop].family === catalog[sorted[i - 1].crop].family) sameFamilyTransitions++;
  }
  const dominant = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  return {
    recordCount: sorted.length, interpretable, unknownOrigins, invalidDates,
    species: interpretable ? counts.size : null,
    families: interpretable ? new Set(sorted.map(c => catalog[c.crop].family)).size : null,
    maxRun: interpretable ? maxRun : null,
    transitions: interpretable ? Math.max(0, sorted.length - 1) : null,
    sameCropTransitions: interpretable ? sameCropTransitions : null,
    sameFamilyTransitions: interpretable ? sameFamilyTransitions : null,
    dominant: interpretable ? { crop: dominant[0], count: dominant[1], shareOfRecords: dominant[1] / sorted.length } : null,
    daysBetweenCampaigns: interpretable && sorted.length > 1 ? sorted.slice(1).reduce((sum, c, i) => sum + daysBetween(sorted[i].end, c.start), 0) : null,
    interpretation: "Describe registros aportados, no superficie sembrada, cobertura real ni daño medido. Las campañas no documentadas pueden cambiar la interpretación.",
    riskContext: interpretable && sameFamilyTransitions > 0 ? "La continuidad de una familia motiva revisar plagas de hospedero y manejo nutricional con un agrónomo. No se ha observado una plaga ni agotamiento del suelo en esta parcela." : "No hay evidencia suficiente para diagnosticar daño. La diversidad registrada tampoco demuestra recuperación del suelo.",
    source: "https://www.fao.org/conservation-agriculture/in-practice/species-diversification/en/",
    formulas: { dominance: "registros de especie dominante / registros interpretables", transitions: "pares consecutivos con especie/familia repetida", gapDays: "suma(siembra siguiente − cosecha anterior), sin cultivos solapados" },
  };
}
