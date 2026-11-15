/**
 * NASA POWER daily meteorology (T2M*, PRECTOTCORR) comes from MERRA-2 on a 0.5° latitude × 0.625°
 * longitude grid. Cell edges were verified empirically against the API around the Virú demo point
 * (docs/evidence/power-grid-check.json): values change exactly when crossing −8.75/−8.25 and
 * −79.0625/−78.4375. Every point inside a cell receives the same data.
 */
export const LAT_STEP = 0.5;
export const LON_STEP = 0.625;

export function powerCell(lat: number, lon: number) {
  const latCenter = Math.round(lat / LAT_STEP) * LAT_STEP;
  const lonCenter = Math.round((lon + 180) / LON_STEP) * LON_STEP - 180;
  return {
    south: Math.max(-90, latCenter - LAT_STEP / 2), north: Math.min(90, latCenter + LAT_STEP / 2),
    west: lonCenter - LON_STEP / 2, east: lonCenter + LON_STEP / 2,
    center: { lat: latCenter, lon: lonCenter },
  };
}

/** Approximate cell size in km at its centre latitude (spherical Earth). */
export function cellSizeKm(lat: number) {
  const kmPerDeg = 111.32;
  return { northSouth: LAT_STEP * kmPerDeg, eastWest: LON_STEP * kmPerDeg * Math.cos((lat * Math.PI) / 180) };
}
