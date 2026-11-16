"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import styles from "./design-alt.module.css";

const STEPS = [
  { id: "inicio", es: "Inicio", en: "Home" },
  { id: "terreno", es: "Terreno", en: "Field" },
  { id: "cultivos", es: "Cultivos", en: "Crops" },
  { id: "condiciones", es: "Condiciones", en: "Conditions" },
  { id: "alternativas", es: "Alternativas", en: "Options" },
  { id: "evidencias", es: "Evidencias", en: "Evidence" },
];

export default function DesignAlt() {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [altTab, setAltTab] = useState<"agua" | "suelo" | "nino">("agua");
  const t = (es: string, en: string) => (lang === "en" ? en : es);

  return (
    <div className={styles.da}>
      <header className={styles.daHeader}>
        <div className={styles.daHeaderInner}>
          <a className={styles.daBrand} href="#inicio">
            AgroOrbit <strong>Nexus</strong>
            <small>From Space to Soil</small>
          </a>
          <nav className={styles.daNav} aria-label={t("Pasos", "Steps")}>
            {STEPS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className={i === 0 ? "isActive" : ""}>
                {t(s.es, s.en)}
              </a>
            ))}
          </nav>
          <div className={styles.daLang} role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === "es"} onClick={() => setLang("es")} lang="es">ES</button>
            <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en">EN</button>
          </div>
        </div>
        <div className={styles.daProgress}><span style={{ width: "16%" }} /></div>
      </header>

      <main className={styles.daMain} id="inicio">
        {/* HERO */}
        <section className={styles.daHero}>
          <div className={styles.daHeroLeft}>
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
            <p style={{ fontSize: 13, color: "var(--da-ink2)", margin: "0 0 24px", fontWeight: 600 }}>
              {t("Caso ilustrativo: Virú, La Libertad. Sin validación regional independiente.", "Illustrative case: Virú, La Libertad. No independent regional validation.")}
            </p>
            <div className={styles.daHeroActions}>
              <a className={styles.daBtn} href="#terreno">{t("Explorar caso ilustrativo", "Explore illustrative case")}</a>
              <a className={`${styles.daBtn} ${styles.ghost}`} href="#alternativas" style={{ marginLeft: 0, borderLeft: 0 }}>
                {t("Conocer el proceso", "Learn the process")} <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className={styles.daHeroRight}>
            <ol className={styles.daHeroIndex}>
              {STEPS.slice(1).map((s, i) => (
                <li key={s.id}><b>{String(i + 1).padStart(2, "0")}</b><span>{t(s.es, s.en)}</span></li>
              ))}
            </ol>
            <p className={styles.daHeroMeta}>
              {t("Clima diario NASA POWER · Agua en m³/ha con FAO-56 · Exploración, no recomendación", "NASA POWER daily climate · Water in m³/ha with FAO-56 · Exploration, not recommendation")}
            </p>
          </div>
        </section>

        {/* TERRENO */}
        <section id="terreno" className={styles.daSection}>
          <div className={styles.daSectionHead}>
            <h2>{t("Terreno", "Field")}</h2>
            <p>{t("Ficha cartográfica del caso ilustrativo. Coordenadas de referencia, sin límites legales de parcela.", "Cartographic sheet of the illustrative case. Reference coordinates, no legal parcel boundaries.")}</p>
          </div>
          <div className={styles.daFieldGrid}>
            <div className={styles.daMapCol}>
              <div className={styles.daMapFrame}>
                <svg className={styles.daMapSvg} viewBox="0 0 400 340" preserveAspectRatio="xMidYMid slice" aria-label={t("Mapa esquemático", "Schematic map")}>
                  <defs>
                    <pattern id="dagrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c9c9c9" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="400" height="340" fill="#e8ecf2" />
                  <rect width="400" height="340" fill="url(#dagrid)" />
                  <rect x="60" y="80" width="110" height="70" fill="rgba(30,58,95,.12)" stroke="#1e3a5f" strokeWidth="1.5" />
                  <rect x="180" y="120" width="90" height="60" fill="rgba(176,122,47,.12)" stroke="#b07a2f" strokeWidth="1.5" />
                  <rect x="260" y="60" width="80" height="90" fill="rgba(30,58,95,.08)" stroke="#1e3a5f" strokeWidth="1.5" />
                  <rect x="90" y="200" width="130" height="80" fill="rgba(63,107,63,.12)" stroke="#3f6b3f" strokeWidth="1.5" />
                  <path d="M 0 250 Q 120 230 200 260 T 400 240" stroke="#2c5f6f" strokeWidth="2" fill="none" strokeDasharray="6 4" />
                  <g transform="translate(200,150)">
                    <circle r="12" fill="rgba(30,58,95,.2)" />
                    <circle r="6" fill="#1e3a5f" stroke="#fff" strokeWidth="2" />
                  </g>
                </svg>
              </div>
              <p className={styles.daMapCaption}>{t("Esquema ilustrativo. La meteorología se muestrea en el punto de referencia.", "Illustrative scheme. Meteorology is sampled at the reference point.")}</p>
            </div>
            <div className={styles.daInfoCol}>
              <table className={styles.daInfoTable}>
                <tbody>
                  <tr><th>{t("Nombre del terreno", "Field name")}</th><td>{t("Caso ilustrativo Virú", "Virú illustrative case")}</td></tr>
                  <tr><th>{t("Localidad", "Location")}</th><td>Virú, La Libertad, Perú</td></tr>
                  <tr><th>{t("Coordenadas", "Coordinates")}</th><td>-8.112, -78.753</td></tr>
                  <tr><th>{t("Área", "Area")}</th><td>{t("No declarada", "Not declared")}</td></tr>
                  <tr><th>{t("Tipo de suelo", "Soil texture")}</th><td>{t("Desconocido", "Unknown")}</td></tr>
                  <tr><th>{t("Riego", "Irrigation")}</th><td>{t("Gravedad (Chavimochic)", "Gravity (Chavimochic)")}</td></tr>
                  <tr><th>{t("Procedencia", "Data source")}</th><td>{t("Declarado / ilustrativo", "Declared / illustrative")}</td></tr>
                </tbody>
              </table>
              <p className={styles.daNotice}>{t("Coordenadas de referencia del piloto. No representan límites catastrales.", "Reference coordinates of the pilot. Not cadastral boundaries.")}</p>
            </div>
          </div>
        </section>

        {/* CULTIVOS */}
        <section id="cultivos" className={styles.daSection}>
          <div className={styles.daSectionHead}>
            <h2>{t("Cultivos y periodo", "Crops and period")}</h2>
            <p>{t("Línea de tiempo agrícola. Siembra, cosecha y secuencia.", "Agricultural timeline. Sowing, harvest and sequence.")}</p>
          </div>
          <div className={styles.daTimeline}>
            <div className={styles.daTimelineRow}>
              <span className={styles.daTimelineLabel}>{t("Secuencia A", "Sequence A")}</span>
              <div className={styles.daTimelineTrack}>
                <span className={`${styles.daTimelineBar} ${styles.maize}`} style={{ left: "4%", width: "30%" }}>Maíz</span>
                <span className={`${styles.daTimelineBar} ${styles.maize}`} style={{ left: "36%", width: "30%" }}>Maíz</span>
                <span className={`${styles.daTimelineBar} ${styles.maize}`} style={{ left: "68%", width: "28%" }}>Maíz</span>
              </div>
            </div>
            <div className={styles.daTimelineRow}>
              <span className={styles.daTimelineLabel}>{t("Alternativa B", "Alternative B")}</span>
              <div className={styles.daTimelineTrack}>
                <span className={`${styles.daTimelineBar} ${styles.maize}`} style={{ left: "4%", width: "30%" }}>Maíz</span>
                <span className={`${styles.daTimelineBar} ${styles.bean}`} style={{ left: "36%", width: "26%" }}>Frijol</span>
                <span className={`${styles.daTimelineBar} ${styles.maize}`} style={{ left: "64%", width: "32%" }}>Maíz</span>
              </div>
            </div>
            <div className={styles.daTimelineRow}>
              <span className={styles.daTimelineLabel}>{t("Alternativa C", "Alternative C")}</span>
              <div className={styles.daTimelineTrack}>
                <span className={`${styles.daTimelineBar} ${styles.maize}`} style={{ left: "4%", width: "30%" }}>Maíz</span>
                <span className={`${styles.daTimelineBar} ${styles.sorghum}`} style={{ left: "36%", width: "28%" }}>Sorgo</span>
                <span className={`${styles.daTimelineBar} ${styles.bean}`} style={{ left: "66%", width: "30%" }}>Frijol</span>
              </div>
            </div>
          </div>
          <div className={styles.daBotanical}>
            <figure className={styles.daBotanicalCard}>
              <Image src="/design-preview/maize-stalk.jpg" alt={t("Maíz", "Maize")} width={400} height={250} style={{ width: "100%", height: 140, objectFit: "cover" }} />
              <figcaption><b>{t("Maíz", "Maize")}</b>{t("Cereal de ciclo largo, alta demanda hídrica.", "Long-cycle cereal, high water demand.")}</figcaption>
            </figure>
            <figure className={styles.daBotanicalCard}>
              <Image src="/design-preview/beans.jpg" alt={t("Frijol", "Bean")} width={400} height={250} style={{ width: "100%", height: 140, objectFit: "cover" }} />
              <figcaption><b>{t("Frijol", "Bean")}</b>{t("Leguminosa, aporta diversidad botánica.", "Legume, adds botanical diversity.")}</figcaption>
            </figure>
            <figure className={styles.daBotanicalCard}>
              <Image src="/design-preview/corn-field-wide.jpg" alt={t("Sorgo", "Sorghum")} width={400} height={250} style={{ width: "100%", height: 140, objectFit: "cover" }} />
              <figcaption><b>{t("Sorgo", "Sorghum")}</b>{t("Cereal alternativo de menor demanda hídrica.", "Alternative cereal with lower water demand.")}</figcaption>
            </figure>
          </div>
        </section>

        {/* CONDICIONES */}
        <section id="condiciones" className={styles.daSection}>
          <div className={styles.daSectionHead}>
            <h2>{t("Condiciones climáticas", "Climate conditions")}</h2>
            <p>{t("Panel de lectura científica. Temperatura, lluvia modelada y periodo de referencia.", "Scientific reading panel. Temperature, modelled rainfall and reference period.")}</p>
          </div>
          <div className={styles.daCondGrid}>
            <div className={styles.daChartCol}>
              <div className={styles.daChart} aria-label={t("Gráfica climática", "Climate chart")}>
                <svg viewBox="0 0 520 240" width="100%" height="100%" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="darain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2c5f6f" stopOpacity=".4" />
                      <stop offset="100%" stopColor="#2c5f6f" stopOpacity=".05" />
                    </linearGradient>
                  </defs>
                  {[40,80,120,160,200].map((y) => <line key={y} x1="40" y1={y} x2="500" y2={y} stroke="#d9d9d9" strokeWidth="1" />)}
                  {[30,5,2,0,0,1,4,12,18,25,35,40].map((v,i) => { const h=v*2.5; const x=50+i*38; return <rect key={i} x={x} y={200-h} width="24" height={h} fill="url(#darain)" />; })}
                  <polyline points="62,150 100,148 138,135 176,120 214,105 252,95 290,90 328,98 366,115 404,135 442,150 480,160" fill="none" stroke="#1e3a5f" strokeWidth="2" />
                  {["E","F","M","A","M","J","J","A","S","O","N","D"].map((m,i) => <text key={i} x={62+i*38} y={225} textAnchor="middle" fontSize="10" fill="#555555">{m}</text>)}
                </svg>
              </div>
              <p style={{ fontSize: 12, color: "var(--da-ink2)", marginTop: 12 }}>{t("Ejemplo visual estático. Valores no verificados.", "Static visual example. Values unverified.")}</p>
            </div>
            <div className={styles.daKpiCol}>
              {[
                { label: t("Temperatura media", "Mean temperature"), value: "22.4 °C", sub: t("12 meses", "12 months") },
                { label: t("Días consultados", "Days queried"), value: "365", sub: t("Serie diaria", "Daily series") },
                { label: t("Valores faltantes", "Missing values"), value: "0", sub: t("Sin huecos", "No gaps") },
                { label: t("Lluvia (modelo)", "Rainfall (model)"), value: "42 mm", sub: t("No es lluvia efectiva", "Not effective rain") },
              ].map((k) => (
                <div key={k.label} className={styles.daKpi}>
                  <span>{k.label}</span>
                  <strong>{k.value}</strong>
                  <small>{k.sub}</small>
                </div>
              ))}
              <p style={{ fontSize: 12, color: "var(--da-ink2)", marginTop: 16 }}>{t("Fuente: NASA POWER, comunidad AG, hora solar local.", "Source: NASA POWER, AG community, local solar time.")}</p>
            </div>
          </div>
        </section>

        {/* ALTERNATIVAS */}
        <section id="alternativas" className={styles.daSection}>
          <div className={styles.daSectionHead}>
            <h2>{t("Comparación de rotaciones", "Rotation comparison")}</h2>
            <p>{t("Agua, suelo y contexto de El Niño. Sin puntuación global inventada.", "Water, soil and El Niño context. No invented global score.")}</p>
          </div>
          <div className={styles.daTabs}>
            {(["agua", "suelo", "nino"] as const).map((tab) => (
              <button key={tab} type="button" className={`${styles.daTab} ${altTab === tab ? styles.isActive : ""}`} onClick={() => setAltTab(tab)}>
                {tab === "agua" ? t("Agua", "Water") : tab === "suelo" ? t("Suelo", "Soil") : t("El Niño", "El Niño")}
              </button>
            ))}
          </div>

          {altTab === "agua" && (
            <div className={styles.daAltGrid}>
              {[
                { letter: "A", name: t("Maíz → Maíz → Maíz", "Maize → Maize → Maize"), water: 13120, max: 13120 },
                { letter: "B", name: t("Maíz → Frijol → Maíz", "Maize → Bean → Maize"), water: 12720, max: 13120 },
                { letter: "C", name: t("Maíz → Sorgo → Frijol", "Maize → Sorghum → Bean"), water: 11730, max: 13120 },
              ].map((a) => (
                <div key={a.letter} className={styles.daAltCol}>
                  <h3>{t("Alternativa", "Option")} {a.letter}</h3>
                  <p className={styles.daAltName}>{a.name}</p>
                  <div className={styles.daBar}><span style={{ width: `${(a.water / a.max) * 100}%` }} /></div>
                  <div className={styles.daWaterRow}><span>{t("Demanda hídrica", "Water demand")}</span><strong>{a.water.toLocaleString("es-ES")} m³/ha</strong></div>
                  <div className={styles.daWaterRow}><span>{t("Diferencia vs A", "Difference vs A")}</span><strong>{a.letter === "A" ? "—" : `${(13120 - a.water).toLocaleString("es-ES")} m³/ha`}</strong></div>
                </div>
              ))}
            </div>
          )}

          {altTab === "suelo" && (
            <div className={styles.daAltGrid}>
              {[
                { letter: "A", name: t("Maíz → Maíz → Maíz", "Maize → Maize → Maize"), items: [["Familias botánicas", "1"], ["Leguminosas", t("No", "No")], ["Repetición máx.", t("3 ciclos maíz", "3 maize")], ["Barbecho", "90 días"]] },
                { letter: "B", name: t("Maíz → Frijol → Maíz", "Maize → Bean → Maize"), items: [["Familias botánicas", "2"], ["Leguminosas", t("Sí", "Yes")], ["Repetición máx.", t("2 ciclos maíz", "2 maize")], ["Barbecho", "105 días"]] },
                { letter: "C", name: t("Maíz → Sorgo → Frijol", "Maize → Sorghum → Bean"), items: [["Familias botánicas", "2"], ["Leguminosas", t("Sí", "Yes")], ["Repetición máx.", t("1 ciclo/cultivo", "1 cycle/crop")], ["Barbecho", "130 días"]] },
              ].map((a) => (
                <div key={a.letter} className={styles.daAltCol}>
                  <h3>{t("Alternativa", "Option")} {a.letter}</h3>
                  <p className={styles.daAltName}>{a.name}</p>
                  <ul>
                    {a.items.map(([label, value]) => (
                      <li key={label}><span>{label}</span><strong>{value}</strong></li>
                    ))}
                  </ul>
                  <p style={{ fontSize: 12, color: "var(--da-ink2)", marginTop: 12 }}>{t("Indicadores de gestión, no salud del suelo medida.", "Management indicators, not measured soil health.")}</p>
                </div>
              ))}
            </div>
          )}

          {altTab === "nino" && (
            <div className={styles.daAltCol} style={{ border: "1px solid var(--da-ink)", padding: 24 }}>
              <h3 style={{ textTransform: "none", letterSpacing: 0, fontSize: 16, color: "var(--da-ink)" }}>{t("Contexto El Niño", "El Niño context")}</h3>
              <p style={{ fontSize: 13, color: "var(--da-ink2)", marginBottom: 16 }}>{t("Replay con temperaturas NASA POWER (1997, 2016, 2023) vs 27 temporadas base. Sin atribución causal.", "Replay with NASA POWER temperatures (1997, 2016, 2023) vs 27 baseline seasons. No causal attribution.")}</p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead><tr style={{ borderBottom: "2px solid var(--da-ink)" }}><th style={{ textAlign: "left", padding: "8px 0" }}>{t("Alt.", "Opt.")}</th><th style={{ textAlign: "left", padding: "8px 0" }}>{t("Agua extra", "Extra water")}</th><th style={{ textAlign: "left", padding: "8px 0" }}>{t("Estado", "Status")}</th></tr></thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--da-rule)" }}><td style={{ padding: "8px 0" }}><strong>A</strong></td><td style={{ padding: "8px 0" }}>+411 m³/ha <small style={{ color: "var(--da-ink2)", fontSize: 11, display: "block" }}>{t("Por encima de todas las bases", "Above every baseline")}</small></td><td style={{ padding: "8px 0" }}>{t("Anomalía", "Anomaly")}</td></tr>
                  <tr style={{ borderBottom: "1px solid var(--da-rule)" }}><td style={{ padding: "8px 0" }}><strong>B</strong></td><td style={{ padding: "8px 0" }}>+396 m³/ha <small style={{ color: "var(--da-ink2)", fontSize: 11, display: "block" }}>{t("Por encima de todas las bases", "Above every baseline")}</small></td><td style={{ padding: "8px 0" }}>{t("Anomalía", "Anomaly")}</td></tr>
                  <tr><td style={{ padding: "8px 0" }}><strong>C</strong></td><td style={{ padding: "8px 0" }}>+359 m³/ha <small style={{ color: "var(--da-ink2)", fontSize: 11, display: "block" }}>{t("Por encima de todas las bases", "Above every baseline")}</small></td><td style={{ padding: "8px 0" }}>{t("Anomalía", "Anomaly")}</td></tr>
                </tbody>
              </table>
              <p style={{ fontSize: 12, color: "var(--da-ink2)", marginTop: 12 }}>{t("Para 2016-17 y 2023 el replay no muestra anomalía. El contexto histórico no es una predicción.", "For 2016-17 and 2023 the replay shows no anomaly. Historical context is not a prediction.")}</p>
            </div>
          )}
        </section>

        {/* EVIDENCIAS */}
        <section id="evidencias" className={styles.daSection}>
          <div className={styles.daSectionHead}>
            <h2>{t("Evidencias", "Evidence")}</h2>
            <p>{t("Informe técnico. Datos utilizados, fuentes, métodos y limitaciones.", "Technical report. Data used, sources, methods and limitations.")}</p>
          </div>
          <div className={styles.daWarn}>{t("Exploración, no recomendación agronómica. Caso sin validación regional independiente.", "Exploration, not an agronomic recommendation. Case without independent regional validation.")}</div>
          <div className={styles.daEvidence}>
            <h3>{t("Resumen del análisis", "Analysis summary")}</h3>
            <p style={{ fontSize: 14, color: "var(--da-ink2)", margin: "0 0 24px" }}>{t("Caso ilustrativo de Virú. Comparación descriptiva de tres secuencias por demanda hídrica, diversidad y contexto histórico de El Niño.", "Virú illustrative case. Descriptive comparison of three sequences.")}</p>
            <div className={styles.daEvidenceGrid}>
              <div className={styles.daEvidenceBlock}>
                <h3>{t("Datos utilizados", "Data used")}</h3>
                <ul>
                  <li>{t("Coordenadas de referencia", "Reference coordinates")}</li>
                  <li>{t("Serie climática NASA POWER", "NASA POWER climate series")}</li>
                  <li>{t("Registros de campañas declarados", "Declared campaign records")}</li>
                  <li>{t("Catálogo general de cultivos", "General crop catalogue")}</li>
                </ul>
              </div>
              <div className={styles.daEvidenceBlock}>
                <h3>{t("Fuente y periodo", "Source and period")}</h3>
                <ul>
                  <li>{t("NASA POWER, comunidad AG", "NASA POWER, AG community")}</li>
                  <li>{t("Periodo configurable", "Configurable period")}</li>
                  <li>{t("ET0: Hargreaves o Penman-Monteith", "ET0: Hargreaves or Penman-Monteith")}</li>
                  <li>{t("Kc genéricos FAO-56", "Generic FAO-56 Kc")}</li>
                </ul>
              </div>
              <div className={styles.daEvidenceBlock}>
                <h3>{t("Métodos", "Methods")}</h3>
                <ul>
                  <li>ETc = Kc × ET0</li>
                  <li>{t("Replay El Niño vs 27 bases", "El Niño replay vs 27 baselines")}</li>
                  <li>{t("Indicadores de gestión", "Management indicators")}</li>
                </ul>
              </div>
              <div className={styles.daEvidenceBlock}>
                <h3>{t("Limitaciones", "Limitations")}</h3>
                <ul>
                  <li>{t("Sin validación agronómica regional", "No regional agronomic validation")}</li>
                  <li>{t("Sin predicción de rendimiento", "No yield prediction")}</li>
                  <li>{t("Kc genéricos, no validados", "Generic Kc, not validated")}</li>
                  <li>{t("Lluvia de grilla, no efectiva", "Grid rainfall, not effective")}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <footer className={styles.daFooter}>
          <strong>AgroOrbit Nexus</strong>
          <p style={{ marginTop: 8 }}>{t("Datos climáticos: NASA POWER. Mapa: © OpenStreetMap. Sin afiliación ni aval de NASA.", "Climate data: NASA POWER. Map: © OpenStreetMap. Not affiliated with NASA.")}</p>
          <p>{t("Proyecto independiente. Exploración, no recomendación. Sin login ni pagos.", "Independent project. Exploration, not recommendation. No login or payments.")}</p>
          <p><a href="https://github.com/bel001/AgroOrbit-Nexus" target="_blank" rel="noreferrer" style={{ color: "var(--da-accent)", fontWeight: 700 }}>{t("Código MIT", "MIT code")}</a></p>
        </footer>
      </main>
    </div>
  );
}