import { describe, expect, it } from "vitest";
import { farmSchema, newGlobalFarm, type Farm } from "@/lib/model";
import { buildReport, compareStrategies } from "@/lib/rotations";
import { exampleFarm } from "@/lib/examples/viru";

const userFarm = (): Farm => ({
  ...newGlobalFarm(), lat: -16.399, lon: -71.537, analysisMode: "regional",
  current: [{ crop: "maize", start: "2024-01-01", end: "2024-05-30", origin: "declarado" }],
});

describe("Alternativas propuestas por el usuario", () => {
  it("un perfil sin alternativas sigue siendo válido (compatibilidad con informes previos)", () => {
    const { alternatives, ...legacy } = userFarm();
    expect(alternatives).toEqual([]);
    expect(farmSchema.parse(legacy).alternatives).toEqual([]);
  });
  it("fuera de un perfil regional compara A con las alternativas del usuario, con letras consecutivas", () => {
    const f = { ...userFarm(), alternatives: [{ name: "Con frijol", campaigns: [{ crop: "bean" as const, start: "2024-01-01", end: "2024-04-10", origin: "estimado" as const }] }] };
    const s = compareStrategies(f, null);
    expect(s.map(x => x.id)).toEqual(["A", "B"]);
    expect(s[1].name).toBe("Con frijol");
    expect(s[1].userProposed).toBe(true);
    expect(s[0].userProposed).toBeUndefined();
  });
  it("en la demo de Virú las alternativas propias van después de B y C ilustrativas", () => {
    const f = { ...exampleFarm, alternatives: [{ name: "Mía", campaigns: [exampleFarm.current[0]] }] };
    expect(compareStrategies(f, null).map(x => x.id)).toEqual(["A", "B", "C", "D"]);
  });
  it("valida fechas de las alternativas igual que la secuencia A", () => {
    const f = { ...userFarm(), alternatives: [{ name: "Solapada", campaigns: [
      { crop: "maize" as const, start: "2024-01-01", end: "2024-05-30", origin: "estimado" as const },
      { crop: "bean" as const, start: "2024-03-01", end: "2024-06-30", origin: "estimado" as const },
    ] }] };
    expect(compareStrategies(f, null)[1].status).toBe("Incompatible");
  });
  it("rechaza más de dos alternativas, nombres vacíos o alternativas sin ciclos", () => {
    const alt = { name: "X", campaigns: userFarm().current };
    expect(farmSchema.safeParse({ ...userFarm(), alternatives: [alt, alt, alt] }).success).toBe(false);
    expect(farmSchema.safeParse({ ...userFarm(), alternatives: [{ ...alt, name: " " }] }).success).toBe(false);
    expect(farmSchema.safeParse({ ...userFarm(), alternatives: [{ ...alt, campaigns: [] }] }).success).toBe(false);
  });
  it("en modo solo clima no se generan alternativas aunque existan en el formulario", () => {
    const f = { ...userFarm(), analysisMode: "climate" as const, alternatives: [{ name: "X", campaigns: userFarm().current }] };
    expect(buildReport(f, null).strategies).toEqual([]);
  });
});
