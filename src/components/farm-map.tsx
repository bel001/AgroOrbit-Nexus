"use client";
import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { worldCover, worldCoverTileUrl, worldCoverAttribution } from "@/lib/sources";
import { cellSizeKm, powerCell } from "@/lib/grid";
import { useT } from "./i18n";
import { approximateAreaHa, parcelSchema, parseParcelText, type Parcel, type Vertex } from "@/lib/parcel";

type Polygon = { type: "Feature"; properties: Record<string, never>; geometry: { type: "Polygon"; coordinates: number[][][] } };
type Collection = { type: "FeatureCollection"; features: Polygon[] };

// Opens on Peru (first pilot); "Ver mapa mundial" shows the whole world.
const PERU_VIEW = { center: [-75.3, -9.4] as [number, number], zoom: 4.3 };
const WORLD_VIEW = { center: [0, 15] as [number, number], zoom: 1 };
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Marcador propio con pulso animado (se desactiva con prefers-reduced-motion en CSS).
function pinElement() {
  const el = document.createElement("div");
  el.className = "map-pin";
  el.innerHTML = '<span class="map-pin-pulse"></span><svg width="34" height="44" viewBox="0 0 34 44" aria-hidden="true"><path d="M17 1C8.2 1 1 8 1 16.7 1 28.5 17 43 17 43s16-14.5 16-26.3C33 8 25.8 1 17 1z" fill="#1f6b4f" stroke="#fff" stroke-width="2"/><circle cx="17" cy="16.5" r="6" fill="#fff"/></svg>';
  return el;
}

/** GeoJSON polygon of the NASA POWER (MERRA-2) cell that contains the point. */
function cellFeature(lat: number, lon: number): Polygon {
  const c = powerCell(lat, lon);
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[c.west, c.south], [c.east, c.south], [c.east, c.north], [c.west, c.north], [c.west, c.south]]] } };
}
const EMPTY: Collection = { type: "FeatureCollection", features: [] };

type Props = { lat: number; lon: number; onSelect: (lat: number, lon: number) => void; parcel?: Parcel; onParcel?: (parcel: Parcel | undefined) => void };
export default function FarmMap({ lat, lon, onSelect, parcel, onParcel }: Props) {
  const t = useT();
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const callback = useRef(onSelect);
  const initial = useRef({ lat, lon });
  const [failed, setFailed] = useState(false);
  const [showCover, setShowCover] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [coverSlow, setCoverSlow] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const drawRef = useRef(false);
  const [parcelText, setParcelText] = useState("");
  const [parcelError, setParcelError] = useState("");
  useEffect(() => { callback.current = onSelect; }, [onSelect]);
  useEffect(() => {
    if (!container.current) return;
    let instance: maplibregl.Map;
    try {
      maplibregl.setWorkerUrl("/vendor/maplibre-gl-worker.mjs");
      const hasPoint = Number.isFinite(initial.current.lat) && Number.isFinite(initial.current.lon);
      instance = new maplibregl.Map({ container: container.current, center: hasPoint ? [initial.current.lon, Math.max(-85, Math.min(85, initial.current.lat))] : PERU_VIEW.center, zoom: hasPoint ? 8.5 : PERU_VIEW.zoom, minZoom: 0, maxZoom: 17, cooperativeGestures: true, style: {
        version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' } },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      } });
      map.current = instance;
      if (hasPoint && Math.abs(initial.current.lat) <= 85) marker.current = new maplibregl.Marker({ element: pinElement(), anchor: "bottom" }).setLngLat([initial.current.lon, initial.current.lat]).addTo(instance);
      instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      // Style readiness does not wait for slow/unavailable base-map tiles.
      instance.on("style.load", () => {
        // NASA POWER cell: every point inside it receives the same data.
        instance.addSource("power-cell", { type: "geojson", data: hasPoint ? cellFeature(initial.current.lat, initial.current.lon) : EMPTY });
        instance.addLayer({ id: "power-cell-fill", type: "fill", source: "power-cell", paint: { "fill-color": "#3f87b5", "fill-opacity": 0.12 } });
        instance.addLayer({ id: "power-cell-line", type: "line", source: "power-cell", paint: { "line-color": "#1d5a80", "line-width": 2, "line-dasharray": [3, 2] } });
        instance.addSource("parcel", { type: "geojson", data: EMPTY });
        instance.addLayer({ id: "parcel-fill", type: "fill", source: "parcel", paint: { "fill-color": "#1f6b4f", "fill-opacity": 0.25 } });
        instance.addLayer({ id: "parcel-line", type: "line", source: "parcel", paint: { "line-color": "#134634", "line-width": 3 } });
      });
      instance.on("click", e => {
        const lat = Number(e.lngLat.lat.toFixed(5)), lon = Number(((((e.lngLat.lng + 180) % 360 + 360) % 360) - 180).toFixed(5));
        if (drawRef.current) setVertices(v => v.length < 64 ? [...v, [lon, lat]] : v);
        else callback.current(lat, lon);
      });
      instance.on("error", e => { if ("sourceId" in e && e.sourceId === "worldcover") setCoverFailed(true); else setFailed(true); });
      // A slow base-map tile must not keep the ESA status pending forever.
      // Report received ESA tile content, not completion of every map source.
      instance.on("sourcedata", e => { if (e.sourceId === "worldcover" && e.tile?.state === "loaded") { setCoverLoaded(true); setCoverSlow(false); } });
    } catch { queueMicrotask(() => setFailed(true)); }
    return () => { marker.current?.remove(); instance?.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    const instance = map.current;
    const valid = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
    const setCell = () => (instance?.getSource("power-cell") as maplibregl.GeoJSONSource | undefined)?.setData(valid && Math.abs(lat) <= 85 ? cellFeature(lat, lon) : EMPTY);
    if (instance?.getSource("power-cell")) setCell(); else instance?.once("style.load", setCell);
    if (valid) {
      if (Math.abs(lat) <= 85 && instance) {
        marker.current ??= new maplibregl.Marker({ element: pinElement(), anchor: "bottom" }).setLngLat([lon, lat]).addTo(instance);
        marker.current.setLngLat([lon, lat]);
      } else { marker.current?.remove(); marker.current = null; }
      // Frame the whole NASA cell around the point (valley scale), so its size is visible.
      if (instance && Math.abs(lat) <= 85) {
        const c = powerCell(lat, lon);
        instance.fitBounds([[c.west, c.south], [c.east, c.north]], { padding: 36, maxZoom: 10, duration: reducedMotion() ? 0 : 700 });
      }
    } else { marker.current?.remove(); marker.current = null; instance?.jumpTo(PERU_VIEW); }
    return () => { instance?.off("style.load", setCell); };
  }, [lat, lon]);
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const apply = () => {
      if (showCover && !instance.getSource("worldcover")) {
        instance.addSource("worldcover", { type: "raster", tiles: [worldCoverTileUrl], tileSize: 256, bounds: [-180, -60, 180, 83], maxzoom: 14, attribution: worldCoverAttribution });
        instance.addLayer({ id: "worldcover", type: "raster", source: "worldcover", paint: { "raster-opacity": 0.65 } }, "power-cell-fill");
      }
      if (instance.getLayer("worldcover")) instance.setLayoutProperty("worldcover", "visibility", showCover ? "visible" : "none");
    };
    if (instance.getSource("power-cell")) apply(); else instance.once("style.load", apply);
    return () => { instance.off("style.load", apply); };
  }, [showCover]);
  useEffect(() => {
    const instance = map.current;
    const ring = drawing ? vertices : parcel?.vertices ?? [];
    const apply = () => (instance?.getSource("parcel") as maplibregl.GeoJSONSource | undefined)?.setData(ring.length >= 3 ? { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[...ring, ring[0]]] } } : EMPTY);
    if (instance?.getSource("parcel")) apply(); else instance?.once("style.load", apply);
    return () => { instance?.off("style.load", apply); };
  }, [drawing, vertices, parcel]);
  useEffect(() => {
    if (!showCover || coverLoaded || coverFailed) return;
    const timer = setTimeout(() => setCoverSlow(true), 25_000);
    return () => clearTimeout(timer);
  }, [showCover, coverLoaded, coverFailed]);
  const finishParcel = (value: unknown) => {
    const parsed = parcelSchema.safeParse(value);
    if (!parsed.success) { setParcelError(t("Revisa los vértices: mínimo 3, sin cruces ni duplicados; coordenadas válidas y parcela local.", "Check the vertices: at least 3, no crossings or duplicates; valid coordinates and a local parcel.")); return; }
    onParcel?.(parsed.data); setDrawing(false); drawRef.current = false; setVertices([]); setParcelError("");
  };

  const hasPoint = Number.isFinite(lat) && Number.isFinite(lon);
  const cell = hasPoint ? powerCell(lat, lon) : null;
  const size = cell ? cellSizeKm(cell.center.lat) : null;
  return <div className="map-wrap"><div className="map-frame">
    <button className="button map-float" type="button" onClick={() => map.current?.flyTo({ ...WORLD_VIEW, duration: reducedMotion() ? 0 : 900 })}>{t("Ver mapa mundial", "Show world map")}</button>
    <div ref={container} className="map" role="region" aria-label={t("Mapa mundial. Alternativa accesible: campos de latitud y longitud.", "World map. Accessible alternative: latitude and longitude fields.")} />
    {cell && size && <div className="cell-legend" role="note"><span className="cell-swatch" aria-hidden="true" /><span><b lang="en">NASA data represents this whole area, not just your field.</b> {t(`Celda meteorológica MERRA-2 de ~${Math.round(size.northSouth)} × ${Math.round(size.eastWest)} km (0,5° × 0,625°). La radiación solar tiene una grilla de producto diferente.`, `MERRA-2 meteorological cell of ~${Math.round(size.northSouth)} × ${Math.round(size.eastWest)} km (0.5° × 0.625°). Solar radiation has a different product grid.`)}</span></div>}
    <div className="map-caption">{t("Punto de referencia", "Reference point")} · {Number.isFinite(lat) ? lat.toFixed(4) : "—"}, {Number.isFinite(lon) ? lon.toFixed(4) : "—"}</div></div>
    {failed && <p className="notice" role="status">{t("No se pudo cargar una parte del mapa. Puedes continuar con las coordenadas.", "Part of the map could not load. You can continue with the coordinates.")}</p>}
    {Number.isFinite(lat) && Math.abs(lat) > 85 && <p className="notice">{t("Zona polar: la proyección Mercator no permite mostrar este punto exacto. La consulta NASA utiliza tus coordenadas originales.", "Polar zone: the Mercator projection cannot show this exact point. The NASA request uses your original coordinates.")}</p>}
    <label className="check-label switch"><input type="checkbox" checked={showCover} onChange={e => { setShowCover(e.target.checked); setCoverFailed(false); setCoverSlow(false); }} /> {t("Mostrar cobertura terrestre ESA · 2021", "Show ESA land cover · 2021")}</label>
    {showCover && coverSlow && !coverFailed && <p className="notice" role="status">{t("La capa ESA tarda más de lo habitual. Puedes desactivarla y continuar con coordenadas y clima; no se está usando en los cálculos.", "The ESA layer is taking longer than usual. You can turn it off and continue with coordinates and climate; it is not used in calculations.")}</p>}
    {showCover && <div className="small"><p role="status">{coverFailed ? t("Algunas teselas ESA no están disponibles. La vista puede estar incompleta; desactiva la capa para continuar.", "Some ESA tiles are unavailable. The view may be incomplete; turn the layer off to continue.") : coverLoaded ? t("Capa ESA: datos recibidos; pueden quedar teselas pendientes.", "ESA layer: data received; some tiles may still be loading.") : t("Cargando capa ESA…", "Loading ESA layer…")}</p><p>ESA WorldCover {worldCover.version} · {t("10 m nominales · clasificación histórica, no imagen actual. La capa incluye cultivos y otras coberturas; no identifica especies, límites ni rotaciones. Disponibilidad del servicio: latitudes −60° a 83°.", "10 m nominal · historical classification, not a current image. It includes cropland and other covers; it does not identify species, boundaries or rotations. Service coverage: latitudes −60° to 83°.")}</p><p>{worldCoverAttribution}. <a href={worldCover.documentation} target="_blank" rel="noreferrer">{t("Fuente, leyenda y licencia CC BY 4.0", "Source, legend and CC BY 4.0 licence")}</a></p></div>}
    {onParcel && <div className="parcel-controls">
      <div className="report-actions">
        <button type="button" className="button secondary" aria-pressed={drawing} onClick={() => { setDrawing(d => !d); drawRef.current = !drawing; setVertices([]); setParcelError(""); }}>{drawing ? t("Cancelar dibujo", "Cancel drawing") : t("Dibujar parcela", "Draw parcel")}</button>
        {drawing && <><button type="button" className="button ghost" disabled={!vertices.length} onClick={() => setVertices(v => v.slice(0, -1))}>{t("Deshacer vértice", "Undo vertex")}</button><button type="button" className="button" disabled={vertices.length < 3} onClick={() => finishParcel({ vertices, origin: "declarado" })}>{t("Guardar polígono", "Save polygon")}</button></>}
        {parcel && <button type="button" className="button ghost" onClick={() => onParcel(undefined)}>{t("Quitar polígono", "Remove polygon")}</button>}
      </div>
      {drawing && <p role="status">{t(`Añade vértices haciendo clic en orden (${vertices.length}/64). Acerca el mapa para dibujar.`, `Click vertices in order (${vertices.length}/64). Zoom in to draw.`)}</p>}
      {parcel && <p className="small">{t("Superficie aproximada del polígono", "Approximate polygon area")}: {approximateAreaHa(parcel.vertices).toFixed(3)} ha · {parcel.vertices.length} {t("vértices", "vertices")}. {t("No es un levantamiento catastral.", "Not a cadastral survey.")}</p>}
      <details className="soft-details"><summary>{t("Introducir vértices o GeoJSON", "Enter vertices or GeoJSON")}</summary>
        <label>{t("Coordenadas del polígono (longitud, latitud por línea)", "Polygon coordinates (longitude, latitude per line)")}<textarea rows={4} maxLength={12000} value={parcelText} onChange={e => setParcelText(e.target.value)} /></label>
        <p className="small muted">{t("WGS84, entre 3 y 64 vértices; también admite Polygon o Feature GeoJSON sin huecos. El cierre es automático. No certifica propiedad ni uso agrícola.", "WGS84, 3–64 vertices; also accepts a GeoJSON Polygon or Feature without holes. Closure is automatic. Does not certify ownership or agricultural use.")}</p>
        <button type="button" className="button secondary" onClick={() => { try { finishParcel(parseParcelText(parcelText)); } catch { setParcelError(t("Polígono inválido. Revisa coordenadas, cruces y formato.", "Invalid polygon. Check coordinates, crossings and format.")); } }}>{t("Aplicar vértices", "Apply vertices")}</button>
      </details>
      {parcelError && <p role="alert" className="notice error">{parcelError}</p>}
    </div>}
    <p className="small muted">{t("Haz clic para ubicar el terreno. El punto no delimita una propiedad. Mapa base: OpenStreetMap. La capa ESA es contexto visual y no se utiliza para recomendar cultivos.", "Click to place the field. The point does not delimit a property. Base map: OpenStreetMap. The ESA layer is visual context and is not used to recommend crops.")}</p>
  </div>;
}
