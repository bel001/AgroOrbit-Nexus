import { describe, expect, it, vi } from "vitest";
import raw from "../docs/evidence/power-viru-2024.json";
import { addDays, climateQuerySchema, exampleFarm, farmSchema, isoDate, variables } from "@/lib/model";
import { fetchClimate, monthlyClimate, normalizePower } from "@/lib/power";
import { buildReport, compareStrategies, evaluateStrategy, maxRepeat } from "@/lib/rotations";
const query = { lat: -8.42, lon: -78.75, start: "2024-01-01", end: "2024-12-31" };
const copy = () => structuredClone(raw);
describe("GeoFarm y fechas", () => {
  it("valida el caso ilustrativo sin convertir nulos en cero", () => {
    const f = farmSchema.parse(exampleFarm); expect(f.waterMm).toBeNull(); expect(f.ph).toBeNull(); expect(f.areaHa).toBeNull();
  });
  it.each([-91, 91, NaN, Infinity])("rechaza latitud inválida %s", lat => { expect(farmSchema.safeParse({ ...exampleFarm, lat }).success).toBe(false); });
  it("rechaza longitudes fuera del globo y nombre vacío", () => { expect(farmSchema.safeParse({ ...exampleFarm, lon: 181 }).success).toBe(false); expect(farmSchema.safeParse({ ...exampleFarm, name: " " }).success).toBe(false); });
  it("conserva cero real y exige su procedencia", () => { expect(farmSchema.safeParse({ ...exampleFarm, waterMm: 0 }).success).toBe(false); expect(farmSchema.parse({ ...exampleFarm, waterMm: 0, waterOrigin: "declarado" }).waterMm).toBe(0); });
  it.each(["2024-02-30", "2023-02-29", "2024-13-01", ""]) ("rechaza fecha imposible %s", s => { expect(isoDate.safeParse(s).success).toBe(false); });
  it("mantiene día bisiesto y días UTC", () => { expect(addDays("2024-02-28", 1)).toBe("2024-02-29"); expect(addDays("2024-02-28", 2)).toBe("2024-03-01"); });
  it("bloquea consulta invertida, futura o demasiado larga", () => {
    expect(climateQuerySchema.safeParse({ ...query, start: "2025-01-01" }).success).toBe(false);
    expect(climateQuerySchema.safeParse({ ...query, end: "2099-01-01" }).success).toBe(false);
    expect(climateQuerySchema.safeParse({ ...query, start: "1980-01-01" }).success).toBe(false);
  });
});
describe("NASA POWER · fixture real; mutaciones controladas", () => {
  it("normaliza 366 días con unidades y versión reales", () => { const c = normalizePower(raw, query); expect(c.days).toHaveLength(366); expect(c.units.T2M).toBe("C"); expect(c.units.PRECTOTCORR).toBe("mm/day"); expect(c.version).toBe("v2.10.3"); });
  it("conserva cero, fill y null distintos", () => {
    const r = copy(); r.properties.parameter.PRECTOTCORR["20240101"] = 0; r.properties.parameter.T2M["20240101"] = -999;
    const c = normalizePower(r, query); expect(c.days[0].PRECTOTCORR).toBe(0); expect(c.days[0].T2M).toBeNull(); expect(c.missing.T2M).toBe(1);
  });
  it("genera fechas ausentes como null en todas las variables", () => { const r = copy(); for (const v of variables) Reflect.deleteProperty(r.properties.parameter[v], "20240229"); const c = normalizePower(r, query); expect(c.days.find(d => d.date === "2024-02-29")?.T2M).toBeNull(); expect(c.missing.PRECTOTCORR).toBe(1); });
  it("descarta precipitación negativa y rechaza unidades incompatibles", () => { const r = copy(); r.properties.parameter.PRECTOTCORR["20240101"] = -1; expect(normalizePower(r, query).days[0].PRECTOTCORR).toBeNull(); r.parameters.T2M.units = "F"; expect(() => normalizePower(r, query)).toThrow("unidad"); });
  it("rechaza mínimas superiores a máximas", () => { const r = copy(); r.properties.parameter.T2M_MIN["20240101"] = 99; expect(() => normalizePower(r, query)).toThrow("inconsistente"); });
  it("rechaza respuesta vacía o malformada", () => { expect(() => normalizePower({}, query)).toThrow(); const r = copy(); for (const v of variables) r.properties.parameter[v] = {} as typeof r.properties.parameter.T2M; expect(() => normalizePower(r, query)).toThrow("válidas"); });
  it("los meses con lluvia ausente no se convierten en cero", () => { const c = normalizePower(raw, query); c.days.forEach(d => d.PRECTOTCORR = null); const m = monthlyClimate(c); expect(m[0].rain).toBeNull(); expect(m[0].validRain).toBe(0); });
  it("gestiona HTTP 503 sin fabricar clima", async () => { const mock = vi.fn().mockResolvedValue(new Response("caída", { status: 503 })); await expect(fetchClimate({ ...query, lon: 14 }, mock)).rejects.toThrow("503"); });
  it("propaga timeouts y permite reintentar", async () => { const q = { ...query, lon: 15 }; const fail = vi.fn().mockRejectedValue(new DOMException("Timeout", "TimeoutError")); await expect(fetchClimate(q, fail)).rejects.toThrow("Timeout"); const good = vi.fn().mockResolvedValue(Response.json(raw)); await expect(fetchClimate(q, good)).resolves.toHaveProperty("version"); });
  it("deduplica solicitudes simultáneas e idénticas", async () => { const mock = vi.fn().mockResolvedValue(Response.json(raw)); const q = { ...query, lon: 16 }; const [a, b] = await Promise.all([fetchClimate(q, mock), fetchClimate(q, mock)]); expect(mock).toHaveBeenCalledTimes(1); expect(a).toEqual(b); await fetchClimate(q, mock); expect(mock).toHaveBeenCalledTimes(1); });
});
describe("Rotaciones · sin afirmaciones locales no validadas", () => {
  it("evalúa tres estrategias en el mismo horizonte", () => { const s = compareStrategies(exampleFarm, null); expect(s).toHaveLength(3); expect(new Set(s.map(x => JSON.stringify(x.horizon))).size).toBe(1); expect(s.map(x => x.status)).toEqual(Array(3).fill("Evaluación incompleta")); });
  it("cuenta repetición y diversidad sin llamar daño a la repetición", () => { const [a, b, c] = compareStrategies(exampleFarm, null); expect([a.maxRepeat, b.maxRepeat, c.maxRepeat]).toEqual([3, 1, 1]); expect([a.families, b.families, c.families]).toEqual([1, 2, 2]); expect(maxRepeat([])).toBe(0); });
  it("no cuenta dos Poaceae como familias distintas", () => { const s = evaluateStrategy(exampleFarm, "x", "prueba", [{ ...exampleFarm.current[0] }, { ...exampleFarm.current[1], crop: "sorghum" }], null); expect(s.families).toBe(1); });
  it("detecta solapamiento y fechas fuera del horizonte", () => { const f = structuredClone(exampleFarm); f.current[1].start = f.current[0].start; expect(compareStrategies(f, null)[0].status).toBe("Incompatible"); f.current[1].start = "2030-01-01"; expect(compareStrategies(f, null)[0].status).toBe("Incompatible"); });
  it("rechaza campañas de duración negativa", () => { const f = structuredClone(exampleFarm); f.current[0].end = "2023-01-01"; expect(compareStrategies(f, null)[0].status).toBe("Incompatible"); expect(compareStrategies(f, null)[0].idleDays).toBeNull(); });
  it("cero agua total es incompatible; desconocida sigue incompleta", () => { const f = { ...exampleFarm, waterMm: 0, waterOrigin: "declarado" as const }; expect(compareStrategies(f, null).every(s => s.status === "Incompatible")).toBe(true); expect(compareStrategies(exampleFarm, null).every(s => s.waterDemandMm === null)).toBe(true); });
  it("no inventa insuficiencia para un presupuesto positivo sin balance", () => { const s = compareStrategies({ ...exampleFarm, waterMm: 5, waterOrigin: "estimado" }, null); expect(s[0].checks.find(c => c.rule === "Agua utilizable")?.status).toBe("desconocido"); });
  it("las exclusiones se evalúan antes de ventajas de diversidad", () => { const s = compareStrategies({ ...exampleFarm, excluded: ["bean"] }, null); expect(s[1].status).toBe("Incompatible"); expect(s[0].status).toBe("Evaluación incompleta"); });
  it("falta de calendario local nunca equivale a cumplimiento", () => { const s = compareStrategies(exampleFarm, normalizePower(raw, query)); expect(s[0].checks.find(c => c.rule === "Calendario y variedad local")?.status).toBe("desconocido"); });
  it("cambiar prioridad no modifica clima ni indicadores", () => { const a = compareStrategies(exampleFarm, null); const b = compareStrategies({ ...exampleFarm, priority: "agua" }, null); expect(a).toEqual(b); });
  it("exporta procedencia, metadatos, fórmulas pendientes y nulidad", () => { const r = buildReport(exampleFarm, normalizePower(raw, query)); const json = JSON.parse(JSON.stringify(r)); expect(json.input.illustrative).toBe(true); expect(json.input.waterMm).toBeNull(); expect(json.climate.url).toContain("community=AG"); expect(json.strategies[1].campaigns[1].origin).toBe("estimado"); });
  it("historial con procedencia desconocida no genera una racha aparente", () => { const f = structuredClone(exampleFarm); f.history[1].origin = "desconocido"; expect(buildReport(f, null).history.maxRepeat).toBeNull(); });
  it("historial solapado no genera una racha aparente", () => { const f = structuredClone(exampleFarm); f.history[1].start = f.history[0].start; expect(buildReport(f, null).history.maxRepeat).toBeNull(); });
});
