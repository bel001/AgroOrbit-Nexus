import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "@/app/api/analyze/route";
import { exampleFarm } from "@/lib/model";
import raw from "../docs/evidence/power-viru-2024.json";
const req = (body: unknown) => new Request("http://localhost/api/analyze", { method: "POST", body: JSON.stringify(body) });
afterEach(() => vi.unstubAllGlobals());
describe("API de análisis", () => {
  it("valida en servidor antes de consultar NASA", async () => { const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher); expect((await POST(req({ ...exampleFarm, lat: 999 }))).status).toBe(400); expect(fetcher).not.toHaveBeenCalled(); });
  it("bloquea JSON inválido y tamaño excesivo", async () => { expect((await POST(new Request("http://localhost", { method: "POST", body: "{" }))).status).toBe(400); expect((await POST(req({ data: "x".repeat(33_000) }))).status).toBe(413); });
  it("devuelve informe parcial y error explícito ante caída NASA", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 }))); const r = await POST(req({ ...exampleFarm, lat: -9 })); const body = await r.json(); expect(body.report.climate).toBeNull(); expect(body.climateError).toContain("503"); expect(body.report.strategies).toHaveLength(3); });
  it("el recorrido servidor integra datos NASA normalizados", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(raw))); const r = await POST(req({ ...exampleFarm, lat: -10 })); const body = await r.json(); expect(body.report.climate.days).toHaveLength(540); expect(body.report.climate.missing.T2M).toBe(174); expect(body.climateError).toBeNull(); });
});
