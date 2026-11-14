import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/locations/route";
import { createPlaceSearch, geocodingUrl, normalizePlaces } from "@/lib/geocoding";
const raw = { results: [{ id: 1, name: "Localidad de prueba", latitude: 0, longitude: 0, admin1: "Región de prueba", country: "País de prueba" }] };
describe("Búsqueda de localidades", () => {
  it("valida antes de acceder a red y codifica el término en parámetros", async () => { expect((await GET(new Request("http://localhost/api/locations?q=x"))).status).toBe(400); expect(new URL(geocodingUrl("París, Francia")).searchParams.get("name")).toBe("París, Francia"); });
  it("conserva cero geográfico y desambigua con región y país", () => { const [p] = normalizePlaces(raw); expect(p.lat).toBe(0); expect(p.lon).toBe(0); expect(p.label).toBe("Localidad de prueba, Región de prueba, País de prueba"); });
  it("no inventa lugares ante ausencia de resultados", () => { expect(normalizePlaces({ generationtime_ms: 1 })).toEqual([]); });
  it("rechaza error upstream y coordenadas fuera del globo", () => { expect(() => normalizePlaces({ error: true, reason: "Error" })).toThrow(); expect(() => normalizePlaces({ results: [{ ...raw.results[0], latitude: 91 }] })).toThrow(); });
  it("deduplica IDs sin confundir localidades homónimas", () => { expect(normalizePlaces({ results: [raw.results[0], raw.results[0], { ...raw.results[0], id: 2 }] })).toHaveLength(2); });
  it("cachea y deduplica sin repetir solicitudes", async () => { const fetcher = vi.fn().mockResolvedValue(Response.json(raw)); const search = createPlaceSearch(fetcher); const [a, b] = await Promise.all([search("Viru"), search("viru")]); expect(a).toEqual(b); await search(" VIRU "); expect(fetcher).toHaveBeenCalledTimes(1); });
  it("gestiona fallo y limita consultas consecutivas sin ocultar alternativas manuales", async () => { const search = createPlaceSearch(vi.fn().mockResolvedValue(new Response("", { status: 503 }))); await expect(search("Viru")).rejects.toThrow("mapa o las coordenadas"); await expect(search("Paris")).rejects.toMatchObject({ status: 429 }); });
});
