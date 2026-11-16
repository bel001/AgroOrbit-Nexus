import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
/** Generated evidence never overwrites the curated, tracked files in docs/evidence. */
export function evidencePath(name: string) {
  const path = join(process.env.PLAYWRIGHT_EVIDENCE_DIR ?? "test-results/evidence", name);
  mkdirSync(dirname(path), { recursive: true }); return path;
}
