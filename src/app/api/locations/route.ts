import { NextResponse } from "next/server";
import { placeQuerySchema, searchPlaces, PlaceSearchError } from "@/lib/geocoding";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const parsed = placeQuerySchema.safeParse(new URL(request.url).searchParams.get("q"));
  if (!parsed.success) return NextResponse.json({ error: "Escribe entre 3 y 120 caracteres para buscar una localidad o código postal." }, { status: 400 });
  try { return NextResponse.json(await searchPlaces(parsed.data), { headers: { "Cache-Control": "no-store" } }); }
  catch (e) { return NextResponse.json({ error: e instanceof PlaceSearchError ? e.message : "No se pudo consultar el buscador. Puedes usar el mapa o las coordenadas." }, { status: e instanceof PlaceSearchError ? e.status : 502 }); }
}
