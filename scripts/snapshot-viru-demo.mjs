// Downloads the exact NASA POWER series used by the Virú demo and stores it unmodified,
// so the demo still works offline or when the API is down. Re-run to refresh.
import { mkdir, writeFile } from "node:fs/promises";

const query = { lat: -8.42, lon: -78.75, start: "2024-01-01", end: "2025-06-23" };
const url = new URL("https://power.larc.nasa.gov/api/temporal/daily/point");
url.search = new URLSearchParams({
  parameters: "T2M,T2M_MIN,T2M_MAX,PRECTOTCORR", community: "AG",
  longitude: String(query.lon), latitude: String(query.lat),
  start: query.start.replaceAll("-", ""), end: query.end.replaceAll("-", ""),
  format: "JSON", "time-standard": "LST",
}).toString();

const response = await fetch(url, { signal: AbortSignal.timeout(90_000), headers: { Accept: "application/json" } });
if (!response.ok) throw new Error(`NASA POWER HTTP ${response.status}`);
const raw = await response.json();
if (raw.parameters?.T2M?.units !== "C" || raw.parameters?.PRECTOTCORR?.units !== "mm/day") throw new Error("Unexpected NASA POWER contract");
const days = Object.keys(raw.properties.parameter.T2M).length;

await mkdir("src/data", { recursive: true });
await writeFile("src/data/power-viru-demo.json", JSON.stringify({ query, url: url.toString(), retrievedAt: new Date().toISOString(), raw }));
console.log(`Snapshot saved: ${days} days, API ${raw.header.api.version}, ${url}`);
