import { describe, expect, it, vi } from "vitest";
import { normalizeVegetation, validateVegetationBands, vegetationQuality, vegetationQuerySchema, fetchVegetation } from "@/lib/vegetation";
import { GET } from "@/app/api/vegetation/route";
import raw from "../docs/evidence/revision-2026-11-15/modis-subset.json";
import bands from "../docs/evidence/revision-2026-11-15/modis-bands.json";
const query = { lat: -8.42, lon: -78.75, start: "2024-01-01", end: "2024-02-02" };
const dates = [{ calendar_date: "2024-01-01", modis_date: "A2024001" }, { calendar_date: "2024-01-17", modis_date: "A2024017" }, { calendar_date: "2024-02-02", modis_date: "A2024033" }];
describe("MODIS contextual real y calidad explícita", () => {
  it("verifica escala/rango y conserva NDVI, fecha real, píxel y calidad", () => {
    expect(validateVegetationBands(bands)).toHaveLength(12);
    const c = normalizeVegetation(raw, query, dates);
    expect(c.observations[0]).toMatchObject({ ndvi: 0.4758, observedDate: "2024-01-15", qa: 2116, valid: true });
    expect(c.grid.nrows).toBe(1); expect(c.validCount).toBe(3); expect(c.collectionVersion).toBeNull();
  });
  it("conserva fill, calidad ausente y fechas inválidas como nulos", () => {
    const r = structuredClone(raw);
    r.subset.find(row => row.band.endsWith("_NDVI"))!.data = [-3000];
    r.subset.find(row => row.band.endsWith("_pixel_reliability") && row.modis_date === "A2024017")!.data = [-1];
    r.subset.find(row => row.band.endsWith("_composite_day_of_the_year") && row.modis_date === "A2024033")!.data = [366];
    expect(normalizeVegetation(r, query, dates).observations.every(o => o.ndvi === null)).toBe(true);
  });
  it("descarta nubes, sombras, nieve, agua, aerosoles altos y baja utilidad", () => {
    const good = 1 << 11;
    expect(vegetationQuality(0, good)).toBe(true);
    for (const mask of [1, 3 << 2, 3 << 6, 1 << 8, 1 << 10, 1 << 14, 1 << 15]) expect(vegetationQuality(0, good | mask)).toBe(false);
    expect(vegetationQuality(0, 0)).toBe(false); expect(vegetationQuality(1, good)).toBe(false); expect(vegetationQuality(0, null)).toBe(false);
  });
  it("no confunde NDVI cero válido con ausencia", () => {
    const r = structuredClone(raw); r.subset.find(row => row.band.endsWith("_NDVI"))!.data = [0];
    expect(normalizeVegetation(r, query, dates).observations[0].ndvi).toBe(0);
  });
  it("rechaza ubicación, escala o tamaño espacial distintos del contrato", () => {
    expect(() => normalizeVegetation({ ...raw, latitude: 1 }, query, dates)).toThrow("ubicación");
    expect(() => normalizeVegetation({ ...raw, nrows: 3 }, query, dates)).toThrow();
    const b = structuredClone(bands); b.bands.find(b => b.band.endsWith("_NDVI"))!.scale_factor = "1";
    expect(() => validateVegetationBands(b)).toThrow("Contrato");
  });
  it("no acepta duplicados de una misma banda/fecha", () => {
    expect(() => normalizeVegetation({ ...raw, subset: [...raw.subset, raw.subset[0]] }, query, dates)).toThrow();
  });
  it("rechaza identificadores de fecha, resolución y teselas inconsistentes", () => {
    expect(() => normalizeVegetation({ ...raw, cellsize: 10 }, query, dates)).toThrow();
    const r = structuredClone(raw); r.subset[0].modis_date = "A2024002";
    expect(() => normalizeVegetation(r, query, dates)).toThrow();
    const mixed = structuredClone(raw); mixed.subset.find(r => r.band.endsWith("_VI_Quality"))!.tile = "h11v09";
    expect(() => normalizeVegetation(mixed, query, dates)).toThrow("teselas");
  });
  it("limita periodos y valida coordenadas antes de acceder a red", async () => {
    expect(vegetationQuerySchema.safeParse({ ...query, end: "2024-12-31" }).success).toBe(false);
    expect((await GET(new Request("http://localhost/api/vegetation?start=2024-01-01&end=2024-02-02"))).status).toBe(400);
  });
  it("no sustituye por datos de Virú una caída MODIS en otra ubicación", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("", { status: 503 }));
    await expect(fetchVegetation({ ...query, lat: -13.52, lon: -71.97 }, fetcher)).rejects.toThrow("503");
  });
});
