# Borrador para la ficha de entrega

2026-11-14. Inglés para revisión humana y adaptación al formulario vigente; no es una ficha enviada. Equipo, miembros, sede y datos personales se completan en el portal. Enlaces definitivos: DEPLOYMENT.

**Title:** AgroOrbit Nexus — From Space to Soil

**Challenge:** Field Shift: Adapting Farms with NASA Data

**Short summary:** AgroOrbit Nexus combines real NASA POWER historical climate with farmer-provided cropping records to make crop-rotation scenarios inspectable. It quantifies repetition and botanical diversity, checks basic constraints and explains missing evidence. Climate access is worldwide; agricultural assessment is limited by regional evidence. Virú, Peru, is an illustrative documentary pilot, without field validation or certified recommendations.

**Problem:** A repeated crop sequence is observable in a supplied history, but it does not by itself prove soil degradation or pest damage. Farmers and advisers need to connect that history with climate, local resources and crop evidence before comparing alternatives. Our tool distinguishes calculated descriptors, bibliographic context and evidence still needed.

**How it works:** Users select a point through the world map, locality search, coordinates or device location. They record campaign dates and provenance, soil and water where known. The server queries NASA POWER Daily point temperature and precipitation. The illustrative Virú case compares three sequences in a common 540-day horizon. Results show timeline and exclusion checks, botanical families, repetition and unrecorded intervals. Unknown local suitability remains incomplete. Users inspect references, download the full JSON or print the report.

**NASA data:** NASA POWER Daily point API, AG community, local solar time; T2M/T2M_MIN/T2M_MAX (°C), PRECTOTCORR (mm/day). Reports retain location/dates, source query, version, retrieval time, daily data and missingness. Gridded data are climate context, not parcel sensor measurements. No fabricated failure fallback exists. **Before claiming Global Awards eligibility, confirm POWER is listed in Field Shift Resources; this listing remains unverified.**

**Local evidence:** INIA cultivar leaflets, MIDAGRI planting history and FAO references are linked with edition/page and scope. No farm measurements or local sequence trials were supplied. The illustrative bean duration uses harvest maturity, not physiological maturity. General water ranges do not establish local demand or irrigation savings.

**Benefits and limits:** The implemented benefit is transparent comparison and traceability, not proven yield, water saving or soil recovery. No trained prediction model, causal NDVI diagnosis or economic forecast is included. Regional agronomic review, cultivar identification and local soil/water measurements are required before recommendations.

**AI disclosure:** Codex assisted research, code, tests, visual review and documentation using team instructions, repository documents, official sources and public NASA weather data. The product runs deterministic checks and descriptive calculations, without a runtime LLM. No generated images, videos or synthetic satellite observations were used. Automated checks and assistant review do not replace human agronomic validation.

**Open source and credits:** Original code MIT. NASA POWER climate; OpenStreetMap map; Open-Meteo/GeoNames locality search; optional ESA WorldCover 2021 via Terrascope; INIA, MIDAGRI, FAO and Kew references. Dependency and skill attributions: THIRD_PARTY_NOTICES, SKILLS, `evidence/dependencies.json`. External publications retain their rights.

**Demonstration:** Seven-slide English deck at `/submission/index.html`. Reproduce the live case with “Cargar caso ilustrativo” → “Consultar clima y comparar”; inspect incomplete states and official evidence, then download JSON. Repository evidence records executed tests; STATUS gives current totals and verification limits.

## Antes de copiar

Revisar reglas y sede (NASA_COMPLIANCE), pegar enlaces públicos separados para producto/demo/código, confirmar miembros y fechas, citar recursos, revisar condiciones geocoding/cartografía y declaración IA, enviar desde la cuenta del equipo. Guardar comprobante; GitHub no acredita envío.
