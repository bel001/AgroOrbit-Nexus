# AgroOrbit Nexus — From Space to Soil

**Compare crop rotations by water, soil and risk, before you plant.**

> In Virú, water arrives by canal and costs money. AgroOrbit shows how much water each rotation needs, what it does for the soil, and how it would have handled El Niño, before you plant.

**Built for agricultural extension agents who review rotation options with farmers.** That is why the app compares and explains instead of recommending: every result carries the label *“Exploration, not a recommendation · No regional agronomist validation yet”*.

NASA Space Apps Challenge 2026 · **Field Shift: Adapting Farms with NASA Data**.

- Working app: https://agroorbit-nexus.vercel.app/?lang=en (Spanish: https://agroorbit-nexus.vercel.app)
- Seven-slide deck (English): https://agroorbit-nexus.vercel.app/submission/index.html · [PDF](https://agroorbit-nexus.vercel.app/submission/agroorbit-nexus-demo.pdf)
- Local: http://127.0.0.1:3000 (see Run below)

## What it shows (Virú demo, real NASA POWER data)

| | A · maize → maize → maize | B · maize → bean → maize | C · maize → sorghum → bean |
|---|---|---|---|
| Water needed (FAO-56 ETc) | **13,120 m³/ha** | **12,720 m³/ha** | **11,730 m³/ha** |
| Legume / crop families | No / 1 | Yes / 2 | Yes / 2 |
| Same crop in a row | 3× maize | Never | Never |
| Uncropped days | 90 | 105 | 130 |
| El Niño 1997–98 (extra water vs 1991–2020) | +411 m³/ha, above every baseline season | +396 m³/ha, above every baseline season | +359 m³/ha, above every baseline season |

**Bottom line (generated from the data):** *C needs ~1,390 m³/ha less water than A (139 mm), uses 2 crop families and breaks the maize cycle.*
For 2016–17 and 2023 the replay shows **no anomaly in these data**, and the app says so.

## How it works

1. **Field** — search a place, use your location or click the map (opens on Peru). The map draws the real **NASA POWER cell** (0.5° × 0.625°, ~56 × 69 km at Virú, bounds verified against the API): *“NASA data represents this whole area, not just your field.”*
2. **Crops** — past campaigns, the sequence you plan (A) and up to two options of your own.
3. **Conditions** — daily NASA POWER climate (T2M, T2M_MIN, T2M_MAX, PRECTOTCORR; AG community, local solar time). A new global analysis starts with the latest 12 months NASA POWER has published (about 3 days of latency).
4. **Options** — a data-generated *bottom line*; **farmer priorities** (three 0–100 sliders: water, soil health, diversity / pest-cycle break) that re-order the options live with the formula on screen (`score = Σ wᵢ·sᵢ / Σ wᵢ`, criteria normalised 0–1 across the options shown) and a numeric *“Why it ranks here”*; water in **m³/ha** (1 mm = 10 m³/ha) with an optional user tariff (S/ per m³, never a default); a **soil-health card** per option with FAO sources; and the **El Niño stress test**.
5. **Evidence** — JSON export with inputs, daily data, rules, weights and limitations; printable report.

In Virú, irrigation comes from the **Chavimochic** system, which supplies the Chao, Virú and Moche valleys with water from the **Santa river** ([gob.pe · Chavimochic](https://www.gob.pe/institucion/chavimochic/institucional), [gob.pe · Santa river reserve](https://www.gob.pe/institucion/chavimochic/noticias/1444272-chavimochic-proyecta-su-futuro-hidrico-solicita-ampliar-la-reserva-del-rio-santa)). Model rainfall is shown with less weight and a coastal-desert warning, and is never used to rank options.

## Methods

- **Water demand:** ETc = Kc × ET0. ET0 by Hargreaves (FAO-56 eq. 52) from NASA POWER Tmin/Tmax and extraterrestrial radiation (eq. 21); generic Kc curves (FAO-56 tables 11–12). Demand of a healthy crop, not a validated irrigation requirement.
- **El Niño stress test:** each calendar is replayed with real daily NASA POWER temperatures starting in 1997, 2016 and 2023 and compared with 27 baseline seasons (starts 1991–2019, event years excluded). An anomaly is reported only when the season falls outside the baseline min–max. Heat days are **not computed**: no sourced crop-specific threshold was verified.
- **Soil health:** legume present, crop families, back-to-back repeats, uncropped days — read from the plan, with [FAO species diversification](https://www.fao.org/conservation-agriculture/in-practice/species-diversification/en/) and [FAO soil organic cover](https://www.fao.org/conservation-agriculture/in-practice/soil-organic-cover/en/).
- **Offline demo:** the exact NASA POWER responses for the Virú demo (2024-01-01 → 2025-06-23) and the 1991–2023 history are stored unmodified in `src/data/` (refresh with `scripts/snapshot-viru-*.mjs`). The live API is tried first; the stored response is labelled when used.

Details: [METHODOLOGY](docs/METHODOLOGY.md) · [STATUS](docs/STATUS.md) · [evidence](docs/evidence/).

## Limits (stated in the app)

Illustrative crop history for the pilot; generic FAO-56 Kc; Hargreaves ET0 (tends to overestimate under high humidity); no field measurements, yields, profits or savings; no regional agronomist validation yet. The Virú demo computes FAO-56 water demand with the 2024–25 NASA POWER climate only (2024-01-01 → 2025-06-23); a single year can differ from normal climate. Climate works worldwide; agronomic comparisons only where a regional profile exists.

## Run

Requirements: Node.js 24 and npm. No keys.

```powershell
npm ci
npm run build
npm start
```

Open http://127.0.0.1:3000 (add `?lang=en` for English). Development: `npm run dev`.

## Verify

```powershell
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
```

`npm run test:e2e` needs `npm start` running. Current results: 122 unit/API tests and 31 browser tests (desktop, Pixel 7, tablet; 2 skipped by design) with axe accessibility checks.

## Tech

Next.js 16, React 19, TypeScript, Tailwind 4, MapLibre 6, Recharts 3, Zod 4, Vitest, Playwright, axe. Design system: [DESIGN.md](DESIGN.md).

## Use of AI

AI coding assistants helped with research, programming, testing and documentation; the team reviewed the results. The application uses explicit, documented rules: no trained model and no AI service at runtime. See [AI_USAGE](docs/AI_USAGE.md).

## License and credits

Original code under MIT. Climate data: NASA POWER. Map: © OpenStreetMap contributors. Optional land cover: ESA WorldCover 2021 (CC BY 4.0). Independent prototype, not affiliated with or endorsed by NASA. [Third-party notices](docs/THIRD_PARTY_NOTICES.md).

---

**Resumen en español.** AgroOrbit Nexus compara rotaciones de cultivos por agua (m³/ha, FAO-56), salud del suelo y riesgo (El Niño) con datos diarios de NASA POWER. Hecho para extensionistas agrarios que revisan opciones con los agricultores: compara y explica, no recomienda. La interfaz está en español e inglés (botón ES/EN o `?lang=en`). Virú es el primer piloto, con historial ilustrativo y sin validación agronómica regional todavía.
