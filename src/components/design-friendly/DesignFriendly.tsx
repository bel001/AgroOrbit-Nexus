"use client";
import { useState } from "react";
import { Sprout, ArrowRight, ArrowDown, Check, Droplets, Satellite, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";
import styles from "./design-friendly.module.css";

const STEPS = [
  { id: "inicio", es: "Inicio", en: "Home" },
  { id: "terreno", es: "Terreno", en: "Field" },
  { id: "cultivos", es: "Cultivos", en: "Crops" },
  { id: "condiciones", es: "Condiciones", en: "Conditions" },
  { id: "alternativas", es: "Alternativas", en: "Options" },
  { id: "evidencias", es: "Evidencias", en: "Evidence" },
];

export default function DesignFriendly() {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [altTab, setAltTab] = useState<"agua" | "suelo" | "nino">("agua");
  const t = (es: string, en: string) => (lang === "en" ? en : es);

  return (
    <div className={styles.df}>
      <header className={styles.dfHeader}>
        <div className={styles.dfHeaderInner}>
          <a className={styles.dfBrand} href="#inicio">
            <span className={styles.dfBrandMark}><Sprout size={18} aria-hidden="true" /></span>
            <span>AgroOrbit <strong>Nexus</strong><small>From Space to Soil</small></span>
          </a>
          <nav className={styles.dfNav} aria-label={t("Pasos", "Steps")}>
            {STEPS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className={i === 0 ? "isActive" : ""}>{t(s.es, s.en)}</a>
            ))}
          </nav>
          <div className={styles.dfLang} role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === "es"} onClick={() => setLang("es")} lang="es">ES</button>
            <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en">EN</button>
          </div>
        </div>
        <div className={styles.dfProgress}><span style={{ width: "16%" }} /></div>
      </header>

      <main className={styles.dfMain} id="inicio">
        {/* HERO */}
        <section className={styles.dfHero}>
          <div className={styles.dfHeroCopy}>
            <h1>
              {t("Entiende tu terreno ", "Understand your field ")}
              <em>{t("antes de decidir qué sembrar.", "before you decide what to plant.")}</em>
            </h1>
            <p>
              {t(
                "Explora información climática, registra tus cultivos y compara alternativas por agua, suelo y diversidad. Una lectura del territorio antes de la decisión.",
                "Explore climate information, record your crops and compare alternatives by water, soil and diversity. A reading of the territory before the decision."
              )}
            </p>
            <p style={{ fontSize: 13, color: "var(--df-ink2)", margin: "0 0 16px", fontWeight: 600 }}>
              {t("Caso ilustrativo: Virú, La Libertad. Sin validación regional independiente.", "Illustrative case: Virú, La Libertad. No independent regional validation.")}
            </p>
            <div className={styles.dfHeroActions}>
              <a className={styles.dfBtn} href="#terreno">
                <ArrowDown size={16} aria-hidden="true" />
                {t("Explorar caso ilustrativo", "Explore illustrative case")}
              </a>
              <a className={`${styles.dfBtn} ${styles.secondary}`} href="#alternativas">
                {t("Conocer el proceso", "Learn the process")} <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <ul className={styles.dfHeroFacts} aria-label={t("Fuentes y alcance", "Sources and scope")}>
              <li><Users size={15} aria-hidden="true" />{t("Para extensionistas y agricultores", "For extension agents and farmers")}</li>
              <li><Satellite size={15} aria-hidden="true" />{t("Clima diario NASA POWER", "NASA POWER daily climate")}</li>
              <li><Droplets size={15} aria-hidden="true" />{t("Agua en m³/ha con FAO-56", "Water in m³/ha with FAO-56")}</li>
              <li><ShieldCheck size={15} aria-hidden="true" />{t("Exploración, no recomendación", "Exploration, not a recommendation")}</li>
            </ul>
          </div>
          <div className={styles.dfHeroVisual}>
            <Image src="/design-preview/field-aerial.jpg" alt={t("Parcelas agrícolas vistas desde altura", "Agricultural plots seen from above")} width={900} height={600} style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 320 }} />
            <span className={styles.dfHeroBadge}>{t("Lectura del territorio", "Reading the territory")}</span>
          </div>
        </section>

        {/* TERRENO */}
        <section id="terreno" className={styles.dfSection}>
          <div className={styles.dfSectionHead}>
            <h2><span className={styles.dfStepNum}>1</span>{t("Terreno", "Field")}</h2>
            <p>{t("Ficha cartográfica del caso ilustrativo. Coordenadas de referencia, sin límites legales de parcela.", "Cartographic sheet of the illustrative case. Reference coordinates, no legal parcel boundaries.")}</p>
          </div>
          <div className={styles.dfNotice + " " + styles.neutral}>
            <strong>{t("Cobertura: diagnóstico agrícola parcial", "Coverage: partial farm diagnosis")}</strong>. {t("Perfil de demostración sin validación agronómica. No genera recomendaciones.", "Demo profile without agronomic validation. Makes no recommendations.")}
          </div>
          <div className={styles.dfFieldGrid}>
            <div className={styles.dfCard}>
              <div className={styles.dfFieldInfo}>
                {[
                  [t("Nombre del terreno", "Field name"), t("Caso ilustrativo Virú", "Virú illustrative case")],
                  [t("Localidad", "Location"), "Virú, La Libertad, Perú"],
                  [t("Coordenadas", "Coordinates"), "-8.112, -78.753"],
                  [t("Área", "Area"), t("No declarada", "Not declared")],
                  [t("Tipo de suelo", "Soil texture"), t("Desconocido", "Unknown")],
                  [t("Riego", "Irrigation"), t("Gravedad (Chavimochic)", "Gravity (Chavimochic)")],
                  [t("Procedencia", "Data source"), t("Declarado / ilustrativo", "Declared / illustrative")],
                ].map(([label, value]) => (
                  <div key={label} className={styles.dfFieldRow}>
                    <span>{label}</span><strong>{value}</strong>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "var(--df-ink2)", marginTop: 12, marginBottom: 0 }}>
                {t("Coordenadas de referencia del piloto. No representan límites catastrales.", "Reference coordinates of the pilot. Not cadastral boundaries.")}
              </p>
            </div>
            <div className={styles.dfMapFrame}>
              <svg className={styles.dfMapSvg} viewBox="0 0 400 340" preserveAspectRatio="xMidYMid slice" aria-label={t("Mapa esquemático", "Schematic map")}>
                <defs>
                  <pattern id="dffgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c9d6e0" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="400" height="340" fill="#eaf2f7" />
                <rect width="400" height="340" fill="url(#dffgrid)" />
                <rect x="60" y="80" width="110" height="70" rx="12" fill="rgba(31,107,79,.15)" stroke="#1f6b4f" strokeWidth="2" />
                <rect x="180" y="120" width="90" height="60" rx="12" fill="rgba(95,168,211,.15)" stroke="#5fa8d3" strokeWidth="2" />
                <rect x="260" y="60" width="80" height="90" rx="12" fill="rgba(224,159,62,.15)" stroke="#e09f3e" strokeWidth="2" />
                <rect x="90" y="200" width="130" height="80" rx="12" fill="rgba(79,138,58,.15)" stroke="#4f8a3a" strokeWidth="2" />
                <path d="M 0 250 Q 120 230 200 260 T 400 240" stroke="#5fa8d3" strokeWidth="3" fill="none" strokeDasharray="6 4" />
                <g transform="translate(200,150)">
                  <circle r="16" fill="rgba(31,107,79,.2)" />
                  <circle r="9" fill="#1f6b4f" stroke="#fff" strokeWidth="3" />
                </g>
              </svg>
              <p className={styles.dfMapCaption}>{t("Esquema ilustrativo. La meteorología se muestrea en el punto de referencia.", "Illustrative scheme. Meteorology is sampled at the reference point.")}</p>
            </div>
          </div>
        </section>

        {/* CULTIVOS */}
        <section id="cultivos" className={styles.dfSection}>
          <div className={styles.dfSectionHead}>
            <h2><span className={styles.dfStepNum}>2</span>{t("Cultivos y periodo", "Crops and period")}</h2>
            <p>{t("Línea de tiempo agrícola. Siembra, cosecha y secuencia.", "Agricultural timeline. Sowing, harvest and sequence.")}</p>
          </div>
          <div className={styles.dfTimeline}>
            {[
              { label: t("Secuencia A", "Sequence A"), bars: [{ cls: "maize", left: "4%", w: "30%", name: "Maíz" }, { cls: "maize", left: "36%", w: "30%", name: "Maíz" }, { cls: "maize", left: "68%", w: "28%", name: "Maíz" }] },
              { label: t("Alternativa B", "Alternative B"), bars: [{ cls: "maize", left: "4%", w: "30%", name: "Maíz" }, { cls: "bean", left: "36%", w: "26%", name: "Frijol" }, { cls: "maize", left: "64%", w: "32%", name: "Maíz" }] },
              { label: t("Alternativa C", "Alternative C"), bars: [{ cls: "maize", left: "4%", w: "30%", name: "Maíz" }, { cls: "sorghum", left: "36%", w: "28%", name: "Sorgo" }, { cls: "bean", left: "66%", w: "30%", name: "Frijol" }] },
            ].map((row) => (
              <div key={row.label} className={styles.dfTimelineRow}>
                <span className={styles.dfTimelineLabel}>{row.label}</span>
                <div className={styles.dfTimelineTrack}>
                  {row.bars.map((b, i) => (
                    <span key={i} className={`${styles.dfTimelineBar} ${styles[b.cls]}`} style={{ left: b.left, width: b.w }}>{b.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.dfLegend}>
            <span><i style={{ background: "#c99a2e" }} />{t("Maíz", "Maize")}</span>
            <span><i style={{ background: "#4f8a3a" }} />{t("Frijol", "Bean")}</span>
            <span><i style={{ background: "#a2694b" }} />{t("Sorgo", "Sorghum")}</span>
          </div>
          <div className={styles.dfBotanical}>
            <figure className={styles.dfBotanicalCard}>
              <Image src="/design-preview/maize-stalk.jpg" alt={t("Maíz", "Maize")} width={400} height={250} style={{ width: "100%", height: 170, objectFit: "cover" }} />
              <figcaption><b>{t("Maíz", "Maize")}</b>{t("Cereal de ciclo largo, alta demanda hídrica.", "Long-cycle cereal, high water demand.")}</figcaption>
            </figure>
            <figure className={styles.dfBotanicalCard}>
              <Image src="/design-preview/beans.jpg" alt={t("Frijol", "Bean")} width={400} height={250} style={{ width: "100%", height: 170, objectFit: "cover" }} />
              <figcaption><b>{t("Frijol", "Bean")}</b>{t("Leguminosa, aporta diversidad botánica.", "Legume, adds botanical diversity.")}</figcaption>
            </figure>
            <figure className={styles.dfBotanicalCard}>
              <Image src="/design-preview/corn-field-wide.jpg" alt={t("Sorgo", "Sorghum")} width={400} height={250} style={{ width: "100%", height: 170, objectFit: "cover" }} />
              <figcaption><b>{t("Sorgo", "Sorghum")}</b>{t("Cereal alternativo de menor demanda hídrica.", "Alternative cereal with lower water demand.")}</figcaption>
            </figure>
          </div>
        </section>

        {/* CONDICIONES */}
        <section id="condiciones" className={styles.dfSection}>
          <div className={styles.dfSectionHead}>
            <h2><span className={styles.dfStepNum}>3</span>{t("Condiciones climáticas", "Climate conditions")}</h2>
            <p>{t("Panel de lectura científica. Temperatura, lluvia modelada y periodo de referencia.", "Scientific reading panel. Temperature, modelled rainfall and reference period.")}</p>
          </div>
          <div className={styles.dfCondGrid}>
            <div className={styles.dfChart} aria-label={t("Gráfica climática", "Climate chart")}>
              <svg viewBox="0 0 520 240" width="100%" height="100%" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="dfrain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5fa8d3" stopOpacity=".5" />
                    <stop offset="100%" stopColor="#5fa8d3" stopOpacity=".05" />
                  </linearGradient>
                </defs>
                {[40,80,120,160,200].map((y) => <line key={y} x1="40" y1={y} x2="500" y2={y} stroke="#e8e0d4" strokeWidth="1" />)}
                {[30,5,2,0,0,1,4,12,18,25,35,40].map((v,i) => { const h=v*2.5; const x=50+i*38; return <rect key={i} x={x} y={200-h} width="24" height={h} fill="url(#dfrain)" rx="4" />; })}
                <polyline points="62,150 100,148 138,135 176,120 214,105 252,95 290,90 328,98 366,115 404,135 442,150 480,160" fill="none" stroke="#1f6b4f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {["E","F","M","A","M","J","J","A","S","O","N","D"].map((m,i) => <text key={i} x={62+i*38} y={225} textAnchor="middle" fontSize="10" fill="#6b7a74">{m}</text>)}
              </svg>
              <p style={{ fontSize: 12, color: "var(--df-ink2)", marginTop: 10, marginBottom: 0 }}>
                <span className={styles.dfBadge}>{t("Ejemplo visual", "Visual example")}</span>
                {" "}{t("Valores no verificados. La lluvia de grilla no es lluvia efectiva.", "Values unverified. Grid rainfall is not effective rain.")}
              </p>
            </div>
            <div className={styles.dfKpiGrid}>
              {[
                { label: t("Temperatura media", "Mean temperature"), value: "22.4 °C", sub: t("12 meses", "12 months") },
                { label: t("Días consultados", "Days queried"), value: "365", sub: t("Serie diaria", "Daily series") },
                { label: t("Valores faltantes", "Missing values"), value: "0", sub: t("Sin huecos", "No gaps") },
                { label: t("Lluvia (modelo)", "Rainfall (model)"), value: "42 mm", sub: t("Modelo, no efectiva", "Model, not effective"), muted: true },
              ].map((k) => (
                <div key={k.label} className={`${styles.dfKpi} ${k.muted ? styles.muted : ""}`}>
                  <span>{k.label}</span>
                  <strong>{k.value}</strong>
                  <small>{k.sub}</small>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "var(--df-ink2)", marginTop: 16, marginBottom: 0 }}>
              {t("Fuente: NASA POWER, comunidad AG, hora solar local. Periodo configurable.", "Source: NASA POWER, AG community, local solar time. Configurable period.")}
            </p>
          </div>
        </section>

        {/* ALTERNATIVAS */}
        <section id="alternativas" className={styles.dfSection}>
          <div className={styles.dfSectionHead}>
            <h2><span className={styles.dfStepNum}>4</span>{t("Comparación de rotaciones", "Rotation comparison")}</h2>
            <p>{t("Agua, suelo y contexto de El Niño. Sin puntuación global inventada.", "Water, soil and El Niño context. No invented global score.")}</p>
          </div>
          <div className={styles.dfTabs}>
            {(["agua", "suelo", "nino"] as const).map((tab) => (
              <button key={tab} type="button" className={`${styles.dfTab} ${altTab === tab ? styles.isActive : ""}`} onClick={() => setAltTab(tab)}>
                {tab === "agua" ? t("Agua", "Water") : tab === "suelo" ? t("Suelo", "Soil") : t("El Niño", "El Niño")}
              </button>
            ))}
          </div>

          {altTab === "agua" && (
            <div className={styles.dfAltGrid}>
              {[
                { letter: "A", name: t("Maíz → Maíz → Maíz", "Maize → Maize → Maize"), water: 13120, max: 13120 },
                { letter: "B", name: t("Maíz → Frijol → Maíz", "Maize → Bean → Maize"), water: 12720, max: 13120 },
                { letter: "C", name: t("Maíz → Sorgo → Frijol", "Maize → Sorghum → Bean"), water: 11730, max: 13120 },
              ].map((a, i) => (
                <div key={a.letter} className={`${styles.dfAltCard} ${i === 2 ? styles.highlight : ""}`}>
                  <div className={styles.dfAltHead}>
                    <span className={styles.dfAltLetter}>{a.letter}</span>
                    <span className={styles.dfAltName}>{a.name}</span>
                  </div>
                  <p className={styles.dfAltSeq}>{t("Demanda hídrica estimada (FAO-56 ETc)", "Estimated water demand (FAO-56 ETc)")}</p>
                  <div className={styles.dfWaterBar}>
                    <span>{t("Demanda", "Demand")}</span>
                    <span className={styles.dfWaterTrack}>
                      <span className={styles.dfWaterFill} style={{ width: `${(a.water / a.max) * 100}%` }} />
                    </span>
                    <span className={styles.dfWaterVal}>{a.water.toLocaleString("es-ES")} <small>m³/ha</small></span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--df-ink2)", margin: "10px 0 0" }}>
                    {t("Diferencia vs A: ", "Difference vs A: ")}
                    <strong style={{ color: "var(--df-brand)" }}>{a.letter === "A" ? "—" : `${(13120 - a.water).toLocaleString("es-ES")} m³/ha`}</strong>
                  </p>
                </div>
              ))}
            </div>
          )}

          {altTab === "suelo" && (
            <div className={styles.dfAltGrid}>
              {[
                { letter: "A", name: t("Maíz → Maíz → Maíz", "Maize → Maize → Maize"), items: [[t("Familias botánicas", "Crop families"), "1"], [t("Leguminosas", "Legumes"), t("No", "No")], [t("Repetición máx.", "Max. repetition"), t("3 ciclos maíz", "3 maize")], [t("Barbecho", "Fallow"), "90 días"]] },
                { letter: "B", name: t("Maíz → Frijol → Maíz", "Maize → Bean → Maize"), items: [[t("Familias botánicas", "Crop families"), "2"], [t("Leguminosas", "Legumes"), t("Sí", "Yes")], [t("Repetición máx.", "Max. repetition"), t("2 ciclos maíz", "2 maize")], [t("Barbecho", "Fallow"), "105 días"]] },
                { letter: "C", name: t("Maíz → Sorgo → Frijol", "Maize → Sorghum → Bean"), items: [[t("Familias botánicas", "Crop families"), "2"], [t("Leguminosas", "Legumes"), t("Sí", "Yes")], [t("Repetición máx.", "Max. repetition"), t("1 ciclo/cultivo", "1 cycle/crop")], [t("Barbecho", "Fallow"), "130 días"]] },
              ].map((a) => (
                <div key={a.letter} className={styles.dfAltCard}>
                  <div className={styles.dfAltHead}>
                    <span className={styles.dfAltLetter}>{a.letter}</span>
                    <span className={styles.dfAltName}>{a.name}</span>
                  </div>
                  <ul className={styles.dfSoilList}>
                    {a.items.map(([label, value]) => (
                      <li key={label}>
                        <Check size={16} aria-hidden="true" />
                        <div>
                          <span style={{ color: "var(--df-ink2)", fontSize: 12 }}>{label}</span>
                          <strong style={{ display: "block", color: "var(--df-ink)" }}>{value}</strong>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p style={{ fontSize: 12, color: "var(--df-ink2)", marginTop: 12, marginBottom: 0 }}>
                    {t("Indicadores de gestión, no salud del suelo medida.", "Management indicators, not measured soil health.")}
                  </p>
                </div>
              ))}
            </div>
          )}

          {altTab === "nino" && (
            <div className={styles.dfCard}>
              <h3 style={{ marginBottom: 8, color: "var(--df-ink)" }}>{t("Contexto El Niño (replay histórico)", "El Niño context (historical replay)")}</h3>
              <p style={{ fontSize: 14, color: "var(--df-ink2)", marginBottom: 16 }}>
                {t("Cada calendario se repite con temperaturas diarias reales de NASA POWER (1997, 2016, 2023) y se compara con 27 temporadas base.", "Each calendar is replayed with real daily NASA POWER temperatures (1997, 2016, 2023) and compared with 27 baseline seasons.")}
              </p>
              <table className={styles.dfElNinoTable}>
                <thead>
                  <tr>
                    <th>{t("Alternativa", "Option")}</th>
                    <th>{t("Agua extra vs base", "Extra water vs baseline")}</th>
                    <th>{t("Estado", "Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>A</strong> {t("Maíz → Maíz → Maíz", "Maize → Maize → Maize")}</td><td>+411 m³/ha <small style={{ display: "block", color: "var(--df-ink2)", fontSize: 11 }}>{t("Por encima de todas las bases", "Above every baseline")}</small></td><td className={styles.anom}>{t("Anomalía", "Anomaly")}</td></tr>
                  <tr><td><strong>B</strong> {t("Maíz → Frijol → Maíz", "Maize → Bean → Maize")}</td><td>+396 m³/ha <small style={{ display: "block", color: "var(--df-ink2)", fontSize: 11 }}>{t("Por encima de todas las bases", "Above every baseline")}</small></td><td className={styles.anom}>{t("Anomalía", "Anomaly")}</td></tr>
                  <tr><td><strong>C</strong> {t("Maíz → Sorgo → Frijol", "Maize → Sorghum → Bean")}</td><td>+359 m³/ha <small style={{ display: "block", color: "var(--df-ink2)", fontSize: 11 }}>{t("Por encima de todas las bases", "Above every baseline")}</small></td><td className={styles.anom}>{t("Anomalía", "Anomaly")}</td></tr>
                </tbody>
              </table>
              <p style={{ fontSize: 13, color: "var(--df-ink2)", marginTop: 12, marginBottom: 0 }}>
                {t("Para 2016-17 y 2023 el replay no muestra anomalía. El contexto histórico no es una predicción.", "For 2016-17 and 2023 the replay shows no anomaly. Historical context is not a prediction.")}
              </p>
            </div>
          )}
        </section>

        {/* EVIDENCIAS */}
        <section id="evidencias" className={styles.dfSection}>
          <div className={styles.dfSectionHead}>
            <h2><span className={styles.dfStepNum}>5</span>{t("Evidencias", "Evidence")}</h2>
            <p>{t("Informe técnico. Datos utilizados, fuentes, métodos y limitaciones.", "Technical report. Data used, sources, methods and limitations.")}</p>
          </div>
          <div className={styles.dfWarn}>{t("Exploración, no recomendación agronómica. Caso sin validación regional independiente.", "Exploration, not an agronomic recommendation. Case without independent regional validation.")}</div>
          <div className={styles.dfEvidence}>
            <h3 style={{ marginBottom: 4 }}>{t("Resumen del análisis", "Analysis summary")}</h3>
            <p style={{ fontSize: 14, color: "var(--df-ink2)", marginBottom: 0 }}>
              {t("Caso ilustrativo de Virú. Comparación descriptiva de tres secuencias por demanda hídrica, diversidad y contexto histórico de El Niño.", "Virú illustrative case. Descriptive comparison of three sequences.")}
            </p>
            <div className={styles.dfEvidenceGrid}>
              {[
                { title: t("Datos utilizados", "Data used"), items: [t("Coordenadas de referencia", "Reference coordinates"), t("Serie climática NASA POWER", "NASA POWER climate series"), t("Registros de campañas declarados", "Declared campaign records"), t("Catálogo general de cultivos", "General crop catalogue")] },
                { title: t("Fuente y periodo", "Source and period"), items: [t("NASA POWER, comunidad AG", "NASA POWER, AG community"), t("Periodo configurable", "Configurable period"), t("ET0: Hargreaves o Penman-Monteith", "ET0: Hargreaves or Penman-Monteith"), t("Kc genéricos FAO-56", "Generic FAO-56 Kc")] },
                { title: t("Métodos", "Methods"), items: ["ETc = Kc × ET0", t("Replay El Niño vs 27 bases", "El Niño replay vs 27 baselines"), t("Indicadores de gestión", "Management indicators")] },
                { title: t("Limitaciones", "Limitations"), items: [t("Sin validación agronómica regional", "No regional agronomic validation"), t("Sin predicción de rendimiento", "No yield prediction"), t("Kc genéricos, no validados", "Generic Kc, not validated"), t("Lluvia de grilla, no efectiva", "Grid rainfall, not effective")] },
              ].map((block) => (
                <div key={block.title} className={styles.dfEvidenceBlock}>
                  <h3>{block.title}</h3>
                  <ul>{block.items.map((it) => <li key={it}>{it}</li>)}</ul>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className={styles.dfBtn} type="button">{t("Descargar JSON (visual)", "Download JSON (visual)")}</button>
              <button className={`${styles.dfBtn} ${styles.secondary}`} type="button">{t("Vista de impresión", "Print view")}</button>
            </div>
          </div>
        </section>

        <footer className={styles.dfFooter}>
          <span className={styles.dfFooterBrand}><Sprout size={18} aria-hidden="true" /> AgroOrbit Nexus</span>
          <p style={{ marginTop: 8 }}>{t("Datos climáticos: NASA POWER. Mapa: © OpenStreetMap. Sin afiliación ni aval de NASA.", "Climate data: NASA POWER. Map: © OpenStreetMap. Not affiliated with NASA.")}</p>
          <p>{t("Proyecto independiente. Exploración, no recomendación. Sin login ni pagos.", "Independent project. Exploration, not recommendation. No login or payments.")}</p>
          <p><a href="https://github.com/bel001/AgroOrbit-Nexus" target="_blank" rel="noreferrer" style={{ color: "var(--df-brand)", fontWeight: 700 }}>{t("Código MIT", "MIT code")}</a></p>
        </footer>
      </main>
    </div>
  );
}