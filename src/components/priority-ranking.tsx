"use client";
import { flushSync } from "react-dom";
import { Scale } from "lucide-react";
import { rankStrategies, type CriterionId, type Ranking, type Weights } from "@/lib/priorities";
import type { Strategy } from "@/lib/rotations";

const SLIDERS: { id: CriterionId; es: string; en: string; help: string }[] = [
  { id: "water", es: "Agua", en: "Water", help: "Menos agua no cubierta por la lluvia (déficit bruto FAO-56)." },
  { id: "soil", es: "Salud del suelo", en: "Soil health", help: "Media de 4 indicadores: leguminosa, familias, repeticiones, días sin cultivo." },
  { id: "diversity", es: "Diversidad / corte de ciclo de plagas", en: "Diversity / pest-cycle break", help: "Más familias de cultivos y menos repeticiones seguidas." },
];

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => unknown };

export default function PriorityRanking({ strategies, weights, onWeights }: { strategies: Strategy[]; weights: Weights; onWeights: React.Dispatch<React.SetStateAction<Weights>> }) {
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
  const total = SLIDERS.reduce((a, s) => a + weights[s.id], 0);

  return <div className="priority-card">
    <div className="priority-head">
      <h3><Scale size={20} aria-hidden="true" /> Prioridades del agricultor <span lang="en">· Farmer priorities</span></h3>
      <span className="explore-tag" lang="en">Exploration, not a recommendation · No regional agronomist validation yet</span>
    </div>
    <div className="sliders">
      {SLIDERS.map(s => <label key={s.id} className="slider">
        <span className="slider-top"><b>{s.es} <span lang="en">· {s.en}</span></b><output>{weights[s.id]}</output></span>
        <input type="range" min={0} max={100} step={5} value={weights[s.id]} onChange={e => set(s.id, Number(e.target.value))} aria-describedby={`help-${s.id}`} />
        <small id={`help-${s.id}`}>{s.help} Peso efectivo: {total ? Math.round((weights[s.id] / total) * 100) : 0} %.</small>
      </label>)}
    </div>
    <p className="formula"><code>{ranking.formula}</code></p>
    <p className="small muted">Pesos actuales: agua {weights.water}, suelo {weights.soil}, diversidad {weights.diversity}. Cada criterio se normaliza entre las opciones mostradas (1 = la mejor de este grupo, 0 = la peor), así que la puntuación es relativa, no una calidad absoluta. Salud del suelo pondera por igual sus cuatro indicadores (supuesto del proyecto).</p>
    {ranking.note && <p className="notice" role="status">{ranking.note}</p>}
    <ol className="ranking" aria-label="Opciones ordenadas por las prioridades elegidas" aria-live="polite">
      {ranking.ranked.map(r => <li key={r.strategy.id} style={{ viewTransitionName: `rank-${r.strategy.id}` } as React.CSSProperties}>
        <span className="rank-pos" aria-label={`Puesto ${r.rank}`}>#{r.rank}</span>
        <div className="rank-body">
          <div className="rank-title"><span className="strategy-chip">{r.strategy.id}</span><strong>{r.strategy.name}</strong><span className="rank-score">{r.score.toFixed(2)}</span></div>
          <span className="rank-bar" aria-hidden="true"><span style={{ width: `${r.score * 100}%` }} /></span>
          <p className="why"><b lang="en">Why it ranks here:</b> <span lang="en">{r.why}</span></p>
          <p className="parts small muted">sᵢ → agua {r.parts.water === null ? "n/d" : r.parts.water.toFixed(2)} · suelo {r.parts.soil?.toFixed(2)} · diversidad {r.parts.diversity?.toFixed(2)}</p>
        </div>
      </li>)}
    </ol>
    {ranking.excluded.length > 0 && <p className="small muted">Sin ordenar: {ranking.excluded.map(e => `${e.strategy.id} (${e.reason})`).join("; ")}</p>}
  </div>;
}
