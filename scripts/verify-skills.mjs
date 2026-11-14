import { readdir, readFile } from "node:fs/promises";
const root = ".agents/skills";
let count = 0;
for (const dir of await readdir(root, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const path = `${root}/${dir.name}/SKILL.md`;
  const text = await readFile(path, "utf8");
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter || !/^name:\s*\S+/m.test(frontmatter[1]) || !/^description:\s*\S+/m.test(frontmatter[1])) throw new Error(`Encabezado inválido: ${path}`);
  const name = frontmatter[1].match(/^name:\s*["']?([a-z0-9-]+)/m)?.[1];
  if (name !== dir.name) throw new Error(`Nombre distinto al directorio: ${path}`);
  console.log(`OK: ${path}`); count++;
}
if (count < 4) throw new Error("Faltan skills esperadas");
console.log(`${count} skills con ubicación y encabezados descubribles. La carga automática en un nuevo turno depende del cliente Codex.`);
