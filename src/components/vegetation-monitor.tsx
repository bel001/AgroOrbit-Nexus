"use client";
import { useEffect, useRef, useState } from "react";
import { addDays, type Farm } from "@/lib/model";
import type { Vegetation } from "@/lib/vegetation";
import { useT } from "./i18n";

export default function VegetationMonitor({ farm, onLoaded }: { farm: Farm; onLoaded: (value: Vegetation | null) => void }) {
  const t = useT();
  const [start, setStart] = useState(farm.start < "2000-02-18" ? "2000-02-18" : farm.start);
  const [end, setEnd] = useState(addDays(start, Math.min(119, farm.horizonDays - 1)));
  const [data, setData] = useState<Vegetation | null>(null);
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const query = async () => {
    controller.current?.abort(); const active = new AbortController(); controller.current = active;
    setLoading(true); setError(""); setData(null); onLoaded(null);
    try {
      const params = new URLSearchParams({ lat: String(farm.lat), lon: String(farm.lon), start, end });
      const response = await fetch(`/api/vegetation?${params}`, { signal: AbortSignal.any([active.signal, AbortSignal.timeout(40_000)]) });
      const body = await response.json();
      if (active.signal.aborted) return;
      if (!response.ok) throw new Error("MODIS unavailable");
      setData(body.vegetation); onLoaded(body.vegetation);
    } catch { if (!active.signal.aborted) setError(t("No se pudo verificar MODIS. Revisa fechas (máximo 120 días) o reintenta. Tu informe sigue disponible.", "MODIS could not be verified. Check dates (120 days maximum) or retry. Your report is still available.")); }
    finally { if (!active.signal.aborted) setLoading(false); }
  };
  return <details className="vegetation-monitor soft-details"><summary>{t("Vegetación del entorno · NASA MODIS (opcional)", "Surrounding vegetation · NASA MODIS (optional)")}</summary>
    <p>{t("NDVI de un píxel nominal de 250 m en compuestos de hasta 16 días. Puede mezclar terrenos: no representa una parcela pequeña ni identifica su cultivo. No modifica las alternativas ni sus puntuaciones.", "NDVI from one nominal 250 m pixel in composites of up to 16 days. It may mix fields: it does not represent a small plot or identify its crop. Options and scores are unaffected.")}</p>
    <div className="two-col">
      <label>{t("Inicio de la serie NDVI", "NDVI series start")}<input type="date" min="2000-02-18" value={start} disabled={loading} onChange={e => { setStart(e.target.value); setData(null); onLoaded(null); }} /></label>
      <label>{t("Fin de la serie NDVI", "NDVI series end")}<input type="date" min={start} value={end} disabled={loading} onChange={e => { setEnd(e.target.value); setData(null); onLoaded(null); }} /></label>
    </div>
    <button type="button" className="button secondary" disabled={loading} onClick={() => void query()}>{loading ? t("Consultando MODIS…", "Querying MODIS…") : t("Consultar NDVI del entorno", "Get surrounding NDVI")}</button>
    {error && <p role="alert" className="notice">{error}</p>}
    {data && <div className="vegetation-results">
      <p role="status">{data.validCount}/{data.totalCount} {t("observaciones aceptadas por calidad", "observations accepted by quality")} · {data.query.lat}, {data.query.lon} · {data.query.start} → {data.query.end}.</p>
      <p className="small muted">{t("Un píxel muestreado", "One sampled pixel")} · {data.grid.cellSizeM.toFixed(2)} m · {t("Colección: no declarada por el servicio; API v1. Consulta", "Collection: not declared by the service; API v1. Retrieved")} {data.retrievedAt}.</p>
      {farm.areaHa !== null && farm.areaHa < data.grid.cellSizeM ** 2 / 10000 && <p className="notice neutral">{t("Tu superficie es menor que un píxel MODIS. Es contexto del entorno; no permite concluir sobre tu parcela.", "Your area is smaller than one MODIS pixel. This is surrounding context; plot-level conclusions cannot be drawn.")}</p>}
      <div className="table-scroll" tabIndex={0} role="region" aria-label={t("Tabla de observaciones NDVI", "NDVI observations table")}><table>
        <caption>{t("Mismo producto y píxel; equivalencia fenológica sin validar. No se calcula una tendencia entre campañas.", "Same product and pixel; phenological equivalence is unverified. No cross-season trend is computed.")}</caption>
        <thead><tr><th>{t("Compuesto", "Composite")}</th><th>{t("Fecha observada", "Observation date")}</th><th>NDVI</th><th>{t("Calidad", "Quality")}</th></tr></thead>
        <tbody>{data.observations.map(o => <tr key={o.date}><td>{o.date} → {o.compositeEnd}</td><td>{o.observedDate ?? "—"}</td><td>{o.ndvi === null ? t("Sin dato utilizable", "No usable observation") : o.ndvi.toFixed(4)}</td><td>{o.valid ? t("Aceptada", "Accepted") : t("Descartada", "Rejected")} · QA {o.qa ?? "—"} · reliability {o.reliability ?? "—"}</td></tr>)}</tbody>
      </table></div>
      {!data.validCount && <p className="notice">{t("Sin observaciones útiles: resultado no concluyente.", "No usable observations: inconclusive result.")}</p>}
      <p className="small muted">{t("Las banderas descartan nubes, sombras, nieve, agua, aerosol alto y calidad insuficiente. NDVI no demuestra degradación, fertilidad, plagas ni rendimiento; cosecha, clima y manejo pueden producir cambios parecidos.", "Flags reject clouds, shadows, snow, water, high aerosol and insufficient quality. NDVI does not establish degradation, fertility, pests or yield; harvest, weather and management may produce similar changes.")}</p>
      <p className="small"><a href={data.urls.subset} target="_blank" rel="noreferrer">{t("Respuesta de origen ORNL DAAC", "Original ORNL DAAC response")}</a> · <a href={data.qualityGuide} target="_blank" rel="noreferrer">{t("Guía de calidad MOD13", "MOD13 quality guide")}</a>. NASA MODIS Terra / ORNL DAAC · {t("Incluido en la descarga JSON.", "Included in the JSON download.")}</p>
    </div>}
  </details>;
}
