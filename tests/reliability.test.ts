import { describe, expect, it } from "vitest";
import { exampleFarm } from "@/lib/examples/viru";
import { buildReport, compareStrategies } from "@/lib/rotations";
import { normalizePower, rainfallSummary } from "@/lib/power";
import { newGlobalFarm, farmSchema } from "@/lib/model";
import { decodeDraft, encodeDraft, importInputs } from "@/lib/session";
import { DEFAULT_WEIGHTS } from "@/lib/priorities";
import { approximateAreaHa, parcelCenter, parcelSchema, parseParcelText } from "@/lib/parcel";
import { dailyPenmanMonteith, penmanMonteithEquation } from "@/lib/penman-monteith";
import { waterBalance } from "@/lib/water";
import { agronomicReview } from "@/lib/agronomic-review";
import { catalog } from "@/lib/catalog";
import demo from "../src/data/power-viru-demo.json";
import pmViru from "../docs/evidence/revision-2026-11-15/power-pm-viru.json";
import pmCusco from "../docs/evidence/revision-2026-11-15/power-pm-cusco.json";
const climate = normalizePower(demo.raw, demo.query, demo.retrievedAt);

describe("Regresiones del diagnóstico", () => {
  it("sin estrategias compatibles no crea una tabla histórica vacía", () => {
    const report = buildReport({ ...exampleFarm, excluded: ["maize"] }, climate, climate.days);
    expect(report.strategies.every(s => s.status === "Incompatible")).toBe(true);
    expect(report.stressTest).toBeNull();
  });
  it.each([{ lat: -8.21, lon: -78.51 }, { lat: -8.43, lon: -78.75 }, { lat: -13.52, lon: -71.97 }])("no usa el histórico guardado en otro punto $lat", point => {
    expect(buildReport({ ...exampleFarm, ...point }, null, climate.days).stressTest).toBeNull();
  });
  it("no cambia la estación del histórico al editar el inicio de la demo", () => {
    expect(buildReport({ ...exampleFarm, start: "2024-05-01" }, null, climate.days).stressTest).toBeNull();
  });
  it("distingue lluvia desconocida, cero real y suma parcial", () => {
    const day = { ...climate.days[0], PRECTOTCORR: null };
    expect(rainfallSummary([day]).totalMm).toBeNull();
    expect(rainfallSummary([{ ...day, PRECTOTCORR: 0 }])).toMatchObject({ totalMm: 0, partial: false });
    expect(rainfallSummary([day, { ...day, PRECTOTCORR: 2 }])).toMatchObject({ totalMm: 2, partial: true, validDays: 1, requestedDays: 2 });
  });
});

describe("Perfiles, borradores e importación", () => {
  it("conserva una ubicación vacía como desconocida al guardar/recuperar", () => {
    const restored = decodeDraft(encodeDraft(newGlobalFarm(), DEFAULT_WEIGHTS, { tariff: "", currency: "USD" }));
    expect(Number.isNaN(restored.farm.lat)).toBe(true); expect(restored.farm.history).toEqual([]); expect(restored.cost.currency).toBe("USD");
  });
  it("recupera campañas, pesos y tarifa; ignora resultados y aprobaciones importadas", () => {
    const raw = { schemaVersion: "3.0", input: exampleFarm, priorityRanking: { weights: { water: 100, soil: 0, diversity: 0 } }, costScenario: { tariff: "0.2", currency: "PEN" }, recommendationsAllowed: true, strategies: [{ status: "Viable" }] };
    const parsed = importInputs(JSON.stringify(raw));
    expect(parsed.farm.current).toEqual(exampleFarm.current); expect(parsed.weights.water).toBe(100); expect(parsed.cost.tariff).toBe("0.2");
    expect(buildReport(parsed.farm, null).coverage.recommendationsAllowed).toBe(false);
  });
  it("rechaza JSON corrupto, versión ajena, pesos inválidos y coordenadas fuera del globo", () => {
    expect(() => importInputs("{" )).toThrow(); expect(() => importInputs(JSON.stringify({ schemaVersion: "99", input: exampleFarm }))).toThrow();
    expect(() => importInputs(JSON.stringify({ input: exampleFarm, priorityRanking: { weights: { water: -1, soil: 0, diversity: 0 } } }))).toThrow();
    expect(() => importInputs(JSON.stringify({ ...exampleFarm, lat: 91 }))).toThrow();
  });
  it("mantiene la revisión agronómica pendiente aunque se aporten datos", () => {
    expect(agronomicReview(exampleFarm).recommendationsAllowed).toBe(false);
    expect(agronomicReview(exampleFarm).requiredExternalEvidence).toHaveLength(3);
    expect(farmSchema.safeParse({ ...exampleFarm, waterScenario: { effectiveRainPct: 50, efficiencyPct: 0, origin: "estimado", reference: "Supuesto de prueba" } }).success).toBe(false);
  });
  it("amplía el catálogo sin trasladar plantillas ni inventar Kc de arroz", () => {
    expect(catalog.potato.family).toBe("Solanaceae"); expect(catalog.wheat.family).toBe("Poaceae"); expect(catalog.rice.waterUse).toBeNull();
    expect(compareStrategies({ ...exampleFarm, lat: -13.52, lon: -71.97, current: [{ ...exampleFarm.current[0], crop: "potato" }] }, null)).toHaveLength(1);
  });
});

describe("Polígonos geográficos", () => {
  const square: [number, number][] = [[0, 0], [0.001, 0], [0.001, 0.001], [0, 0.001]];
  it("estima un cuadrado ecuatorial y conserva el área al invertir sus vértices", () => {
    expect(approximateAreaHa(square)).toBeCloseTo(1.2364, 3);
    expect(approximateAreaHa([...square].reverse())).toBeCloseTo(approximateAreaHa(square), 8);
  });
  it("rechaza cruces, puntos duplicados, área nula y coordenadas inválidas", () => {
    for (const vertices of [[square[0], square[2], square[1], square[3]], [square[0], square[1], square[1]], [[0, 0], [1, 0], [2, 0]], [[0, 91], [1, 0], [0, 1]]]) expect(parcelSchema.safeParse({ vertices, origin: "declarado" }).success).toBe(false);
  });
  it("admite un polígono local que cruza el antimeridiano", () => {
    const p = parcelSchema.parse({ vertices: [[179.999, 0], [-179.999, 0], [-179.999, 0.001], [179.999, 0.001]], origin: "declarado" });
    expect(approximateAreaHa(p.vertices)).toBeCloseTo(2.4729, 3);
  });
  it("importa un anillo GeoJSON y rechaza huecos", () => {
    expect(parseParcelText(JSON.stringify({ type: "Polygon", coordinates: [[...square, square[0]]] })).vertices).toHaveLength(4);
    expect(() => parseParcelText(JSON.stringify({ type: "Polygon", coordinates: [square, square] }))).toThrow();
  });
  it("elige un punto interior en una parcela cóncava", () => {
    const p = parcelSchema.parse({ vertices: [[0, 0], [0.03, 0], [0.03, 0.01], [0.01, 0.01], [0.01, 0.02], [0.03, 0.02], [0.03, 0.03], [0, 0.03]], origin: "declarado" });
    const reference = parcelCenter(p.vertices);
    expect(reference.lat).toBeCloseTo(0.015, 6); expect(reference.lon).toBeGreaterThan(0); expect(reference.lon).toBeLessThan(0.01);
  });
});

describe("Penman–Monteith y escenarios de agua", () => {
  it("reproduce la ecuación FAO-56, ejemplo 18 de Uccle (~3,9 mm/día)", () => {
    expect(penmanMonteithEquation({ meanC: 16.9, netRadiation: 13.28, vapourPressureKpa: 1.409, saturationKpa: 1.997, pressureKpa: 100.1, wind2m: 2.078 })).toBeCloseTo(3.9, 1);
  });
  it("no reemplaza radiación o elevación ausentes con constantes", () => {
    expect(dailyPenmanMonteith({ minC: 12.3, maxC: 21.5, dewC: 12, wind2m: 2.078, solarMj: null, pressureKpa: 100.1, elevationM: 100, raMj: 41.09 })).toBeNull();
  });
  it("reproduce el cálculo radiativo diario completo del ejemplo 18 FAO-56", () => {
    const log = Math.log(1.409 / 0.6108), dewC = 237.3 * log / (17.27 - log);
    expect(dailyPenmanMonteith({ minC: 12.3, maxC: 21.5, dewC, wind2m: 2.078, solarMj: 22.07, pressureKpa: 100.1, elevationM: 100, raMj: 41.09 })).toBeCloseTo(3.9, 1);
  });
  it.each([pmViru, pmCusco])("normaliza ocho variables NASA reales y mantiene cada ubicación", fixture => {
    const c = normalizePower(fixture.raw, fixture.query, fixture.retrievedAt);
    const b = waterBalance([{ crop: "maize", start: "2024-01-01", end: "2024-02-01", origin: "estimado" }], c);
    expect(c.query.lat).toBe(fixture.query.lat); expect(c.waterWeather?.missing.WS2M).toBe(0); expect(b.etcMm).toBeGreaterThan(0); expect(b.method).toContain("Penman-Monteith");
    c.days[0].WS2M = null; expect(waterBalance([{ crop: "maize", start: "2024-01-01", end: "2024-02-01", origin: "estimado" }], c).etcMm).toBeNull();
  });
  it("rechaza una unidad solar inesperada", () => {
    const raw = structuredClone(pmViru.raw); raw.parameters.ALLSKY_SFC_SW_DWN.units = "kWh/m2/day";
    expect(() => normalizePower(raw, pmViru.query)).toThrow("unidad");
  });
  it("los supuestos de lluvia/eficiencia conservan cero y no se activan sin procedencia", () => {
    const cycles = [exampleFarm.current[0]];
    const b = waterBalance(cycles, climate, { effectiveRainPct: 0, efficiencyPct: 50, origin: "estimado", reference: "Escenario sintético de prueba" });
    expect(b.scenario?.effectiveRainMm).toBe(0); expect(b.scenario?.grossIrrigationMm).toBeCloseTo(b.etcMm! * 2, 8);
    expect(waterBalance(cycles, climate).scenario).toBeNull();
    expect(waterBalance(cycles, climate, { effectiveRainPct: 50, efficiencyPct: 50, origin: "desconocido", reference: "" }).scenario?.netIrrigationMm).toBeNull();
  });
});
