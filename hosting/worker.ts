import assets from "virtual:hosting-assets";
import { POST } from "../src/app/api/analyze/route";
import { GET } from "../src/app/api/locations/route";

const worker = {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/analyze") return request.method === "POST" ? POST(request) : Response.json({ error: "Usa POST" }, { status: 405, headers: { Allow: "POST" } });
    if (pathname === "/api/locations") return request.method === "GET" ? GET(request) : Response.json({ error: "Usa GET" }, { status: 405, headers: { Allow: "GET" } });
    if (!["GET", "HEAD"].includes(request.method)) return new Response("Método no permitido", { status: 405 });
    const asset = assets[pathname === "/" ? "/index.html" : pathname === "/submission/" ? "/submission/index.html" : pathname];
    if (!asset) return new Response("No encontrado", { status: 404 });
    const bytes = Uint8Array.from(atob(asset.body), c => c.charCodeAt(0));
    return new Response(request.method === "HEAD" ? null : bytes, { headers: {
      "Content-Type": asset.type, "Content-Encoding": "gzip", "X-Content-Type-Options": "nosniff",
      "Cache-Control": pathname === "/" || pathname.endsWith(".html") ? "no-cache" : "public, max-age=3600",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    } });
  },
};
export default worker;
