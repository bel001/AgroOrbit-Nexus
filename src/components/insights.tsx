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
export function WaterCard({ report, tariff, onTariff, currency, onCurrency }: { report: EvidenceReport; tariff: string; onTariff: (v: string) => void; currency: "PEN" | "USD" | "EUR"; onCurrency: (v: "PEN" | "USD" | "EUR") => void }) {
  const t = useT(); const num = useNum(); const name = useStrategyName();
  const rows = report.strategies.filter(s => s.water?.etcMm != null);
  if (!rows.length) return null;
  const max = Math.max(...rows.map(s => s.water!.etcMm!));
  const price = tariff.trim() === "" ? null : Number(tariff.replace(",", "."));
  const validPrice = price !== null && Number.isFinite(price) && price >= 0 ? price : null;
  const symbol = currency === "PEN" ? "S/" : currency;
  return <div className="water-card">
    <div className="water-card-head"><Droplets size={20} aria-hidden="true" /><h3>{t("Agua que necesita cada rotación", "Water each rotation needs")}</h3></div>
    <p className="small muted">{t("Demanda de agua del cultivo (ETc, FAO-56) durante todas las campañas del periodo. 1 mm = 10 m³/ha.", "Crop water demand (ETc, FAO-56) over all campaigns in the period. 1 mm = 10 m³/ha.")}</p>
    <ul className="water-bars">{rows.map((s, i) => {
      const etc = s.water!.etcMm!; const m3 = toM3PerHa(etc);
      return <li key={s.id} style={{ "--i": i } as React.CSSProperties}>
        <span className="water-label"><b>{s.id}</b> {name(s)}</span>
        <span className="water-track"><span className="water-fill" style={{ width: `${max > 0 ? (etc / max) * 100 : 0}%` }} /></span>
        <span className="water-value"><strong className="m3">{num(Math.round(m3 / 10) * 10)} m³/ha</strong><small>{num(Math.round(etc))} mm{validPrice !== null ? ` · ≈ ${symbol} ${num(Math.round(m3 * validPrice))} /ha` : ""}</small></span>
      </li>;
    })}</ul>
    <div className="tariff">
      <label>{t("Moneda de tu tarifa", "Tariff currency")}<select value={currency} onChange={e => onCurrency(e.target.value as typeof currency)}><option value="PEN">PEN · S/</option><option value="USD">USD</option><option value="EUR">EUR</option></select></label>
      <label>{t(`Tu tarifa de agua (${symbol} por m³, opcional)`, `Your water tariff (${symbol} per m³, optional)`)}<input inputMode="decimal" value={tariff} placeholder={t("Vacío = sin costos", "Empty = no costs shown")} onChange={e => onTariff(e.target.value)} /></label>
      <p className="small muted">{validPrice === null
        ? t("Sin tarifa no se muestran costos. AgroOrbit no usa tarifas por defecto.", "Without a tariff no costs are shown. AgroOrbit never uses a default tariff.")
        : t(`Escenario de costo = demanda ETc × ${symbol} ${tariff} que ingresaste. No representa volumen facturado, riego aplicado ni ahorro.`, `Cost scenario = ETc demand × the ${symbol} ${tariff} you entered. It is not billed water, applied irrigation or savings.`)}</p>
    </div>
    <details className="rain-note">
      <summary>{t("Lluvia de grilla: contexto, no lluvia efectiva", "Gridded rainfall: context, not effective rainfall")}</summary>
      <p className="small muted">{t("Precipitación de grilla NASA POWER durante las campañas", "NASA POWER grid rainfall during the campaigns")}: {rows.map(s => `${s.id} ${s.water!.rainMm === null ? t("sin datos completos", "incomplete data") : `${num(Math.round(s.water!.rainMm))} mm`}`).join(" · ")}. {t("Requiere contraste local; su representatividad depende de la región. No se usa para ordenar opciones.", "Requires local comparison; representativeness depends on the region. It is not used to rank options.")}</p>
    </details>
    {rows.some(s => s.water?.scenario) && <details className="rain-note"><summary>{t("Escenario de riego con tus supuestos", "Irrigation scenario with your assumptions")}</summary>
      <p className="small muted">{t("No es una programación de riego validada: no incluye almacenamiento del suelo, escorrentía ni lavado de sales. No afecta el ranking.", "Not a validated irrigation schedule: excludes soil storage, runoff and salt leaching. It does not affect ranking.")}</p>
      <ul>{rows.filter(s => s.water?.scenario).map(s => { const scenario = s.water!.scenario!; return <li key={s.id}>{s.id} · {t("Lluvia efectiva supuesta", "Assumed effective rain")}: {scenario.effectiveRainMm === null ? "—" : `${num(scenario.effectiveRainMm)} mm`} · {t("Riego neto / bruto estimado", "Estimated net / gross irrigation")}: {scenario.netIrrigationMm === null ? "—" : num(scenario.netIrrigationMm)} / {scenario.grossIrrigationMm === null ? "—" : num(scenario.grossIrrigationMm)} mm. {scenario.inputs?.reference}</li>; })}</ul>
    </details>}
  </div>;
}

/** Soil-health card per option: four indicators with why it matters and an FAO source. */
export function SoilCards({ report }: { report: EvidenceReport }) {
  const t = useT(); const lang = useLang(); const name = useStrategyName();
  const options = report.strategies.filter(s => s.status !== "Incompatible");
  if (!options.length) return null;
  return <div className="soil-section">
    <h3 className="soil-title"><Sprout size={20} aria-hidden="true" /> {t("Indicadores de manejo por opción", "Management indicators by option")}</h3>
    <p className="small muted">{t("Describen el plan de cultivos; no miden salud del suelo, fertilidad ni control de plagas.", "These describe the crop plan; they do not measure soil health, fertility or pest control.")}</p>
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
  if (!st || !st.strategies.length) return null;
  const tag = (a: string) => a === "above" ? t("por encima del rango 1991–2020", "above the 1991–2020 range") : a === "below" ? t("por debajo del rango 1991–2020", "below the 1991–2020 range") : a === "none" ? t("sin anomalía en estos datos", "no anomaly in these data") : t("sin datos", "no data");
  return <div className="elnino-card">
    <div className="water-card-head"><ThermometerSun size={20} aria-hidden="true" /><h3>{t("Prueba histórica de demanda hídrica", "Historical water-demand replay")}</h3></div>
    <p className="small muted">{t("Cada rotación se repite con las temperaturas de grilla NASA POWER de esos años y se compara con temporadas históricas de referencia. La referencia no equivale a temporadas climáticamente neutras. Es una repetición histórica, no un pronóstico ni un efecto causal de El Niño.",
      "Each rotation is replayed with NASA POWER gridded temperatures and compared with historical reference seasons. The reference does not mean climatically neutral seasons. This is a historical replay, not a forecast or a causal El Niño effect.")}</p>
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
