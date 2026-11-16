/** Stored history belongs to this illustrative point and calendar, never to the whole region. */
export const VIRU_HISTORY_POINT = { lat: -8.42, lon: -78.75, start: "2024-01-01", horizonDays: 540 };
export function matchesHistoricalContext(input: { lat: number; lon: number; start: string; horizonDays: number }) {
  return input.lat === VIRU_HISTORY_POINT.lat && input.lon === VIRU_HISTORY_POINT.lon &&
    input.start === VIRU_HISTORY_POINT.start && input.horizonDays === VIRU_HISTORY_POINT.horizonDays;
}
