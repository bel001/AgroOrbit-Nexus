import { z } from "zod";
export type Vertex = [number, number]; // longitude, latitude (WGS84)
const R = 6_371_008.8;
const radians = (n: number) => n * Math.PI / 180;
const deltaLon = (a: number, b: number) => ((b - a + 540) % 360) - 180;
export function approximateAreaHa(vertices: Vertex[]) {
  if (vertices.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i], b = vertices[(i + 1) % vertices.length];
    sum += radians(deltaLon(a[0], b[0])) * (Math.sin(radians(a[1])) + Math.sin(radians(b[1])));
  }
  return Math.abs(sum) * R * R / 2 / 10_000;
}
function localCoordinates(vertices: Vertex[]): Vertex[] {
  return vertices.map(([lon, lat]) => [deltaLon(vertices[0][0], lon), lat]);
}
function intersects(a: Vertex, b: Vertex, c: Vertex, d: Vertex) {
  const cross = (p: Vertex, q: Vertex, r: Vertex) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const on = (p: Vertex, q: Vertex, r: Vertex) => Math.abs(cross(p, q, r)) < 1e-12 && r[0] >= Math.min(p[0], q[0]) && r[0] <= Math.max(p[0], q[0]) && r[1] >= Math.min(p[1], q[1]) && r[1] <= Math.max(p[1], q[1]);
  return (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) || on(a, b, c) || on(a, b, d) || on(c, d, a) || on(c, d, b);
}
export const parcelSchema = z.object({
  vertices: z.array(z.tuple([z.number().finite().min(-180).max(180), z.number().finite().min(-85).max(85)])).min(3).max(64),
  origin: z.enum(["declarado", "medido", "estimado"]),
}).superRefine((parcel, ctx) => {
  const points = localCoordinates(parcel.vertices);
  if (new Set(parcel.vertices.map(p => p.join(","))).size !== points.length) ctx.addIssue({ code: "custom", message: "No repitas vértices; el cierre del polígono es automático" });
  if (Math.max(...points.map(p => p[0])) - Math.min(...points.map(p => p[0])) > 5 || Math.max(...points.map(p => p[1])) - Math.min(...points.map(p => p[1])) > 5) ctx.addIssue({ code: "custom", message: "El polígono debe representar una parcela local (extensión máxima 5°)" });
  const area = approximateAreaHa(parcel.vertices);
  if (area < 0.001 || area > 1_000_000) ctx.addIssue({ code: "custom", message: "Área estimada fuera del rango 0,001–1 000 000 ha" });
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
    if (j === i + 1 || (i === 0 && j === points.length - 1)) continue;
    if (intersects(points[i], points[(i + 1) % points.length], points[j], points[(j + 1) % points.length])) { ctx.addIssue({ code: "custom", message: "Los bordes del polígono se cruzan o se tocan" }); return; }
  }
});
export type Parcel = z.infer<typeof parcelSchema>;
export function parcelCenter(vertices: Vertex[]) {
  const points = localCoordinates(vertices);
  // An interior reference point, including concave parcels (not a surveyed centroid).
  const lat = (Math.min(...points.map(p => p[1])) + Math.max(...points.map(p => p[1]))) / 2;
  const intersections: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    if ((a[1] > lat) !== (b[1] > lat)) intersections.push(a[0] + (lat - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
  }
  intersections.sort((a, b) => a - b);
  let left = intersections[0], right = intersections[1];
  for (let i = 2; i + 1 < intersections.length; i += 2) if (intersections[i + 1] - intersections[i] > right - left) { left = intersections[i]; right = intersections[i + 1]; }
  return { lon: ((vertices[0][0] + (left + right) / 2 + 540) % 360) - 180, lat };
}
export function parseParcelText(text: string): Parcel {
  let vertices: unknown;
  if (text.trim().startsWith("{")) {
    const raw = JSON.parse(text); const geometry = raw.type === "Feature" ? raw.geometry : raw;
    if (geometry?.type !== "Polygon" || geometry.coordinates?.length !== 1) throw new Error("Usa un polígono GeoJSON sin huecos");
    const ring = geometry.coordinates[0];
    vertices = ring.length > 1 && JSON.stringify(ring[0]) === JSON.stringify(ring.at(-1)) ? ring.slice(0, -1) : ring;
  } else vertices = text.trim().split(/\r?\n/).map(line => line.trim().split(/[,;\s]+/).map(Number));
  return parcelSchema.parse({ vertices, origin: "declarado" });
}
