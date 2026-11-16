/** FAO-56 eq. 6. Inputs use MJ m⁻² day⁻¹, °C, kPa and m s⁻¹ at 2 m. */
export function penmanMonteithEquation(input: { meanC: number; netRadiation: number; vapourPressureKpa: number; saturationKpa: number; pressureKpa: number; wind2m: number; soilHeatFlux?: number }) {
  const { meanC: t, netRadiation: rn, vapourPressureKpa: ea, saturationKpa: es, pressureKpa: p, wind2m: u } = input;
  if (![t, rn, ea, es, p, u, input.soilHeatFlux ?? 0].every(Number.isFinite) || p <= 0 || u < 0 || ea < 0 || es < ea) return null;
  const delta = 4098 * saturationPressure(t) / (t + 237.3) ** 2;
  const gamma = 0.000665 * p;
  return Math.max(0, (0.408 * delta * (rn - (input.soilHeatFlux ?? 0)) + gamma * (900 / (t + 273)) * u * (es - ea)) / (delta + gamma * (1 + 0.34 * u)));
}
export const saturationPressure = (c: number) => 0.6108 * Math.exp(17.27 * c / (c + 237.3));

/** FAO-56 eq. 11–14, 19, 37–39. Daily G=0; standard grass albedo=0.23. */
export function dailyPenmanMonteith(input: { minC: number | null; maxC: number | null; dewC?: number | null; wind2m?: number | null; solarMj?: number | null; pressureKpa?: number | null; elevationM?: number | null; raMj: number }) {
  const { minC, maxC, dewC, wind2m, solarMj, pressureKpa, elevationM, raMj } = input;
  if ([minC, maxC, dewC, wind2m, solarMj, pressureKpa, elevationM, raMj].some(x => x === null || x === undefined || !Number.isFinite(x))) return null;
  if (minC! > maxC! || dewC! > maxC! || wind2m! < 0 || solarMj! < 0 || pressureKpa! <= 0) return null;
  const rso = (0.75 + 0.00002 * elevationM!) * raMj;
  // Polar night needs an independently justified radiation treatment.
  if (rso <= 0) return null;
  const es = (saturationPressure(minC!) + saturationPressure(maxC!)) / 2;
  const ea = saturationPressure(dewC!);
  if (ea > es) return null;
  const ratio = Math.max(0.3, Math.min(1, solarMj! / rso));
  const rnl = 4.903e-9 * ((maxC! + 273.16) ** 4 + (minC! + 273.16) ** 4) / 2 * (0.34 - 0.14 * Math.sqrt(ea)) * (1.35 * ratio - 0.35);
  return penmanMonteithEquation({ meanC: (minC! + maxC!) / 2, netRadiation: 0.77 * solarMj! - rnl, vapourPressureKpa: ea, saturationKpa: es, pressureKpa: pressureKpa!, wind2m: wind2m! });
}
