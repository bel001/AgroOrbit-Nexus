import { createServer } from "node:http";
import worker from "../dist/server/index.js";
const port = Number(process.env.PORT ?? 8787);
createServer(async (incoming, outgoing) => {
  try {
    const chunks = []; let size = 0;
    for await (const chunk of incoming) { size += chunk.length; if (size > 32_768) { outgoing.writeHead(413); outgoing.end("Formulario demasiado grande"); return; } chunks.push(chunk); }
    const body = size ? Buffer.concat(chunks) : undefined;
    const response = await worker.fetch(new Request(`http://127.0.0.1:${port}${incoming.url}`, { method: incoming.method, headers: incoming.headers, body }));
    outgoing.writeHead(response.status, Object.fromEntries(response.headers)); outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch (e) { console.error(e.message); outgoing.writeHead(500); outgoing.end("Error de previsualización"); }
}).listen(port, "127.0.0.1", () => console.log(`Worker local: http://127.0.0.1:${port}`));
