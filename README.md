# AgroOrbit Nexus — From Space to Soil

**Local revision 2026-11-15: these corrections have not been deployed.** The previously authorized public release linked below may differ. Current implementation, evidence and open scientific requirements: [IMPLEMENTATION_MATRIX](docs/IMPLEMENTATION_MATRIX.md), [STATUS](docs/STATUS.md), [VALIDATION](docs/VALIDATION.md).

**Compare crop rotations by water, soil and risk, before you plant.**

> Explore water-demand estimates and management indicators with NASA climate and farmer-provided records. No region currently has validated agronomic recommendations; Virú is an illustrative pilot.

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

1. **Field** — search a place, use your location or click the map. Optional polygon drawing or coordinate/GeoJSON entry provides approximate area, without cadastral claims. Climate still samples the reference point. The map displays the NASA POWER cell; its bounds were checked at the Virú demo point.
2. **Crops** — past campaigns, the sequence you plan (A) and up to two options of your own.
3. **Conditions** — daily NASA POWER climate (T2M, T2M_MIN, T2M_MAX, PRECTOTCORR; AG community, local solar time). A new global analysis starts with the latest 12 months NASA POWER has published (about 3 days of latency).
4. **Options** — relative exploration weights for water demand, management indicators and diversity. Formula and missing criteria are explicit; these are not measured soil health or pest control. Optional tariff and currency remain user inputs. Historical replay uses only the exact stored Virú point/calendar, without a causal ENSO claim.
5. **Evidence** — JSON 3.0 with inputs, climate, methods, weights, tariff/currency and any MODIS observations requested; printable report and agronomic review dossier. Browser drafts persist locally and can be deleted. Profile/report import validates inputs and requires recalculation.

The general catalogue now contains maize, dry bean, sorghum, potato, rice and wheat. No local suitability is implied; new crops without reviewed water coefficients return unknown demand. Optional MODIS/ORNL NDVI shows one nominal 250 m pixel with quality flags, observation/composite dates and provenance. It is surrounding context, not parcel diagnosis or a cross-season trend.

In Virú, irrigation comes from the **Chavimochic** system, which supplies the Chao, Virú and Moche valleys with water from the **Santa river** ([gob.pe · Chavimochic](https://www.gob.pe/institucion/chavimochic/institucional), [gob.pe · Santa river reserve](https://www.gob.pe/institucion/chavimochic/noticias/1444272-chavimochic-proyecta-su-futuro-hidrico-solicita-ampliar-la-reserva-del-rio-santa)). Model rainfall is shown with less weight and a coastal-desert warning, and is never used to rank options.

## Methods

- **Water demand:** ETc = Kc × ET0. Hargreaves (FAO-56 eq. 52) or optional Penman–Monteith (eq. 6) with NASA radiation, dew point, 2 m wind, pressure and grid elevation; generic Kc curves. Optional rainfall/efficiency assumptions are documented user scenarios. No validated irrigation schedule or savings claim.
- **Historical replay:** calendars are replayed with stored daily temperatures in selected windows starting in 1997, 2016 and 2023 against 27 reference seasons (starts 1991–2019, selected starts 1997 and 2016 excluded). The reference is not a classification of neutral ENSO seasons. Out-of-range ETc is descriptive, not a causal ENSO effect. No sourced crop-specific heat threshold was verified.
- **Management indicators:** legumes, families, repetitions and days without recorded crops describe the plan; they do not measure soil health, fixed nitrogen, bare soil or pest control.
- **Offline demo:** the exact NASA POWER responses for the Virú demo (2024-01-01 → 2025-06-23) and the 1991–2023 history are stored unmodified in `src/data/` (refresh with `scripts/snapshot-viru-*.mjs`). The live API is tried first; the stored response is labelled when used.

Details: [METHODOLOGY](docs/METHODOLOGY.md) · [STATUS](docs/STATUS.md) · [evidence](docs/evidence/).

## Limits (stated in the app)

Illustrative pilot history; generic Kc; no field validation, yields, profits or savings. User scenarios can be compared descriptively worldwide; automatic templates remain limited to the illustrative profile. MODIS mixes surrounding land cover, and its REST response does not declare a collection version (preserved as unknown). HLS/NDVI by parcel, phenological comparison and reviewed regional evaluators remain pending. See [AGRONOMIC_REVIEW](docs/AGRONOMIC_REVIEW.md).

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
npx playwright install chromium firefox webkit
npm run test:e2e:ci
npm run test:e2e
```

Local browser tests need `npm start`; CI starts it automatically. `test:e2e:ci` uses controlled upstream fixtures across Chromium desktop/mobile/tablet, Firefox and WebKit. Full e2e also accesses live services. Generated artifacts go to ignored `test-results/`. `npm run verify:extensions` records real POWER/ORNL access separately. Executed totals: [VALIDATION](docs/VALIDATION.md). WebKit is not a physical Safari/iOS test.

## Tech

Next.js 16, React 19, TypeScript, Tailwind 4, MapLibre 6, Recharts 3, Zod 4, Vitest, Playwright, axe. Design system: [DESIGN.md](DESIGN.md).

## Use of AI

AI coding assistants helped with research, programming, testing and documentation; the team reviewed the results. The application uses explicit, documented rules: no trained model and no AI service at runtime. See [AI_USAGE](docs/AI_USAGE.md).

## License and credits

Original code under MIT. Climate data: NASA POWER. Map: © OpenStreetMap contributors. Optional land cover: ESA WorldCover 2021 (CC BY 4.0). Independent prototype, not affiliated with or endorsed by NASA. [Third-party notices](docs/THIRD_PARTY_NOTICES.md).

---

**Resumen en español.** Comparación descriptiva de rotaciones e indicadores de manejo con clima NASA, borradores locales, polígonos, catálogo de seis especies, ETo Hargreaves/Penman–Monteith y NDVI MODIS contextual. Interfaz ES/EN y expediente para revisión profesional. No hay recomendaciones regionales validadas. Virú sigue siendo ilustrativo; esta revisión no se ha desplegado.
