import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { readFile, writeFile, mkdir, readdir, cp, rm, lstat, copyFile } from "node:fs/promises";
import { resolve, join, relative, dirname, basename, extname } from "node:path";
import { gzipSync } from "node:zlib";
const root = process.cwd();
const temporary = resolve(root, ".hosting-build");
// Only our named generated directory may be recursively replaced, never a symlink.
if (dirname(temporary) !== root || basename(temporary) !== ".hosting-build") throw new Error("Directorio de build fuera del proyecto");
const existing = await lstat(temporary).catch(e => { if (e.code !== "ENOENT") throw e; return null; });
if (existing?.isSymbolicLink()) throw new Error("El directorio de build no puede ser un enlace");
await rm(temporary, { recursive: true, force: true });
const clientDir = join(temporary, "client"); await mkdir(clientDir, { recursive: true });
await build({ entryPoints: ["hosting/client.tsx"], outdir: clientDir, bundle: true, splitting: true, format: "esm", platform: "browser", target: "es2022", jsx: "automatic", minify: true, publicPath: "/", entryNames: "assets/app", chunkNames: "assets/[name]-[hash]", assetNames: "assets/[name]-[hash]", loader: { ".woff2": "file", ".woff": "file" }, alias: { "next/dynamic": resolve("hosting/dynamic.tsx") }, define: { "process.env.NODE_ENV": '"production"' }, plugins: [{ name: "nexus-tailwind", setup(b) { b.onLoad({ filter: /globals\.css$/ }, async args => ({ contents: (await postcss([tailwind()]).process(await readFile(args.path, "utf8"), { from: args.path })).css, loader: "css", resolveDir: dirname(args.path) })); } }] });
await cp("public/vendor", join(clientDir, "vendor"), { recursive: true });
await cp("public/submission", join(clientDir, "submission"), { recursive: true });
await writeFile(join(clientDir, "index.html"), '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Clima NASA y evaluación explicable de registros agrícolas. Piloto ilustrativo, sin recomendaciones certificadas."><title>AgroOrbit Nexus · From Space to Soil</title><link rel="stylesheet" href="/assets/app.css"></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>');
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".woff2": "font/woff2", ".woff": "font/woff", ".pdf": "application/pdf", ".txt": "text/plain; charset=utf-8" };
const assets = {};
async function collect(dir) { for (const item of await readdir(dir, { withFileTypes: true })) { const file = join(dir, item.name); if (item.isDirectory()) await collect(file); else assets["/" + relative(clientDir, file).replaceAll("\\", "/")] = { type: types[extname(file)] ?? "application/octet-stream", body: gzipSync(await readFile(file)).toString("base64") }; } }
await collect(clientDir);
await mkdir("dist/server", { recursive: true });
await build({ entryPoints: ["hosting/worker.ts"], outfile: "dist/server/index.js", bundle: true, format: "esm", platform: "browser", target: "es2022", minify: true, plugins: [{ name: "inline-assets", setup(b) { b.onResolve({ filter: /^virtual:hosting-assets$/ }, () => ({ path: "assets", namespace: "nexus" })); b.onLoad({ filter: /.*/, namespace: "nexus" }, () => ({ contents: `export default ${JSON.stringify(assets)}`, loader: "js" })); } }] });
try { await mkdir("dist/.openai", { recursive: true }); await copyFile(".openai/hosting.json", "dist/.openai/hosting.json"); } catch (e) { if (e.code !== "ENOENT") throw e; }
const size = (await lstat("dist/server/index.js")).size;
console.log(`Worker ESM: ${Object.keys(assets).length} assets embebidos; ${size} bytes. Mismos componentes, validaciones y API que Next.js.`);
