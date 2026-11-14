"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  AlertCircle, ArrowDown, ArrowRight, Check, CloudRain, Download, Droplets, FileText, Leaf, MapPin,
  Play, Printer, RotateCcw, Satellite, Sprout, Thermometer, CalendarDays, Plus, Trash2, ShieldCheck,
} from "lucide-react";
import { addDays, farmSchema, newGlobalFarm, type Farm, type CropId, type Campaign, type Alternative } from "@/lib/model";
import { exampleFarm } from "@/lib/examples/viru";
import { catalog } from "@/lib/catalog";
import { monthlyClimate } from "@/lib/power";
import LocationSearch from "./location-search";
import HistoryEvidence from "./history-evidence";
import RegionalEvidence from "./regional-evidence";
import { CountUp, OrbitArt } from "./motion";
import { resolveCoverage } from "@/lib/regions";
import type { EvidenceReport } from "@/lib/rotations";

const FarmMap = dynamic(() => import("./farm-map"), { ssr: false, loading: () => <div className="map map-loading">Cargando mapa… Puedes escribir las coordenadas.</div> });
const ClimateChart = dynamic(() => import("./climate-chart"), { ssr: false, loading: () => <div className="chart skeleton" /> });

const mm = (v: number | null | undefined) => v === null || v === undefined ? "No calculable · serie NASA incompleta" : `${Math.round(v).toLocaleString("es")} mm`;
const numberOrNull = (s: string) => s.trim() === "" ? null : Number(s);
const crops = Object.keys(catalog) as CropId[];
const origins = ["desconocido", "declarado", "medido", "estimado"] as const;

const STEPS = [
  { id: "terreno", label: "Terreno", icon: MapPin },
  { id: "cultivos", label: "Cultivos", icon: Sprout },
  { id: "diagnostico", label: "Condiciones", icon: Thermometer },
  { id: "rotaciones", label: "Alternativas", icon: Leaf },
  { id: "evidencias", label: "Evidencias", icon: FileText },
] as const;
type StepId = typeof STEPS[number]["id"];

function CropSelect({ value, onChange, label }: { value: CropId; onChange: (crop: CropId) => void; label: string }) {
  return <label>{label}<select value={value} onChange={e => onChange(e.target.value as CropId)}>{crops.map(c => <option key={c} value={c}>{catalog[c].name}</option>)}</select></label>;
}

/** Nueva campaña: empieza tras la última y dura lo mínimo del rango general FAO del cultivo. */
function nextCampaign(list: Campaign[], fallbackStart: string): Campaign {
  const crop = crops[0];
  const last = [...list].sort((a, b) => a.end.localeCompare(b.end)).at(-1);
  const start = last ? addDays(last.end, 1) : fallbackStart;
  return { crop, start, end: addDays(start, catalog[crop].days[0]), origin: "declarado" };
}

const FIELD_NAMES: Record<string, string> = {
  name: "Nombre del terreno", lat: "Latitud", lon: "Longitud", areaHa: "Área", ph: "pH", waterMm: "Agua total utilizable",
  waterOrigin: "Procedencia del agua", soilOrigin: "Procedencia del suelo", start: "Inicio del periodo", horizonDays: "Duración del periodo",
  history: "Historial", current: "Lo que planeas sembrar (A)", alternatives: "Alternativas",
};
const SUBFIELD_NAMES: Record<string, string> = { crop: "cultivo", start: "siembra", end: "cosecha", origin: "procedencia", name: "nombre", campaigns: "ciclos" };
/** Convierte un error de validación en una frase que un agricultor entienda. */
function humanizeIssue(issue: { path: PropertyKey[]; message: string; code: string }) {
  const [root, index, sub, subIndex, field] = issue.path.map(String);
  let where = FIELD_NAMES[root] ?? root;
  if (index !== undefined) where += root === "alternatives" ? ` ${String.fromCharCode(66 + Number(index))}` : ` · campaña ${Number(index) + 1}`;
  if (sub !== undefined) where += ` · ${SUBFIELD_NAMES[sub] ?? sub}`;
  if (subIndex !== undefined) where += ` ${Number(subIndex) + 1}`;
  if (field !== undefined) where += ` · ${SUBFIELD_NAMES[field] ?? field}`;
  // Los mensajes propios (reglas "custom") ya están en español; los genéricos de Zod se traducen por tipo.
  const what = issue.code === "custom" ? issue.message
    : issue.code === "invalid_type" ? "falta o no es un valor válido" : issue.code === "too_small" ? "está vacío o es demasiado pequeño" : issue.code === "too_big" ? "es demasiado grande" : "no es válido";
  return `${where}: ${what}`;
}

function download(report: EvidenceReport) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
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

function SectionHeading({ step, title, text, children }: { step: number; title: string; text: string; children?: React.ReactNode }) {
  return <div className="section-title">
    <div className="section-title-text"><h2><span className="step-num" aria-hidden="true">{step}</span>{title}</h2><p>{text}</p></div>
    {children}
  </div>;
}

function Loader() {
  return <div className="loader-card" aria-hidden="true">
    <OrbitArt size={120} className="spinning" />
    <div><strong>Consultando NASA POWER…</strong><p>Descargando temperaturas y lluvia diarias del punto elegido y calculando indicadores. Puede tardar hasta 25 segundos.</p>
      <div className="loader-bar"><span /></div></div>
  </div>;
}

function ClimateKpis({ report }: { report: EvidenceReport }) {
  const climate = report.climate!;
  const months = monthlyClimate(climate);
  const temps = climate.days.flatMap(d => d.T2M === null ? [] : [d.T2M]);
  const rain = climate.days.reduce((s, d) => s + (d.PRECTOTCORR ?? 0), 0);
  const missing = Object.values(climate.missing).reduce((a, b) => a + b, 0);
  const meanT = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
  const items = [
    { icon: Thermometer, label: "Temperatura media", value: meanT, decimals: 1, suffix: " °C" },
    { icon: CloudRain, label: "Lluvia total de grilla", value: rain, decimals: 0, suffix: " mm" },
    { icon: CalendarDays, label: "Días consultados", value: climate.days.length, decimals: 0, suffix: "" },
    { icon: AlertCircle, label: "Valores faltantes", value: missing, decimals: 0, suffix: "" },
  ];
  return <div className="kpi-grid">{items.map((k, i) => <div className="kpi" key={k.label} style={{ "--i": i } as React.CSSProperties}>
    <k.icon size={20} aria-hidden="true" /><span>{k.label}</span>
    <strong>{k.value === null ? "Sin datos" : <CountUp value={k.value} decimals={k.decimals} suffix={k.suffix} />}</strong>
  </div>)}<p className="kpi-note small muted">{months.length} meses · medias y sumas de días válidos.</p></div>;
}

function WaterBars({ report }: { report: EvidenceReport }) {
  const rows = report.strategies.filter(s => s.water?.etcMm != null);
  if (!rows.length) return null;
  const max = Math.max(...rows.map(s => s.water!.etcMm!));
  return <div className="water-card">
    <div className="water-card-head"><Droplets size={20} aria-hidden="true" /><h3>Demanda hídrica estimada por alternativa</h3></div>
    <p className="small muted">Barra completa = ETc estimada (FAO-56). Tramo oscuro = déficit bruto que la lluvia de grilla no cubre.</p>
    <ul className="water-bars">{rows.map((s, i) => {
      const etc = s.water!.etcMm!, deficit = s.water!.grossDeficitMm ?? 0;
      return <li key={s.id} style={{ "--i": i } as React.CSSProperties}>
        <span className="water-label"><b>{s.id}</b> {s.name}</span>
        <span className="water-track"><span className="water-fill" style={{ width: `${(etc / max) * 100}%` }}><span className="water-deficit" style={{ width: `${etc ? (deficit / etc) * 100 : 0}%` }} /></span></span>
        <span className="water-value">{Math.round(etc).toLocaleString("es")} mm <small>déficit {Math.round(deficit).toLocaleString("es")} mm</small></span>
      </li>;
    })}</ul>
  </div>;
}

export default function Workspace() {
  const [farm, setFarm] = useState<Farm>(() => newGlobalFarm());
  const [report, setReport] = useState<EvidenceReport | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [climateError, setClimateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
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
    if (!Number.isFinite(input.lat) || !Number.isFinite(input.lon)) { showErrors(["Falta la ubicación del terreno: busca una localidad, pulsa «Usar mi ubicación» o haz clic en el mapa."]); return; }
    const parsed = farmSchema.safeParse(input);
    if (!parsed.success) { showErrors(parsed.error.issues.map(humanizeIssue)); return; }
    setLoading(true); setReport(null); setClimateError(null);
    scrollTo("diagnostico");
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data), signal: AbortSignal.timeout(35_000) });
      const result = await response.json();
      if (!response.ok) { showErrors([result.error, ...(result.issues ?? [])]); return; }
      setReport(result.report); setClimateError(result.climateError); setDirty(false);
      scrollTo("diagnostico");
    } catch { showErrors(["No se pudo contactar con el servidor. Comprueba la conexión y vuelve a consultar."]); }
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

  return <>
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#inicio"><span className="brand-mark"><Sprout size={22} aria-hidden="true" /></span><span>AgroOrbit <strong>Nexus</strong><small>From Space to Soil</small></span></a>
        <nav className="steps" aria-label="Cinco pasos del análisis">
          {STEPS.map((s, i) => <a key={s.id} href={`#${s.id}`} className={`${active === s.id ? "is-active" : ""} ${done[s.id] ? "is-done" : ""}`} aria-current={active === s.id ? "step" : undefined}>
            <span className="step-dot" aria-hidden="true">{done[s.id] ? <Check size={14} /> : i + 1}</span><span className="step-label"><span className="sr-only">{i + 1}. </span>{s.label}</span>{done[s.id] && <span className="sr-only"> (completado)</span>}
          </a>)}
        </nav>
        <a className="source-link" href="https://github.com/bel001/AgroOrbit-Nexus" target="_blank" rel="noreferrer">Código <ArrowRight size={16} aria-hidden="true" /></a>
      </div>
      <div className="progress" role="progressbar" aria-label="Avance del análisis" aria-valuemin={0} aria-valuemax={5} aria-valuenow={progress}><span style={{ width: `${(progress / 5) * 100}%` }} /></div>
    </header>

    <main id="inicio">
      <section className="hero">
        <div className="hero-copy">
          <h1>Tu siguiente cultivo<br /><em>empieza con evidencia.</em></h1>
          <p>Elige un terreno en cualquier lugar del mundo, registra lo que has sembrado y compara alternativas con datos climáticos reales y límites siempre visibles.</p>
          <div className="hero-actions">
            <button type="button" className="button big" onClick={tryDemo} disabled={loading}><Play size={18} aria-hidden="true" />Probar demo de Virú</button>
            <a className="button secondary big" href="#terreno">Analizar mi terreno <ArrowDown size={18} aria-hidden="true" /></a>
          </div>
          <ul className="hero-facts small" aria-label="Fuentes y alcance"><li><Satellite size={16} aria-hidden="true" />Clima diario NASA POWER</li><li><Droplets size={16} aria-hidden="true" />Demanda de agua FAO-56</li><li><ShieldCheck size={16} aria-hidden="true" />Demo con historial ilustrativo; sin recomendaciones certificadas</li></ul>
        </div>
        <div className="hero-visual">
          <OrbitArt />
          <div className="float-card one"><Thermometer size={18} aria-hidden="true" /><span>Clima diario<br /><b>desde 1981</b></span></div>
          <div className="float-card two"><Droplets size={18} aria-hidden="true" /><span>Demanda de agua<br /><b>FAO-56</b></span></div>
          <div className="float-card three"><Leaf size={18} aria-hidden="true" /><span>Primer piloto<br /><b>Virú, Perú</b></span></div>
        </div>
      </section>

      <form onSubmit={analyze} aria-label="Perfil agrícola" noValidate>
        <fieldset disabled={loading} className="form-fieldset"><legend className="sr-only">Ubicación y perfil</legend>

        <section id="terreno" className="section card">
          <SectionHeading step={1} title="Conozcamos el terreno" text="Busca una localidad, usa tu ubicación o haz clic en el mapa.">
            <div className="report-actions">
              <button type="button" className="button ghost" disabled={loading} onClick={() => { setFarm(newGlobalFarm()); setDirty(true); setErrors([]); }}><RotateCcw size={16} aria-hidden="true" />Nuevo análisis global</button>
              <button type="button" className="button secondary" disabled={loading} onClick={() => { setFarm(structuredClone(exampleFarm)); setDirty(true); setErrors([]); }}>Cargar caso ilustrativo</button>
            </div>
          </SectionHeading>
          <div className="callouts">
            <p className="notice neutral"><strong>{coverage.level === "climate-only" ? "Cobertura: información climática global" : "Cobertura: diagnóstico agrícola parcial"}</strong>. {coverage.reason} Ninguna región cuenta todavía con análisis agronómico validado.</p>
            <p className={farm.illustrative ? "notice" : "notice neutral"}>{farm.illustrative ? "Caso ilustrativo / datos de ejemplo. La ubicación y las campañas no son observaciones de campo verificadas. El clima se consulta a NASA." : "Perfil aportado por el usuario. Los registros declarados no han sido validados de forma independiente."}</p>
          </div>
          <div className="farm-grid">
            <div className="form-fields">
              <LocationSearch lat={farm.lat} lon={farm.lon} onSelect={(lat, lon) => location({ lat, lon })} />
              <label>Nombre del terreno<input value={farm.name} maxLength={80} required onChange={e => update({ name: e.target.value })} /></label>
              <div className="two-col">
                <label>Latitud<input type="number" step="any" required min={-90} max={90} value={Number.isNaN(farm.lat) ? "" : farm.lat} onChange={e => location({ lat: e.target.value === "" ? NaN : Number(e.target.value) })} /></label>
                <label>Longitud<input type="number" step="any" required min={-180} max={180} value={Number.isNaN(farm.lon) ? "" : farm.lon} onChange={e => location({ lon: e.target.value === "" ? NaN : Number(e.target.value) })} /></label>
              </div>
              <p className="small muted">Cambiar coordenadas desactiva la plantilla regional. Revisa la procedencia de los registros si cambias de terreno.</p>
              <div className="two-col">
                <label>Área (ha, opcional)<input type="number" step="any" min="0.001" value={farm.areaHa ?? ""} placeholder="Desconocida" onChange={e => update({ areaHa: numberOrNull(e.target.value) })} /></label>
                <label>Textura del suelo<select value={farm.soil} onChange={e => update({ soil: e.target.value as Farm["soil"] })}>{["desconocido", "arenoso", "franco", "arcilloso"].map(s => <option key={s}>{s}</option>)}</select></label>
              </div>
              <details className="soft-details"><summary>Suelo, agua y preferencias (opcional)</summary>
                <div className="two-col">
                  <label>pH (opcional)<input type="number" min="0" max="14" step="any" value={farm.ph ?? ""} placeholder="Desconocido" onChange={e => update({ ph: numberOrNull(e.target.value) })} /></label>
                  <label>Procedencia del suelo<select value={farm.soilOrigin} onChange={e => update({ soilOrigin: e.target.value as Farm["soilOrigin"] })}>{origins.map(o => <option key={o}>{o}</option>)}</select></label>
                  <label>Sistema de riego<select value={farm.irrigation} onChange={e => update({ irrigation: e.target.value as Farm["irrigation"] })}>{["desconocido", "secano", "goteo", "gravedad"].map(s => <option key={s}>{s}</option>)}</select></label>
                  <label>Agua total utilizable (mm / {farm.horizonDays} días)<input type="number" min="0" step="any" value={farm.waterMm ?? ""} placeholder="Desconocida" onChange={e => update({ waterMm: numberOrNull(e.target.value) })} /></label>
                  <label>Procedencia del agua<select value={farm.waterOrigin} onChange={e => update({ waterOrigin: e.target.value as Farm["waterOrigin"] })}>{origins.map(o => <option key={o}>{o}</option>)}</select></label>
                  <label>Prioridad de revisión<select value={farm.priority} onChange={e => update({ priority: e.target.value as Farm["priority"] })}><option value="diversidad">Diversidad de familias</option><option value="agua">Disponibilidad de agua</option><option value="continuidad">Continuidad de cultivos</option></select></label>
                </div>
                <p className="small muted">Agua total incluye lluvia utilizable y riego. Vacío = desconocido; 0 = ausencia declarada de toda agua.</p>
                <fieldset className="exclusions"><legend>Cultivos que no deseas incluir</legend>{crops.map(c => <label className="chip-check" key={c}><input type="checkbox" checked={farm.excluded.includes(c)} onChange={e => update({ excluded: e.target.checked ? [...farm.excluded, c] : farm.excluded.filter(x => x !== c) })} />{catalog[c].name}</label>)}</fieldset>
              </details>
            </div>
            <div className="map-column"><FarmMap lat={farm.lat} lon={farm.lon} onSelect={(lat, lon) => { if (!loading) location({ lat, lon }); }} /></div>
          </div>
        </section>

        <section id="cultivos" className="section card">
          <SectionHeading step={2} title="Cultivos y periodo" text="Elige qué quieres analizar y registra las campañas que conoces." />
          <fieldset className="segmented"><legend>Tipo de análisis</legend>
            <label className={farm.analysisMode === "climate" ? "is-on" : ""}><input type="radio" name="analysisMode" value="climate" checked={farm.analysisMode === "climate"} onChange={() => update({ analysisMode: "climate" })} /><CloudRain size={18} aria-hidden="true" /><span><b>Solo clima global</b><small>Cualquier lugar · sin recomendaciones agrícolas</small></span></label>
            <label className={farm.analysisMode === "regional" ? "is-on" : ""}><input type="radio" name="analysisMode" value="regional" checked={farm.analysisMode === "regional"} onChange={() => update({ analysisMode: "regional" })} /><Sprout size={18} aria-hidden="true" /><span><b>Revisar mis registros</b><small>Diagnóstico parcial y comparación</small></span></label>
          </fieldset>
          <div className="two-col period">
            <label>Inicio del periodo<input type="date" required value={farm.start} onChange={e => update({ start: e.target.value })} /></label>
            <label>Duración del periodo (días)<input type="number" required min="30" max="731" value={Number.isNaN(farm.horizonDays) ? "" : farm.horizonDays} onChange={e => update({ horizonDays: e.target.value === "" ? NaN : Number(e.target.value) })} /></label>
          </div>
          <p className="small muted">El periodo climático es configurable. No se asignan calendarios de cultivo por país o hemisferio sin evidencia.</p>

          <div className="campaign-block" id="registro">
            <h3>Lo que ya sembraste (historial) <span className="count-pill">{farm.history.length} campañas registradas</span></h3>
            <p className="small muted">Campañas pasadas en este terreno. Sirven para ver si se repite el mismo cultivo; no se infiere daño al suelo.</p>
            <p className="small muted origin-help"><b>Procedencia:</b> «declarado» = lo indicas tú · «medido» = con registros o instrumentos · «estimado» = aproximado · «desconocido» = no se usa para interpretar.</p>
            {farm.history.length === 0 && <p className="empty-inline">Sin campañas todavía. Añade lo que se sembró antes en este terreno.</p>}
            {farm.history.map((c, i) => <div className="campaign-row" key={i}>
              <CropSelect label={`Cultivo histórico ${i + 1}`} value={c.crop} onChange={crop => campaign("history", i, { crop })} />
              <label>Siembra<input type="date" required value={c.start} onChange={e => campaign("history", i, { start: e.target.value })} /></label>
              <label>Cosecha<input type="date" required value={c.end} onChange={e => campaign("history", i, { end: e.target.value })} /></label>
              <label>Procedencia<select value={c.origin} onChange={e => campaign("history", i, { origin: e.target.value as Campaign["origin"] })}>{origins.map(o => <option key={o}>{o}</option>)}</select></label>
              <button type="button" className="icon-button" onClick={() => update({ history: farm.history.filter((_, n) => n !== i) })}><Trash2 size={16} aria-hidden="true" /><span>Quitar campaña {i + 1}</span></button>
            </div>)}
            <button type="button" className="button ghost" disabled={farm.history.length >= 12} onClick={() => update({ history: [...farm.history, nextCampaign(farm.history, addDays(farm.start, -365))] })}><Plus size={16} aria-hidden="true" />Añadir campaña</button>
          </div>

          {farm.analysisMode === "regional" && <div className="campaign-block reveal">
            <h3>Lo que planeas sembrar (A)</h3>
            <p className="small muted">Las campañas que quieres evaluar dentro del periodo. Debajo puedes añadir hasta dos alternativas propias para compararlas.</p>
            {farm.current.map((c, i) => <div className="campaign-row current" key={i}>
              <CropSelect label={`A · ciclo ${i + 1}`} value={c.crop} onChange={crop => campaign("current", i, { crop })} />
              <label>Siembra<input type="date" required value={c.start} onChange={e => campaign("current", i, { start: e.target.value })} /></label>
              <label>Cosecha<input type="date" required value={c.end} onChange={e => campaign("current", i, { end: e.target.value })} /></label>
              <label>Procedencia<select value={c.origin} onChange={e => campaign("current", i, { origin: e.target.value as Campaign["origin"] })}>{origins.map(o => <option key={o}>{o}</option>)}</select></label>
            </div>)}
            <button type="button" className="button ghost" disabled={farm.current.length >= 12} onClick={() => update({ current: [...farm.current, nextCampaign(farm.current, farm.start)] })}><Plus size={16} aria-hidden="true" />Añadir ciclo para completar</button>
          </div>}

          {farm.analysisMode === "regional" && <div className="campaign-block reveal">
            <h3>Alternativas para comparar <span className="count-pill">opcional</span></h3>
            <p className="small muted">¿Y si sembraras otra cosa? Crea una alternativa (parte de una copia de A) y cambia cultivos o fechas. Son escenarios tuyos, no recomendaciones.</p>
            {coverage.demoAllowed && <p className="small muted">En la demo de Virú ya se añaden B y C ilustrativas; las tuyas aparecerán después.</p>}
            {farm.alternatives.map((alt, ai) => { const letter = String.fromCharCode(65 + altOffset + ai); return <div className="alt-card" key={ai}>
              <div className="alt-head"><span className="alt-letter" aria-hidden="true">{letter}</span>
                <label className="alt-name">Nombre de la alternativa {letter}<input value={alt.name} maxLength={60} onChange={e => setAlternative(ai, { name: e.target.value })} /></label>
                <button type="button" className="icon-button" onClick={() => update({ alternatives: farm.alternatives.filter((_, n) => n !== ai) })}><Trash2 size={16} aria-hidden="true" /><span>Quitar alternativa {letter}</span></button></div>
              {alt.campaigns.map((c, ci) => <div className="campaign-row alt-row" key={ci}>
                <CropSelect label={`${letter} · ciclo ${ci + 1}`} value={c.crop} onChange={crop => altCampaign(ai, ci, { crop })} />
                <label>Siembra<input type="date" required value={c.start} onChange={e => altCampaign(ai, ci, { start: e.target.value })} /></label>
                <label>Cosecha<input type="date" required value={c.end} onChange={e => altCampaign(ai, ci, { end: e.target.value })} /></label>
                <button type="button" className="icon-button" disabled={alt.campaigns.length <= 1} onClick={() => setAlternative(ai, { campaigns: alt.campaigns.filter((_, n) => n !== ci) })}><Trash2 size={16} aria-hidden="true" /><span>Quitar ciclo {ci + 1} de {letter}</span></button>
              </div>)}
              <button type="button" className="button ghost" disabled={alt.campaigns.length >= 12} onClick={() => setAlternative(ai, { campaigns: [...alt.campaigns, { ...nextCampaign(alt.campaigns, farm.start), origin: "estimado" }] })}><Plus size={16} aria-hidden="true" />Añadir ciclo a {letter}</button>
            </div>; })}
            <button type="button" className="button secondary" disabled={farm.alternatives.length >= 2} onClick={() => update({ alternatives: [...farm.alternatives, { name: `Alternativa ${String.fromCharCode(65 + altOffset + farm.alternatives.length)}`, campaigns: farm.current.length ? farm.current.map(c => ({ ...c, origin: "estimado" as const })) : [{ ...nextCampaign([], farm.start), origin: "estimado" as const }] }] })}><Plus size={16} aria-hidden="true" />Añadir alternativa</button>
          </div>}
          <label className="check-label"><input type="checkbox" checked={farm.illustrative} onChange={e => update({ illustrative: e.target.checked })} /> Estos registros son un caso ilustrativo</label>
        </section>
        </fieldset>

        {errors.length > 0 && <div className="notice error shake" role="alert" id="form-errors" tabIndex={-1}><AlertCircle size={20} aria-hidden="true" /><div><strong>Revisa los datos para continuar</strong><ul>{errors.map((s, i) => <li key={i}>{s}</li>)}</ul></div></div>}
        <div className="action-bar" id="accion">
          <div className="action-summary">
            <span className={hasPoint ? "pill ok" : "pill"}><MapPin size={14} aria-hidden="true" />{hasPoint ? `${farm.lat.toFixed(3)}, ${farm.lon.toFixed(3)}` : "Sin ubicación"}</span>
            <span className="pill"><CalendarDays size={14} aria-hidden="true" />{Number.isNaN(farm.horizonDays) ? "—" : farm.horizonDays} días</span>
            <span className="pill">{farm.analysisMode === "climate" ? "Solo clima" : `${farm.current.length} ${farm.current.length === 1 ? "ciclo" : "ciclos"} en A${farm.alternatives.length ? ` · ${farm.alternatives.length} ${farm.alternatives.length === 1 ? "alternativa" : "alternativas"}` : ""}`}</span>
          </div>
          <button className="button big" type="submit" disabled={loading}>{loading ? "Consultando NASA POWER…" : farm.analysisMode === "climate" ? "Consultar clima NASA" : "Consultar clima y comparar"}<ArrowRight size={18} aria-hidden="true" /></button>
        </div>
        <p className="small muted form-foot">Consulta pública a NASA POWER. Sin cuenta. Los datos del formulario no se guardan en una base de datos.</p>
        <p className="sr-only" role="status">{loading ? "Consulta en curso; puede tardar hasta 25 segundos" : report ? "Informe disponible" : ""}</p>
      </form>

      {dirty && report && <p className="notice sticky-note" role="status">Hay cambios sin calcular. El informe muestra las entradas de la última consulta; vuelve a comparar para actualizarlas.</p>}

      <section id="diagnostico" className="section">
        <SectionHeading step={3} title="Lo que podemos observar" text="Historia agrícola declarada y contexto climático, con sus límites." />
        {loading ? <Loader /> : !report ? <div className="empty"><Leaf size={28} aria-hidden="true" /><p>El diagnóstico aparecerá al consultar el terreno. ¿Con prisa? Pulsa «Probar demo de Virú» arriba.</p></div> : <div className="results">
          <p className="notice neutral"><strong>{report.coverage.level === "climate-only" ? "Alcance: clima global" : "Alcance: análisis parcial"}</strong>. {report.coverage.reason} Recomendaciones agrícolas: no habilitadas.</p>
          {climateError && <div className="notice error" role="alert"><AlertCircle size={20} aria-hidden="true" /><p>{climateError} Puedes revisar restricciones locales; no hay datos climáticos sustitutos. Usa «Consultar clima y comparar» para reintentar.</p></div>}
          {report.climate ? <div className="card climate-card">
            <div className="climate-header"><h3>Clima histórico · NASA POWER</h3><span>{report.climate.query.start} → {report.climate.query.end} · {report.climate.days.length} días</span></div>
            <ClimateKpis report={report} />
            <ClimateChart climate={report.climate} />
            <p className="small muted">{report.climate.spatialSupport}</p>
            <p className="small">API {report.climate.version} · {report.climate.timeStandard} · T2M, T2M_MIN, T2M_MAX: °C; PRECTOTCORR: mm/día. Faltantes: {Object.entries(report.climate.missing).map(([k, v]) => `${k}: ${v}`).join("; ")}.</p>
            <a className="link-arrow" href={report.climate.url} target="_blank" rel="noreferrer">Abrir consulta de origen NASA</a>
          </div> : <p className="muted">Clima no disponible. La evaluación térmica queda incompleta.</p>}
          <div className="card">
            <div className="diagnosis"><h3>{report.input.name}</h3><p>{report.input.illustrative ? "Caso ilustrativo" : "Perfil declarado"} · {report.history.count} registros ({report.history.knownCount} con procedencia conocida) · repetición máxima: {report.history.maxRepeat === null ? "no calculable por datos incompletos o fechas inválidas" : `${report.history.maxRepeat} campañas de una especie`}. <strong>Esto no demuestra degradación del suelo.</strong></p>{report.history.overlappingOrInvalid && <p className="notice">El historial contiene intervalos inválidos o solapados. Revisa las fechas antes de interpretarlo.</p>}</div>
            <HistoryEvidence report={report} />
          </div>
        </div>}
      </section>

      <section id="rotaciones" className="section">
        <SectionHeading step={4} title="Compara alternativas" text="Compatibilidad, diversidad, agua y datos faltantes. No hay un óptimo universal." />
        {!report ? <p className="empty">{loading ? "Calculando alternativas…" : "Consulta una ubicación para conocer el alcance disponible."}</p> : report.strategies.length === 0 ? <p className="notice neutral">Informe climático global. No se generan rotaciones ni recomendaciones: faltan datos agronómicos regionales suficientes.</p> : <div className="results">
          <p className="notice neutral">Horizonte común: {report.strategies[0].horizon.start} a {report.strategies[0].horizon.end} · intervalos de cultivo [siembra, cosecha). Prioridad: {report.input.priority}. No se aplica una puntuación sin validar.</p>
          <WaterBars report={report} />
          <p className="small muted scroll-hint">En pantallas pequeñas, desliza la tabla para ver B y C.</p>
          <div className="table-scroll card flush" tabIndex={0} role="region" aria-label={`Comparación desplazable de ${report.strategies.length} estrategias`}><table className="comparison"><caption>Comparación descriptiva de estrategias. {report.coverage.demoAllowed ? "B y C son propuestas ilustrativas de la demo; requieren validar variedades y ventanas locales. " : ""}{report.strategies.some(s => s.userProposed) ? "Las alternativas propias son escenarios tuyos, no recomendaciones." : report.strategies.length === 1 ? "Solo hay una secuencia: añade alternativas en el paso 2 para compararlas." : ""}</caption><thead><tr><th>Criterio</th>{report.strategies.map(s => <th key={s.id}><span className="strategy-id">{s.id}</span> {s.name}</th>)}</tr></thead><tbody>
            <tr><th>Secuencia</th>{report.strategies.map(s => <td key={s.id}>{s.campaigns.map((c, i) => <div className="cycle" key={i}><span className={`crop-dot ${c.crop}`} /><div><strong>{catalog[c.crop].name}</strong><small>{c.start} → {c.end}<br />{c.origin}</small></div></div>)}</td>)}</tr>
            <tr><th>Estado</th>{report.strategies.map(s => <td key={s.id}><span className={`status ${s.status === "Incompatible" ? "bad" : ""}`}>{s.status}</span></td>)}</tr>
            <tr><th>Familias botánicas</th>{report.strategies.map(s => <td key={s.id}>{s.families}</td>)}</tr>
            <tr><th>Repetición máxima</th>{report.strategies.map(s => <td key={s.id}>{s.maxRepeat} {s.maxRepeat === 1 ? "ciclo" : "ciclos"}</td>)}</tr>
            <tr><th>Días sin cultivo registrado</th>{report.strategies.map(s => <td key={s.id}>{s.idleDays ?? "No calculable"}</td>)}</tr>
            <tr><th>Demanda hídrica estimada (ETc)</th>{report.strategies.map(s => <td key={s.id}>{mm(s.water?.etcMm)}</td>)}</tr>
            <tr><th>Precipitación de grilla en campañas</th>{report.strategies.map(s => <td key={s.id}>{mm(s.water?.rainMm)}</td>)}</tr>
            <tr><th>Déficit bruto (ETc − lluvia)</th>{report.strategies.map(s => <td key={s.id}><strong>{mm(s.water?.grossDeficitMm)}</strong></td>)}</tr>
            <tr><th>Grados-día por campaña</th>{report.strategies.map(s => <td key={s.id}>{s.water ? s.water.campaigns.map((c, i) => <div key={i}><small>{catalog[c.crop].name}: {c.gdd === null ? (c.gddBaseC === null ? "sin base térmica documentada" : "datos incompletos") : `${Math.round(c.gdd).toLocaleString("es")} °C·día (base ${c.gddBaseC} °C)`}</small></div>) : "No calculable"}</td>)}</tr>
          </tbody></table></div>
          <p className="small muted">Más familias no implica mayor rendimiento. Los intervalos sin cultivo no permiten saber si el suelo conserva residuos o cobertura.</p>
          <p className="small muted">Demanda hídrica: ETo de Hargreaves (FAO-56, ec. 52) con temperaturas NASA POWER × Kc genéricos de FAO-56 (tablas 11 y 12). Es la demanda de un cultivo sano en condiciones estándar, no una necesidad de riego validada. La lluvia total no es lluvia efectiva, así que el déficit bruto subestima el riego necesario. Grados-día: método promedio (McMaster y Wilhelm, 1997).</p>
          <div className="accordion">{report.strategies.map(s => <details key={s.id} className="strategy-details"><summary>{s.id} · Restricciones y explicación · {s.checks.filter(c => c.status === "incumple").length} incumplidas</summary><ul className="check-list">{s.checks.map(c => <li key={c.rule} className={`check-${c.status}`}>{c.status === "cumple" ? <Check size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}<div><strong>{c.rule} · {c.status}</strong><p>{c.detail}</p><small>Fuente: {c.source.startsWith("https://") ? <a href={c.source} target="_blank" rel="noreferrer">Referencia metodológica</a> : c.source}</small></div></li>)}</ul></details>)}</div>
        </div>}
        <details className="catalog soft-details"><summary>Consultar catálogo y aplicabilidad de los cultivos</summary><div className="table-scroll" tabIndex={0} role="region" aria-label="Catálogo desplazable"><table><caption>Referencias generales FAO; no representan calendarios regionales.</caption><thead><tr><th>Cultivo / familia</th><th>Ciclo de referencia</th><th>Aplicabilidad</th></tr></thead><tbody>{crops.map(c => <tr key={c}><th>{catalog[c].name}<small>{catalog[c].species} · {catalog[c].family}</small></th><td>{catalog[c].days.join("–")} días</td><td>{catalog[c].applicability}. <a href={catalog[c].source} target="_blank" rel="noreferrer">FAO, tabla 6</a></td></tr>)}</tbody></table></div></details>
      </section>

      <section id="evidencias" className="section evidence">
        <SectionHeading step={5} title="Una decisión que puedes revisar" text="Las entradas, las reglas y las ausencias viajan con el informe.">
          {report && <div className="report-actions"><button className="button light" onClick={() => download(report)}><Download size={17} aria-hidden="true" />Descargar JSON</button><button className="button light" onClick={() => window.print()}><Printer size={17} aria-hidden="true" />Imprimir informe</button></div>}
        </SectionHeading>
        {report ? <div className="results">
          <p>Metodología {report.methodologyVersion} · informe generado {report.createdAt}. {report.climate ? `NASA consultado ${report.climate.retrievedAt}. Fuentes: ${report.climate.sources.join(", ")}.` : "Sin serie NASA verificada en este informe."}</p>
          <ul className="limit-list">{report.limitations.map(s => <li key={s}>{s}</li>)}</ul>
          <div className="regional-block"><RegionalEvidence report={report} /></div>
          <h3>Antes de decidir con un agrónomo</h3><p>Confirma parcela, variedad, ventanas de siembra, drenaje, análisis de suelo y balance hídrico. Contrasta los datos de grilla con registros locales.</p>
          <details className="soft-details"><summary>Inspeccionar entradas utilizadas en este informe</summary><pre>{JSON.stringify(report.input, null, 2)}</pre></details>
        </div> : <p>El informe incluirá coordenadas, fechas, procedencia, unidades, versión NASA, reglas y limitaciones. No contiene recomendaciones certificadas.</p>}
      </section>

      <footer><span className="brand-footer"><Sprout size={18} aria-hidden="true" /> AgroOrbit Nexus</span><p>Datos climáticos: NASA POWER. Mapa: © OpenStreetMap contributors. Sin afiliación ni aval de NASA.</p><p lang="en">Explainable crop-rotation scenarios. Historical climate, farmer-provided context, transparent evidence gaps.</p><a href="https://github.com/bel001/AgroOrbit-Nexus">Código MIT · fuentes y limitaciones</a></footer>
    </main>
  </>;
}
