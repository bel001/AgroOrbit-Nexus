"use client";
import { useEffect, useRef, useState } from "react";
import { LocateFixed, Search, MapPin } from "lucide-react";
import type { Place, PlaceSearch } from "@/lib/geocoding";
import { useT } from "./i18n";

export default function LocationSearch({ lat, lon, onSelect }: { lat: number; lon: number; onSelect: (lat: number, lon: number) => void }) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const action = useRef(0);
  const request = useRef<AbortController | null>(null);
  const [selected, setSelected] = useState<{ lat: number; lon: number } | null>(null);
  const currentPoint = useRef({ lat, lon });
  useEffect(() => { currentPoint.current = { lat, lon }; }, [lat, lon]);
  useEffect(() => () => { request.current?.abort(); action.current++; }, []);
  // GPS/locality feedback only applies until the point is adjusted or the profile is reset.
  const selectionMatches = selected?.lat === lat && selected?.lon === lon;
  async function search() {
    request.current?.abort(); const token = ++action.current;
    setError(""); setMessage(""); setResults([]); setLocating(false); setSelected(null);
    if (query.trim().length < 3 || query.trim().length > 120) { setError(t("Escribe entre 3 y 120 caracteres.", "Type between 3 and 120 characters.")); return; }
    const controller = new AbortController(); request.current = controller; setBusy(true);
    try {
      const response = await fetch(`/api/locations?${new URLSearchParams({ q: query.trim() })}`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]) });
      const data: PlaceSearch & { error?: string } = await response.json();
      if (action.current !== token) return;
      if (!response.ok) throw new Error(data.error ?? t("No se pudo buscar la localidad.", "The place search failed."));
      setResults(data.results); setTimeout(() => document.querySelector(".place-results")?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60); setMessage(data.results.length ? t(`${data.results.length} resultados. Selecciona la localidad más cercana.`, `${data.results.length} results. Pick the nearest place.`) : t("Sin resultados. Prueba con otra localidad cercana o añade el país, por ejemplo: Córdoba, Argentina.", "No results. Try another nearby place or add the country, e.g. Córdoba, Argentina."));
    } catch (e) { if (action.current === token) setError(e instanceof Error && e.name !== "AbortError" ? e.message : t("La búsqueda se interrumpió. Vuelve a intentarlo.", "The search was interrupted. Try again.")); }
    finally { if (action.current === token) setBusy(false); }
  }
  function locate() {
    request.current?.abort(); const token = ++action.current; setBusy(false); setResults([]); setMessage(""); setError(""); setSelected(null);
    if (!navigator.geolocation) { setError(t("Tu navegador no ofrece ubicación. Busca una localidad o usa el mapa.", "Your browser does not provide location. Search for a place or use the map.")); return; }
    setLocating(true);
    const originalPoint = { lat, lon };
    navigator.geolocation.getCurrentPosition(position => {
      if (action.current !== token) return;
      if (!Object.is(originalPoint.lat, currentPoint.current.lat) || !Object.is(originalPoint.lon, currentPoint.current.lon)) { setLocating(false); setMessage(t("El punto cambió mientras se obtenía la ubicación; se conserva tu selección del mapa.", "The point changed while locating; your map selection is kept.")); return; }
      const point = { lat: position.coords.latitude, lon: position.coords.longitude }; setSelected(point);
      onSelect(point.lat, point.lon); setLocating(false);
      setMessage(t(`Ubicación del dispositivo seleccionada. Precisión aproximada: ${Math.round(position.coords.accuracy)} m. Comprueba que sea el terreno donde vas a plantar.`, `Device location selected. Approximate accuracy: ${Math.round(position.coords.accuracy)} m. Check it is the field you will plant.`));
    }, err => {
      if (action.current !== token) return;
      setLocating(false); setError(err.code === 1 ? t("Permiso de ubicación denegado. Puedes buscar la localidad o marcar el terreno en el mapa.", "Location permission denied. Search for the place or mark the field on the map.") : t("No se pudo obtener tu ubicación. Prueba de nuevo o busca una localidad.", "Could not get your location. Try again or search for a place."));
    }, { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 });
  }
  return <div className="location-search" role="group" aria-label={t("Encontrar el terreno", "Find the field")}>
    <label htmlFor="place-query">{t("Busca una localidad o código postal", "Search a place or postcode")}</label>
    <div className="location-search-row"><input id="place-query" value={query} maxLength={120} placeholder={t("Por ejemplo: Virú, Perú o Córdoba, Argentina", "e.g. Virú, Peru or Córdoba, Argentina")} onChange={e => { request.current?.abort(); action.current++; setBusy(false); setLocating(false); setQuery(e.target.value); setResults([]); setMessage(""); setError(""); }} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); void search(); } }} aria-describedby="place-help" /><button className="button" type="button" disabled={busy || locating} onClick={() => void search()}><Search size={18} aria-hidden="true" />{busy ? t("Buscando…", "Searching…") : t("Buscar lugar", "Search place")}</button></div>
    <p id="place-help" className="small muted">{t("Encuentra una referencia cercana; después acerca el mapa y marca el punto exacto de siembra. El resultado no delimita una parcela.", "Find a nearby reference, then zoom the map and mark the exact planting point. The result does not delimit a plot.")}</p>
    <button className="button secondary" type="button" disabled={busy || locating} onClick={locate}><LocateFixed size={18} aria-hidden="true" />{locating ? t("Obteniendo ubicación…", "Getting location…") : t("Usar mi ubicación", "Use my location")}</button>
    {error && <p className="notice error" role="alert">{error}</p>}
    {message && (!selected || selectionMatches || results.length > 0) && <p className="small" role="status">{message}</p>}
    {results.length > 0 && <ul className="place-results" aria-label={t("Localidades encontradas", "Places found")}>{results.map(place => <li key={place.id}><button type="button" onClick={() => { setSelected({ lat: place.lat, lon: place.lon }); onSelect(place.lat, place.lon); setResults([]); setMessage(t(`${place.label} seleccionada. Acerca el mapa y ajusta el punto de siembra.`, `${place.label} selected. Zoom the map and adjust the planting point.`)); }}><MapPin size={18} aria-hidden="true" /><span>{place.label}<small>{place.lat.toFixed(4)}, {place.lon.toFixed(4)}</small></span></button></li>)}</ul>}
    <p className="small muted">{t("Búsqueda", "Search")}: <a href="https://open-meteo.com/en/docs/geocoding-api" target="_blank" rel="noreferrer">Open-Meteo</a> / <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a>. {t("La ubicación del dispositivo solo se solicita al pulsar el botón.", "Device location is only requested when you press the button.")}</p>
  </div>;
}
