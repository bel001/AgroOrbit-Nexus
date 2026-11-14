import type { Metadata } from "next";
import "@fontsource/source-sans-3/latin-400.css";
import "@fontsource/source-sans-3/latin-600.css";
import "@fontsource/source-sans-3/latin-700.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
export const metadata: Metadata = { title: "AgroOrbit Nexus · From Space to Soil", description: "Clima NASA POWER y comparación explicable de rotaciones agrícolas. Prototipo con evidencia y limitaciones visibles." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body><a className="skip-link" href="#terreno">Saltar al análisis del terreno</a>{children}</body></html>; }
