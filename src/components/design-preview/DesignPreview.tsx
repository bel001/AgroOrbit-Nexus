"use client";
import { useState } from "react";
import {
  Sprout, ArrowRight, ArrowDown, Check, Droplets, Satellite, ShieldCheck, Users, AlertCircle,
} from "lucide-react";
import Image from "next/image";
import styles from "./design-preview.module.css";

const STEPS = [
  { id: "inicio", es: "Inicio", en: "Home" },
  { id: "terreno", es: "Terreno", en: "Field" },
  { id: "cultivos", es: "Cultivos", en: "Crops" },
  { id: "condiciones", es: "Condiciones", en: "Conditions" },
  { id: "alternativas", es: "Alternativas", en: "Options" },
  { id: "evidencias", es: "Evidencias", en: "Evidence" },
];

export default function DesignPreview() {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [altTab, setAltTab] = useState<"agua" | "suelo" | "nino">("agua");
  const t = (es: string, en: string) => (lang === "en" ? en : es);

  return (
    <div className={styles.dp}>
      {/* Header */}
      <header className={styles.dpHeader}>
        <div className={styles.dpHeaderInner}>
          <a className={styles.dpBrand} href="#inicio">
            <span className={styles.dpBrandMark}><Sprout size={20} aria-hidden="true" /></span>
            <span>AgroOrbit <strong>Nexus</strong><small>From Space to Soil</small></span>
          </a>
          <nav className={styles.dpNav} aria-label={t("Pasos del análisis", "Analysis steps")}>
            {STEPS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className={i === 0 ? "isActive" : ""}>
                <span className={styles.dpNavDot}>{i + 1}</span>
                <span>{t(s.es, s.en)}</span>
              </a>
            ))}
          </nav>
          <div className={styles.dpLang} role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === "es"} onClick={() => setLang("es")} lang="es">ES</button>
            <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en">EN</button>
          </div>
        </div>
        <div className={styles.dpProgress} role="progressbar" aria-valuenow={1} aria-valuemin={0} aria-valuemax={6}>
          <span style={{ width: "16%" }} />
        </div>
      </header>

      <main className={styles.dpMain} id="inicio">
        {/* HERO */}
        <section className={styles.dpHero}>
          <div className={styles.dpHeroCopy}>
            <h1>
              {t("Entiende tu terreno ", "Understand your field ")}
              <em>{t("antes de decidir qué sembrar.", "before you decide what to plant.")}</em>
            </h1>
            <p>
              {t(
                "Explora información climática, registra tus cultivos y compara alternativas mediante indicadores de agua, suelo y diversidad. Una lectura del territorio antes de la decisión.",
                "Explore climate information, record your crops and compare alternatives through water, soil and diversity indicators. A reading of the territory before the decision."
              )}
            </p>
            <p className="small muted" style={{ margin: "0 0 16px", fontWeight: 600 }}>
              {t("Caso ilustrativo: Virú, La Libertad. Sin validación regional independiente.", "Illustrative case: Virú, La Libertad. No independent regional validation.")}
            </p>
            <div className={styles.dpHeroActions}>
              <a className="button big" href="#terreno">
                <ArrowDown size={18} aria-hidden="true" />
                {t("Explorar caso ilustrativo", "Explore illustrative case")}
              </a>
              <a className="button secondary big" href="#alternativas">
                {t("Conocer el proceso", "Learn the process")} <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <ul className={styles.dpHeroFacts} aria-label={t("Fuentes y alcance", "Sources and scope")}>
              <li><Users size={16} aria-hidden="true" />{t("Para extensionistas y agricultores", "For extension agents and farmers")}</li>
              <li><Satellite size={16} aria-hidden="true" />{t("Clima diario NASA POWER", "NASA POWER daily climate")}</li>
              <li><Droplets size={16} aria-hidden="true" />{t("Agua en m³/ha con FAO-56", "Water in m³/ha with FAO-56")}</li>
              <li><ShieldCheck size={16} aria-hidden="true" />{t("Exploración, no recomendación", "Exploration, not a recommendation")}</li>
            </ul>
          </div>
          <div className={styles.dpHeroVisual}>
            <Image src="/design-preview/field-aerial.jpg" alt={t("Parcelas agrícolas vistas desde altura", "Agricultural plots seen from above")} fill sizes="(max-width: 1000px) 100vw, 50vw" priority style={{ objectFit: "cover" }} />
            <div className={styles.dpHeroOverlay} />
            <span className={styles.dpHeroBadge}>{t("Lectura del territorio", "Reading the territory")}</span>
          </div>
        </section>

        {/* TERRENO */}
        <section id="terreno" className={styles.dpSection}>
          <div className={styles.dpSectionTitle}>
            <h2><span className={styles.dpStepNum}>1</span>{t("Terreno", "Field")}</h2>
            <p>{t("Ficha cartográfica del caso ilustrativo. Coordenadas de referencia, sin límites legales de parcela.", "Cartographic sheet of the illustrative case. Reference coordinates, no legal parcel boundaries.")}</p>
          </div>
          <div className={styles.dpNotice + " " + styles.neutral}>
            <strong>{t("Cobertura: diagnóstico agrícola parcial", "Coverage: partial farm diagnosis")}</strong>. {t("Perfil de demostración sin validación agronómica. No genera recomendaciones.", "Demo profile without agronomic validation. Makes no recommendations.")}
          </div>
          <div className={styles.dpFieldGrid}>
            <div className={styles.dpCard}>
              <div className={styles.dpFieldInfo}>
                <div className={styles.dpFieldRow}><span>{t("Nombre del terreno", "Field name")}</span><strong>{t("Caso ilustrativo Virú", "Virú illustrative case")}</strong></div>
                <div className={styles.dpFieldRow}><span>{t("Localidad", "Location")}</span><strong>Virú, La Libertad, Perú</strong></div>
                <div className={styles.dpFieldRow}><span>{t("Coordenadas", "Coordinates")}</span><strong>-8.112, -78.753</strong></div>
                <div className={styles.dpFieldRow}><span>{t("Área", "Area")}</span><strong>{t("No declarada (ha)", "Not declared (ha)")}</strong></div>
                <div className={styles.dpFieldRow}><span>{t("Tipo de suelo", "Soil texture")}</span><strong>{t("Desconocido", "Unknown")}</strong></div>
                <div className={styles.dpFieldRow}><span>{t("Riego", "Irrigation")}</span><strong>{t("Gravedad (sistema Chavimochic)", "Gravity (Chavimochic system)")}</strong></div>
                <div className={styles.dpFieldRow}><span>{t("Procedencia de datos", "Data source")}</span><strong>{t("Declarado / ilustrativo", "Declared / illustrative")}</strong></div>
              </div>
              <p className="small muted" style={{ marginTop: 16, marginBottom: 0 }}>
                {t("Coordenadas de referencia del piloto. No representan límites catastrales ni mediciones de campo.", "Reference coordinates of the pilot. They do not represent cadastral boundaries or field measurements.")}
              </p>
            </div>
            <div className={styles.dpMapFrame}>
              <svg className={styles.dpMapSvg} viewBox="0 0 400 360" preserveAspectRatio="xMidYMid slice" aria-label={t("Mapa esquemático de referencia", "Schematic reference map")}>
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#b9c7bb" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="400" height="360" fill="#dfe8d8" />
                <rect width="400" height="360" fill="url(#grid)" />
                {/* schematic parcels */}
                <rect x="60" y="80" width="110" height="70" fill="rgb(31 107 79 / .18)" stroke="#1f6b4f" strokeWidth="1.5" rx="4" />
                <rect x="180" y="120" width="90" height="60" fill="rgb(44 95 111 / .16)" stroke="#2c5f6f" strokeWidth="1.5" rx="4" />
                <rect x="260" y="60" width="80" height="90" fill="rgb(201 154 46 / .16)" stroke="#c99a2e" strokeWidth="1.5" rx="4" />
                <rect x="90" y="200" width="130" height="80" fill="rgb(79 138 58 / .16)" stroke="#4f8a3a" strokeWidth="1.5" rx="4" />
                {/* irrigation canal */}
                <path d="M 0 250 Q 120 230 200 260 T 400 240" stroke="#2c5f6f" strokeWidth="3" fill="none" strokeDasharray="6 4" />
                <text x="300" y="232" fontSize="11" fill="#1f4a58" fontWeight="600">{t("Canal", "Canal")}</text>
                {/* marker */}
                <g transform="translate(200,150)">
                  <circle r="14" fill="rgb(31 107 79 / .25)" />
                  <circle r="8" fill="#1f6b4f" stroke="#fff" strokeWidth="2" />
                  <text y="-22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#13261f">{t("Punto de referencia", "Reference point")}</text>
                </g>
                {/* scale */}
                <g transform="translate(20,330)">
                  <line x1="0" y1="0" x2="60" y2="0" stroke="#13261f" strokeWidth="2" />
                  <line x1="0" y1="-4" x2="0" y2="4" stroke="#13261f" strokeWidth="2" />
                  <line x1="60" y1="-4" x2="60" y2="4" stroke="#13261f" strokeWidth="2" />
                  <text x="30" y="-8" textAnchor="middle" fontSize="10" fill="#13261f">~1 km</text>
                </g>
              </svg>
              <div style={{ padding: "8px 16px 0", display: "flex", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--warn-ink)", background: "var(--warn-bg)", padding: "2px 8px", borderRadius: 999 }}>{t("Esquema ilustrativo", "Illustrative scheme")}</span>
              </div>
              <div className={styles.dpMapLegend}>
                <span className={styles.dpMapSwatch} />
                <div>
                  <b>{t("Celda de referencia NASA POWER", "NASA POWER reference cell")}</b>
                  <span>{t("La meteorología se muestrea en el punto de referencia; no representa mediciones de parcela.", "Meteorology is sampled at the reference point; it does not represent plot measurements.")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CULTIVOS */}
        <section id="cultivos" className={styles.dpSection}>
          <div className={styles.dpSectionTitle}>
            <h2><span className={styles.dpStepNum}>2</span>{t("Cultivos y periodo", "Crops and period")}</h2>
            <p>{t("Línea de tiempo agrícola del caso ilustrativo. Siembra, cosecha y secuencia.", "Agricultural timeline of the illustrative case. Sowing, harvest and sequence.")}</p>
          </div>
          <div className={styles.dpCard}>
            <div className={styles.dpTimeline}>
              <div className={styles.dpTimelineRow}>
                <span className={styles.dpTimelineLabel}>{t("Secuencia A", "Sequence A")}</span>
                <div className={styles.dpTimelineTrack}>
                  <span className={styles.dpTimelineBar + " " + styles.maize} style={{ left: "4%", width: "30%" }}>Maíz</span>
                  <span className={styles.dpTimelineBar + " " + styles.maize} style={{ left: "36%", width: "30%" }}>Maíz</span>
                  <span className={styles.dpTimelineBar + " " + styles.maize} style={{ left: "68%", width: "28%" }}>Maíz</span>
                </div>
              </div>
              <div className={styles.dpTimelineRow}>
                <span className={styles.dpTimelineLabel}>{t("Alternativa B", "Alternative B")}</span>
                <div className={styles.dpTimelineTrack}>
                  <span className={styles.dpTimelineBar + " " + styles.maize} style={{ left: "4%", width: "30%" }}>Maíz</span>
                  <span className={styles.dpTimelineBar + " " + styles.bean} style={{ left: "36%", width: "26%" }}>Frijol</span>
                  <span className={styles.dpTimelineBar + " " + styles.maize} style={{ left: "64%", width: "32%" }}>Maíz</span>
                </div>
              </div>
              <div className={styles.dpTimelineRow}>
                <span className={styles.dpTimelineLabel}>{t("Alternativa C", "Alternative C")}</span>
                <div className={styles.dpTimelineTrack}>
                  <span className={styles.dpTimelineBar + " " + styles.maize} style={{ left: "4%", width: "30%" }}>Maíz</span>
                  <span className={styles.dpTimelineBar + " " + styles.sorghum} style={{ left: "36%", width: "28%" }}>Sorgo</span>
                  <span className={styles.dpTimelineBar + " " + styles.bean} style={{ left: "66%", width: "30%" }}>Frijol</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12, fontSize: 13, color: "var(--ink-2)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#c99a2e" }} />{t("Maíz", "Maize")}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#4f8a3a" }} />{t("Frijol", "Bean")}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#a2694b" }} />{t("Sorgo", "Sorghum")}</span>
            </div>
            <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
              {t("Las barras representan periodos de cultivo dentro de un horizonte común. Los campos de formulario son representaciones estáticas del prototipo.", "Bars represent crop periods within a common horizon. Form fields are static representations of the prototype.")}
            </p>
          </div>
          <div className={styles.dpBotanical}>
            <figure className={styles.dpBotanicalCard}>
              <Image src="/design-preview/maize-stalk.jpg" alt={t("Planta de maíz", "Maize plant")} width={800} height={500} style={{ width: "100%", height: 160, objectFit: "cover" }} />
              <figcaption><b>{t("Maíz", "Maize")}</b>{t("Cereal de ciclo largo, alta demanda hídrica.", "Long-cycle cereal, high water demand.")}</figcaption>
            </figure>
            <figure className={styles.dpBotanicalCard}>
              <Image src="/design-preview/beans.jpg" alt={t("Frijol", "Bean")} width={800} height={500} style={{ width: "100%", height: 160, objectFit: "cover" }} />
              <figcaption><b>{t("Frijol", "Bean")}</b>{t("Leguminosa, aporta diversidad botánica.", "Legume, adds botanical diversity.")}</figcaption>
            </figure>
            <figure className={styles.dpBotanicalCard}>
              <Image src="/design-preview/corn-field-wide.jpg" alt={t("Parcela de maíz", "Maize field")} width={800} height={500} style={{ width: "100%", height: 160, objectFit: "cover" }} />
              <figcaption><b>{t("Sorgo", "Sorghum")}</b>{t("Cereal alternativo de menor demanda hídrica.", "Alternative cereal with lower water demand.")}</figcaption>
            </figure>
          </div>
        </section>

        {/* CONDICIONES */}
        <section id="condiciones" className={styles.dpSection}>
          <div className={styles.dpSectionTitle}>
            <h2><span className={styles.dpStepNum}>3</span>{t("Condiciones climáticas", "Climate conditions")}</h2>
            <p>{t("Panel de lectura científica. Temperatura, lluvia modelada y periodo de referencia.", "Scientific reading panel. Temperature, modelled rainfall and reference period.")}</p>
          </div>
          <div className={styles.dpClimateGrid}>
            <div className={styles.dpCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--warn-ink)", background: "var(--warn-bg)", padding: "3px 10px", borderRadius: 999 }}>{t("Ejemplo visual", "Visual example")}</span>
                <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{t("Temperatura media y lluvia mensual", "Mean temperature and monthly rainfall")}</span>
              </div>
              <div className={styles.dpChart} aria-label={t("Gráfica climática", "Climate chart")}>
                <svg viewBox="0 0 520 240" width="100%" height="100%" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2c5f6f" stopOpacity=".5" />
                      <stop offset="100%" stopColor="#2c5f6f" stopOpacity=".05" />
                    </linearGradient>
                  </defs>
                  {/* grid lines */}
                  {[40, 80, 120, 160, 200].map((y) => (
                    <line key={y} x1="40" y1={y} x2="500" y2={y} stroke="#dde5dd" strokeWidth="1" />
                  ))}
                  {/* bars (rainfall) */}
                  {[30, 5, 2, 0, 0, 1, 4, 12, 18, 25, 35, 40].map((v, i) => {
                    const h = v * 2.5;
                    const x = 50 + i * 38;
                    return <rect key={i} x={x} y={200 - h} width="24" height={h} fill="url(#rainGrad)" rx="2" />;
                  })}
                  {/* temp line */}
                  <polyline
                    points="62,150 100,148 138,135 176,120 214,105 252,95 290,90 328,98 366,115 404,135 442,150 480,160"
                    fill="none" stroke="#1f6b4f" strokeWidth="2.5" strokeLinejoin="round" />
                  {/* x labels */}
                  {["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map((m, i) => (
                    <text key={i} x={62 + i * 38} y={225} textAnchor="middle" fontSize="10" fill="#46594f">{m}</text>
                  ))}
                </svg>
              </div>
              <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
                {t("Ejemplo visual estático. Valores no verificados; no representan mediciones de campo. La línea verde indica la media mensual de temperatura; la franja azul, la lluvia acumulada. Para contrastar con la media histórica, consulta la serie NASA POWER del terreno.", "Static visual example. Values unverified; not field measurements. The green line shows monthly mean temperature; the blue band, accumulated rainfall. To contrast with the historical mean, query the field's NASA POWER series.")}
              </p>
            </div>
            <div className={styles.dpKpiGrid}>
              <div className={styles.dpKpi}>
                <span>{t("Temperatura media", "Mean temperature")}</span>
                <strong>22.4 °C</strong>
                <small>{t("12 meses", "12 months")}</small>
              </div>
              <div className={styles.dpKpi}>
                <span>{t("Días consultados", "Days queried")}</span>
                <strong>365</strong>
                <small>{t("Serie diaria", "Daily series")}</small>
              </div>
              <div className={styles.dpKpi}>
                <span>{t("Valores faltantes", "Missing values")}</span>
                <strong>0</strong>
                <small>{t("Sin huecos", "No gaps")}</small>
              </div>
              <div className={`${styles.dpKpi} ${styles.muted}`}>
                <span>{t("Lluvia total de grilla (modelo)", "Total grid rainfall (model)")}</span>
                <strong>42 mm</strong>
                <small>{t("Modelo, no lluvia efectiva", "Model, not effective rain")}</small>
              </div>
            </div>
            <div className={styles.dpCard} style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 16, marginBottom: 8, color: "var(--brand-strong)" }}>{t("Diagrama del agua en el sistema", "Water in the system diagram")}</h3>
              <svg viewBox="0 0 460 120" width="100%" height="120" aria-label={t("Diagrama del agua", "Water diagram")} style={{ display: "block" }}>
                <defs>
                  <linearGradient id="waterFlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2c5f6f" stopOpacity=".9" />
                    <stop offset="100%" stopColor="#1f6b4f" stopOpacity=".9" />
                  </linearGradient>
                </defs>
                {/* rain */}
                <g>
                  <text x="30" y="20" fontSize="11" fill="#1f4a58" fontWeight="600">{t("Lluvia / riego", "Rain / irrigation")}</text>
                  <path d="M 40 28 L 40 55" stroke="#2c5f6f" strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx="40" cy="60" r="4" fill="#2c5f6f" />
                </g>
                {/* soil */}
                <rect x="10" y="78" width="440" height="30" rx="6" fill="rgb(233 226 211 / .9)" stroke="#b9c7bb" />
                <text x="20" y="97" fontSize="11" fill="#46594f" fontWeight="600">{t("Suelo · agua utilizable", "Soil · usable water")}</text>
                {/* plant cross-section: roots + stem + leaves */}
                <g transform="translate(230,28)" stroke="#1f6b4f" fill="none" strokeWidth="1.6">
                  {/* stem */}
                  <line x1="0" y1="50" x2="0" y2="8" />
                  {/* leaves */}
                  <path d="M 0 30 Q -16 22 -22 10 Q -8 18 0 26" fill="#5f7a3a" stroke="#1f6b4f" />
                  <path d="M 0 24 Q 16 16 22 4 Q 8 12 0 20" fill="#5f7a3a" stroke="#1f6b4f" />
                  <path d="M 0 38 Q -12 34 -14 26" fill="#5f7a3a" stroke="#1f6b4f" />
                  {/* roots */}
                  <g stroke="#9a6b2f" strokeWidth="1.4">
                    <path d="M 0 50 Q -6 60 -14 70" />
                    <path d="M 0 50 Q 6 62 16 72" />
                    <path d="M -14 70 Q -20 76 -26 78" />
                    <path d="M 16 72 Q 22 78 28 80" />
                  </g>
                </g>
                {/* ET arrow */}
                <path d="M 230 28 Q 260 10 290 22" stroke="#c99a2e" strokeWidth="2" fill="none" />
                <text x="292" y="20" fontSize="10" fill="#7a440c" fontWeight="600">{t("ETc", "ETc")}</text>
                {/* flow arrow along soil */}
                <path d="M 60 93 L 200 93" stroke="url(#waterFlow)" strokeWidth="2" />
              </svg>
              <p className="small muted" style={{ marginTop: 8, marginBottom: 0 }}>
                {t("Esquema ilustrativo del balance hídrico: lluvia/riego, agua utilizable en el suelo y demanda del cultivo (ETc). No es una medición.", "Illustrative scheme of the water balance: rain/irrigation, usable water in soil and crop demand (ETc). Not a measurement.")}
              </p>
            </div>
            <div className={styles.dpCard} style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 16, marginBottom: 8, color: "var(--brand-strong)" }}>{t("Fuente y periodo", "Source and period")}</h3>
              <p className="small muted" style={{ marginBottom: 6 }}>
                {t("Fuente: NASA POWER, comunidad AG, hora solar local. El periodo de referencia es configurable.", "Source: NASA POWER, AG community, local solar time. The reference period is configurable.")}
              </p>
              <p className="small muted" style={{ marginBottom: 0 }}>
                {t("La lluvia de grilla requiere contraste local; no se usa para ordenar alternativas.", "Grid rainfall requires local comparison; it is not used to rank options.")}
              </p>
            </div>
          </div>
        </section>

        {/* ALTERNATIVAS */}
        <section id="alternativas" className={styles.dpSection}>
          <div className={styles.dpSectionTitle}>
            <h2><span className={styles.dpStepNum}>4</span>{t("Comparación de rotaciones", "Rotation comparison")}</h2>
            <p>{t("Agua, suelo y contexto de El Niño. Sin puntuación global inventada.", "Water, soil and El Niño context. No invented global score.")}</p>
          </div>
          <div className={styles.dpTabs} role="tablist">
            {(["agua", "suelo", "nino"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={altTab === tab}
                className={`${styles.dpTab} ${altTab === tab ? styles.isActive : ""}`}
                onClick={() => setAltTab(tab)}
              >
                {tab === "agua" ? t("Agua", "Water") : tab === "suelo" ? t("Suelo", "Soil") : t("El Niño", "El Niño")}
              </button>
            ))}
          </div>

          {altTab === "agua" && (
            <div className={styles.dpAltGrid}>
              {[
                { letter: "A", name: t("Maíz → Maíz → Maíz", "Maize → Maize → Maize"), water: 13120, max: 13120, seq: "A" },
                { letter: "B", name: t("Maíz → Frijol → Maíz", "Maize → Bean → Maize"), water: 12720, max: 13120, seq: "B" },
                { letter: "C", name: t("Maíz → Sorgo → Frijol", "Maize → Sorghum → Bean"), water: 11730, max: 13120, seq: "C" },
              ].map((a) => (
                <div key={a.letter} className={styles.dpAltCard}>
                  <div className={styles.dpAltHead}>
                    <span className={styles.dpAltLetter}>{a.letter}</span>
                    <span className={styles.dpAltName}>{a.name}</span>
                  </div>
                  <p className={styles.dpAltSeq}>{t("Demanda hídrica estimada (FAO-56 ETc)", "Estimated water demand (FAO-56 ETc)")}</p>
                  <ul className={styles.dpWaterBars}>
                    <li className={styles.dpWaterBar}>
                      <span>{t("Demanda", "Demand")}</span>
                      <span className={styles.dpWaterTrack}>
                        <span className={styles.dpWaterFill} style={{ width: `${(a.water / a.max) * 100}%` }} />
                      </span>
                      <span className={styles.dpWaterVal}>{a.water.toLocaleString("es-ES")} <small>m³/ha</small></span>
                    </li>
                  </ul>
                  <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
                    {t("Diferencia frente a A: ", "Difference vs A: ")}
                    <strong>{a.letter === "A" ? "—" : `${(13120 - a.water).toLocaleString("es-ES")} m³/ha`}</strong>
                  </p>
                </div>
              ))}
            </div>
          )}

          {altTab === "suelo" && (
            <div className={styles.dpAltGrid}>
              {[
                { letter: "A", name: t("Maíz → Maíz → Maíz", "Maize → Maize → Maize"), items: [
                  { label: t("Familias botánicas", "Crop families"), value: "1", weak: true },
                  { label: t("Presencia de leguminosas", "Legume present"), value: t("No", "No"), weak: true },
                  { label: t("Repetición máxima", "Max. repetition"), value: t("3 ciclos maíz", "3 maize cycles"), weak: true },
                  { label: t("Días de barbecho registrado", "Days of recorded fallow"), value: "90", weak: false },
                ]},
                { letter: "B", name: t("Maíz → Frijol → Maíz", "Maize → Bean → Maize"), items: [
                  { label: t("Familias botánicas", "Crop families"), value: "2", weak: false },
                  { label: t("Presencia de leguminosas", "Legume present"), value: t("Sí", "Yes"), weak: false },
                  { label: t("Repetición máxima", "Max. repetition"), value: t("2 ciclos maíz", "2 maize cycles"), weak: false },
                  { label: t("Días de barbecho registrado", "Days of recorded fallow"), value: "105", weak: false },
                ]},
                { letter: "C", name: t("Maíz → Sorgo → Frijol", "Maize → Sorghum → Bean"), items: [
                  { label: t("Familias botánicas", "Crop families"), value: "2", weak: false },
                  { label: t("Presencia de leguminosas", "Legume present"), value: t("Sí", "Yes"), weak: false },
                  { label: t("Repetición máxima", "Max. repetition"), value: t("1 ciclo por cultivo", "1 cycle per crop"), weak: false },
                  { label: t("Días de barbecho registrado", "Days of recorded fallow"), value: "130", weak: false },
                ]},
              ].map((a) => (
                <div key={a.letter} className={styles.dpAltCard}>
                  <div className={styles.dpAltHead}>
                    <span className={styles.dpAltLetter}>{a.letter}</span>
                    <span className={styles.dpAltName}>{a.name}</span>
                  </div>
                  <ul className={styles.dpSoilList}>
                    {a.items.map((it) => (
                      <li key={it.label} className={it.weak ? styles.weak : ""}>
                        {it.weak ? <AlertCircle size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
                        <div>
                          <span style={{ color: "var(--ink-2)", fontSize: 12 }}>{it.label}</span>
                          <strong style={{ display: "block", color: "var(--ink)" }}>{it.value}</strong>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
                    {t("Indicadores de gestión, no salud del suelo medida. «Días de barbecho registrado» cuenta los días sin cultivo declarado en la secuencia.", "Management indicators, not measured soil health. “Days of recorded fallow” counts days without a declared crop in the sequence.")}
                  </p>
                </div>
              ))}
            </div>
          )}

          {altTab === "nino" && (
            <div className={styles.dpCard}>
              <h3 style={{ marginBottom: 8 }}>{t("Contexto El Niño (replay histórico)", "El Niño context (historical replay)")}</h3>
              <p className="small muted" style={{ marginBottom: 16 }}>
                {t("Cada calendario se repite con temperaturas diarias reales de NASA POWER (1997, 2016, 2023) y se compara con 27 temporadas base. Sin atribución causal.", "Each calendar is replayed with real daily NASA POWER temperatures (1997, 2016, 2023) and compared with 27 baseline seasons. No causal attribution.")}
              </p>
              <table className={styles.dpElNinoTable}>
                <thead>
                  <tr>
                    <th>{t("Alternativa", "Option")}</th>
                    <th>{t("Agua extra vs base", "Extra water vs baseline")}</th>
                    <th>{t("Estado", "Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>A</strong> {t("Maíz → Maíz → Maíz", "Maize → Maize → Maize")}</td>
                    <td>+411 m³/ha <small style={{ display: "block", color: "var(--ink-2)", fontSize: 11 }}>{t("Por encima de todas las temporadas base", "Above every baseline season")}</small></td>
                    <td><span style={{ background: "var(--warn-bg)", color: "var(--warn-ink)", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{t("Anomalía", "Anomaly")}</span></td>
                  </tr>
                  <tr>
                    <td><strong>B</strong> {t("Maíz → Frijol → Maíz", "Maize → Bean → Maize")}</td>
                    <td>+396 m³/ha <small style={{ display: "block", color: "var(--ink-2)", fontSize: 11 }}>{t("Por encima de todas las temporadas base", "Above every baseline season")}</small></td>
                    <td><span className="status bad" style={{ background: "var(--warn-bg)", color: "var(--warn-ink)", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{t("Anomalía", "Anomaly")}</span></td>
                  </tr>
                  <tr>
                    <td><strong>C</strong> {t("Maíz → Sorgo → Frijol", "Maize → Sorghum → Bean")}</td>
                    <td>+359 m³/ha <small style={{ display: "block", color: "var(--ink-2)", fontSize: 11 }}>{t("Por encima de todas las temporadas base", "Above every baseline season")}</small></td>
                    <td><span className="status bad" style={{ background: "var(--warn-bg)", color: "var(--warn-ink)", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{t("Anomalía", "Anomaly")}</span></td>
                  </tr>
                </tbody>
              </table>
              <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
                {t("Para 2016-17 y 2023 el replay no muestra anomalía en estos datos. El contexto histórico no es una predicción.", "For 2016-17 and 2023 the replay shows no anomaly in these data. Historical context is not a prediction.")}
              </p>
            </div>
          )}
        </section>

        {/* EVIDENCIAS */}
        <section id="evidencias" className={styles.dpSection}>
          <div className={styles.dpSectionTitle}>
            <h2><span className={styles.dpStepNum}>5</span>{t("Evidencias", "Evidence")}</h2>
            <p>{t("Informe técnico visual. Datos utilizados, fuentes, métodos y limitaciones.", "Visual technical report. Data used, sources, methods and limitations.")}</p>
          </div>
          <div className={styles.dpWarn}>
            {t("Exploración, no recomendación agronómica. Caso sin validación regional independiente.", "Exploration, not an agronomic recommendation. Case without independent regional validation.")}
          </div>
          <div className={styles.dpEvidence}>
            <h3 style={{ marginBottom: 4 }}>{t("Resumen del análisis", "Analysis summary")}</h3>
            <p className="small muted" style={{ marginBottom: 0 }}>
              {t("Caso ilustrativo de Virú. Comparación descriptiva de tres secuencias por demanda hídrica, diversidad y contexto histórico de El Niño.", "Virú illustrative case. Descriptive comparison of three sequences by water demand, diversity and El Niño historical context.")}
            </p>
            <div className={styles.dpEvidenceGrid}>
              <div className={styles.dpEvidenceBlock}>
                <h3>{t("Datos utilizados", "Data used")}</h3>
                <ul>
                  <li>{t("Coordenadas de referencia", "Reference coordinates")}</li>
                  <li>{t("Serie climática NASA POWER", "NASA POWER climate series")}</li>
                  <li>{t("Registros de campañas declarados", "Declared campaign records")}</li>
                  <li>{t("Catálogo general de cultivos", "General crop catalogue")}</li>
                </ul>
              </div>
              <div className={styles.dpEvidenceBlock}>
                <h3>{t("Fuente y periodo", "Source and period")}</h3>
                <ul>
                  <li>{t("NASA POWER · AG community", "NASA POWER · AG community")}</li>
                  <li>{t("Periodo configurable (ej. 12 meses)", "Configurable period (e.g. 12 months)")}</li>
                  <li>{t("Método ET0: Hargreaves o Penman-Monteith", "ET0 method: Hargreaves or Penman-Monteith")}</li>
                  <li>{t("Kc genéricos FAO-56", "Generic FAO-56 Kc")}</li>
                </ul>
              </div>
              <div className={styles.dpEvidenceBlock}>
                <h3>{t("Métodos", "Methods")}</h3>
                <ul>
                  <li>{t("ETc = Kc × ET0", "ETc = Kc × ET0")}</li>
                  <li>{t("Replay histórico El Niño vs 27 bases", "El Niño historical replay vs 27 baselines")}</li>
                  <li>{t("Indicadores de gestión (familias, repeticiones)", "Management indicators (families, repetitions)")}</li>
                </ul>
              </div>
              <div className={styles.dpEvidenceBlock}>
                <h3>{t("Limitaciones", "Limitations")}</h3>
                <ul>
                  <li>{t("Sin validación agronómica regional", "No regional agronomic validation")}</li>
                  <li>{t("Sin predicción de rendimiento ni rentabilidad", "No yield or profitability prediction")}</li>
                  <li>{t("Kc genéricos, no validados localmente", "Generic Kc, not locally validated")}</li>
                  <li>{t("La lluvia de grilla no es lluvia efectiva", "Grid rainfall is not effective rainfall")}</li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="button light" type="button">
                <ArrowDown size={17} aria-hidden="true" />{t("Descargar JSON (visual)", "Download JSON (visual)")}
              </button>
              <button className="button light" type="button">
                <ArrowDown size={17} aria-hidden="true" />{t("Vista de impresión", "Print view")}
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.dpFooter}>
          <span className={styles.dpFooterBrand}><Sprout size={18} aria-hidden="true" /> AgroOrbit Nexus</span>
          <p>{t("Datos climáticos: NASA POWER. Mapa: © OpenStreetMap contributors. Sin afiliación ni aval de NASA.", "Climate data: NASA POWER. Map: © OpenStreetMap contributors. Not affiliated with or endorsed by NASA.")}</p>
          <p>{t("Proyecto independiente. Exploración, no recomendación. Sin login, pagos ni módulos empresariales.", "Independent project. Exploration, not recommendation. No login, payments or enterprise modules.")}</p>
          <p><a href="https://github.com/bel001/AgroOrbit-Nexus" target="_blank" rel="noreferrer">{t("Código MIT · fuentes y limitaciones", "MIT code · sources and limitations")}</a></p>
          <p className="small muted">{t("Créditos fotográficos: Unsplash (ver public/design-preview/ATTRIBUTION.md). Ilustraciones SVG originales.", "Photo credits: Unsplash (see public/design-preview/ATTRIBUTION.md). Original SVG illustrations.")}</p>
        </footer>
      </main>
    </div>
  );
}