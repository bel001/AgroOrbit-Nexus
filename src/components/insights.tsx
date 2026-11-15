"use client";
import { Droplets, Sprout, Waves, ThermometerSun, CheckCircle2, MinusCircle, Info } from "lucide-react";
import { bottomLine, toM3PerHa } from "@/lib/bottom-line";
import { soilCard } from "@/lib/soil";
import type { EvidenceReport, Strategy } from "@/lib/rotations";
import { useLang, useNum, useT } from "./i18n";

const STRATEGY_NAMES_EN: Record<string, string> = {
  "Secuencia aportada por el usuario": "Farmer's own sequence",
  "Alternancia con leguminosa": "Alternating with a legume",
  "Tres especies candidatas": "Three candidate species",
};
export function useStrategyName() {
  const lang = useLang();
  return (s: Pick<Strategy, "name">) => lang === "en" ? STRATEGY_NAMES_EN[s.name] ?? s.name : s.name;
}

export const EXPLORATION_LABEL = "Exploration, not a recommendation · No regional agronomist validation yet";
export function ExplorationTag() {
  return <span className="explore-tag" lang="en">{EXPLORATION_LABEL}</span>;
}

/** Data-generated one-sentence comparison shown at the top of step 4. */
export function BottomLine({ report }: { report: EvidenceReport }) {
  const t = useT(); const lang = useLang();
  const line = bottomLine(report.strategies);
  if (!line) return null;
  return <div className="bottom-line" role="note" aria-label="Bottom line">
    <h3 className="bottom-line-title" lang="en">Bottom line</h3>
    <p>{line[lang]}</p>
    <div className="bottom-line-foot"><ExplorationTag /><span className="small muted">{t("Calculado con NASA POWER y FAO-56 para este escenario; no es una recomendación.", "Computed from NASA POWER and FAO-56 for this scenario; not a recommendation.")}</span></div>
  </div>;
}

/** In Virú, irrigation water comes from the Chavimochic canal system fed by the Santa river, not from rain. */
export function ViruWaterContext() {
  const t = useT();
  return <aside className="water-context">
    <Waves size={22} aria-hidden="true" />
    <div>
      <h3>{t("En Virú el agua llega por canal, no por lluvia", "In Virú, water arrives by canal, not by rain")}</h3>
      <p>{t("El riego del valle depende del Proyecto Especial Chavimochic, que abastece de agua a los valles de Chao, Virú y Moche captándola del río Santa. Por eso aquí importa cuánta agua necesita cada rotación, en m³ por hectárea.",
        "Irrigation in the valley depends on the Chavimochic Special Project, which supplies water to the Chao, Virú and Moche valleys by drawing it from the Santa river. That is why what matters here is how much water each rotation needs, in m³ per hectare.")}</p>
      <p className="small">{t("Fuentes oficiales", "Official sources")}: <a href="https://www.gob.pe/institucion/chavimochic/institucional" target="_blank" rel="noreferrer">gob.pe · Chavimochic</a> · <a href="https://www.gob.pe/institucion/chavimochic/noticias/1444272-chavimochic-proyecta-su-futuro-hidrico-solicita-ampliar-la-reserva-del-rio-santa" target="_blank" rel="noreferrer">{t("gob.pe · reserva del río Santa", "gob.pe · Santa river reserve")}</a></p>
    </div>
  </aside>;
}

/** Water demand per option: m³/ha is the headline, mm secondary; optional user tariff; model rain de-emphasised. */
export function WaterCard({ report, tariff, onTariff }: { report: EvidenceReport; tariff: string; onTariff: (v: string) => void }) {
  const t = useT(); const num = useNum(); const name = useStrategyName();
  const rows = report.strategies.filter(s => s.water?.etcMm != null);
  if (!rows.length) return null;
  const max = Math.max(...rows.map(s => s.water!.etcMm!));
  const price = tariff.trim() === "" ? null : Number(tariff.replace(",", "."));
  const validPrice = price !== null && Number.isFinite(price) && price >= 0 ? price : null;
  return <div className="water-card">
    <div className="water-card-head"><Droplets size={20} aria-hidden="true" /><h3>{t("Agua que necesita cada rotación", "Water each rotation needs")}</h3></div>
    <p className="small muted">{t("Demanda de agua del cultivo (ETc, FAO-56) durante todas las campañas del periodo. 1 mm = 10 m³/ha.", "Crop water demand (ETc, FAO-56) over all campaigns in the period. 1 mm = 10 m³/ha.")}</p>
    <ul className="water-bars">{rows.map((s, i) => {
      const etc = s.water!.etcMm!; const m3 = toM3PerHa(etc);
      return <li key={s.id} style={{ "--i": i } as React.CSSProperties}>
        <span className="water-label"><b>{s.id}</b> {name(s)}</span>
        <span className="water-track"><span className="water-fill" style={{ width: `${(etc / max) * 100}%` }} /></span>
        <span className="water-value"><strong className="m3">{num(Math.round(m3 / 10) * 10)} m³/ha</strong><small>{num(Math.round(etc))} mm{validPrice !== null ? ` · ≈ S/ ${num(Math.round(m3 * validPrice))} /ha` : ""}</small></span>
      </li>;
    })}</ul>
    <div className="tariff">
      <label>{t("Tu tarifa de agua (S/ por m³, opcional)", "Your water tariff (S/ per m³, optional)")}<input inputMode="decimal" value={tariff} placeholder={t("Vacío = sin soles", "Empty = no soles shown")} onChange={e => onTariff(e.target.value)} /></label>
      <p className="small muted">{validPrice === null
        ? t("Sin tarifa no se muestran costos. AgroOrbit no usa tarifas por defecto.", "Without a tariff no costs are shown. AgroOrbit never uses a default tariff.")
        : t(`Costo = m³/ha × S/ ${tariff} que ingresaste. Es la demanda del cultivo, no tu recibo: no incluye pérdidas de riego ni cargos fijos.`, `Cost = m³/ha × the S/ ${tariff} you entered. It is crop demand, not your bill: no irrigation losses or fixed charges.`)}</p>
    </div>
    <details className="rain-note">
      <summary>{t("Lluvia del modelo (poco fiable en el desierto costero)", "Model rainfall (unreliable in the coastal desert)")}</summary>
      <p className="small muted">{t("Precipitación de grilla NASA POWER durante las campañas", "NASA POWER grid rainfall during the campaigns")}: {rows.map(s => `${s.id} ${num(Math.round(s.water!.rainMm ?? 0))} mm`).join(" · ")}. {t("En el desierto costero el modelo puede estar muy lejos de la realidad; no se usa para ordenar opciones.", "In the coastal desert the model can be far from reality; it is not used to rank options.")}</p>
    </details>
  </div>;
}

/** Soil-health card per option: four indicators with why it matters and an FAO source. */
export function SoilCards({ report }: { report: EvidenceReport }) {
  const t = useT(); const lang = useLang(); const name = useStrategyName();
  const options = report.strategies.filter(s => s.status !== "Incompatible");
  if (!options.length) return null;
  return <div className="soil-section">
    <h3 className="soil-title"><Sprout size={20} aria-hidden="true" /> {t("Salud del suelo por opción", "Soil health by option")}</h3>
    <div className="soil-grid">{options.map(s => <article className="soil-card" key={s.id} aria-label={`Soil health ${s.id}`}>
      <header><span className="strategy-chip">{s.id}</span><strong>{name(s)}</strong></header>
      <ul>{soilCard(s).map(ind => <li key={ind.id} className={ind.good === true ? "good" : ind.good === false ? "weak" : ""}>
        <span className="ind-icon" aria-hidden="true">{ind.good === true ? <CheckCircle2 size={18} /> : ind.good === false ? <MinusCircle size={18} /> : <Info size={18} />}</span>
        <div><span className="ind-label">{ind.label[lang]}</span><span className="ind-value">{ind.value[lang]}</span>
          <small>{ind.why[lang]} <a href={ind.source.url} target="_blank" rel="noreferrer">{ind.source.label}</a></small></div>
      </li>)}</ul>
    </article>)}</div>
  </div>;
}

/** El Niño replay table: extra water each option would have needed in past El Niño seasons. */
export function ElNinoTable({ report }: { report: EvidenceReport }) {
  const t = useT(); const lang = useLang(); const num = useNum(); const name = useStrategyName();
  const st = report.stressTest;
  if (!st) return null;
  const tag = (a: string) => a === "above" ? t("por encima del rango 1991–2020", "above the 1991–2020 range") : a === "below" ? t("por debajo del rango 1991–2020", "below the 1991–2020 range") : a === "none" ? t("sin anomalía en estos datos", "no anomaly in these data") : t("sin datos", "no data");
  return <div className="elnino-card">
    <div className="water-card-head"><ThermometerSun size={20} aria-hidden="true" /><h3>{t("Prueba de estrés: ¿cómo le habría ido con El Niño?", "Stress test: how would it have handled El Niño?")}</h3></div>
    <p className="small muted">{t("Cada rotación se repite con las temperaturas reales de NASA POWER de esos años y se compara con 27 temporadas normales (1991–2020, sin los años del evento). Es una repetición histórica, no un pronóstico.",
      "Each rotation is replayed with real NASA POWER temperatures from those years and compared with 27 normal seasons (1991–2020, event years excluded). A historical replay, not a forecast.")}</p>
    <div className="table-scroll" tabIndex={0} role="region" aria-label={t("Tabla de El Niño", "El Niño table")}>
      <table className="elnino-table"><caption>{t("Agua extra que habría pedido cada opción (ETc) frente al promedio 1991–2020, en m³/ha.", "Extra water each option would have needed (ETc) versus the 1991–2020 average, in m³/ha.")}</caption>
        <thead><tr><th>{t("Opción", "Option")}</th>{st.strategies[0].events.map(e => <th key={e.event}>{e.label}</th>)}</tr></thead>
        <tbody>{st.strategies.map(s => <tr key={s.id}><th><span className="strategy-chip">{s.id}</span> {name(s)}</th>
          {s.events.map(e => <td key={e.event} className={e.anomaly === "above" ? "anom" : ""}>
            {e.deltaM3PerHa === null ? "—" : <><strong>{e.deltaM3PerHa >= 0 ? "+" : "−"}{num(Math.abs(Math.round(e.deltaM3PerHa)))} m³/ha</strong><small>{tag(e.anomaly)}</small></>}
          </td>)}</tr>)}</tbody>
      </table>
    </div>
    <ul className="elnino-sentences">{st.strategies.map(s => <li key={s.id}>{s.sentence[lang]}</li>)}</ul>
    <p className="small muted">{t("Días de calor: no calculados, porque no se verificó un umbral de calor por cultivo con fuente. ETc = Kc × ET0 de Hargreaves (FAO-56): FAO-56 advierte que Hargreaves tiende a sobrestimar ET0 con humedad alta, frecuente en años de El Niño.",
      "Heat days: not computed, because no sourced crop-specific heat threshold was verified. ETc = Kc × Hargreaves ET0 (FAO-56): FAO-56 notes Hargreaves tends to overestimate ET0 under high humidity, common in El Niño years.")} {t("Datos", "Data")}: NASA POWER {lang === "en" ? "daily" : "diario"}, 1991-01-01 → 2025-06-23.</p>
  </div>;
}
