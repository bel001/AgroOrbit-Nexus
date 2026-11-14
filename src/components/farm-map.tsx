"use client";
import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
type Props = { lat: number; lon: number; onSelect: (lat: number, lon: number) => void };
export default function FarmMap({ lat, lon, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const callback = useRef(onSelect);
  const initial = useRef({ lat, lon });
  const [failed, setFailed] = useState(false);
  useEffect(() => { callback.current = onSelect; }, [onSelect]);
  useEffect(() => {
    if (!container.current) return;
    let instance: maplibregl.Map;
    try {
      maplibregl.setWorkerUrl("/vendor/maplibre-gl-worker.mjs");
      instance = new maplibregl.Map({ container: container.current, center: [initial.current.lon, initial.current.lat], zoom: 9, maxZoom: 17, cooperativeGestures: true, style: {
        version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' } },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      } });
      map.current = instance;
      marker.current = new maplibregl.Marker({ color: "#21634b" }).setLngLat([initial.current.lon, initial.current.lat]).addTo(instance);
      instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      instance.on("click", e => callback.current(Number(e.lngLat.lat.toFixed(5)), Number(e.lngLat.lng.toFixed(5))));
      instance.on("error", () => setFailed(true));
    } catch { queueMicrotask(() => setFailed(true)); }
    return () => { marker.current?.remove(); instance?.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      marker.current?.setLngLat([lon, lat]); map.current?.jumpTo({ center: [lon, lat] });
    }
  }, [lat, lon]);
  return <div className="map-wrap"><div ref={container} className="map" role="region" aria-label="Mapa de referencia del terreno. Alternativa accesible: campos de latitud y longitud." />
    <div className="map-caption">Punto de referencia · {Number.isFinite(lat) ? lat.toFixed(4) : "—"}, {Number.isFinite(lon) ? lon.toFixed(4) : "—"}</div>
    {failed && <p className="notice" role="status">No se pudo cargar una parte del mapa. Puedes continuar con las coordenadas.</p>}
    <p className="small muted">Haz clic para ubicar el terreno. El punto no delimita una propiedad. Mapa: OpenStreetMap, sin imágenes satelitales.</p>
  </div>;
}
