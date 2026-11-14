"use client";
import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { worldCover, worldCoverTileUrl, worldCoverAttribution } from "@/lib/sources";
type Props = { lat: number; lon: number; onSelect: (lat: number, lon: number) => void };
export default function FarmMap({ lat, lon, onSelect }: Props) {
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
      instance = new maplibregl.Map({ container: container.current, center: hasPoint ? [initial.current.lon, Math.max(-85, Math.min(85, initial.current.lat))] : [0, 15], zoom: hasPoint ? 9 : 1, minZoom: 0, maxZoom: 17, cooperativeGestures: true, style: {
        version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' } },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      } });
      map.current = instance;
      if (hasPoint && Math.abs(initial.current.lat) <= 85) marker.current = new maplibregl.Marker({ color: "#21634b" }).setLngLat([initial.current.lon, initial.current.lat]).addTo(instance);
      instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      instance.on("click", e => callback.current(Number(e.lngLat.lat.toFixed(5)), Number(((((e.lngLat.lng + 180) % 360 + 360) % 360) - 180).toFixed(5))));
      instance.on("error", e => { if ("sourceId" in e && e.sourceId === "worldcover") setCoverFailed(true); else setFailed(true); });
      instance.on("idle", () => { if (instance.getSource("worldcover") && instance.getLayoutProperty("worldcover", "visibility") !== "none" && instance.isSourceLoaded("worldcover")) setCoverLoaded(true); });
    } catch { queueMicrotask(() => setFailed(true)); }
    return () => { marker.current?.remove(); instance?.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      if (Math.abs(lat) <= 85 && map.current) {
        marker.current ??= new maplibregl.Marker({ color: "#21634b" }).setLngLat([lon, lat]).addTo(map.current);
        marker.current.setLngLat([lon, lat]);
      } else { marker.current?.remove(); marker.current = null; }
      map.current?.jumpTo({ center: [lon, Math.max(-85, Math.min(85, lat))] });
    } else { marker.current?.remove(); marker.current = null; map.current?.jumpTo({ center: [0, 15], zoom: 1 }); }
  }, [lat, lon]);
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const apply = () => {
      if (showCover && !instance.getSource("worldcover")) {
        instance.addSource("worldcover", { type: "raster", tiles: [worldCoverTileUrl], tileSize: 256, bounds: [-180, -60, 180, 83], maxzoom: 14, attribution: worldCoverAttribution });
        instance.addLayer({ id: "worldcover", type: "raster", source: "worldcover", paint: { "raster-opacity": 0.65 } });
      }
      if (instance.getLayer("worldcover")) instance.setLayoutProperty("worldcover", "visibility", showCover ? "visible" : "none");
    };
    if (instance.isStyleLoaded()) apply(); else instance.once("load", apply);
    return () => { instance.off("load", apply); };
  }, [showCover]);
  return <div className="map-wrap"><button className="button secondary" type="button" onClick={() => map.current?.jumpTo({ center: [0, 15], zoom: 1 })}>Ver mapa mundial</button><div ref={container} className="map" role="region" aria-label="Mapa mundial. Alternativa accesible: campos de latitud y longitud." />
    <div className="map-caption">Punto de referencia · {Number.isFinite(lat) ? lat.toFixed(4) : "—"}, {Number.isFinite(lon) ? lon.toFixed(4) : "—"}</div>
    {failed && <p className="notice" role="status">No se pudo cargar una parte del mapa. Puedes continuar con las coordenadas.</p>}
    {Number.isFinite(lat) && Math.abs(lat) > 85 && <p className="notice">Zona polar: la proyección Mercator no permite mostrar este punto exacto. La consulta NASA utiliza tus coordenadas originales.</p>}
    <label className="check-label"><input type="checkbox" checked={showCover} onChange={e => { setShowCover(e.target.checked); setCoverFailed(false); setCoverLoaded(false); }} /> Mostrar cobertura terrestre ESA · 2021</label>
    {showCover && <div className="small"><p role="status">{coverFailed ? "Capa ESA no disponible para esta vista. Desactívala para continuar; no se sustituye por datos de ejemplo." : coverLoaded ? "Capa ESA cargada." : "Cargando capa ESA…"}</p><p>ESA WorldCover {worldCover.version} · 10 m nominales · clasificación histórica, no imagen actual. La capa incluye cultivos y otras coberturas; no identifica especies, límites ni rotaciones. Disponibilidad del servicio: latitudes −60° a 83°.</p><p>{worldCoverAttribution}. <a href={worldCover.documentation} target="_blank" rel="noreferrer">Fuente, leyenda y licencia CC BY 4.0</a></p></div>}
    <p className="small muted">Haz clic para ubicar el terreno. El punto no delimita una propiedad. Mapa base: OpenStreetMap. La capa ESA es contexto visual y no se utiliza para recomendar cultivos.</p>
  </div>;
}
