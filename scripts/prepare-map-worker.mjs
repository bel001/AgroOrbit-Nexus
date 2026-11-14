import { copyFile, mkdir } from "node:fs/promises";
// Worker ESM oficial de la misma versión instalada. Mantenerlo fuera del transformador de Next.
await mkdir("public/vendor", { recursive: true });
await copyFile("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "public/vendor/maplibre-gl-worker.mjs");
await copyFile("node_modules/maplibre-gl/LICENSE.txt", "public/vendor/maplibre-LICENSE.txt");
console.log("Worker MapLibre y licencia copiados desde la dependencia fijada.");
