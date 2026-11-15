# Project page text (NASA Space Apps 2026) — draft in English

Paste into the Space Apps project page. Replace the two pending links after deployment. Confirm the exact field names in the portal.

## Project name
AgroOrbit Nexus — From Space to Soil

## Challenge
Field Shift: Adapting Farms with NASA Data

## High-level summary
In Virú, Peru, water arrives by canal and costs money. AgroOrbit Nexus shows how much water each crop rotation needs, what it does for the soil, and how it would have handled El Niño, before you plant. It is built for agricultural extension agents who review rotation options with farmers: it turns NASA POWER daily climate into FAO-56 crop water demand in m³/ha, scores each option's soil health with FAO-sourced indicators, re-orders options live by the farmer's own priorities, and replays every rotation on past El Niño seasons. It compares and explains; it does not recommend.

## Links
- Project demo (slides / video): *pending public link*
- Final project (working app): *pending public link* — local: http://127.0.0.1:3000/?lang=en
- Source code (MIT): https://github.com/bel001/AgroOrbit-Nexus

## Detailed description

**Problem.** In the irrigated desert valleys of coastal Peru, a rotation decision is a water decision: in Virú, irrigation water comes from the Chavimochic system, which draws it from the Santa river. Rain is almost irrelevant there, and repeated maize leaves one crop family in the field. Extension agents need a fast, honest way to compare options with a farmer.

**What it does.** Pick a field anywhere (search, GPS or map), record past and planned campaigns, and AgroOrbit:
1. Downloads daily NASA POWER climate for the point and shows the real NASA cell (~56 × 69 km at Virú): *“NASA data represents this whole area, not just your field.”*
2. Computes each rotation's crop water demand (ETc = Kc × Hargreaves ET0, FAO-56) in **m³/ha**, with an optional user tariff to see soles (never a default tariff).
3. Shows a soil-health card per option: legume (nitrogen fixation), crop families, back-to-back repeats and uncropped days, each with why it matters and an FAO source.
4. Lets the farmer's priorities (water, soil health, diversity / pest-cycle break) re-order the options live, with the formula on screen and a numeric “why it ranks here” line.
5. Replays each rotation on the 1997–98, 2016–17 and 2023 El Niño seasons against 27 normal seasons (1991–2020) and reports an anomaly only when the data show one.
6. Writes a data-generated bottom line and exports everything (inputs, daily data, rules, weights, limits) as JSON.

**Virú demo results (illustrative crop history, real NASA data).** Water needed: A maize→maize→maize 13,120 m³/ha; B maize→bean→maize 12,720 m³/ha; C maize→sorghum→bean 11,730 m³/ha. Bottom line: *C needs ~1,390 m³/ha less water than A (139 mm), uses 2 crop families and breaks the maize cycle.* In the 1997–98 El Niño replay every option would have needed 359–411 m³/ha more, above every baseline season; 2016–17 and 2023 show no anomaly in these data.

**Why it is different.** It speaks the extension agent's language (m³ of canal water per hectare, not rainfall), it is explicit about scale (the NASA grid cell is drawn on the map), it stress-tests options against real past El Niño seasons, and it never invents numbers: every figure comes from NASA POWER data and documented FAO-56 methods, every claim has a source, and missing data stays missing.

**Global.** Climate works for any point on Earth; agronomic comparisons are enabled only where a regional profile exists. English and Spanish interface.

**Limits.** Illustrative crop history in the pilot; generic FAO-56 crop coefficients; Hargreaves ET0; no field measurements, yields, profits or savings; no regional agronomist validation yet. Label shown in the app: *Exploration, not a recommendation · No regional agronomist validation yet.*

**Tools.** Next.js, React, TypeScript, MapLibre, Recharts, Zod, Vitest, Playwright, axe. 118 unit/API tests and 31 browser tests (desktop, mobile, tablet) with accessibility checks.

## Use of NASA data
NASA POWER Daily API (point; AG community; local solar time): T2M, T2M_MIN, T2M_MAX (°C) and PRECTOTCORR (mm/day), for the user's point and, for the Virú demo, 1991-01-01 → 2025-06-23. Used for FAO-56 ET0/ETc water demand, degree-days, the 1991–2020 baseline and the El Niño replay. The MERRA-2 cell size (0.5° × 0.625°) was verified against the API and is drawn on the map. Source: https://power.larc.nasa.gov/ · Not affiliated with or endorsed by NASA. **Before submitting, confirm that NASA POWER is listed in the Field Shift resources.**

## Other data and references
- FAO Irrigation and Drainage Paper 56 (crop evapotranspiration): https://www.fao.org/4/X0490E/X0490E00.htm
- FAO conservation agriculture: species diversification — https://www.fao.org/conservation-agriculture/in-practice/species-diversification/en/ ; soil organic cover — https://www.fao.org/conservation-agriculture/in-practice/soil-organic-cover/en/
- Proyecto Especial Chavimochic (gob.pe): https://www.gob.pe/institucion/chavimochic/institucional
- INIA and MIDAGRI documents for the Virú pilot (listed in the app and in docs/research/VIRU_SOURCE_NOTES.md)
- McMaster & Wilhelm (1997), growing degree-days: https://doi.org/10.1016/S0168-1923(97)00027-0
- OpenStreetMap (map tiles), ESA WorldCover 2021 (optional land cover, CC BY 4.0), Open-Meteo/GeoNames (place search)

## Use of artificial intelligence (AI)
AI coding assistants helped with research, programming, testing and documentation; the team reviewed the results. No AI-generated images, video or audio are used in the product or the slides. The application itself uses explicit, documented rules and FAO-56 formulas: there is no trained model and no AI service at runtime.

## Tags
agriculture · crop rotation · irrigation · water · soil health · El Niño · NASA POWER · FAO-56 · Peru · extension agents
