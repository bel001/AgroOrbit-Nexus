"use client";
import { flushSync } from "react-dom";
import { Scale } from "lucide-react";
import { rankStrategies, type CriterionId, type Ranking, type Weights } from "@/lib/priorities";
import type { Strategy } from "@/lib/rotations";
import { useT } from "./i18n";
import { useStrategyName } from "./insights";

const SLIDERS: { id: CriterionId; es: string; en: string; help: string; helpEn: string }[] = [
  { id: "water", es: "Agua", en: "Water", help: "Menor demanda de agua del cultivo (ETc, FAO-56).", helpEn: "Lower crop water demand (ETc, FAO-56)." },
  { id: "soil", es: "Manejo del suelo (indicadores)", en: "Soil management (indicators)", help: "Leguminosa, familias, repeticiones y días sin cultivo; no mide el suelo.", helpEn: "Legume, families, repeats and uncropped days; not a soil measurement." },
  { id: "diversity", es: "Diversidad de cultivos", en: "Crop diversity", help: "Más familias y menos repeticiones; no demuestra control de plagas.", helpEn: "More families and fewer repeats; does not prove pest control." },
];

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => unknown };

export default function PriorityRanking({ strategies, weights, onWeights }: { strategies: Strategy[]; weights: Weights; onWeights: React.Dispatch<React.SetStateAction<Weights>> }) {
  const t = useT(); const name = useStrategyName();
  const ranking: Ranking = rankStrategies(strategies, weights);
  const set = (id: CriterionId, value: number) => {
    // Functional update: an animated (async) transition must not overwrite a newer change.
    const apply = () => onWeights(prev => ({ ...prev, [id]: value }));
    const doc = document as ViewTransitionDoc;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Animate the live re-ordering where the browser supports view transitions.
    if (doc.startViewTransition && !reduced) doc.startViewTransition(() => flushSync(apply));
    else apply();
  };
  const total = ranking.usedCriteria.reduce((a, id) => a + weights[id], 0);

  return <div className="priority-card">
    <div className="priority-head">
      <h3><Scale size={20} aria-hidden="true" /> {t("Prioridades del agricultor", "Farmer priorities")}</h3>
      <span className="explore-tag" lang="en">Exploration, not a recommendation · No regional agronomist validation yet</span>
    </div>
    <div className="sliders">
      {SLIDERS.map(s => <label key={s.id} className="slider">
        <span className="slider-top"><b>{t(s.es, s.en)}</b><output>{weights[s.id]}</output></span>
        <input type="range" min={0} max={100} step={5} value={weights[s.id]} onChange={e => set(s.id, Number(e.target.value))} aria-describedby={`help-${s.id}`} />
        <small id={`help-${s.id}`}>{t(s.help, s.helpEn)} {t("Peso efectivo", "Effective weight")}: {total && ranking.usedCriteria.includes(s.id) ? Math.round((weights[s.id] / total) * 100) : 0} %.</small>
      </label>)}
    </div>
    <p className="formula"><code>{ranking.formula}</code></p>
    <p className="small muted">{t(`Pesos actuales: agua ${weights.water}, suelo ${weights.soil}, diversidad ${weights.diversity}.`, `Current weights: water ${weights.water}, soil ${weights.soil}, diversity ${weights.diversity}.`)} {t("Cada criterio se normaliza entre las opciones mostradas (1 = la mejor de este grupo, 0 = la peor), así que la puntuación es relativa, no una calidad absoluta. Manejo pondera por igual sus indicadores disponibles (supuesto del proyecto). Manejo y diversidad comparten variables; no son mediciones ni criterios independientes.", "Each criterion is normalised across the options shown (1 = best of this set, 0 = worst), so the score is relative, not an absolute quality. Management weighs its available indicators equally (a project assumption). Management and diversity share variables; they are not measurements or independent criteria.")}</p>
    {ranking.note && <p className="notice" role="status">{t(ranking.note, ranking.note.startsWith("Todas") ? "All priorities are at 0: move at least one slider to rank." : ranking.note.startsWith("No se usa") ? "Water is not used: there is no complete water demand for every option." : "There are no compatible options to rank.")}</p>}
    <ol className="ranking" aria-label={t("Opciones ordenadas por las prioridades elegidas", "Options ordered by the chosen priorities")} aria-live="polite">
      {ranking.ranked.map(r => <li key={r.strategy.id} style={{ viewTransitionName: `rank-${r.strategy.id}` } as React.CSSProperties}>
        <span className="rank-pos" aria-label={t(`Puesto ${r.rank}`, `Rank ${r.rank}`)}>#{r.rank}</span>
        <div className="rank-body">
          <div className="rank-title"><span className="strategy-chip">{r.strategy.id}</span><strong>{name(r.strategy)}</strong><span className="rank-score">{r.score.toFixed(2)}</span></div>
          <span className="rank-bar" aria-hidden="true"><span style={{ width: `${r.score * 100}%` }} /></span>
          <p className="why"><b lang="en">Why it ranks here:</b> <span lang="en">{r.why}</span></p>
          <p className="parts small muted">sᵢ → {t("agua", "water")} {r.parts.water === null ? "n/a" : r.parts.water.toFixed(2)} · {t("suelo", "soil")} {r.parts.soil?.toFixed(2)} · {t("diversidad", "diversity")} {r.parts.diversity?.toFixed(2)}</p>
        </div>
      </li>)}
    </ol>
    {ranking.excluded.length > 0 && <p className="small muted">{t("Sin ordenar", "Not ranked")}: {ranking.excluded.map(e => `${e.strategy.id} (${e.reason})`).join("; ")}</p>}
  </div>;
}
