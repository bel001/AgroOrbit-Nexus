// Downloads daily NASA POWER data for the Virú demo point, 1991-01-01 → 2023-12-31, unmodified.
// Covers the 1991–2020 baseline and the 1997–98, 2016–17 and 2023 seasons used by the El Niño
// stress test, so the analysis works offline. Re-run to refresh.
import { mkdir, writeFile } from "node:fs/promises";

const query = { lat: -8.42, lon: -78.75, start: "1991-01-01", end: "2023-12-31" };
const url = new URL("https://power.larc.nasa.gov/api/temporal/daily/point");
url.search = new URLSearchParams({
  parameters: "T2M,T2M_MIN,T2M_MAX,PRECTOTCORR", community: "AG",
  longitude: String(query.lon), latitude: String(query.lat),
  start: query.start.replaceAll("-", ""), end: query.end.replaceAll("-", ""),
  format: "JSON", "time-standard": "LST",
}).toString();

const response = await fetch(url, { signal: AbortSignal.timeout(180_000), headers: { Accept: "application/json" } });
if (!response.ok) throw new Error(`NASA POWER HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
const raw = await response.json();
if (raw.parameters?.T2M_MAX?.units !== "C" || raw.parameters?.T2M_MIN?.units !== "C") throw new Error("Unexpected NASA POWER contract");
const days = Object.keys(raw.properties.parameter.T2M).length;

await mkdir("src/data", { recursive: true });
await writeFile("src/data/power-viru-1991-2023.json", JSON.stringify({ query, url: url.toString(), retrievedAt: new Date().toISOString(), raw }));
console.log(`History snapshot saved: ${days} days, API ${raw.header.api.version}, grid ${JSON.stringify(raw.geometry ?? null)}`);
