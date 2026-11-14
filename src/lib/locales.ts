// Extend one registry when adding locale-aware content; scientific IDs remain stable.
export const supportedLocales = ["es", "en"] as const;
export type Locale = typeof supportedLocales[number];
export function localizedName(names: Record<string, string>, locale: string): string {
  return names[locale] ?? names.es ?? names.en ?? Object.values(names)[0] ?? "";
}
