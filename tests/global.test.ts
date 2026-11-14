import { describe, expect, it } from "vitest";
import { containsLocation, regionProfiles, regionProfileSchema, resolveCoverage } from "@/lib/regions";
import { createCropCatalog, catalog } from "@/lib/catalog";
import { farmSchema, newGlobalFarm, climateQuerySchema } from "@/lib/model";
import { exampleFarm } from "@/lib/examples/viru";
import { compareStrategies, buildReport } from "@/lib/rotations";
import { localizedName } from "@/lib/locales";
import { normalizePower } from "@/lib/power";
import viru from "../docs/evidence/global/viru.json";
import california from "../docs/evidence/global/california.json";
import france from "../docs/evidence/global/france.json";
import kenya from "../docs/evidence/global/kenya.json";
import india from "../docs/evidence/global/india.json";
import australia from "../docs/evidence/global/australia.json";
const locations = [
  { lat: -8.42, lon: -78.75, raw: viru }, { lat: 36.75, lon: -119.75, raw: california },
  { lat: 48.25, lon: 2.25, raw: france }, { lat: -0.5, lon: 36.5, raw: kenya },
  { lat: 30.75, lon: 75.75, raw: india }, { lat: -34.5, lon: 146.5, raw: australia },
];
describe("Alcance global y aislamiento regional", () => {
  it("comienza sin coordenadas, cultivos ni calendario de Perú implícitos", () => {
    const f = newGlobalFarm(); expect(f.current).toEqual([]); expect(f.history).toEqual([]); expect(f.regionProfileId).toBeNull(); expect(f.analysisMode).toBe("climate"); expect(Number.isNaN(f.lat)).toBe(true);
  });
  it.each(locations)("clima global sin recomendaciones para $lat, $lon", ({ lat, lon, raw }) => {
    const f = farmSchema.parse({ ...newGlobalFarm(), lat, lon });
    const c = normalizePower(raw, { lat, lon, start: "2024-01-01", end: "2024-01-07" });
    expect(c.days).toHaveLength(7); expect(c.units.PRECTOTCORR).toBe("mm/day");
    const r = buildReport(f, c); expect(r.strategies).toEqual([]); expect(r.coverage.level).toBe("climate-only"); expect(r.coverage.recommendationsAllowed).toBe(false);
  });
  it.each(locations.slice(1))("no aplica plantilla de Virú en $lat, $lon aunque se envíe su ID", ({ lat, lon }) => {
    const f = { ...exampleFarm, lat, lon }; expect(resolveCoverage(f).profile).toBeNull(); expect(compareStrategies(f, null).map(s => s.id)).toEqual(["A"]);
  });
  it("la demo exige ámbito geográfico, consentimiento ilustrativo y horizonte propios", () => {
    expect(compareStrategies(exampleFarm, null)).toHaveLength(3);
    expect(compareStrategies({ ...exampleFarm, illustrative: false }, null)).toHaveLength(1);
    expect(compareStrategies({ ...exampleFarm, horizonDays: 365 }, null)).toHaveLength(1);
  });
  it("un horizonte corto es configurable sin inferir un calendario agrícola", () => { const f = farmSchema.parse({ ...newGlobalFarm(), lat: 40, lon: 0, horizonDays: 30 }); expect(compareStrategies(f, null)).toHaveLength(0); });
  it.each([[-90, -180], [90, 180], [0, 179.9], [0, -179.9]])("acepta límites globales %s / %s para NASA", (lat, lon) => { expect(climateQuerySchema.safeParse({ lat, lon, start: "2024-01-01", end: "2024-01-31" }).success).toBe(true); });
  it("soporta regiones que cruzan el antimeridiano", () => {
    const bounds = { west: 170, east: -170, south: -20, north: 20 }; expect(containsLocation(bounds, 0, 179)).toBe(true); expect(containsLocation(bounds, 0, -179)).toBe(true); expect(containsLocation(bounds, 0, 0)).toBe(false);
  });
  it("no acepta revisión agronómica sin trazabilidad", () => { expect(regionProfileSchema.safeParse({ ...regionProfiles[0], status: "reviewed", validation: null }).success).toBe(false); });
  it("el catálogo admite nuevas especies sin modificar un enum del motor", () => { const extended = createCropCatalog({ ...catalog, "test-crop": { ...catalog.bean, name: "Especie de prueba, no catálogo real" } }); expect(extended["test-crop"]).toBeDefined(); expect(catalog["test-crop"]).toBeUndefined(); });
  it("idioma adicional y fallback no alteran identificadores científicos", () => { expect(localizedName({ es: "Maíz", en: "Maize", fr: "Maïs" }, "fr")).toBe("Maïs"); expect(localizedName(catalog.maize.names, "sw")).toBe("Maíz grano"); });
});
