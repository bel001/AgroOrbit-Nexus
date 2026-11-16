import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "@/app/api/analyze/route";
import { exampleFarm } from "@/lib/examples/viru";
import raw from "../docs/evidence/power-viru-2024.json";
const req = (body: unknown) => new Request("http://localhost/api/analyze", { method: "POST", body: JSON.stringify(body) });
afterEach(() => vi.unstubAllGlobals());
describe("API de análisis", () => {
  it("valida en servidor antes de consultar NASA", async () => { const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher); expect((await POST(req({ ...exampleFarm, lat: 999 }))).status).toBe(400); expect(fetcher).not.toHaveBeenCalled(); });
  it("bloquea JSON inválido y tamaño excesivo", async () => { expect((await POST(new Request("http://localhost", { method: "POST", body: "{" }))).status).toBe(400); expect((await POST(req({ data: "x".repeat(33_000) }))).status).toBe(413); });
  it("devuelve informe parcial sin extrapolar plantilla ante caída NASA fuera del piloto", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 }))); const r = await POST(req({ ...exampleFarm, lat: -9 })); const body = await r.json(); expect(body.report.climate).toBeNull(); expect(body.climateError).toContain("503"); expect(body.report.strategies).toHaveLength(1); expect(body.report.coverage.recommendationsAllowed).toBe(false); });
  it("el recorrido servidor integra datos NASA normalizados", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(raw))); const r = await POST(req({ ...exampleFarm, lat: -10 })); const body = await r.json(); expect(body.report.climate.days).toHaveLength(540); expect(body.report.climate.missing.T2M).toBe(174); expect(body.climateError).toBeNull(); });
});

describe("Snapshot de la demo de Virú", () => {
  it("usa la respuesta NASA guardada solo para la consulta exacta de la demo y lo declara", async () => {
    const { fetchClimateWithSnapshot, demoSnapshot } = await import("@/lib/snapshots");
    const down = (async () => { throw new TypeError("fetch failed"); }) as unknown as typeof fetch;
    const climate = await fetchClimateWithSnapshot(demoSnapshot.query, down);
    expect(climate.snapshot?.retrievedAt).toBe(demoSnapshot.retrievedAt);
    expect(climate.days).toHaveLength(540);
    expect(climate.warnings[0]).toContain("guardados localmente");
    await expect(fetchClimateWithSnapshot({ ...demoSnapshot.query, lat: 10 }, down)).rejects.toThrow();
    await expect(fetchClimateWithSnapshot({ ...demoSnapshot.query, extended: true }, down)).rejects.toThrow();
  });
});

describe("Snapshot histórico 1991–2023 (El Niño)", () => {
  it("contiene la serie diaria completa para la línea base y los años de El Niño", async () => {
    const { historyClimate } = await import("@/lib/snapshots");
    const c = historyClimate();
    expect(c.days).toHaveLength(12053);
    expect(c.days[0].date).toBe("1991-01-01");
    expect(c.days.at(-1)!.date).toBe("2023-12-31");
    for (const d of ["1997-12-01", "2016-02-01", "2023-03-01"]) expect(c.days.find(x => x.date === d)?.T2M_MAX).not.toBeNull();
    expect(c.missing.T2M_MAX + c.missing.T2M_MIN).toBe(0);
  });
});
