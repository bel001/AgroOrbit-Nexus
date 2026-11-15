import { catalog } from "./catalog";
import type { Strategy } from "./rotations";

/**
 * Farmer-priority ordering of the compared sequences.
 *
 * This is an exploration aid, not a recommendation: it only re-orders options by how they compare
 * with each other on numbers already computed elsewhere (FAO-56 crop water demand ETc, crop families,
 * repetitions, uncropped days). Every criterion is min-max normalised across the options shown
 * (1 = best of this set, 0 = worst of this set), so scores are relative, never absolute quality.
 *
 *   score = Σ wᵢ·sᵢ / Σ wᵢ   over the criteria with data for every option
 */

export const LEGUME_FAMILY = "Fabaceae";
export type Weights = { water: number; soil: number; diversity: number };
export const DEFAULT_WEIGHTS: Weights = { water: 50, soil: 50, diversity: 50 };
export type CriterionId = keyof Weights;

export type SoilIndicators = {
  hasLegume: boolean; families: number; maxRepeat: number; uncroppedDays: number | null;
};
export function soilIndicators(s: Strategy): SoilIndicators {
  return {
    hasLegume: s.campaigns.some(c => catalog[c.crop].family === LEGUME_FAMILY),
    families: s.families, maxRepeat: s.maxRepeat, uncroppedDays: s.idleDays,
  };
}

/** Min-max normalisation across options. Equal values → 1 for all (no option is worse). */
export function normalise(values: number[], higherIsBetter: boolean): number[] {
  const min = Math.min(...values), max = Math.max(...values);
  if (max === min) return values.map(() => 1);
  return values.map(v => higherIsBetter ? (v - min) / (max - min) : (max - v) / (max - min));
}
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export type Criterion = { id: CriterionId; available: boolean; scores: number[]; reason?: string };

/** The three criteria, each a 0–1 score per option. */
export function criteria(strategies: Strategy[]): Criterion[] {
  const ind = strategies.map(soilIndicators);
  // Water = crop water demand (FAO-56 ETc). Irrigated coastal valleys depend on canal water, not on rain.
  const demand = strategies.map(s => s.water?.etcMm ?? null);
  const waterOk = demand.every((d): d is number => d !== null);
  const idle = ind.map(i => i.uncroppedDays);
  const idleOk = idle.every((d): d is number => d !== null);

  const legume = ind.map(i => i.hasLegume ? 1 : 0);
  const families = normalise(ind.map(i => i.families), true);
  const repeats = normalise(ind.map(i => i.maxRepeat), false);
  const bare = idleOk ? normalise(idle as number[], false) : null;
  // Soil health: equal-weight mean of the four indicators (assumption shown in the UI).
  const soil = strategies.map((_, k) => mean([legume[k], families[k], repeats[k], ...(bare ? [bare[k]] : [])]));
  const diversity = strategies.map((_, k) => mean([families[k], repeats[k]]));

  return [
    { id: "water", available: waterOk, scores: waterOk ? normalise(demand as number[], false) : strategies.map(() => 0),
      reason: waterOk ? undefined : "Sin demanda de agua completa para todas las opciones (falta la serie NASA del horizonte)." },
    { id: "soil", available: true, scores: soil },
    { id: "diversity", available: true, scores: diversity },
  ];
}

export type Ranked = {
  strategy: Strategy; rank: number; score: number;
  parts: Record<CriterionId, number | null>; why: string;
};
export type Ranking = {
  ranked: Ranked[]; excluded: { strategy: Strategy; reason: string }[];
  weights: Weights; usedCriteria: CriterionId[]; formula: string; note: string | null;
};

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export function rankStrategies(all: Strategy[], weights: Weights): Ranking {
  const excluded = all.filter(s => s.status === "Incompatible").map(strategy => ({ strategy, reason: "Incompatible: fechas o exclusiones no válidas; no se ordena." }));
  const options = all.filter(s => s.status !== "Incompatible");
  const formula = "score = Σ wᵢ·sᵢ / Σ wᵢ · sᵢ ∈ [0,1] normalised across the options shown (1 = best of this set)";
  if (options.length === 0) return { ranked: [], excluded, weights, usedCriteria: [], formula, note: "No hay opciones compatibles para ordenar." };

  const crit = criteria(options);
  const used = crit.filter(c => c.available && weights[c.id] > 0);
  const totalW = used.reduce((a, c) => a + weights[c.id], 0);
  const unavailable = crit.filter(c => !c.available && weights[c.id] > 0);
  const note = totalW === 0 ? "Todas las prioridades están en 0: mueve al menos un control para ordenar."
    : unavailable.length ? `No se usa «${unavailable.map(c => c.id).join(", ")}»: ${unavailable[0].reason}` : null;

  const ind = options.map(soilIndicators);
  const demand = options.map(s => s.water?.etcMm ?? null);
  const minDemand = demand.every(d => d !== null) ? Math.min(...(demand as number[])) : null;

  const rows = options.map((strategy, k) => {
    const parts = Object.fromEntries(crit.map(c => [c.id, c.available ? c.scores[k] : null])) as Record<CriterionId, number | null>;
    const score = totalW === 0 ? 0 : used.reduce((a, c) => a + weights[c.id] * c.scores[k], 0) / totalW;
    return { strategy, score, parts, k };
  });
  const sorted = [...rows].sort((a, b) => b.score - a.score || a.strategy.id.localeCompare(b.strategy.id));
  const ranked: Ranked[] = sorted.map(r => {
    // Ties share the rank of the first option with the same score.
    const rank = sorted.findIndex(x => Math.abs(x.score - r.score) < 1e-9) + 1;
    const i = ind[r.k], d = demand[r.k];
    const facts: string[] = [];
    if (d !== null && minDemand !== null) facts.push(d === minDemand ? `lowest water demand (${fmt(d * 10)} m³/ha)` : `${fmt((d - minDemand) * 10)} m³/ha more water than the lowest (${fmt(d * 10)} m³/ha)`);
    facts.push(`${i.families} crop ${i.families === 1 ? "family" : "families"}`);
    facts.push(i.maxRepeat > 1 ? `same crop ${i.maxRepeat}× in a row` : "no crop repeated back-to-back");
    facts.push(i.hasLegume ? "includes a legume" : "no legume");
    if (i.uncroppedDays !== null) facts.push(`${fmt(i.uncroppedDays)} uncropped days`);
    // Name a strongest criterion only if it actually contributes to the score.
    const best = used.map(c => ({ id: c.id, v: weights[c.id] * c.scores[r.k] })).sort((a, b) => b.v - a.v)[0];
    const top = best && best.v > 0 ? best.id : null;
    const lead = totalW === 0 ? "Not ranked (all weights 0)" : `#${rank} · score ${r.score.toFixed(2)}${top ? ` · strongest on ${top}` : ""}`;
    return { strategy: r.strategy, rank, score: r.score, parts: r.parts, why: `${lead}: ${facts.join(", ")}.` };
  });
  return { ranked, excluded, weights, usedCriteria: used.map(c => c.id), formula, note };
}
