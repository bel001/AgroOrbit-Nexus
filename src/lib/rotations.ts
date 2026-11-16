import { catalog, FAO_CYCLES, FAO56 } from "./catalog";
import { addDays, daysBetween, farmSchema, type Campaign, type Climate, type Farm, type CropId } from "./model";
import { regionProfiles, resolveCoverage } from "./regions";
import { worldCover } from "./sources";
import { diagnoseHistory } from "./history-diagnostics";
import { regionalEvidenceFor } from "./regional-evidence";
import { waterBalance, type WaterBalance } from "./water";
import { stressTest } from "./elnino";
import type { ClimateDay } from "./model";
import { matchesHistoricalContext } from "./historical-context";
import { agronomicReview } from "./agronomic-review";
import { approximateAreaHa } from "./parcel";
export type Check = { rule: string; status: "cumple" | "incumple" | "desconocido"; detail: string; source: string };
export type Strategy = { id: string; name: string; campaigns: Campaign[]; horizon: { start: string; end: string }; checks: Check[]; status: "Viable bajo supuestos" | "Incompatible" | "Evaluación incompleta"; families: number; maxRepeat: number; idleDays: number | null; cropDays: number | null; waterDemandMm: number | null; water: WaterBalance | null; userProposed?: boolean };
export function maxRepeat(campaigns: Campaign[]) {
  let max = 0, run = 0, prev: CropId | undefined;
  for (const c of [...campaigns].sort((a, b) => a.start.localeCompare(b.start))) { run = c.crop === prev ? run + 1 : 1; max = Math.max(max, run); prev = c.crop; }
  return max;
}
export function evaluateStrategy(f: Farm, id: string, name: string, campaigns: Campaign[], climate: Climate | null): Strategy {
  const end = addDays(f.start, f.horizonDays);
  const checks: Check[] = [];
  const add = (rule: string, status: Check["status"], detail: string, source: string) => checks.push({ rule, status, detail, source });
  const sorted = [...campaigns].sort((a, b) => a.start.localeCompare(b.start));
  const validDates = sorted.every((c, i) => c.start < c.end && c.start >= f.start && c.end <= end && (i === 0 || c.start >= sorted[i - 1].end));
  add("Integridad temporal", validDates ? "cumple" : "incumple", `Intervalos [siembra, cosecha) sin solapamiento dentro de ${f.start} a ${end} (${f.horizonDays} días).`, "docs/METHODOLOGY.md §5 · convención de software");
  const forbidden = sorted.filter(c => f.excluded.includes(c.crop));
  add("Exclusiones del productor", forbidden.length ? "incumple" : "cumple", forbidden.length ? forbidden.map(c => catalog[c.crop].name).join(", ") : "Sin cultivos prohibidos en la secuencia.", "Perfil declarado del terreno");
  add("Duración orientativa", "desconocido", sorted.map(c => { const crop = catalog[c.crop]; const d = daysBetween(c.start, c.end); return `${crop.name}: ${d} días; referencia general ${crop.days.join("–")} días${d < crop.days[0] || d > crop.days[1] ? ", fuera del rango de referencia: revisar variedad" : ""}`; }).join(". "), FAO_CYCLES);
  const evidence = regionalEvidenceFor(resolveCoverage(f).profile?.id);
  add("Calendario y variedad local", "desconocido", evidence ? "Hay fichas bibliográficas INIA para variedades candidatas, sin validación de la parcela ni de la secuencia. La demo supone frijol de 135 días a cosecha, no 98 de madurez fisiológica. La orientación marzo–julio requiere revisión local; no es una regla aprobada. Los 150 días de maíz no representan todas las estaciones o variedades." : "No hay ventanas de siembra ni variedades validadas para esta ubicación y periodo. No se extrapolan reglas de otro país o hemisferio.", evidence ? evidence.entries[1].url : FAO_CYCLES);
  add("Compatibilidad de suelo", "desconocido", `Textura: ${f.soil}; pH: ${f.ph ?? "desconocido"} (${f.soilOrigin}). Falta ficha regional por variedad y drenaje.`, "Perfil + docs/METHODOLOGY.md §5");
  const sameClimate = climate && climate.query.lat === f.lat && climate.query.lon === f.lon && climate.query.start <= f.start && climate.query.end >= addDays(end, -1);
  const water = sameClimate && validDates ? waterBalance(sorted, climate, f.waterScenario) : null;
  const demand = water?.etcMm ?? null;
  add("Agua utilizable", f.waterMm === 0 ? "incumple" : "desconocido", f.waterMm === 0 ? "Se declararon 0 mm de agua total utilizable durante todo el horizonte, incluida lluvia. No existe suministro para establecer los cultivos." : `Agua total: ${f.waterMm === null ? "desconocida" : `${f.waterMm} mm (${f.waterOrigin})`}. ${demand === null ? "Demanda no cuantificable: faltan datos diarios completos o coeficientes de cultivo aplicables." : `ETc estimada ${Math.round(demand)} mm (${climate?.query.extended ? "Penman-Monteith" : "Hargreaves"} × Kc FAO-56 genérico)${f.waterMm === null || demand <= 0 ? "" : `; el agua declarada equivale al ${Math.round((f.waterMm / demand) * 100)} % de esa demanda`}. Es una estimación en condiciones estándar, no una necesidad de riego validada.`}`, FAO56);
  add("Contexto térmico histórico", "desconocido", sameClimate ? `Serie NASA contextual disponible (${climate.version}); faltan umbrales térmicos regionales por variedad. No certifica aptitud.` : "No hay serie NASA de la misma ubicación que cubra el horizonte completo.", "https://power.larc.nasa.gov/docs/services/api/temporal/daily/");
  const cropDays = validDates ? sorted.reduce((sum, c) => sum + daysBetween(c.start, c.end), 0) : null;
  return { id, name, campaigns, horizon: { start: f.start, end }, checks,
    status: checks.some(c => c.status === "incumple") ? "Incompatible" : checks.some(c => c.status === "desconocido") ? "Evaluación incompleta" : "Viable bajo supuestos",
    families: new Set(sorted.map(c => catalog[c.crop].family)).size, maxRepeat: maxRepeat(sorted), cropDays, idleDays: cropDays === null ? null : f.horizonDays - cropDays, waterDemandMm: demand, water };
}
export function compareStrategies(input: Farm, climate: Climate | null) {
  const f = farmSchema.parse(input);
  if (f.analysisMode === "climate") return [];
  const result = [evaluateStrategy(f, "A", "Secuencia aportada por el usuario", f.current, climate)];
  const coverage = resolveCoverage(f);
  const scenario = coverage.demoAllowed ? regionProfiles.find(r => r.id === coverage.profile?.id)?.scenario : null;
  for (const sequence of scenario?.sequences ?? []) {
    const campaigns: Campaign[] = sequence.crops.map((crop, i) => ({ crop, start: addDays(f.start, scenario!.offsets[i]), end: addDays(f.start, scenario!.offsets[i] + scenario!.durations[crop]), origin: "estimado" }));
    result.push(evaluateStrategy(f, sequence.id, sequence.name, campaigns, climate));
  }
  // Alternativas del usuario: letras consecutivas tras A y las de la demo.
  for (const alt of f.alternatives) {
    result.push({ ...evaluateStrategy(f, String.fromCharCode(65 + result.length), alt.name, alt.campaigns, climate), userProposed: true });
  }
  return result;
}
/** One line, from the data: water demand comes from the queried period only, which may not be a normal year. */
export function climatePeriodLimitation(climate: Climate | null, compared: boolean) {
  if (!climate || !compared) return null;
  const { start, end } = climate.query;
  return {
    es: `La demanda de agua FAO-56 usa solo el clima NASA POWER de ${start} a ${end}; un solo año puede diferir del clima normal.`,
    en: `FAO-56 water demand uses only the NASA POWER climate from ${start} to ${end}; a single year can differ from normal climate.`,
  };
}
/** `history`: stored daily NASA series for the El Niño stress test (only provided for the Virú demo point). */
export function buildReport(farm: Farm, climate: Climate | null, history: ClimateDay[] | null = null, historyProvenance: { query: { lat: number; lon: number; start: string; end: string }; url: string; retrievedAt: string; apiVersion: string; sources: string[] }[] = []) {
  const strategies = compareStrategies(farm, climate);
  const coverage = resolveCoverage(farm);
  const invalidHistory = farm.history.some((c, i, a) => c.start >= c.end || a.some((d, j) => i !== j && c.start < d.end && d.start < c.end));
  const knownHistory = farm.history.filter(c => c.origin !== "desconocido");
  const periodLine = climatePeriodLimitation(climate, strategies.length > 0);
  return { schemaVersion: "3.0", methodologyVersion: "evidence-integrity-2026-11-15", createdAt: new Date().toISOString(), input: farm, coverage: resolveCoverage(farm), historyDiagnostics: diagnoseHistory(farm.history), regionalEvidence: regionalEvidenceFor(resolveCoverage(farm).profile?.id), contextualSources: [{ ...worldCover, usedInAgronomicEvaluation: false, access: "Capa visual opcional; su activación en el mapa no implica uso en cálculos" }], history: { count: farm.history.length, knownCount: knownHistory.length, maxRepeat: invalidHistory || knownHistory.length !== farm.history.length ? null : maxRepeat(knownHistory), overlappingOrInvalid: invalidHistory }, climate, strategies, catalog,
    agronomicReview: agronomicReview(farm),
    historicalContext: history && coverage.demoAllowed && matchesHistoricalContext(farm) ? { location: { lat: farm.lat, lon: farm.lon }, method: "Hargreaves + Kc genéricos; independiente del método de la consulta principal", provenance: historyProvenance } : null,
    parcelSummary: farm.parcel ? { approximateAreaHa: approximateAreaHa(farm.parcel.vertices), crs: "EPSG:4326", method: "Integral esférica de bordes; radio medio 6371008,8 m. Área aproximada, sin relieve ni certificación catastral.", origin: farm.parcel.origin, usedForClimateAggregation: false } : null,
    stressTest: history && coverage.demoAllowed && matchesHistoricalContext(farm) ? stressTest(strategies, history, farm.lat) : null,
    limitationsEn: ["No local agronomic validation or field trials; no region has a validated agronomic analysis yet.", "General FAO ranges; not regional calendars or crop recommendations.", "Days without a recorded crop do not imply bare soil.", "ETc is an FAO-56 estimate (selected ETo method and generic Kc), not a measurement or a validated irrigation requirement. No savings, yield, fixed nitrogen or profitability are computed.", "Farm history is not inferred from satellites. Parcel-scale HLS is not implemented; optional MODIS NDVI is surrounding context only.", ...(periodLine ? [periodLine.en] : [])],
    priority: { selected: farm.priority, effect: "Los pesos de exploración ordenan indicadores relativos; no alteran observaciones ni certifican aptitud. priorityRanking conserva los pesos y el orden al exportar." },
    limitations: ["Sin validación agronómica local ni ensayos de campo; ninguna región tiene análisis agronómico validado actualmente.", "Rangos FAO generales; no son calendarios regionales ni recomendaciones de cultivos.", "Días sin cultivo registrado no implican suelo desnudo.", "La ETc es una estimación FAO-56 (método ETo elegido y Kc genéricos), no una medición ni una necesidad de riego validada. No se calcula ahorro, rendimiento, nitrógeno fijado ni rentabilidad.", "La historia agrícola no se infiere por satélite. HLS por parcela no implementado; NDVI MODIS opcional es contexto del entorno.", ...(periodLine ? [periodLine.es] : [])] };
}
export type EvidenceReport = ReturnType<typeof buildReport>;
