import { describe, expect, it } from "vitest";
import { buildReport } from "@/lib/rotations";
import { daysBetween, newGlobalFarm } from "@/lib/model";
import { exampleFarm } from "@/lib/examples/viru";

describe("Evidencia documental regional, sin certificación", () => {
  it("conserva fuentes y límites en el informe sin habilitar recomendaciones", () => {
    const r = buildReport(exampleFarm, null);
    expect(r.regionalEvidence?.entries.map(e => e.institution)).toEqual(["INIA", "INIA", "MIDAGRI", "FAO"]);
    expect(r.regionalEvidence?.localValidation).toBe(false);
    expect(r.coverage.recommendationsAllowed).toBe(false);
    expect(r.strategies.every(s => s.status === "Evaluación incompleta")).toBe(true);
    expect(r.strategies[1].checks.find(c => c.rule === "Calendario y variedad local")?.status).toBe("desconocido");
  });
  it("no sustituye cosecha por madurez fisiológica ni por el rango general FAO", () => {
    const r = buildReport(exampleFarm, null);
    const bean = r.strategies[1].campaigns[1];
    expect(daysBetween(bean.start, bean.end)).toBe(135);
    expect(r.catalog.bean.days).toEqual([95, 110]);
    expect(r.strategies[1].checks.find(c => c.rule === "Duración orientativa")?.detail).toContain("revisar variedad");
    expect(r.regionalEvidence?.entries[1].facts).toContain("98 días");
    expect(r.strategies.every(s => s.waterDemandMm === null)).toBe(true);
  });
  it("no exporta fichas de Virú a un terreno de otro país aunque se conserve el ID del piloto", () => {
    const r = buildReport({ ...exampleFarm, lat: 48.8, lon: 2.3 }, null);
    expect(r.regionalEvidence).toBeNull(); expect(r.strategies).toHaveLength(1);
    expect(r.strategies[0].checks.find(c => c.rule === "Calendario y variedad local")?.detail).not.toContain("INIA");
    expect(buildReport({ ...newGlobalFarm(), lat: 48.8, lon: 2.3 }, null).strategies).toEqual([]);
  });
});
