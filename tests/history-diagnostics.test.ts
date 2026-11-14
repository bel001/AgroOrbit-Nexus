import { describe, it, expect } from "vitest";
import { diagnoseHistory } from "@/lib/history-diagnostics";
import { exampleFarm } from "@/lib/examples/viru";
describe("Indicadores de repetición sin diagnóstico causal", () => {
  it("cuantifica tres registros de maíz como historial ilustrativo", () => {
    const d = diagnoseHistory(exampleFarm.history); expect(d.interpretable).toBe(true); expect(d.maxRun).toBe(3); expect(d.families).toBe(1); expect(d.dominant?.shareOfRecords).toBe(1); expect(d.sameCropTransitions).toBe(2); expect(d.sameFamilyTransitions).toBe(2);
  });
  it("no convierte historia ausente en diversidad o daño cero", () => { const d = diagnoseHistory([]); expect(d.recordCount).toBe(0); expect(d.species).toBeNull(); expect(d.dominant).toBeNull(); expect(d.daysBetweenCampaigns).toBeNull(); });
  it("rechaza interpretación con duplicación o procedencia desconocida", () => { const c = exampleFarm.history[0]; expect(diagnoseHistory([c, c]).interpretable).toBe(false); expect(diagnoseHistory([{ ...c, origin: "desconocido" }]).maxRun).toBeNull(); });
  it("distingue cambio de especie de cambio de familia", () => { const d = diagnoseHistory([exampleFarm.history[0], { ...exampleFarm.history[1], crop: "sorghum" }]); expect(d.species).toBe(2); expect(d.families).toBe(1); expect(d.sameCropTransitions).toBe(0); expect(d.sameFamilyTransitions).toBe(1); });
  it("ordena cronológicamente y no suma campañas solapadas como días libres", () => { const d = diagnoseHistory([...exampleFarm.history].reverse()); expect(d.maxRun).toBe(3); expect(d.daysBetweenCampaigns).toBeGreaterThan(0); const bad = diagnoseHistory([{ ...exampleFarm.history[0], end: "2022-06-01" }, exampleFarm.history[1]]); expect(bad.invalidDates).toBe(true); expect(bad.daysBetweenCampaigns).toBeNull(); });
  it("un único registro no permite calcular intervalos entre campañas", () => { expect(diagnoseHistory([exampleFarm.history[0]]).daysBetweenCampaigns).toBeNull(); });
});
