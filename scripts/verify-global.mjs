import { mkdir, writeFile } from "node:fs/promises";
const places = [
  { id: "viru", label: "Virú · Perú", lat: -8.42, lon: -78.75 },
  { id: "california", label: "California · Estados Unidos", lat: 36.75, lon: -119.75 },
  { id: "france", label: "Francia", lat: 48.25, lon: 2.25 },
  { id: "kenya", label: "Kenia", lat: -0.5, lon: 36.5 },
  { id: "india", label: "India", lat: 30.75, lon: 75.75 },
  { id: "australia", label: "Australia", lat: -34.5, lon: 146.5 },
];
await mkdir("docs/evidence/global", { recursive: true });
const results = [];
for (const place of places) {
  const url = new URL("https://power.larc.nasa.gov/api/temporal/daily/point");
  url.search = new URLSearchParams({ parameters: "T2M,T2M_MIN,T2M_MAX,PRECTOTCORR", community: "AG", latitude: String(place.lat), longitude: String(place.lon), start: "20240101", end: "20240107", format: "JSON", "time-standard": "LST" }).toString();
  const retrievedAt = new Date().toISOString();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.json();
    if (raw.parameters?.T2M?.units !== "C" || raw.parameters?.PRECTOTCORR?.units !== "mm/day") throw new Error("Unidades inesperadas");
    await writeFile(`docs/evidence/global/${place.id}.json`, JSON.stringify(raw));
    results.push({ ...place, url: url.href, retrievedAt, status: response.status, api: raw.header.api.version, temperatureDays: Object.keys(raw.properties.parameter.T2M).length, units: raw.parameters });
    console.log(`OK NASA real: ${place.label}`);
  } catch (e) { results.push({ ...place, url: url.href, retrievedAt, error: e.message }); console.log(`ERROR ${place.label}: ${e.message}`); }
}
await writeFile("docs/evidence/global/requests.json", JSON.stringify(results, null, 2));
if (results.some(r => r.error)) process.exitCode = 1;
