import { fetchVegetation, vegetationQuerySchema } from "@/lib/vegetation";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const parsed = vegetationQuerySchema.safeParse({ lat: params.has("lat") ? Number(params.get("lat")) : NaN, lon: params.has("lon") ? Number(params.get("lon")) : NaN, start: params.get("start"), end: params.get("end") });
  if (!parsed.success) return Response.json({ error: "Revisa coordenadas y fechas: periodo histórico MODIS de hasta 120 días desde 2000-02-18." }, { status: 400 });
  try { return Response.json({ vegetation: await fetchVegetation(parsed.data) }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ error: "No se pudo verificar la serie MODIS para ese punto y periodo. Prueba otra fecha o reintenta más tarde; el informe climático sigue disponible." }, { status: 502 }); }
}
