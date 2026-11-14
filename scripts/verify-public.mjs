import { writeFile } from "node:fs/promises";
const origin = new URL(process.argv[2] ?? "http://127.0.0.1:8787").origin;
const checks = [];
for (const [path, type, expected] of [
  ["/", "text/html", /^<!doctype html>/i],
  ["/assets/app.js", "javascript", /./s],
  ["/submission/index.html", "text/html", /^<!doctype html>/i],
  ["/submission/agroorbit-nexus-demo.pdf", "application/pdf", /^%PDF-/],
]) {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(20_000) });
  const body = new Uint8Array(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? "";
  const decoded = new TextDecoder().decode(body);
  if (!response.ok || !contentType.includes(type) || (body[0] === 31 && body[1] === 139) || !expected.test(decoded)) throw new Error(`Contenido inválido o doble compresión: ${path}, HTTP ${response.status}`);
  checks.push({ path, status: response.status, url: response.url, contentType, decodedBytes: body.length, contentVerified: true });
}
for (const [path, init, status] of [
  ["/api/analyze", { method: "GET" }, 405],
  ["/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, 400],
]) {
  const response = await fetch(origin + path, { ...init, signal: AbortSignal.timeout(20_000) });
  const data = await response.json();
  if (response.status !== status || typeof data.error !== "string") throw new Error(`Validación de API inesperada: ${response.status}`);
  checks.push({ path, method: init.method, status: response.status, validationVerified: true });
}
await writeFile(process.argv[3] ?? "docs/evidence/public-http.json", JSON.stringify({ verifiedAt: new Date().toISOString(), origin, anonymous: true, checks, scope: "Contenido HTML/JS/PDF y validación HTTP; pruebas NASA/interfaz registradas por separado." }, null, 2));
console.log(`HTTP y contenido verificados sin sesión: ${checks.length} comprobaciones en ${origin}`);
