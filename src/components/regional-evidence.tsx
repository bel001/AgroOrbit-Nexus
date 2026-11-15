"use client";
import type { EvidenceReport } from "@/lib/rotations";
import { useLang, useT } from "./i18n";

export default function RegionalEvidence({ report }: { report: EvidenceReport }) {
  const t = useT(); const lang = useLang();
  const evidence = report.regionalEvidence;
  if (!evidence) return <p>{t("No hay ficha agronómica regional aplicable. Las referencias generales del catálogo no habilitan recomendaciones para esta ubicación.", "No regional agronomic sheet applies. General catalogue references do not enable recommendations for this location.")}</p>;
  return <div className="regional-evidence"><h3>{t("Virú: qué respaldan las fuentes y qué falta", "Virú: what the sources support and what is missing")}</h3>
    <p>{t(`Revisión documental ${evidence.reviewedAt}. Las variedades siguientes son candidatas de estudio, no variedades verificadas en el terreno. Ninguna ficha certifica estas rotaciones.`, `Document review ${evidence.reviewedAt}. The varieties below are study candidates, not varieties verified on the plot. No sheet certifies these rotations.`)}{lang === "en" ? " The official INIA, MIDAGRI and FAO notes below are summarised in Spanish." : ""}</p>
    {evidence.entries.map(entry => <details key={entry.id}><summary>{entry.institution} · {entry.title}</summary><p>{entry.facts}</p><p><strong>{t("Alcance y límite:", "Scope and limit:")}</strong> {entry.limit}</p><p className="small"><a href={entry.url} target="_blank" rel="noreferrer">{t("Documento oficial", "Official document")} · {entry.edition} · {entry.pages}</a></p></details>)}
    <h4>{t("Evidencia pendiente para una evaluación agrícola", "Evidence still needed for an agronomic assessment")}</h4><ul>{evidence.gaps.map(gap => <li key={gap}>{gap}</li>)}</ul>
  </div>;
}
