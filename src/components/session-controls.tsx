"use client";
import { useRef } from "react";
import { Upload, Download, Trash2 } from "lucide-react";
import { MAX_IMPORT_BYTES } from "@/lib/session";
import { useT } from "./i18n";

export function saveJson(value: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function SessionControls({ status, disabled, onImport, onError, onSave, onClear }: { status: string; disabled: boolean; onImport: (text: string) => void; onError: (message: string) => void; onSave: () => void; onClear: () => void }) {
  const t = useT(); const file = useRef<HTMLInputElement>(null);
  return <div className="session-controls">
    <p className="small muted" role="status">{status}</p>
    <p className="small muted">{t("El borrador se guarda en este navegador. El JSON permite trasladarlo a otro equipo; los resultados se recalculan al importar.", "Your draft stays in this browser. Use JSON to move it to another device; imported results are recalculated.")}</p>
    <div className="report-actions">
      <button type="button" className="button secondary" disabled={disabled} onClick={() => file.current?.click()}><Upload size={16} aria-hidden="true" />{t("Importar JSON", "Import JSON")}</button>
      <button type="button" className="button ghost" disabled={disabled} onClick={onSave}><Download size={16} aria-hidden="true" />{t("Guardar perfil JSON", "Save profile JSON")}</button>
      <button type="button" className="button ghost" disabled={disabled} onClick={onClear}><Trash2 size={16} aria-hidden="true" />{t("Borrar borrador local", "Delete local draft")}</button>
    </div>
    <input ref={file} className="sr-only" type="file" accept=".json,application/json" aria-label={t("Archivo de perfil JSON", "JSON profile file")} onChange={async e => {
      const selected = e.target.files?.[0]; e.target.value = "";
      if (!selected) return;
      try { if (selected.size > MAX_IMPORT_BYTES) throw new Error("size"); onImport(await selected.text()); }
      catch { onError(t("No se pudo importar. Usa un perfil o informe JSON compatible, con entradas válidas, de hasta 8 MB.", "Import failed. Use a compatible JSON profile or report with valid inputs, up to 8 MB.")); }
    }} />
  </div>;
}
