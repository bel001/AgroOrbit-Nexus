"use client";
import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { worldCover, worldCoverTileUrl, worldCoverAttribution } from "@/lib/sources";
import { cellSizeKm, powerCell } from "@/lib/grid";
import { useT } from "./i18n";

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

type Props = { lat: number; lon: number; onSelect: (lat: number, lon: number) => void };
export default function FarmMap({ lat, lon, onSelect }: Props) {
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
      instance.on("load", () => {
        // NASA POWER cell: every point inside it receives the same data.
        instance.addSource("power-cell", { type: "geojson", data: hasPoint ? cellFeature(initial.current.lat, initial.current.lon) : EMPTY });
        instance.addLayer({ id: "power-cell-fill", type: "fill", source: "power-cell", paint: { "fill-color": "#3f87b5", "fill-opacity": 0.12 } });
        instance.addLayer({ id: "power-cell-line", type: "line", source: "power-cell", paint: { "line-color": "#1d5a80", "line-width": 2, "line-dasharray": [3, 2] } });
      });
      instance.on("click", e => callback.current(Number(e.lngLat.lat.toFixed(5)), Number(((((e.lngLat.lng + 180) % 360 + 360) % 360) - 180).toFixed(5))));
      instance.on("error", e => { if ("sourceId" in e && e.sourceId === "worldcover") setCoverFailed(true); else setFailed(true); });
      // A slow base-map tile must not keep the ESA status pending forever.
      // Report received ESA tile content, not completion of every map source.
      instance.on("sourcedata", e => { if (e.sourceId === "worldcover" && e.tile?.state === "loaded") setCoverLoaded(true); });
    } catch { queueMicrotask(() => setFailed(true)); }
    return () => { marker.current?.remove(); instance?.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    const instance = map.current;
    const valid = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
    const setCell = () => (instance?.getSource("power-cell") as maplibregl.GeoJSONSource | undefined)?.setData(valid && Math.abs(lat) <= 85 ? cellFeature(lat, lon) : EMPTY);
    if (instance?.isStyleLoaded()) setCell(); else instance?.once("load", setCell);
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
    return () => { instance?.off("load", setCell); };
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
    if (instance.isStyleLoaded()) apply(); else instance.once("load", apply);
    return () => { instance.off("load", apply); };
  }, [showCover]);

  const hasPoint = Number.isFinite(lat) && Number.isFinite(lon);
  const cell = hasPoint ? powerCell(lat, lon) : null;
  const size = cell ? cellSizeKm(cell.center.lat) : null;
  return <div className="map-wrap"><div className="map-frame">
    <button className="button map-float" type="button" onClick={() => map.current?.flyTo({ ...WORLD_VIEW, duration: reducedMotion() ? 0 : 900 })}>{t("Ver mapa mundial", "Show world map")}</button>
    <div ref={container} className="map" role="region" aria-label={t("Mapa mundial. Alternativa accesible: campos de latitud y longitud.", "World map. Accessible alternative: latitude and longitude fields.")} />
    {cell && size && <div className="cell-legend" role="note"><span className="cell-swatch" aria-hidden="true" /><span><b lang="en">NASA data represents this whole area, not just your field.</b> {t(`Celda NASA POWER de ~${Math.round(size.northSouth)} × ${Math.round(size.eastWest)} km (0,5° × 0,625°): todos los puntos dentro reciben los mismos datos.`, `NASA POWER cell of ~${Math.round(size.northSouth)} × ${Math.round(size.eastWest)} km (0.5° × 0.625°): every point inside gets the same data.`)}</span></div>}
    <div className="map-caption">{t("Punto de referencia", "Reference point")} · {Number.isFinite(lat) ? lat.toFixed(4) : "—"}, {Number.isFinite(lon) ? lon.toFixed(4) : "—"}</div></div>
    {failed && <p className="notice" role="status">{t("No se pudo cargar una parte del mapa. Puedes continuar con las coordenadas.", "Part of the map could not load. You can continue with the coordinates.")}</p>}
    {Number.isFinite(lat) && Math.abs(lat) > 85 && <p className="notice">{t("Zona polar: la proyección Mercator no permite mostrar este punto exacto. La consulta NASA utiliza tus coordenadas originales.", "Polar zone: the Mercator projection cannot show this exact point. The NASA request uses your original coordinates.")}</p>}
    <label className="check-label switch"><input type="checkbox" checked={showCover} onChange={e => { setShowCover(e.target.checked); setCoverFailed(false); }} /> {t("Mostrar cobertura terrestre ESA · 2021", "Show ESA land cover · 2021")}</label>
    {showCover && <div className="small"><p role="status">{coverFailed ? t("Algunas teselas ESA no están disponibles. La vista puede estar incompleta; desactiva la capa para continuar.", "Some ESA tiles are unavailable. The view may be incomplete; turn the layer off to continue.") : coverLoaded ? t("Capa ESA: datos recibidos; pueden quedar teselas pendientes.", "ESA layer: data received; some tiles may still be loading.") : t("Cargando capa ESA…", "Loading ESA layer…")}</p><p>ESA WorldCover {worldCover.version} · {t("10 m nominales · clasificación histórica, no imagen actual. La capa incluye cultivos y otras coberturas; no identifica especies, límites ni rotaciones. Disponibilidad del servicio: latitudes −60° a 83°.", "10 m nominal · historical classification, not a current image. It includes cropland and other covers; it does not identify species, boundaries or rotations. Service coverage: latitudes −60° to 83°.")}</p><p>{worldCoverAttribution}. <a href={worldCover.documentation} target="_blank" rel="noreferrer">{t("Fuente, leyenda y licencia CC BY 4.0", "Source, legend and CC BY 4.0 licence")}</a></p></div>}
    <p className="small muted">{t("Haz clic para ubicar el terreno. El punto no delimita una propiedad. Mapa base: OpenStreetMap. La capa ESA es contexto visual y no se utiliza para recomendar cultivos.", "Click to place the field. The point does not delimit a property. Base map: OpenStreetMap. The ESA layer is visual context and is not used to recommend crops.")}</p>
  </div>;
}
