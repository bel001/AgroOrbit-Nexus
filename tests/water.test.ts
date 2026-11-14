import { describe, expect, it } from "vitest";
import raw from "../docs/evidence/power-viru-2024.json";
import { normalizePower } from "@/lib/power";
import { buildReport } from "@/lib/rotations";
import { exampleFarm } from "@/lib/examples/viru";
import { campaignClimate, dayOfYear, extraterrestrialRadiation, hargreavesEto, kcOnDay, waterBalance } from "@/lib/water";
import type { Campaign } from "@/lib/model";

const query = { lat: -8.42, lon: -78.75, start: "2024-01-01", end: "2024-12-31" };
const climate = () => normalizePower(structuredClone(raw), query);
const maize: Campaign = { crop: "maize", start: "2024-01-01", end: "2024-05-30", origin: "estimado" };
const bean: Campaign = { crop: "bean", start: "2024-06-29", end: "2024-11-11", origin: "estimado" };

describe("FAO-56 · radiación extraterrestre y ETo de Hargreaves", () => {
  it("reproduce el ejemplo 8 de FAO-56 (20°S, 3 de septiembre: Ra = 32,2 MJ m⁻² día⁻¹)", () => {
    expect(dayOfYear("2015-09-03")).toBe(246);
    expect(extraterrestrialRadiation(-20, 246)).toBeCloseTo(32.2, 1);
  });
  it("no inventa ETo cuando falta una temperatura y no da valores negativos", () => {
    expect(hargreavesEto({ date: "2024-01-01", T2M_MIN: null, T2M_MAX: 30 }, -8.4)).toBeNull();
    expect(hargreavesEto({ date: "2024-01-01", T2M_MIN: 20, T2M_MAX: 20 }, -8.4)).toBe(0);
  });
  it("acota la radiación en latitudes polares sin producir NaN", () => {
    expect(Number.isFinite(extraterrestrialRadiation(89, 172))).toBe(true);
    expect(extraterrestrialRadiation(89, 355)).toBeCloseTo(0, 3);
  });
  it("da una ETo anual plausible para la costa árida de Virú con datos NASA reales", () => {
    const total = climate().days.reduce((sum, d) => sum + (hargreavesEto(d, query.lat) ?? 0), 0);
    expect(total).toBeGreaterThan(900);
    expect(total).toBeLessThan(2000);
  });
});

describe("FAO-56 · curva de Kc por etapas", () => {
  it("sigue la forma ini → desarrollo → medio → final", () => {
    expect(kcOnDay("maize", 0, 180)).toBe(0.3);
    expect(kcOnDay("maize", 55, 180)).toBeCloseTo(0.75, 2); // mitad del desarrollo (30 + 25)
    expect(kcOnDay("maize", 100, 180)).toBe(1.2);
    expect(kcOnDay("maize", 180, 180)).toBeCloseTo(0.35, 5);
  });
});

describe("Balance hídrico por campaña", () => {
  it("calcula ETc, lluvia y déficit bruto con la serie real completa", () => {
    const c = campaignClimate(maize, climate());
    expect(c.complete).toBe(true);
    expect(c.etcMm).toBeGreaterThan(0);
    expect(c.etcMm!).toBeLessThan(c.etoMm! * 1.2);
    expect(c.grossDeficitMm).toBe(Math.max(0, c.etcMm! - c.rainMm!));
    expect(c.gdd).toBeGreaterThan(0);
    expect(c.gddBaseC).toBe(10);
  });
  it("no asigna base térmica al frijol sin fuente documentada", () => {
    const c = campaignClimate(bean, climate());
    expect(c.gddBaseC).toBeNull();
    expect(c.gdd).toBeNull();
    expect(c.etcMm).toBeGreaterThan(0);
  });
  it("devuelve null en vez de un total parcial cuando falta un día", () => {
    const r = structuredClone(raw);
    r.properties.parameter.T2M_MAX["20240115"] = -999;
    const c = campaignClimate(maize, normalizePower(r, query));
    expect(c.complete).toBe(false);
    expect(c.etcMm).toBeNull();
    expect(c.grossDeficitMm).toBeNull();
    expect(c.daysWithEto).toBe(c.days - 1);
  });
  it("no suma campañas fuera de la serie disponible", () => {
    const outside: Campaign = { crop: "maize", start: "2024-12-01", end: "2025-04-30", origin: "estimado" };
    const b = waterBalance([maize, outside], climate());
    expect(b.campaigns[0].etcMm).not.toBeNull();
    expect(b.campaigns[1].etcMm).toBeNull();
    expect(b.etcMm).toBeNull();
  });
  it("sin serie NASA el informe no muestra demanda, y declara sus supuestos cuando existe", () => {
    expect(buildReport(exampleFarm, null).strategies.every(s => s.water === null && s.waterDemandMm === null)).toBe(true);
    const b = waterBalance([maize, bean], climate());
    expect(b.assumptions.join(" ")).toContain("no es una necesidad de riego validada");
    expect(b.etcMm).toBeCloseTo(b.campaigns[0].etcMm! + b.campaigns[1].etcMm!, 6);
  });
});
