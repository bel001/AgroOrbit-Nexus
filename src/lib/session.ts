import { z } from "zod";
import { farmSchema, type Farm } from "./model";
import { DEFAULT_WEIGHTS } from "./priorities";

export const DRAFT_KEY = "agroorbit-draft-v1";
export const MAX_IMPORT_BYTES = 8 * 1024 * 1024;
export const weightsSchema = z.object({ water: z.number().finite().min(0).max(100), soil: z.number().finite().min(0).max(100), diversity: z.number().finite().min(0).max(100) });
export const costSchema = z.object({ tariff: z.string().max(30), currency: z.enum(["PEN", "USD", "EUR"]) });
// A draft can be mid-edit (for example water provenance not chosen yet). Validate field types here;
// apply all cross-field constraints again on import and before analysis.
const draftFarmSchema = z.object({ ...farmSchema.shape, lat: z.number().finite().min(-90).max(90).nullable(), lon: z.number().finite().min(-180).max(180).nullable() });
const sessionSchema = z.object({ version: z.literal(1), savedAt: z.iso.datetime(), farm: draftFarmSchema, weights: weightsSchema, cost: costSchema });

export function encodeDraft(farm: Farm, weights: z.infer<typeof weightsSchema>, cost: z.infer<typeof costSchema>) {
  return JSON.stringify(sessionSchema.parse({ version: 1, savedAt: new Date().toISOString(), farm: { ...farm, lat: Number.isFinite(farm.lat) ? farm.lat : null, lon: Number.isFinite(farm.lon) ? farm.lon : null }, weights, cost }));
}
export function decodeDraft(text: string) {
  if (text.length > MAX_IMPORT_BYTES) throw new Error("Borrador demasiado grande");
  const data = sessionSchema.parse(JSON.parse(text));
  return { ...data, farm: { ...data.farm, lat: data.farm.lat ?? NaN, lon: data.farm.lon ?? NaN } as Farm };
}

/** Import inputs only. Reports and claimed review/results are never trusted or reused. */
export function importInputs(text: string) {
  if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) throw new Error("El JSON supera 8 MB");
  const raw = JSON.parse(text);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Se esperaba un perfil o informe JSON");
  if (raw.schemaVersion !== undefined && !["2.1", "2.2", "3.0"].includes(raw.schemaVersion)) throw new Error("Versión de informe no compatible");
  const farm = farmSchema.parse(raw.input ?? raw);
  const weights = raw.priorityRanking?.weights === undefined ? DEFAULT_WEIGHTS : weightsSchema.parse(raw.priorityRanking.weights);
  const cost = raw.costScenario === undefined ? { tariff: "", currency: "PEN" as const } : costSchema.parse(raw.costScenario);
  return { farm, weights, cost };
}
