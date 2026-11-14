import { catalog } from "@/lib/catalog";
import type { EvidenceReport } from "@/lib/rotations";

export default function HistoryEvidence({ report }: { report: EvidenceReport }) {
  const d = report.historyDiagnostics;
  return <div className="history-evidence"><h3>¿Qué dice el historial sobre la repetición de cultivos?</h3>
    <p>{report.input.illustrative ? "Escenario ilustrativo: estos indicadores no son observaciones de una finca real." : "Indicadores calculados únicamente con los registros aportados."}</p>
    {!d.interpretable ? <p className="notice">{d.recordCount === 0 ? "Aún no hay campañas registradas. Añade el historial para examinar repetición y diversidad." : "No se interpretan los indicadores: revisa fechas solapadas/inválidas o procedencias desconocidas."}</p> : <>
    <div className="table-scroll" role="region" tabIndex={0} aria-label="Indicadores de repetición de cultivos"><table><caption>Descripciones del historial, sin puntuación de salud del suelo ni diagnóstico de plagas.</caption><thead><tr><th>Indicador</th><th>Resultado</th><th>Qué permite interpretar</th></tr></thead><tbody>
      <tr><th>Campañas documentadas</th><td>{d.recordCount}</td><td>No acredita que el historial esté completo.</td></tr>
      <tr><th>Especies / familias</th><td>{d.species} / {d.families}</td><td>Diversidad taxonómica registrada; no diversidad medida del suelo.</td></tr>
      <tr><th>Mayor racha de una especie</th><td>{d.maxRun} campañas</td><td>Repetición entre registros consecutivos conocidos.</td></tr>
      <tr><th>Especie dominante</th><td>{d.dominant ? `${catalog[d.dominant.crop].name}: ${d.dominant.count}/${d.recordCount} (${(d.dominant.shareOfRecords * 100).toFixed(0)} %)` : "No calculable"}</td><td>Porcentaje de registros; no de hectáreas ni años observados.</td></tr>
      <tr><th>Transiciones de igual especie / familia</th><td>{d.sameCropTransitions} / {d.sameFamilyTransitions} de {d.transitions} pares</td><td>Cambiar maíz por sorgo cambia especie, pero conserva Poaceae.</td></tr>
      <tr><th>Intervalos entre campañas</th><td>{d.daysBetweenCampaigns === null ? "No calculable" : `${d.daysBetweenCampaigns} días`}</td><td>Ausencia de cultivo registrado; puede haber residuos u otras campañas no documentadas.</td></tr>
    </tbody></table></div></>}
    <p><strong>Riesgo potencial a investigar:</strong> {d.riskContext}</p>
    <p><strong>Daño comprobado en este informe:</strong> ninguno. No hay análisis de fertilidad, diagnóstico fitosanitario ni mediciones de pérdidas.</p>
    <p className="small muted">{d.interpretation} <a href={d.source} target="_blank" rel="noreferrer">FAO: fundamento general de diversificación</a>.</p>
  </div>;
}
