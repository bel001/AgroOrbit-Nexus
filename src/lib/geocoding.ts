import { z } from "zod";

export const placeQuerySchema = z.string().trim().min(3, "Escribe al menos 3 caracteres").max(120, "La búsqueda es demasiado larga");
const locationSchema = z.object({
  id: z.number().int(), name: z.string().min(1), latitude: z.number().finite().min(-90).max(90), longitude: z.number().finite().min(-180).max(180),
  country: z.string().optional(), country_code: z.string().optional(), admin1: z.string().optional(),
});
const responseSchema = z.object({ error: z.literal(false).optional(), results: z.array(locationSchema).max(20).optional() });
export type Place = { id: number; label: string; lat: number; lon: number };
export type PlaceSearch = { results: Place[]; provider: string; url: string; retrievedAt: string };
export class PlaceSearchError extends Error { constructor(message: string, public status = 502) { super(message); } }

export function geocodingUrl(query: string) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({ name: placeQuerySchema.parse(query), count: "5", language: "es", format: "json" }).toString();
  return url.href;
}
export function normalizePlaces(raw: unknown): Place[] {
  const parsed = responseSchema.parse(raw);
  return [...new Map((parsed.results ?? []).map(p => [p.id, { id: p.id, label: [p.name, p.admin1, p.country].filter((s, i, a) => s && a.indexOf(s) === i).join(", "), lat: p.latitude, lon: p.longitude }])).values()];
}
export function createPlaceSearch(fetcher: typeof fetch = fetch) {
  const cache = new Map<string, PlaceSearch>();
  const pending = new Map<string, Promise<PlaceSearch>>();
  let lastRequestAt = 0;
  return async (query: string): Promise<PlaceSearch> => {
    const normalized = placeQuerySchema.parse(query);
    const key = normalized.toLocaleLowerCase("es");
    const stored = cache.get(key);
    if (stored && Date.now() - Date.parse(stored.retrievedAt) < 86_400_000) return stored;
    if (pending.has(key)) return pending.get(key)!;
    if (Date.now() - lastRequestAt < 1000) throw new PlaceSearchError("Espera un segundo antes de buscar otra localidad.", 429);
    lastRequestAt = Date.now();
    const url = geocodingUrl(normalized);
    const task = (async () => {
      const response = await fetcher(url, { signal: AbortSignal.timeout(10_000), headers: { Accept: "application/json" } });
      if (!response.ok) throw new PlaceSearchError("El buscador de localidades no está disponible. Usa el mapa o las coordenadas.");
      const result = { results: normalizePlaces(await response.json()), provider: "Open-Meteo / GeoNames", url, retrievedAt: new Date().toISOString() };
      if (cache.size >= 128) cache.delete(cache.keys().next().value!);
      cache.set(key, result); return result;
    })();
    pending.set(key, task);
    try { return await task; } finally { pending.delete(key); }
  };
}
export const searchPlaces = createPlaceSearch();
