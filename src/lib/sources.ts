import { z } from "zod";
export const sourceDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), provider: z.string(), dataset: z.string(),
  documentation: z.url(), coverage: z.enum(["global", "regional"]), type: z.enum(["climate", "land-cover", "reflectance"]),
  version: z.string(), period: z.string(), resolution: z.string(), license: z.string(),
  use: z.string(), limitations: z.array(z.string()).min(1),
});
export const worldCover = sourceDefinitionSchema.parse({
  id: "esa-worldcover-2021", provider: "ESA WorldCover consortium / Terrascope", dataset: "ESA WorldCover 2021", documentation: "https://esa-worldcover.org/en/data-access", coverage: "global", type: "land-cover", version: "v200", period: "2021", resolution: "10 m nominales; teselas renderizadas según zoom", license: "CC-BY-4.0",
  use: "Contexto de cobertura terrestre clasificada; la clase cropland no identifica especie ni rotación.",
  limitations: ["Mapa histórico de 2021, no estado actual de una parcela", "Servicio WMS: cobertura entre latitudes -60 y 83 grados; fuera de ella no se infieren datos", "Clasificación con error; no define límites prediales ni valida aptitud agronómica", "No comparar cambios 2020/2021 sin considerar algoritmos distintos", "La capa no alimenta reglas de recomendación"],
});
export const worldCoverTileUrl = "https://titiler.terrascope.be/wms?service=WMS&version=1.3.0&request=GetMap&layers=esa-worldcover-map-10m-2021-v2_map&time=2021-01-01&styles=&format=image/png&transparent=true&width=256&height=256&crs=EPSG:3857&bbox={bbox-epsg-3857}";
export const worldCoverAttribution = "© ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium";
