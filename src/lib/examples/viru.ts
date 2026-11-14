import { addDays, type Farm } from "../model";
// Explicit fixture. Never used to initialize a location or prescribe a crop globally.
export const exampleFarm: Farm = {
  name: "Parcela ilustrativa · Virú", lat: -8.42, lon: -78.75, areaHa: null,
  analysisMode: "regional", regionProfileId: "pe-viru-demo",
  soil: "desconocido", ph: null, soilOrigin: "desconocido", irrigation: "desconocido", waterMm: null, waterOrigin: "desconocido",
  priority: "diversidad", excluded: [], illustrative: true, start: "2024-01-01", horizonDays: 540,
  history: [2021, 2022, 2023].map(y => ({ crop: "maize", start: `${y}-01-01`, end: `${y}-05-31`, origin: "estimado" })),
  current: [0, 180, 360].map(offset => ({ crop: "maize", start: addDays("2024-01-01", offset), end: addDays("2024-01-01", offset + 150), origin: "estimado" })),
};
