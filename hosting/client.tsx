import { createRoot } from "react-dom/client";
import Workspace from "../src/components/workspace";
import "@fontsource/source-sans-3/latin-400.css";
import "@fontsource/source-sans-3/latin-600.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "../src/app/globals.css";

createRoot(document.getElementById("root")!).render(<><a className="skip-link" href="#terreno">Saltar al análisis del terreno</a><Workspace /></>);
