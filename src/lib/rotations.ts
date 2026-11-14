import { catalog, FAO_CYCLES, FAO56 } from "./catalog";
import { addDays, daysBetween, farmSchema, type Campaign, type Climate, type Farm, type CropId } from "./model";
export type Check = { rule: string; status: "cumple" | "incumple" | "desconocido"; detail: string; source: string };
export type Strategy = { id: string; name: string; campaigns: Campaign[]; horizon: { start: string; end: string }; checks: Check[]; status: "Viable bajo supuestos" | "Incompatible" | "Evaluación incompleta"; families: number; maxRepeat: number; idleDays: number | null; cropDays: number | null; waterDemandMm: null };
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
  add("Integridad temporal", validDates ? "cumple" : "incumple", `Intervalos [siembra, cosecha) sin solapamiento dentro de ${f.start} a ${end} (540 días).`, "docs/METHODOLOGY.md §5 · convención de software");
  const forbidden = sorted.filter(c => f.excluded.includes(c.crop));
  add("Exclusiones del productor", forbidden.length ? "incumple" : "cumple", forbidden.length ? forbidden.map(c => catalog[c.crop].name).join(", ") : "Sin cultivos prohibidos en la secuencia.", "Perfil declarado del terreno");
  add("Duración orientativa", "desconocido", sorted.map(c => { const crop = catalog[c.crop]; const d = daysBetween(c.start, c.end); return `${crop.name}: ${d} días; referencia general ${crop.days.join("–")} días${d < crop.days[0] || d > crop.days[1] ? ", fuera del rango de referencia: revisar variedad" : ""}`; }).join(". "), FAO_CYCLES);
  add("Calendario y variedad local", "desconocido", "No hay ventanas de siembra ni variedades validadas para la parcela piloto. Las fechas propuestas son supuestos editables.", FAO_CYCLES);
  add("Compatibilidad de suelo", "desconocido", `Textura: ${f.soil}; pH: ${f.ph ?? "desconocido"} (${f.soilOrigin}). Falta ficha regional por variedad y drenaje.`, "Perfil + docs/METHODOLOGY.md §5");
  add("Agua utilizable", f.waterMm === 0 ? "incumple" : "desconocido", f.waterMm === 0 ? "Se declararon 0 mm de agua total utilizable durante todo el horizonte, incluida lluvia. No existe suministro para establecer los cultivos." : `Agua total: ${f.waterMm === null ? "desconocida" : `${f.waterMm} mm (${f.waterOrigin})`}. Demanda e insuficiencia no cuantificables sin ETo, Kc por etapa y balance local.`, FAO56);
  const sameClimate = climate && climate.query.lat === f.lat && climate.query.lon === f.lon && climate.query.start <= f.start && climate.query.end >= addDays(end, -1);
  add("Contexto térmico histórico", "desconocido", sameClimate ? `Serie NASA contextual disponible (${climate.version}); faltan umbrales térmicos regionales por variedad. No certifica aptitud.` : "No hay serie NASA de la misma ubicación que cubra el horizonte completo.", "https://power.larc.nasa.gov/docs/services/api/temporal/daily/");
  const cropDays = validDates ? sorted.reduce((sum, c) => sum + daysBetween(c.start, c.end), 0) : null;
  return { id, name, campaigns, horizon: { start: f.start, end }, checks,
    status: checks.some(c => c.status === "incumple") ? "Incompatible" : checks.some(c => c.status === "desconocido") ? "Evaluación incompleta" : "Viable bajo supuestos",
    families: new Set(sorted.map(c => catalog[c.crop].family)).size, maxRepeat: maxRepeat(sorted), cropDays, idleDays: cropDays === null ? null : f.horizonDays - cropDays, waterDemandMm: null };
}
export function compareStrategies(input: Farm, climate: Climate | null) {
  const f = farmSchema.parse(input);
  const generate = (crops: CropId[]): Campaign[] => crops.map((crop, i) => ({ crop, start: addDays(f.start, i * 180), end: addDays(f.start, i * 180 + catalog[crop].scenarioDays), origin: "estimado" }));
  return [evaluateStrategy(f, "A", "Secuencia de referencia", f.current, climate), evaluateStrategy(f, "B", "Alternancia con leguminosa", generate(["maize", "bean", "maize"]), climate), evaluateStrategy(f, "C", "Tres especies candidatas", generate(["maize", "sorghum", "bean"]), climate)];
}
export function buildReport(farm: Farm, climate: Climate | null) {
  const invalidHistory = farm.history.some((c, i, a) => c.start >= c.end || a.some((d, j) => i !== j && c.start < d.end && d.start < c.end));
  const knownHistory = farm.history.filter(c => c.origin !== "desconocido");
  return { schemaVersion: "1.0", methodologyVersion: "p0-2026-11-14", createdAt: new Date().toISOString(), input: farm, history: { count: farm.history.length, knownCount: knownHistory.length, maxRepeat: invalidHistory || knownHistory.length !== farm.history.length ? null : maxRepeat(knownHistory), overlappingOrInvalid: invalidHistory }, climate, strategies: compareStrategies(farm, climate), catalog,
    priority: { selected: farm.priority, effect: "No altera observaciones ni emite un ranking; orienta qué dimensión revisar." },
    limitations: ["Sin validación agronómica local ni ensayos de campo.", "Rangos FAO generales; no son calendarios de La Libertad.", "Días sin cultivo registrado no implican suelo desnudo.", "No se calcula ETc, ahorro, rendimiento, nitrógeno fijado ni rentabilidad.", "La historia agrícola no se infiere por satélite. HLS/NDVI no implementado."] };
}
export type EvidenceReport = ReturnType<typeof buildReport>;
