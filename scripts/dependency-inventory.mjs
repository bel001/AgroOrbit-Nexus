import { readFile, writeFile } from "node:fs/promises";
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const packages = [];
for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  const installed = JSON.parse(await readFile(`node_modules/${name}/package.json`, "utf8"));
  packages.push({ name, requestedVersion: version, installedVersion: installed.version, license: installed.license ?? "No declarada", repository: installed.repository ?? null, developmentOnly: name in pkg.devDependencies });
}
await writeFile("docs/evidence/dependencies.json", JSON.stringify({ retrievedAt: new Date().toISOString(), node: process.version, packages, override: pkg.overrides }, null, 2));
console.log(`Inventario de ${packages.length} dependencias directas guardado; las licencias transitivas no quedan auditadas por este script.`);
