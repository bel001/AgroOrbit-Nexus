"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  AlertCircle, ArrowDown, ArrowRight, Check, CloudRain, Download, Droplets, Leaf, MapPin,
  Play, Printer, RotateCcw, Satellite, Sprout, Thermometer, CalendarDays, Plus, Trash2, ShieldCheck, Users,
} from "lucide-react";
import { addDays, farmSchema, latestPeriod, newGlobalFarm, POWER_LATENCY_DAYS, type Farm, type CropId, type Campaign, type Alternative } from "@/lib/model";
import { exampleFarm } from "@/lib/examples/viru";
import { catalog } from "@/lib/catalog";
import { monthlyClimate } from "@/lib/power";
import LocationSearch from "./location-search";
import HistoryEvidence from "./history-evidence";
import RegionalEvidence from "./regional-evidence";
import PriorityRanking from "./priority-ranking";
import { BottomLine, ElNinoTable, EXPLORATION_LABEL, SoilCards, ViruWaterContext, WaterCard, useStrategyName } from "./insights";
import { DEFAULT_WEIGHTS, rankStrategies, type Weights } from "@/lib/priorities";
import { CountUp, OrbitArt } from "./motion";
import { LangProvider, useNum, useT, type Lang } from "./i18n";
import { resolveCoverage } from "@/lib/regions";
import type { EvidenceReport } from "@/lib/rotations";

const FarmMap = dynamic(() => import("./farm-map"), { ssr: false, loading: () => <div className="map map-loading">Cargando mapa… / Loading map…</div> });
const ClimateChart = dynamic(() => import("./climate-chart"), { ssr: false, loading: () => <div className="chart skeleton" /> });

const numberOrNull = (s: string) => s.trim() === "" ? null : Number(s);
const crops = Object.keys(catalog) as CropId[];
const origins = ["desconocido", "declarado", "medido", "estimado"] as const;
const ORIGIN_EN: Record<string, string> = { desconocido: "unknown", declarado: "declared", medido: "measured", estimado: "estimated" };
const SOIL_EN: Record<string, string> = { desconocido: "unknown", arenoso: "sandy", franco: "loam", arcilloso: "clay" };
const IRRIGATION_EN: Record<string, string> = { desconocido: "unknown", secano: "rainfed", goteo: "drip", gravedad: "furrow / gravity" };
type T = (es: string, en: string) => string;

const STEPS = [
  { id: "terreno", es: "Terreno", en: "Field" },
  { id: "cultivos", es: "Cultivos", en: "Crops" },
  { id: "diagnostico", es: "Condiciones", en: "Conditions" },
  { id: "rotaciones", es: "Alternativas", en: "Options" },
  { id: "evidencias", es: "Evidencias", en: "Evidence" },
] as const;
type StepId = typeof STEPS[number]["id"];

function CropSelect({ value, onChange, label }: { value: CropId; onChange: (crop: CropId) => void; label: string }) {
  const t = useT();
  return <label>{label}<select value={value} onChange={e => onChange(e.target.value as CropId)}>{crops.map(c => <option key={c} value={c}>{t(catalog[c].names.es, catalog[c].names.en)}</option>)}</select></label>;
}
function OriginSelect({ value, onChange }: { value: Campaign["origin"]; onChange: (o: Campaign["origin"]) => void }) {
  const t = useT();
  return <label>{t("Procedencia", "Source")}<select value={value} onChange={e => onChange(e.target.value as Campaign["origin"])}>{origins.map(o => <option key={o} value={o}>{t(o, ORIGIN_EN[o])}</option>)}</select></label>;
}

/** Nueva campaña: empieza tras la última y dura lo mínimo del rango general FAO del cultivo. */
function nextCampaign(list: Campaign[], fallbackStart: string): Campaign {
  const crop = crops[0];
  const last = [...list].sort((a, b) => a.end.localeCompare(b.end)).at(-1);
  const start = last ? addDays(last.end, 1) : fallbackStart;
  return { crop, start, end: addDays(start, catalog[crop].days[0]), origin: "declarado" };
}

const FIELD_NAMES: Record<string, [string, string]> = {
  name: ["Nombre del terreno", "Field name"], lat: ["Latitud", "Latitude"], lon: ["Longitud", "Longitude"], areaHa: ["Área", "Area"], ph: ["pH", "pH"],
  waterMm: ["Agua total utilizable", "Total usable water"], waterOrigin: ["Procedencia del agua", "Water data source"], soilOrigin: ["Procedencia del suelo", "Soil data source"],
  start: ["Inicio del periodo", "Period start"], horizonDays: ["Duración del periodo", "Period length"], history: ["Historial", "History"],
  current: ["Lo que planeas sembrar (A)", "What you plan to grow (A)"], alternatives: ["Alternativas", "Options"],
};
const SUBFIELD_NAMES: Record<string, [string, string]> = { crop: ["cultivo", "crop"], start: ["siembra", "sowing"], end: ["cosecha", "harvest"], origin: ["procedencia", "source"], name: ["nombre", "name"], campaigns: ["ciclos", "cycles"] };
/** Convierte un error de validación en una frase que un agricultor entienda. */
function humanizeIssue(issue: { path: PropertyKey[]; message: string; code: string }, t: T) {
  const [root, index, sub, subIndex, field] = issue.path.map(String);
  const pick = (pair: [string, string] | undefined, fallback: string) => pair ? t(pair[0], pair[1]) : fallback;
  let where = pick(FIELD_NAMES[root], root);
  if (index !== undefined) where += root === "alternatives" ? ` ${String.fromCharCode(66 + Number(index))}` : ` · ${t("campaña", "campaign")} ${Number(index) + 1}`;
  if (sub !== undefined) where += ` · ${pick(SUBFIELD_NAMES[sub], sub)}`;
  if (subIndex !== undefined) where += ` ${Number(subIndex) + 1}`;
  if (field !== undefined) where += ` · ${pick(SUBFIELD_NAMES[field], field)}`;
  // Los mensajes propios (reglas "custom") están en español; los genéricos de Zod se traducen por tipo.
  const what = issue.code === "custom" ? issue.message
    : issue.code === "invalid_type" ? t("falta o no es un valor válido", "is missing or not a valid value") : issue.code === "too_small" ? t("está vacío o es demasiado pequeño", "is empty or too small") : issue.code === "too_big" ? t("es demasiado grande", "is too large") : t("no es válido", "is not valid");
  return `${where}: ${what}`;
}

function download(report: EvidenceReport, weights: Weights) {
  // The exported report carries the priority weights and the resulting order shown on screen.
  const ranking = report.strategies.length ? rankStrategies(report.strategies, weights) : null;
  const exported = { ...report, priorityRanking: ranking && { weights, formula: ranking.formula, usedCriteria: ranking.usedCriteria, note: ranking.note, order: ranking.ranked.map(r => ({ id: r.strategy.id, rank: r.rank, score: r.score, parts: r.parts, why: r.why })), label: EXPLORATION_LABEL } };
  const url = URL.createObjectURL(new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" }));
  const a = document.createElement("a"); a.href = url; a.download = "agroorbit-evidencia.json"; a.click(); URL.revokeObjectURL(url);
}

/** Resalta el paso visible en la navegación. */
function useActiveStep() {
  const [active, setActive] = useState<StepId>("terreno");
  useEffect(() => {
    let frame = 0;
    // Paso activo = último paso cuyo inicio ya pasó el 40 % superior de la ventana.
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const line = window.innerHeight * 0.4;
        let current: StepId = STEPS[0].id;
        for (const s of STEPS) { const el = document.getElementById(s.id); if (el && el.getBoundingClientRect().top <= line) current = s.id; }
        setActive(current);
      });
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", sync); window.removeEventListener("resize", sync); };
  }, []);
  return active;
}

/** Idioma: ?lang=en o la elección guardada; español por defecto. */
function useLanguage(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => {
    let initial: Lang | null = null;
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl === "en" || fromUrl === "es") initial = fromUrl;
    else { try { const saved = localStorage.getItem("agroorbit-lang"); if (saved === "en" || saved === "es") initial = saved; } catch { /* storage unavailable */ } }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only preferences after hydration
    if (initial) setLang(initial);
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const choose = (l: Lang) => { setLang(l); try { localStorage.setItem("agroorbit-lang", l); } catch { /* storage unavailable */ } };
  return [lang, choose];
}

/** New global analysis: the most recent 12 months NASA POWER should have complete. */
function freshGlobalFarm(): Farm {
  const { start, horizonDays } = latestPeriod(365);
  return { ...newGlobalFarm(), start, horizonDays };
}

function SectionHeading({ step, title, text, children }: { step: number; title: string; text: string; children?: React.ReactNode }) {
  return <div className="section-title">
    <div className="section-title-text"><h2><span className="step-num" aria-hidden="true">{step}</span>{title}</h2><p>{text}</p></div>
    {children}
  </div>;
}

function Loader() {
  const t = useT();
  return <div className="loader-card" aria-hidden="true">
    <OrbitArt size={120} className="spinning" />
    <div><strong>{t("Consultando NASA POWER…", "Querying NASA POWER…")}</strong><p>{t("Descargando temperaturas y lluvia diarias del punto elegido y calculando indicadores. Puede tardar hasta 25 segundos.", "Downloading daily temperature and rainfall for the chosen point and computing indicators. It can take up to 25 seconds.")}</p>
      <div className="loader-bar"><span /></div></div>
  </div>;
}

function ClimateKpis({ report }: { report: EvidenceReport }) {
  const t = useT();
  const climate = report.climate!;
  const months = monthlyClimate(climate);
  const temps = climate.days.flatMap(d => d.T2M === null ? [] : [d.T2M]);
  const rain = climate.days.reduce((s, d) => s + (d.PRECTOTCORR ?? 0), 0);
  const missing = Object.values(climate.missing).reduce((a, b) => a + b, 0);
  const meanT = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
  const items = [
    { icon: Thermometer, label: t("Temperatura media", "Mean temperature"), value: meanT, decimals: 1, suffix: " °C", muted: false },
    { icon: CalendarDays, label: t("Días consultados", "Days queried"), value: climate.days.length, decimals: 0, suffix: "", muted: false },
    { icon: AlertCircle, label: t("Valores faltantes", "Missing values"), value: missing, decimals: 0, suffix: "", muted: false },
    { icon: CloudRain, label: t("Lluvia total de grilla (modelo)", "Total grid rainfall (model)"), value: rain, decimals: 0, suffix: " mm", muted: true },
  ];
  return <div className="kpi-grid">{items.map((k, i) => <div className={`kpi${k.muted ? " kpi-muted" : ""}`} key={k.label} style={{ "--i": i } as React.CSSProperties}>
    <k.icon size={20} aria-hidden="true" /><span>{k.label}</span>
    <strong>{k.value === null ? t("Sin datos", "No data") : <CountUp value={k.value} decimals={k.decimals} suffix={k.suffix} />}</strong>
  </div>)}<p className="kpi-note small muted">{months.length} {t("meses · medias y sumas de días válidos. La lluvia del modelo puede estar muy lejos de la realidad en el desierto costero.", "months · means and sums of valid days. Model rainfall can be far from reality in the coastal desert.")}</p></div>;
}

function ComparisonTable({ report }: { report: EvidenceReport }) {
  const t = useT(); const num = useNum(); const name = useStrategyName();
  const mmCell = (v: number | null | undefined) => v === null || v === undefined ? t("No calculable · serie NASA incompleta", "Not computable · incomplete NASA series") : `${num(Math.round(v))} mm`;
  const m3Cell = (v: number | null | undefined) => v === null || v === undefined ? "—" : `${num(Math.round(v * 10 / 10) * 10)} m³/ha`;
  return <><p className="small muted scroll-hint">{t("En pantallas pequeñas, desliza la tabla para ver B y C.", "On small screens, swipe the table to see B and C.")}</p>
    <div className="table-scroll card flush" tabIndex={0} role="region" aria-label={t(`Comparación desplazable de ${report.strategies.length} estrategias`, `Scrollable comparison of ${report.strategies.length} options`)}><table className="comparison"><caption>{t("Comparación descriptiva de estrategias.", "Descriptive comparison of options.")} {report.coverage.demoAllowed ? t("B y C son propuestas ilustrativas de la demo; requieren validar variedades y ventanas locales. ", "B and C are illustrative demo options; local varieties and sowing windows still need validation. ") : ""}{report.strategies.some(s => s.userProposed) ? t("Las alternativas propias son escenarios tuyos, no recomendaciones.", "Your own options are your scenarios, not recommendations.") : report.strategies.length === 1 ? t("Solo hay una secuencia: añade alternativas en el paso 2 para compararlas.", "Only one sequence: add options in step 2 to compare them.") : ""}</caption><thead><tr><th>{t("Criterio", "Criterion")}</th>{report.strategies.map(s => <th key={s.id}><span className="strategy-id">{s.id}</span> {name(s)}</th>)}</tr></thead><tbody>
      <tr><th>{t("Secuencia", "Sequence")}</th>{report.strategies.map(s => <td key={s.id}>{s.campaigns.map((c, i) => <div className="cycle" key={i}><span className={`crop-dot ${c.crop}`} /><div><strong>{t(catalog[c.crop].names.es, catalog[c.crop].names.en)}</strong><small>{c.start} → {c.end}<br />{t(c.origin, ORIGIN_EN[c.origin])}</small></div></div>)}</td>)}</tr>
      <tr><th>{t("Agua que necesita (ETc)", "Water needed (ETc)")}</th>{report.strategies.map(s => <td key={s.id}><strong>{m3Cell(s.water?.etcMm)}</strong><small>{mmCell(s.water?.etcMm)}</small></td>)}</tr>
      <tr><th>{t("Familias botánicas", "Crop families")}</th>{report.strategies.map(s => <td key={s.id}>{s.families}</td>)}</tr>
      <tr><th>{t("Repetición máxima", "Max. repetition")}</th>{report.strategies.map(s => <td key={s.id}>{s.maxRepeat} {s.maxRepeat === 1 ? t("ciclo", "cycle") : t("ciclos", "cycles")}</td>)}</tr>
      <tr><th>{t("Días sin cultivo registrado", "Days without a recorded crop")}</th>{report.strategies.map(s => <td key={s.id}>{s.idleDays ?? t("No calculable", "Not computable")}</td>)}</tr>
      <tr><th>{t("Grados-día por campaña", "Degree-days per campaign")}</th>{report.strategies.map(s => <td key={s.id}>{s.water ? s.water.campaigns.map((c, i) => <div key={i}><small>{t(catalog[c.crop].names.es, catalog[c.crop].names.en)}: {c.gdd === null ? (c.gddBaseC === null ? t("sin base térmica documentada", "no documented base temperature") : t("datos incompletos", "incomplete data")) : `${num(Math.round(c.gdd))} °C·${t("día", "day")} (base ${c.gddBaseC} °C)`}</small></div>) : t("No calculable", "Not computable")}</td>)}</tr>
      <tr className="row-muted"><th>{t("Lluvia del modelo en campañas", "Model rainfall in campaigns")}</th>{report.strategies.map(s => <td key={s.id}>{mmCell(s.water?.rainMm)}</td>)}</tr>
      <tr className="row-muted"><th>{t("Validación", "Validation")}</th>{report.strategies.map(s => <td key={s.id}>{s.status === "Incompatible" ? <span className="status bad">{t("Incompatible", "Incompatible")}</span> : <span className="status-secondary">{t("Sin validación agronómica regional", "No regional agronomist validation")}</span>}</td>)}</tr>
    </tbody></table></div></>;
}

export default function Workspace() {
  const [lang, setLang] = useLanguage();
  return <LangProvider value={lang}><WorkspaceView lang={lang} setLang={setLang} /></LangProvider>;
}

function WorkspaceView({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const t: T = (es, en) => lang === "en" ? en : es;
  const [initialFarm] = useState<Farm>(newGlobalFarm);
  const [latestEnd, setLatestEnd] = useState<string | null>(null);
  const [farm, setFarm] = useState<Farm>(initialFarm);
  // The page is prerendered at build time: compute "the last 12 months" in the browser, not at build.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- date-dependent default, browser only (page is prerendered)
    setFarm(f => f === initialFarm ? { ...f, ...latestPeriod(365) } : f);
    setLatestEnd(latestPeriod().end);
  }, [initialFarm]);
  const [report, setReport] = useState<EvidenceReport | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [climateError, setClimateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [tariff, setTariff] = useState("");
  const active = useActiveStep();
  const coverage = resolveCoverage(farm);
  const hasPoint = Number.isFinite(farm.lat) && Number.isFinite(farm.lon);

  // Cualquier corrección retira los avisos anteriores; se vuelven a validar al consultar.
  const update = (patch: Partial<Farm>) => { setFarm(f => ({ ...f, ...patch })); setDirty(true); setErrors([]); };
  // Mover el punto anula la plantilla regional (p. ej. la demo de Virú), pero conserva el tipo de análisis elegido.
  const location = (patch: Partial<Farm>) => update({ ...patch, regionProfileId: null });
  const campaign = (key: "history" | "current", i: number, patch: Partial<Campaign>) => update({ [key]: farm[key].map((c, index) => index === i ? { ...c, ...patch } : c) });
  const scrollTo = (id: string) => setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "instant" }), 50);
  const showErrors = (list: string[]) => {
    setErrors(list);
    setTimeout(() => { const box = document.getElementById("form-errors"); box?.scrollIntoView({ behavior: "instant", block: "center" }); box?.focus({ preventScroll: true }); }, 50);
  };
  const altOffset = coverage.demoAllowed ? 3 : 1;
  const setAlternative = (i: number, patch: Partial<Alternative>) => update({ alternatives: farm.alternatives.map((a, n) => n === i ? { ...a, ...patch } : a) });
  const altCampaign = (ai: number, ci: number, patch: Partial<Campaign>) => setAlternative(ai, { campaigns: farm.alternatives[ai].campaigns.map((c, n) => n === ci ? { ...c, ...patch } : c) });

  async function runAnalysis(input: Farm) {
    setErrors([]);
    if (!Number.isFinite(input.lat) || !Number.isFinite(input.lon)) { showErrors([t("Falta la ubicación del terreno: busca una localidad, pulsa «Usar mi ubicación» o haz clic en el mapa.", "The field location is missing: search for a place, press “Use my location” or click on the map.")]); return; }
    const parsed = farmSchema.safeParse(input);
    if (!parsed.success) { showErrors(parsed.error.issues.map(i => humanizeIssue(i, t))); return; }
    setLoading(true); setReport(null); setClimateError(null);
    scrollTo("diagnostico");
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data), signal: AbortSignal.timeout(35_000) });
      const result = await response.json();
      if (!response.ok) { showErrors([result.error, ...(result.issues ?? [])]); return; }
      setReport(result.report); setClimateError(result.climateError); setDirty(false);
      scrollTo(result.report.strategies.length ? "rotaciones" : "diagnostico");
    } catch { showErrors([t("No se pudo contactar con el servidor. Comprueba la conexión y vuelve a consultar.", "Could not reach the server. Check the connection and try again.")]); }
    finally { setLoading(false); }
  }
  const analyze = (e: React.FormEvent) => { e.preventDefault(); void runAnalysis(farm); };
  const tryDemo = () => { const demo = structuredClone(exampleFarm); setFarm(demo); void runAnalysis(demo); };

  const done: Record<StepId, boolean> = {
    terreno: hasPoint,
    cultivos: farm.history.length + farm.current.length > 0 || (Boolean(report) && farm.analysisMode === "climate"),
    diagnostico: Boolean(report),
    rotaciones: Boolean(report && report.strategies.length),
    evidencias: Boolean(report),
  };
  const progress = STEPS.filter(s => done[s.id]).length;
  const coverageReason = coverage.profile ? t("Perfil de demostración sin validación agronómica. No genera recomendaciones.", "Demo profile without agronomic validation. It makes no recommendations.") : t("Sin perfil regional aplicable a estas coordenadas. Solo clima y comprobaciones descriptivas de registros aportados.", "No regional profile applies to these coordinates. Climate and descriptive checks of your records only.");
  const isViruDemo = Boolean(report?.coverage.demoAllowed);

  return <>
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#inicio"><span className="brand-mark"><Sprout size={22} aria-hidden="true" /></span><span>AgroOrbit <strong>Nexus</strong><small>From Space to Soil</small></span></a>
        <nav className="steps" aria-label={t("Cinco pasos del análisis", "Five analysis steps")}>
          {STEPS.map((s, i) => <a key={s.id} href={`#${s.id}`} className={`${active === s.id ? "is-active" : ""} ${done[s.id] ? "is-done" : ""}`} aria-current={active === s.id ? "step" : undefined}>
            <span className="step-dot" aria-hidden="true">{done[s.id] ? <Check size={14} /> : i + 1}</span><span className="step-label"><span className="sr-only">{i + 1}. </span>{t(s.es, s.en)}</span>{done[s.id] && <span className="sr-only"> ({t("completado", "done")})</span>}
          </a>)}
        </nav>
        <div className="lang-toggle" role="group" aria-label="Idioma / Language">
          <button type="button" aria-pressed={lang === "es"} onClick={() => setLang("es")} lang="es">ES</button>
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en">EN</button>
        </div>
        <a className="source-link" href="https://github.com/bel001/AgroOrbit-Nexus" target="_blank" rel="noreferrer">{t("Código", "Code")} <ArrowRight size={16} aria-hidden="true" /></a>
      </div>
      <div className="progress" role="progressbar" aria-label={t("Avance del análisis", "Analysis progress")} aria-valuemin={0} aria-valuemax={5} aria-valuenow={progress}><span style={{ width: `${(progress / 5) * 100}%` }} /></div>
    </header>

    <main id="inicio">
      <section className="hero">
        <div className="hero-copy">
          <h1>{t("Compara rotaciones de cultivos por agua, suelo y riesgo,", "Compare crop rotations by water, soil and risk,")} <em>{t("antes de sembrar.", "before you plant.")}</em></h1>
          <p>{t("Hecho para extensionistas agrarios que revisan opciones de rotación junto con los agricultores. Por eso comparamos y explicamos, en vez de recomendar.", "Built for agricultural extension agents who review rotation options with farmers. That is why we compare and explain instead of recommending.")}</p>
          <div className="hero-actions">
            <button type="button" className="button big" onClick={tryDemo} disabled={loading}><Play size={18} aria-hidden="true" />{t("Probar demo de Virú", "Try the Virú demo")}</button>
            <a className="button secondary big" href="#terreno">{t("Analizar mi terreno", "Analyse my field")} <ArrowDown size={18} aria-hidden="true" /></a>
          </div>
          <ul className="hero-facts small" aria-label={t("Fuentes y alcance", "Sources and scope")}>
            <li><Users size={16} aria-hidden="true" />{t("Para extensionistas y agricultores", "For extension agents and farmers")}</li>
            <li><Satellite size={16} aria-hidden="true" />{t("Clima diario NASA POWER", "NASA POWER daily climate")}</li>
            <li><Droplets size={16} aria-hidden="true" />{t("Agua en m³/ha con FAO-56", "Water in m³/ha with FAO-56")}</li>
            <li><ShieldCheck size={16} aria-hidden="true" />{t("Exploración, no recomendación", "Exploration, not a recommendation")}</li>
          </ul>
        </div>
        <div className="hero-visual">
          <OrbitArt />
          <div className="float-card one"><Thermometer size={18} aria-hidden="true" /><span>{t("Clima diario", "Daily climate")}<br /><b>{t("desde 1981", "since 1981")}</b></span></div>
          <div className="float-card two"><Droplets size={18} aria-hidden="true" /><span>{t("Agua por rotación", "Water per rotation")}<br /><b>m³/ha</b></span></div>
          <div className="float-card three"><Leaf size={18} aria-hidden="true" /><span>{t("Primer piloto", "First pilot")}<br /><b>Virú, Perú</b></span></div>
        </div>
      </section>

      <form onSubmit={analyze} aria-label={t("Perfil agrícola", "Farm profile")} noValidate>
        <fieldset disabled={loading} className="form-fieldset"><legend className="sr-only">{t("Ubicación y perfil", "Location and profile")}</legend>

        <section id="terreno" className="section card">
          <SectionHeading step={1} title={t("Conozcamos el terreno", "Find the field")} text={t("Busca una localidad, usa tu ubicación o haz clic en el mapa.", "Search for a place, use your location or click on the map.")}>
            <div className="report-actions">
              <button type="button" className="button ghost" disabled={loading} onClick={() => { setFarm(freshGlobalFarm()); setDirty(true); setErrors([]); }}><RotateCcw size={16} aria-hidden="true" />{t("Nuevo análisis global", "New global analysis")}</button>
              <button type="button" className="button secondary" disabled={loading} onClick={() => { setFarm(structuredClone(exampleFarm)); setDirty(true); setErrors([]); }}>{t("Cargar caso ilustrativo", "Load illustrative case")}</button>
            </div>
          </SectionHeading>
          <div className="callouts">
            <p className="notice neutral"><strong>{coverage.level === "climate-only" ? t("Cobertura: información climática global", "Coverage: global climate information") : t("Cobertura: diagnóstico agrícola parcial", "Coverage: partial farm diagnosis")}</strong>. {lang === "en" ? coverageReason : coverage.reason} {t("Ninguna región cuenta todavía con análisis agronómico validado.", "No region has a validated agronomic analysis yet.")}</p>
            <p className={farm.illustrative ? "notice" : "notice neutral"}>{farm.illustrative ? t("Caso ilustrativo / datos de ejemplo. La ubicación y las campañas no son observaciones de campo verificadas. El clima se consulta a NASA.", "Illustrative case / sample data. Location and campaigns are not verified field observations. Climate comes from NASA.") : t("Perfil aportado por el usuario. Los registros declarados no han sido validados de forma independiente.", "Profile provided by the user. Declared records have not been independently validated.")}</p>
          </div>
          <div className="farm-grid">
            <div className="form-fields">
              <LocationSearch lat={farm.lat} lon={farm.lon} onSelect={(lat, lon) => location({ lat, lon })} />
              <label>{t("Nombre del terreno", "Field name")}<input value={farm.name} maxLength={80} required onChange={e => update({ name: e.target.value })} /></label>
              <div className="two-col">
                <label>{t("Latitud", "Latitude")}<input type="number" step="any" required min={-90} max={90} value={Number.isNaN(farm.lat) ? "" : farm.lat} onChange={e => location({ lat: e.target.value === "" ? NaN : Number(e.target.value) })} /></label>
                <label>{t("Longitud", "Longitude")}<input type="number" step="any" required min={-180} max={180} value={Number.isNaN(farm.lon) ? "" : farm.lon} onChange={e => location({ lon: e.target.value === "" ? NaN : Number(e.target.value) })} /></label>
              </div>
              <p className="small muted">{t("Cambiar coordenadas desactiva la plantilla regional. Revisa la procedencia de los registros si cambias de terreno.", "Changing coordinates turns off the regional template. Review your record sources if you change field.")}</p>
              <div className="two-col">
                <label>{t("Área (ha, opcional)", "Area (ha, optional)")}<input type="number" step="any" min="0.001" value={farm.areaHa ?? ""} placeholder={t("Desconocida", "Unknown")} onChange={e => update({ areaHa: numberOrNull(e.target.value) })} /></label>
                <label>{t("Textura del suelo", "Soil texture")}<select value={farm.soil} onChange={e => update({ soil: e.target.value as Farm["soil"] })}>{["desconocido", "arenoso", "franco", "arcilloso"].map(s => <option key={s} value={s}>{t(s, SOIL_EN[s])}</option>)}</select></label>
              </div>
              <details className="soft-details"><summary>{t("Suelo, agua y preferencias (opcional)", "Soil, water and preferences (optional)")}</summary>
                <div className="two-col">
                  <label>{t("pH (opcional)", "pH (optional)")}<input type="number" min="0" max="14" step="any" value={farm.ph ?? ""} placeholder={t("Desconocido", "Unknown")} onChange={e => update({ ph: numberOrNull(e.target.value) })} /></label>
                  <label>{t("Procedencia del suelo", "Soil data source")}<select value={farm.soilOrigin} onChange={e => update({ soilOrigin: e.target.value as Farm["soilOrigin"] })}>{origins.map(o => <option key={o} value={o}>{t(o, ORIGIN_EN[o])}</option>)}</select></label>
                  <label>{t("Sistema de riego", "Irrigation system")}<select value={farm.irrigation} onChange={e => update({ irrigation: e.target.value as Farm["irrigation"] })}>{["desconocido", "secano", "goteo", "gravedad"].map(s => <option key={s} value={s}>{t(s, IRRIGATION_EN[s])}</option>)}</select></label>
                  <label>{t(`Agua total utilizable (mm / ${farm.horizonDays} días)`, `Total usable water (mm / ${farm.horizonDays} days)`)}<input type="number" min="0" step="any" value={farm.waterMm ?? ""} placeholder={t("Desconocida", "Unknown")} onChange={e => update({ waterMm: numberOrNull(e.target.value) })} /></label>
                  <label>{t("Procedencia del agua", "Water data source")}<select value={farm.waterOrigin} onChange={e => update({ waterOrigin: e.target.value as Farm["waterOrigin"] })}>{origins.map(o => <option key={o} value={o}>{t(o, ORIGIN_EN[o])}</option>)}</select></label>
                  <label>{t("Prioridad de revisión", "Review priority")}<select value={farm.priority} onChange={e => update({ priority: e.target.value as Farm["priority"] })}><option value="diversidad">{t("Diversidad de familias", "Family diversity")}</option><option value="agua">{t("Disponibilidad de agua", "Water availability")}</option><option value="continuidad">{t("Continuidad de cultivos", "Crop continuity")}</option></select></label>
                </div>
                <p className="small muted">{t("Agua total incluye lluvia utilizable y riego. Vacío = desconocido; 0 = ausencia declarada de toda agua.", "Total water includes usable rain and irrigation. Empty = unknown; 0 = no water at all declared.")}</p>
                <fieldset className="exclusions"><legend>{t("Cultivos que no deseas incluir", "Crops you do not want")}</legend>{crops.map(c => <label className="chip-check" key={c}><input type="checkbox" checked={farm.excluded.includes(c)} onChange={e => update({ excluded: e.target.checked ? [...farm.excluded, c] : farm.excluded.filter(x => x !== c) })} />{t(catalog[c].names.es, catalog[c].names.en)}</label>)}</fieldset>
              </details>
            </div>
            <div className="map-column"><FarmMap lat={farm.lat} lon={farm.lon} onSelect={(lat, lon) => { if (!loading) location({ lat, lon }); }} /></div>
          </div>
        </section>

        <section id="cultivos" className="section card">
          <SectionHeading step={2} title={t("Cultivos y periodo", "Crops and period")} text={t("Elige qué quieres analizar y registra las campañas que conoces.", "Choose what to analyse and record the campaigns you know.")} />
          <fieldset className="segmented"><legend>{t("Tipo de análisis", "Analysis type")}</legend>
            <label className={farm.analysisMode === "climate" ? "is-on" : ""}><input type="radio" name="analysisMode" value="climate" checked={farm.analysisMode === "climate"} onChange={() => update({ analysisMode: "climate" })} /><CloudRain size={18} aria-hidden="true" /><span><b>{t("Solo clima global", "Global climate only")}</b><small>{t("Cualquier lugar · sin recomendaciones agrícolas", "Anywhere · no farming recommendations")}</small></span></label>
            <label className={farm.analysisMode === "regional" ? "is-on" : ""}><input type="radio" name="analysisMode" value="regional" checked={farm.analysisMode === "regional"} onChange={() => update({ analysisMode: "regional" })} /><Sprout size={18} aria-hidden="true" /><span><b>{t("Revisar mis registros", "Review my records")}</b><small>{t("Diagnóstico parcial y comparación", "Partial diagnosis and comparison")}</small></span></label>
          </fieldset>
          <div className="two-col period">
            <label>{t("Inicio del periodo", "Period start")}<input type="date" required value={farm.start} onChange={e => update({ start: e.target.value })} /></label>
            <label>{t("Duración del periodo (días)", "Period length (days)")}<input type="number" required min="30" max="731" value={Number.isNaN(farm.horizonDays) ? "" : farm.horizonDays} onChange={e => update({ horizonDays: e.target.value === "" ? NaN : Number(e.target.value) })} /></label>
          </div>
          <div className="period-actions"><button type="button" className="button ghost" onClick={() => update(latestPeriod(365))}><CalendarDays size={16} aria-hidden="true" />{t("Últimos 12 meses", "Last 12 months")}</button>
            <p className="small muted">{t(`NASA POWER publica los datos diarios con unos ${POWER_LATENCY_DAYS} días de retraso: lo más reciente disponible es hasta el ${latestEnd ?? "…"}. Los días aún no publicados aparecen como faltantes, nunca como cero.`, `NASA POWER publishes daily data with about ${POWER_LATENCY_DAYS} days of delay: the most recent available data run to ${latestEnd ?? "…"}. Days not yet published show as missing, never as zero.`)}</p></div>
          <p className="small muted">{t("El periodo climático es configurable. No se asignan calendarios de cultivo por país o hemisferio sin evidencia.", "The climate period is configurable. No crop calendars are assigned by country or hemisphere without evidence.")}</p>

          <div className="campaign-block" id="registro">
            <h3>{t("Lo que ya sembraste (historial)", "What you already grew (history)")} <span className="count-pill">{farm.history.length} {t("campañas registradas", "campaigns recorded")}</span></h3>
            <p className="small muted">{t("Campañas pasadas en este terreno. Sirven para ver si se repite el mismo cultivo; no se infiere daño al suelo.", "Past campaigns on this field. They show whether the same crop repeats; no soil damage is inferred.")}</p>
            <p className="small muted origin-help"><b>{t("Procedencia", "Source")}:</b> {t("«declarado» = lo indicas tú · «medido» = con registros o instrumentos · «estimado» = aproximado · «desconocido» = no se usa para interpretar.", "“declared” = you state it · “measured” = records or instruments · “estimated” = approximate · “unknown” = not used for interpretation.")}</p>
            {farm.history.length === 0 && <p className="empty-inline">{t("Sin campañas todavía. Añade lo que se sembró antes en este terreno.", "No campaigns yet. Add what was grown on this field before.")}</p>}
            {farm.history.map((c, i) => <div className="campaign-row" key={i}>
              <CropSelect label={t(`Cultivo histórico ${i + 1}`, `Past crop ${i + 1}`)} value={c.crop} onChange={crop => campaign("history", i, { crop })} />
              <label>{t("Siembra", "Sowing")}<input type="date" required value={c.start} onChange={e => campaign("history", i, { start: e.target.value })} /></label>
              <label>{t("Cosecha", "Harvest")}<input type="date" required value={c.end} onChange={e => campaign("history", i, { end: e.target.value })} /></label>
              <OriginSelect value={c.origin} onChange={origin => campaign("history", i, { origin })} />
              <button type="button" className="icon-button" onClick={() => update({ history: farm.history.filter((_, n) => n !== i) })}><Trash2 size={16} aria-hidden="true" /><span>{t(`Quitar campaña ${i + 1}`, `Remove campaign ${i + 1}`)}</span></button>
            </div>)}
            <button type="button" className="button ghost" disabled={farm.history.length >= 12} onClick={() => update({ history: [...farm.history, nextCampaign(farm.history, addDays(farm.start, -365))] })}><Plus size={16} aria-hidden="true" />{t("Añadir campaña", "Add campaign")}</button>
          </div>

          {farm.analysisMode === "regional" && <div className="campaign-block reveal">
            <h3>{t("Lo que planeas sembrar (A)", "What you plan to grow (A)")}</h3>
            <p className="small muted">{t("Las campañas que quieres evaluar dentro del periodo. Debajo puedes añadir hasta dos alternativas propias para compararlas.", "The campaigns you want to assess within the period. Below you can add up to two options of your own to compare.")}</p>
            {farm.current.map((c, i) => <div className="campaign-row current" key={i}>
              <CropSelect label={`A · ${t("ciclo", "cycle")} ${i + 1}`} value={c.crop} onChange={crop => campaign("current", i, { crop })} />
              <label>{t("Siembra", "Sowing")}<input type="date" required value={c.start} onChange={e => campaign("current", i, { start: e.target.value })} /></label>
              <label>{t("Cosecha", "Harvest")}<input type="date" required value={c.end} onChange={e => campaign("current", i, { end: e.target.value })} /></label>
              <OriginSelect value={c.origin} onChange={origin => campaign("current", i, { origin })} />
            </div>)}
            <button type="button" className="button ghost" disabled={farm.current.length >= 12} onClick={() => update({ current: [...farm.current, nextCampaign(farm.current, farm.start)] })}><Plus size={16} aria-hidden="true" />{t("Añadir ciclo para completar", "Add a cycle")}</button>
          </div>}

          {farm.analysisMode === "regional" && <div className="campaign-block reveal">
            <h3>{t("Alternativas para comparar", "Options to compare")} <span className="count-pill">{t("opcional", "optional")}</span></h3>
            <p className="small muted">{t("¿Y si sembraras otra cosa? Crea una alternativa (parte de una copia de A) y cambia cultivos o fechas. Son escenarios tuyos, no recomendaciones.", "What if you grew something else? Create an option (starts as a copy of A) and change crops or dates. They are your scenarios, not recommendations.")}</p>
            {coverage.demoAllowed && <p className="small muted">{t("En la demo de Virú ya se añaden B y C ilustrativas; las tuyas aparecerán después.", "In the Virú demo, illustrative B and C are added; yours appear after them.")}</p>}
            {farm.alternatives.map((alt, ai) => { const letter = String.fromCharCode(65 + altOffset + ai); return <div className="alt-card" key={ai}>
              <div className="alt-head"><span className="alt-letter" aria-hidden="true">{letter}</span>
                <label className="alt-name">{t(`Nombre de la alternativa ${letter}`, `Name of option ${letter}`)}<input value={alt.name} maxLength={60} onChange={e => setAlternative(ai, { name: e.target.value })} /></label>
                <button type="button" className="icon-button" onClick={() => update({ alternatives: farm.alternatives.filter((_, n) => n !== ai) })}><Trash2 size={16} aria-hidden="true" /><span>{t(`Quitar alternativa ${letter}`, `Remove option ${letter}`)}</span></button></div>
              {alt.campaigns.map((c, ci) => <div className="campaign-row alt-row" key={ci}>
                <CropSelect label={`${letter} · ${t("ciclo", "cycle")} ${ci + 1}`} value={c.crop} onChange={crop => altCampaign(ai, ci, { crop })} />
                <label>{t("Siembra", "Sowing")}<input type="date" required value={c.start} onChange={e => altCampaign(ai, ci, { start: e.target.value })} /></label>
                <label>{t("Cosecha", "Harvest")}<input type="date" required value={c.end} onChange={e => altCampaign(ai, ci, { end: e.target.value })} /></label>
                <button type="button" className="icon-button" disabled={alt.campaigns.length <= 1} onClick={() => setAlternative(ai, { campaigns: alt.campaigns.filter((_, n) => n !== ci) })}><Trash2 size={16} aria-hidden="true" /><span>{t(`Quitar ciclo ${ci + 1} de ${letter}`, `Remove cycle ${ci + 1} of ${letter}`)}</span></button>
              </div>)}
              <button type="button" className="button ghost" disabled={alt.campaigns.length >= 12} onClick={() => setAlternative(ai, { campaigns: [...alt.campaigns, { ...nextCampaign(alt.campaigns, farm.start), origin: "estimado" }] })}><Plus size={16} aria-hidden="true" />{t(`Añadir ciclo a ${letter}`, `Add a cycle to ${letter}`)}</button>
            </div>; })}
            <button type="button" className="button secondary" disabled={farm.alternatives.length >= 2} onClick={() => update({ alternatives: [...farm.alternatives, { name: `${t("Alternativa", "Option")} ${String.fromCharCode(65 + altOffset + farm.alternatives.length)}`, campaigns: farm.current.length ? farm.current.map(c => ({ ...c, origin: "estimado" as const })) : [{ ...nextCampaign([], farm.start), origin: "estimado" as const }] }] })}><Plus size={16} aria-hidden="true" />{t("Añadir alternativa", "Add option")}</button>
          </div>}
          <label className="check-label"><input type="checkbox" checked={farm.illustrative} onChange={e => update({ illustrative: e.target.checked })} /> {t("Estos registros son un caso ilustrativo", "These records are an illustrative case")}</label>
        </section>
        </fieldset>

        {errors.length > 0 && <div className="notice error shake" role="alert" id="form-errors" tabIndex={-1}><AlertCircle size={20} aria-hidden="true" /><div><strong>{t("Revisa los datos para continuar", "Check the data to continue")}</strong><ul>{errors.map((s, i) => <li key={i}>{s}</li>)}</ul></div></div>}
        <div className="action-bar" id="accion">
          <div className="action-summary">
            <span className={hasPoint ? "pill ok" : "pill"}><MapPin size={14} aria-hidden="true" />{hasPoint ? `${farm.lat.toFixed(3)}, ${farm.lon.toFixed(3)}` : t("Sin ubicación", "No location")}</span>
            <span className="pill"><CalendarDays size={14} aria-hidden="true" />{Number.isNaN(farm.horizonDays) ? "—" : farm.horizonDays} {t("días", "days")}</span>
            <span className="pill">{farm.analysisMode === "climate" ? t("Solo clima", "Climate only") : `${farm.current.length} ${farm.current.length === 1 ? t("ciclo", "cycle") : t("ciclos", "cycles")} ${t("en", "in")} A${farm.alternatives.length ? ` · ${farm.alternatives.length} ${farm.alternatives.length === 1 ? t("alternativa", "option") : t("alternativas", "options")}` : ""}`}</span>
          </div>
          <button className="button big" type="submit" disabled={loading}>{loading ? t("Consultando NASA POWER…", "Querying NASA POWER…") : farm.analysisMode === "climate" ? t("Consultar clima NASA", "Get NASA climate") : t("Consultar clima y comparar", "Get climate and compare")}<ArrowRight size={18} aria-hidden="true" /></button>
        </div>
        <p className="small muted form-foot">{t("Consulta pública a NASA POWER. Sin cuenta. Los datos del formulario no se guardan en una base de datos.", "Public NASA POWER request. No account. Form data is not stored in a database.")}</p>
        <p className="sr-only" role="status">{loading ? t("Consulta en curso; puede tardar hasta 25 segundos", "Request in progress; it can take up to 25 seconds") : report ? t("Informe disponible", "Report available") : ""}</p>
      </form>

      {dirty && report && <p className="notice sticky-note" role="status">{t("Hay cambios sin calcular. El informe muestra las entradas de la última consulta; vuelve a comparar para actualizarlas.", "There are uncalculated changes. The report shows the last request; compare again to update it.")}</p>}

      <section id="diagnostico" className="section">
        <SectionHeading step={3} title={t("Lo que podemos observar", "What we can observe")} text={t("Historia agrícola declarada y contexto climático, con sus límites.", "Declared farm history and climate context, with their limits.")} />
        {loading ? <Loader /> : !report ? <div className="empty"><Leaf size={28} aria-hidden="true" /><p>{t("El diagnóstico aparecerá al consultar el terreno. ¿Con prisa? Pulsa «Probar demo de Virú» arriba.", "The diagnosis appears once you query a field. In a hurry? Press “Try the Virú demo” above.")}</p></div> : <div className="results">
          <p className="notice neutral"><strong>{report.coverage.level === "climate-only" ? t("Alcance: clima global", "Scope: global climate") : t("Alcance: análisis parcial", "Scope: partial analysis")}</strong>. {lang === "en" ? coverageReason : report.coverage.reason} {t("Recomendaciones agrícolas: no habilitadas.", "Farming recommendations: not enabled.")}</p>
          {climateError && <div className="notice error" role="alert"><AlertCircle size={20} aria-hidden="true" /><p>{climateError} {t("Puedes revisar restricciones locales; no hay datos climáticos sustitutos. Usa «Consultar clima y comparar» para reintentar.", "You can still review local constraints; there is no substitute climate data. Use “Get climate and compare” to retry.")}</p></div>}
          {report.climate ? <div className="card climate-card">
            <div className="climate-header"><h3>Clima histórico · NASA POWER</h3><span>{report.climate.query.start} → {report.climate.query.end} · {report.climate.days.length} {t("días", "days")}</span></div>
            {report.climate.snapshot && <p className="notice" role="status">{t(`Datos NASA POWER guardados localmente el ${report.climate.snapshot.retrievedAt.slice(0, 10)} (misma respuesta de la API, sin modificar). La consulta en vivo no estuvo disponible: ${report.climate.snapshot.reason}`, `NASA POWER data stored locally on ${report.climate.snapshot.retrievedAt.slice(0, 10)} (the same, unmodified API response). The live request was unavailable: ${report.climate.snapshot.reason}`)}</p>}
            <ClimateKpis report={report} />
            <ClimateChart climate={report.climate} />
            <p className="small muted">{t(report.climate.spatialSupport, "MERRA-2 regional-grid meteorology; the native support depends on the product. It does not represent field measurements.")}</p>
            <p className="small">API {report.climate.version} · {report.climate.timeStandard} · T2M, T2M_MIN, T2M_MAX: °C; PRECTOTCORR: mm/{t("día", "day")}. {t("Faltantes", "Missing")}: {Object.entries(report.climate.missing).map(([k, v]) => `${k}: ${v}`).join("; ")}.</p>
            <a className="link-arrow" href={report.climate.url} target="_blank" rel="noreferrer">{t("Abrir consulta de origen NASA", "Open the source NASA request")}</a>
          </div> : <p className="muted">{t("Clima no disponible. La evaluación térmica queda incompleta.", "Climate unavailable. The thermal assessment is incomplete.")}</p>}
          <div className="card">
            <div className="diagnosis"><h3>{report.input.name}</h3><p>{report.input.illustrative ? t("Caso ilustrativo", "Illustrative case") : t("Perfil declarado", "Declared profile")} · {report.history.count} {t("registros", "records")} ({report.history.knownCount} {t("con procedencia conocida", "with a known source")}) · {t("repetición máxima", "max. repetition")}: {report.history.maxRepeat === null ? t("no calculable por datos incompletos o fechas inválidas", "not computable: incomplete data or invalid dates") : t(`${report.history.maxRepeat} campañas de una especie`, `${report.history.maxRepeat} campaigns of one species`)}. <strong>{t("Esto no demuestra degradación del suelo.", "This does not prove soil degradation.")}</strong></p>{report.history.overlappingOrInvalid && <p className="notice">{t("El historial contiene intervalos inválidos o solapados. Revisa las fechas antes de interpretarlo.", "The history has invalid or overlapping intervals. Check the dates before interpreting it.")}</p>}</div>
            <HistoryEvidence report={report} />
          </div>
        </div>}
      </section>

      <section id="rotaciones" className="section">
        <SectionHeading step={4} title={t("Compara alternativas", "Compare options")} text={t("Agua, suelo y riesgo de cada rotación, con tus prioridades. No hay un óptimo universal.", "Water, soil and risk of each rotation, weighted by your priorities. There is no universal optimum.")} />
        {!report ? <p className="empty">{loading ? t("Calculando alternativas…", "Computing options…") : t("Consulta una ubicación para conocer el alcance disponible.", "Query a location to see what can be compared.")}</p> : report.strategies.length === 0 ? <p className="notice neutral">{t("Informe climático global. No se generan rotaciones ni recomendaciones: faltan datos agronómicos regionales suficientes.", "Global climate report. No rotations or recommendations are generated: regional agronomic data are insufficient.")}</p> : <div className="results">
          <BottomLine report={report} />
          {isViruDemo && <ViruWaterContext />}
          <PriorityRanking strategies={report.strategies} weights={weights} onWeights={setWeights} />
          <WaterCard report={report} tariff={tariff} onTariff={setTariff} />
          <SoilCards report={report} />
          <ElNinoTable report={report} />
          <p className="notice neutral small">{t("Horizonte común", "Common horizon")}: {report.strategies[0].horizon.start} → {report.strategies[0].horizon.end} · {t("intervalos de cultivo [siembra, cosecha)", "crop intervals [sowing, harvest)")}.</p>
          <ComparisonTable report={report} />
          <p className="small muted">{t("Demanda hídrica: ETo de Hargreaves (FAO-56, ec. 52) con temperaturas NASA POWER × Kc genéricos de FAO-56 (tablas 11 y 12). Es la demanda de un cultivo sano en condiciones estándar, no una necesidad de riego validada. Grados-día: método promedio (McMaster y Wilhelm, 1997).", "Water demand: Hargreaves ET0 (FAO-56 eq. 52) from NASA POWER temperatures × generic FAO-56 Kc (tables 11–12). It is the demand of a healthy crop under standard conditions, not a validated irrigation requirement. Degree-days: averaging method (McMaster & Wilhelm, 1997).")}</p>
          <div className="accordion">{report.strategies.map(s => <details key={s.id} className="strategy-details"><summary>{s.id} · {t("Restricciones y explicación", "Constraints and explanation")} · {s.checks.filter(c => c.status === "incumple").length} {t("incumplidas", "failed")}</summary>{lang === "en" && <p className="small muted">Rule details are written in Spanish.</p>}<ul className="check-list">{s.checks.map(c => <li key={c.rule} className={`check-${c.status}`}>{c.status === "cumple" ? <Check size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}<div><strong>{c.rule} · {c.status}</strong><p>{c.detail}</p><small>{t("Fuente", "Source")}: {c.source.startsWith("https://") ? <a href={c.source} target="_blank" rel="noreferrer">{t("Referencia metodológica", "Method reference")}</a> : c.source}</small></div></li>)}</ul></details>)}</div>
        </div>}
        <details className="catalog soft-details"><summary>{t("Consultar catálogo y aplicabilidad de los cultivos", "Crop catalogue and applicability")}</summary><div className="table-scroll" tabIndex={0} role="region" aria-label={t("Catálogo desplazable", "Scrollable catalogue")}><table><caption>{t("Referencias generales FAO; no representan calendarios regionales.", "General FAO references; not regional calendars.")}</caption><thead><tr><th>{t("Cultivo / familia", "Crop / family")}</th><th>{t("Ciclo de referencia", "Reference cycle")}</th><th>{t("Aplicabilidad", "Applicability")}</th></tr></thead><tbody>{crops.map(c => <tr key={c}><th>{t(catalog[c].names.es, catalog[c].names.en)}<small>{catalog[c].species} · {catalog[c].family}</small></th><td>{catalog[c].days.join("–")} {t("días", "days")}</td><td>{t(catalog[c].applicability, "General reference; does not prove suitability for a region or variety")}. <a href={catalog[c].source} target="_blank" rel="noreferrer">{t("FAO, tabla 6", "FAO, table 6")}</a></td></tr>)}</tbody></table></div></details>
      </section>

      <section id="evidencias" className="section evidence">
        <SectionHeading step={5} title={t("Una decisión que puedes revisar", "A decision you can review")} text={t("Las entradas, las reglas y las ausencias viajan con el informe.", "Inputs, rules and gaps travel with the report.")}>
          {report && <div className="report-actions"><button className="button light" onClick={() => download(report, weights)}><Download size={17} aria-hidden="true" />{t("Descargar JSON", "Download JSON")}</button><button className="button light" onClick={() => window.print()}><Printer size={17} aria-hidden="true" />{t("Imprimir informe", "Print report")}</button></div>}
        </SectionHeading>
        {report ? <div className="results">
          <p>{t("Metodología", "Method")} {report.methodologyVersion} · {t("informe generado", "report generated")} {report.createdAt}. {report.climate ? `${t("NASA consultado", "NASA queried")} ${report.climate.retrievedAt}. ${t("Fuentes", "Sources")}: ${report.climate.sources.join(", ")}.` : t("Sin serie NASA verificada en este informe.", "No verified NASA series in this report.")}</p>
          <ul className="limit-list">{(lang === "en" && report.limitationsEn ? report.limitationsEn : report.limitations).map(s => <li key={s}>{s}</li>)}</ul>
          <div className="regional-block"><RegionalEvidence report={report} /></div>
          <h3>{t("Antes de decidir con un agrónomo", "Before deciding with an agronomist")}</h3><p>{t("Confirma parcela, variedad, ventanas de siembra, drenaje, análisis de suelo y balance hídrico. Contrasta los datos de grilla con registros locales.", "Confirm the plot, variety, sowing windows, drainage, soil analysis and water balance. Check grid data against local records.")}</p>
          <details className="soft-details"><summary>{t("Inspeccionar entradas utilizadas en este informe", "Inspect the inputs used in this report")}</summary><pre>{JSON.stringify(report.input, null, 2)}</pre></details>
        </div> : <p>{t("El informe incluirá coordenadas, fechas, procedencia, unidades, versión NASA, reglas y limitaciones. No contiene recomendaciones certificadas.", "The report will include coordinates, dates, sources, units, NASA version, rules and limitations. It contains no certified recommendations.")}</p>}
      </section>

      <footer><span className="brand-footer"><Sprout size={18} aria-hidden="true" /> AgroOrbit Nexus</span><p>{t("Datos climáticos: NASA POWER. Mapa: © OpenStreetMap contributors. Sin afiliación ni aval de NASA.", "Climate data: NASA POWER. Map: © OpenStreetMap contributors. Not affiliated with or endorsed by NASA.")}</p><p lang="en">Built for agricultural extension agents who review rotation options with farmers. Exploration, not a recommendation.</p><a href="https://github.com/bel001/AgroOrbit-Nexus">{t("Código MIT · fuentes y limitaciones", "MIT code · sources and limitations")}</a></footer>
    </main>
  </>;
}
