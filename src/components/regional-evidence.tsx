import type { EvidenceReport } from "@/lib/rotations";

export default function RegionalEvidence({ report }: { report: EvidenceReport }) {
  const evidence = report.regionalEvidence;
  if (!evidence) return <p>No hay ficha agronómica regional aplicable. Las referencias generales del catálogo no habilitan recomendaciones para esta ubicación.</p>;
  return <div className="regional-evidence"><h3>Virú: qué respaldan las fuentes y qué falta</h3>
    <p>Revisión documental {evidence.reviewedAt}. Las variedades siguientes son candidatas de estudio, no variedades verificadas en el terreno. Ninguna ficha certifica estas rotaciones.</p>
    {evidence.entries.map(entry => <details key={entry.id}><summary>{entry.institution} · {entry.title}</summary><p>{entry.facts}</p><p><strong>Alcance y límite:</strong> {entry.limit}</p><p className="small"><a href={entry.url} target="_blank" rel="noreferrer">Documento oficial · {entry.edition} · {entry.pages}</a></p></details>)}
    <h4>Evidencia pendiente para una evaluación agrícola</h4><ul>{evidence.gaps.map(gap => <li key={gap}>{gap}</li>)}</ul>
  </div>;
}
