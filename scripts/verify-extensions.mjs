// Real upstream responses for reproducible integration evidence, never a production fallback.
import { mkdir, writeFile } from "node:fs/promises";
import { build } from "esbuild";
const dir = "docs/evidence/revision-2026-11-15";
await mkdir(dir, { recursive: true });
const compiled = await build({ stdin: { contents: "export {fetchClimate,normalizePower} from './src/lib/power'; export {fetchVegetation} from './src/lib/vegetation';", resolveDir: process.cwd(), loader: "ts" }, bundle: true, platform: "node", format: "esm", write: false });
const lib = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString("base64")}`);
const recordedFetch = async (input, init) => {
  const url = String(input); const response = await fetch(input, init);
  if (response.ok && /\/MOD13Q1\/(bands|subset)/.test(url)) {
    const name = url.includes("/bands") ? "modis-bands.json" : "modis-subset.json";
    await writeFile(`${dir}/${name}`, JSON.stringify(await response.clone().json(), null, 2));
  }
  return response;
};
const results = await Promise.allSettled([
  ...[{ name: "viru", lat: -8.42, lon: -78.75 }, { name: "cusco", lat: -13.52, lon: -71.97 }].map(async point => {
    const query = { lat: point.lat, lon: point.lon, start: "2024-01-01", end: "2024-01-31", extended: true };
    let raw;
    const climate = await lib.fetchClimate(query, async (input, init) => { const r = await fetch(input, init); if (r.ok) raw = await r.clone().json(); return r; }, 30_000);
    await writeFile(`${dir}/power-pm-${point.name}.json`, JSON.stringify({ query, retrievedAt: climate.retrievedAt, url: climate.url, raw }, null, 2));
    return { service: "NASA POWER extended", location: point.name, days: climate.days.length, missing: climate.waterWeather.missing };
  }),
  (async () => {
    const vegetation = await lib.fetchVegetation({ lat: -8.42, lon: -78.75, start: "2024-01-01", end: "2024-02-02" }, recordedFetch);
    await writeFile(`${dir}/modis-normalized.json`, JSON.stringify(vegetation, null, 2));
    return { service: "NASA MODIS / ORNL DAAC", total: vegetation.totalCount, accepted: vegetation.validCount };
  })(),
]);
const summary = results.map(r => r.status === "fulfilled" ? { passed: true, ...r.value } : { passed: false, error: r.reason?.message ?? String(r.reason) });
await writeFile(`${dir}/live-services.json`, JSON.stringify({ verifiedAt: new Date().toISOString(), results: summary }, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (summary.some(s => !s.passed)) process.exitCode = 1;
