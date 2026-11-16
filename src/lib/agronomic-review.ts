import type { Farm } from "./model";
import { resolveCoverage } from "./regions";

/** Readiness to take this case to a specialist, never an agronomic approval. */
export function agronomicReview(farm: Farm) {
  const campaigns = [...farm.current, ...farm.alternatives.flatMap(a => a.campaigns)];
  const items = [
    { id: "varieties", label: "Identidad varietal de cada campaña", supplied: campaigns.length > 0 && campaigns.every(c => Boolean(c.variety?.trim())) },
    { id: "soil", label: "Análisis de suelo con fecha, procedencia, drenaje y salinidad", supplied: farm.soilOrigin !== "desconocido" && farm.ph !== null && !!farm.soilDetails?.sampledOn && !!farm.soilDetails.reference && farm.soilDetails.drainage !== "desconocido" && farm.soilDetails.salinityDsM !== null },
    { id: "water", label: "Disponibilidad de agua y procedencia", supplied: farm.waterMm !== null && farm.waterOrigin !== "desconocido" },
    { id: "profile", label: "Perfil regional revisado y vigente", supplied: resolveCoverage(farm).profile?.status === "reviewed" },
  ];
  return { status: "pending-independent-review" as const, recommendationsAllowed: false,
    items, requiredExternalEvidence: ["Ventanas de siembra y requisitos por variedad, región y periodo", "Dos casos independientes con resultados esperados y discrepancias revisadas", "Revisión del evaluador por un agrónomo identificado, con fecha, fuentes y límites"],
    note: "Aportar datos no valida su exactitud ni habilita recomendaciones. La revisión debe incorporarse al perfil versionado y a sus pruebas, no al JSON del usuario." };
}
