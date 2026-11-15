"use client";
import { createContext, useContext } from "react";

/**
 * Two-language UI (es / en). Spanish is the default; English is selected with the header toggle or
 * `?lang=en`, and remembered per browser. Strings live next to their use: t("español", "English").
 */
export type Lang = "es" | "en";
const LangContext = createContext<Lang>("es");
export const LangProvider = LangContext.Provider;
export function useLang() { return useContext(LangContext); }
export function useT() {
  const lang = useContext(LangContext);
  return (es: string, en: string) => lang === "en" ? en : es;
}
/** Locale for numbers: es-PE / en-US. */
export function useNum() {
  const lang = useContext(LangContext);
  return (n: number, digits = 0) => n.toLocaleString(lang === "en" ? "en-US" : "es-PE", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
