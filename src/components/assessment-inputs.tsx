"use client";
import type { Farm } from "@/lib/model";
import { useT } from "./i18n";
const numberOrNull = (s: string) => s.trim() ? Number(s) : null;

export default function AssessmentInputs({ farm, onChange }: { farm: Farm; onChange: (patch: Partial<Farm>) => void }) {
  const t = useT();
  const soil = farm.soilDetails ?? { drainage: "desconocido" as const, organicMatterPct: null, salinityDsM: null, sampledOn: null, reference: "" };
  const water = farm.waterScenario ?? { effectiveRainPct: null, efficiencyPct: null, origin: "desconocido" as const, reference: "" };
  return <>
    <label>{t("Método de evapotranspiración", "Evapotranspiration method")}<select value={farm.etoMethod ?? "hargreaves"} onChange={e => onChange({ etoMethod: e.target.value as Farm["etoMethod"] })}>
      <option value="hargreaves">Hargreaves · FAO-56</option><option value="penman-monteith">Penman–Monteith · FAO-56</option>
    </select></label>
    <p className="small muted">{t("Penman–Monteith consulta radiación, punto de rocío, viento a 2 m y presión NASA. No sustituye datos faltantes ni constituye validación local. El histórico ilustrativo usa Hargreaves y se identifica por separado.", "Penman–Monteith requests NASA radiation, dew point, 2 m wind and pressure. Missing data are not substituted; local validation is still needed. The illustrative historical replay uses Hargreaves separately.")}</p>
    <details className="soft-details"><summary>{t("Análisis de suelo y supuestos de agua", "Soil analysis and water assumptions")}</summary>
      <div className="two-col">
        <label>{t("Drenaje declarado", "Declared drainage")}<select value={soil.drainage} onChange={e => onChange({ soilDetails: { ...soil, drainage: e.target.value as typeof soil.drainage } })}><option value="desconocido">{t("Desconocido", "Unknown")}</option><option value="bueno">{t("Bueno", "Good")}</option><option value="limitado">{t("Limitado", "Limited")}</option></select></label>
        <label>{t("Salinidad (dS/m, opcional)", "Salinity (dS/m, optional)")}<input type="number" min="0" max="100" step="any" value={soil.salinityDsM ?? ""} onChange={e => onChange({ soilDetails: { ...soil, salinityDsM: numberOrNull(e.target.value) } })} /></label>
        <label>{t("Materia orgánica (%, opcional)", "Organic matter (%, optional)")}<input type="number" min="0" max="100" step="any" value={soil.organicMatterPct ?? ""} onChange={e => onChange({ soilDetails: { ...soil, organicMatterPct: numberOrNull(e.target.value) } })} /></label>
        <label>{t("Fecha del análisis de suelo", "Soil analysis date")}<input type="date" value={soil.sampledOn ?? ""} onChange={e => onChange({ soilDetails: { ...soil, sampledOn: e.target.value || null } })} /></label>
      </div>
      <label>{t("Fuente del análisis de suelo", "Soil analysis reference")}<input maxLength={300} value={soil.reference} onChange={e => onChange({ soilDetails: { ...soil, reference: e.target.value } })} /></label>
      <p className="small muted">{t("Los siguientes porcentajes son supuestos que tú documentas para explorar un escenario. No se deducen del sistema de riego ni se consideran mediciones de lluvia efectiva.", "The following percentages are assumptions you document to explore a scenario. They are not inferred from the irrigation system or treated as measured effective rainfall.")}</p>
      <div className="two-col">
        <label>{t("Fracción de lluvia de grilla utilizable (%)", "Usable fraction of grid rainfall (%)")}<input type="number" min="0" max="100" step="any" value={water.effectiveRainPct ?? ""} onChange={e => onChange({ waterScenario: { ...water, effectiveRainPct: numberOrNull(e.target.value) } })} /></label>
        <label>{t("Eficiencia de aplicación supuesta (%)", "Assumed application efficiency (%)")}<input type="number" min="0.1" max="100" step="any" value={water.efficiencyPct ?? ""} onChange={e => onChange({ waterScenario: { ...water, efficiencyPct: numberOrNull(e.target.value) } })} /></label>
        <label>{t("Procedencia de los supuestos", "Assumption provenance")}<select value={water.origin} onChange={e => onChange({ waterScenario: { ...water, origin: e.target.value as typeof water.origin } })}><option value="desconocido">{t("Desconocido", "Unknown")}</option><option value="declarado">{t("Declarado", "Declared")}</option><option value="estimado">{t("Estimado", "Estimated")}</option><option value="medido">{t("Medido", "Measured")}</option></select></label>
        <label>{t("Referencia o explicación de los supuestos", "Assumption reference or explanation")}<input maxLength={300} value={water.reference} onChange={e => onChange({ waterScenario: { ...water, reference: e.target.value } })} /></label>
      </div>
    </details>
  </>;
}
