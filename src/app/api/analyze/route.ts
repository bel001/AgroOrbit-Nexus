import { farmSchema, climateQuerySchema, addDays } from "@/lib/model";
import { fetchClimateWithSnapshot } from "@/lib/snapshots";
import { buildReport } from "@/lib/rotations";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 32_768) return Response.json({ error: "Formulario demasiado grande" }, { status: 413 });
  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ error: "Falta el formulario" }, { status: 400 });
    const decoder = new TextDecoder(); let text = "", size = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 32_768) { await reader.cancel(); return Response.json({ error: "Formulario demasiado grande" }, { status: 413 }); }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode(); body = JSON.parse(text);
  }
  catch { return Response.json({ error: "JSON inválido" }, { status: 400 }); }
  const parsed = farmSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Revisa el perfil agrícola", issues: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`) }, { status: 400 });
  const farm = parsed.data;
  const query = climateQuerySchema.safeParse({ lat: farm.lat, lon: farm.lon, start: farm.start, end: addDays(farm.start, farm.horizonDays - 1) });
  if (!query.success) return Response.json({ error: "Elige un horizonte histórico válido (finalizado hace al menos dos días)", issues: query.error.issues.map(i => i.message) }, { status: 400 });
  let climate = null;
  let climateError: string | null = null;
  try { climate = await fetchClimateWithSnapshot(query.data); }
  catch (e) { climateError = e instanceof Error && !/Zod|JSON|fetch failed/.test(e.message) ? e.message : "No se pudo verificar la respuesta de NASA POWER. Reintenta la consulta."; }
  return Response.json({ report: buildReport(farm, climate), climateError }, { headers: { "Cache-Control": "no-store" } });
}
