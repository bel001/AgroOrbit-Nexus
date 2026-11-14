import { mkdir, writeFile } from "node:fs/promises";
const urls = [
  "https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/",
  "https://www.spaceappschallenge.org/2026/",
  "https://www.spaceappschallenge.org/legal/",
  "https://www.spaceappschallenge.org/resources/project-submission-guide/",
  "https://www.nasa.gov/nasa-brand-center/brand-guidelines/",
];
const results = await Promise.all(urls.map(async url => {
  const retrievedAt = new Date().toISOString();
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    const text = await r.text();
    return { url, retrievedAt, status: r.status, bytes: text.length, title: text.match(/<title>(.*?)<\/title>/is)?.[1] ?? null, note: "Estado HTTP no acredita revisión legal completa. Véase NASA_COMPLIANCE.md." };
  } catch (e) { return { url, retrievedAt, error: e.message }; }
}));
await mkdir("docs/evidence", { recursive: true });
await writeFile("docs/evidence/source-access.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
