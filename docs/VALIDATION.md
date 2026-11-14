# Validación ejecutada — 2026-11-14

## Consolidación científica y entrega

Resultado actual: **78 unitarias/API, 22 e2e aprobadas y 2 omitidas**. Las omitidas evitan repetir la fuente ESA en móvil/tablet; integración real comprobada en escritorio. Worker local en 8787: suite completa en 53,5 s. Next producción local en 3000: tres pruebas adicionales de escritorio aprobadas (NASA/comparación/exportación, fallo NASA simulado y presentación).

Casos nuevos protegen denominadores por registros, desconocidos/solapamientos, familia maíz/sorgo, aislamiento geográfico de fichas, cosecha de frijol 135 frente a madurez fisiológica 98 y demanda hídrica nula. Tipado, lint, skills, npm audit (0 vulnerabilidades), Next build y build:hosting correctos. CI añade build Worker.

La primera pasada e2e tuvo 21 aprobadas, 1 fallo y 2 omitidas: aviso ESA pendiente pese a PNG recibido. Se leyó el source map de MapLibre 6: el evento de tesela cargada no incluye `sourceDataType: content`. Corregido el listener, se repitió toda la suite hasta aprobar. No se aceptó un estado falso de carga.

Deck inglés probado con axe/navegación en tres tamaños; pypdf confirmó **7 páginas** y cierre en la última. Capturas `submission-*.png`, PDF e informes JSON en evidence. Detector Impeccable de componentes y portada renderizada: `[]` tras ajuste tipográfico menor. axe sin violaciones en estados probados, sin certificación WCAG. GPS emulado, no hardware.

Reproducir: lint, typecheck, test, verify:skills, audit, build, build:hosting de npm; con servidor Worker fijar `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8787` para test:e2e (en PowerShell asignar `$env:PLAYWRIGHT_BASE_URL`). Next usa 3000 por defecto. Pruebas públicas: DEPLOYMENT. Apartados siguientes corresponden a hitos anteriores y no indican los totales actuales.

Entorno inicial: Windows/PowerShell, Node 24.20.0, npm 11.19.0, Next 16.4.6. Zona America/Lima; timestamps JSON UTC. Servidor de producción `npm start` después de compilar.

## Ampliación global (misma fecha)

**Hito de búsqueda posterior:** 69 unitarias/API en cuatro archivos, 19 e2e aprobadas y 2 omitidas de 21 configuradas. Nuevas pruebas de localidad real, elección ambigua, coordenadas actualizadas sin iniciar clima, GPS emulado con permiso/precisión, permiso denegado y buscador caído conservando el punto. Consulta real «Virú, Perú» HTTP 200; GPS físico no probado. Primera pasada: 9 fallos de accesibilidad `link-in-text-block` por enlaces nuevos de atribución; se subrayaron y la suite completa pasó. `npm run lint`, `typecheck`, `build` y detector Impeccable [] ejecutados. Evidencias específicas en evidence/search y LOCATION_SEARCH.

62 pruebas unitarias/API aprobadas en tres archivos. Casos nuevos: seis fixtures NASA de países/hemisferios distintos, ausencia de recomendaciones globales, intentos de usar perfil peruano fuera de ámbito, periodos configurables, coordenadas polares y antimeridiano, revisión sin evidencia rechazada, catálogo ampliable y fallback de idioma. Tipado, lint y build ejecutados después de modificar el modelo.

Playwright: 10 aprobadas y 2 omitidas explícitamente de 12 configuradas. Flujo global con consultas reales de California/India/Australia y JSON en escritorio/móvil/tablet; demo regional y error controlado conservados. WorldCover real probada en escritorio; esas dos pruebas de red no se duplicaron en móvil/tablet. axe sin violaciones en los estados globales comprobados; no es certificación WCAG. Capturas/informes en evidence/global.

`npm run verify:global` consultó seis puntos reales de NASA; `node scripts/verify-worldcover.mjs` verificó GetCapabilities y PNG de WorldCover con fecha y CORS. Esto no valida calendarios agrícolas locales ni demuestra escalabilidad de carga masiva. Las filas siguientes son el registro del hito inicial de 40 pruebas, no el total actual.

| Comando / control | Resultado observado |
|---|---|
| `npm install`, instalación reproducible con package-lock | Instalación ejecutada; versiones fijadas. Worker se prepara en postinstall desde el paquete local |
| `npm run verify:nasa` | HTTP 200 real, API v2.10.3, 366 días de 2024. URL, unidades y fecha en power-request.json; respuesta original en power-viru-2024.json |
| `npm run verify:skills` | 4 SKILL.md con encabezados y nombres válidos. No se afirma un reinicio automático de Codex |
| `npm test` | 40 pruebas aprobadas, 2 archivos. Contratos, fechas, null/cero/fill, lluvia negativa, unidades, calendario completo, API caída/timeout, deduplicación, restricciones y trazabilidad |
| `npm run lint` | Sin errores ni advertencias tras correcciones |
| `npm run typecheck` | Sin errores |
| `npm run build` | Compilación producción correcta; página / y endpoint dinámico /api/analyze |
| `npm run test:e2e` | 6 pruebas aprobadas: dos flujos en escritorio, móvil y tablet; última pasada corregida sin pageerror ni console.error en el flujo real |
| axe vía e2e | Cero violaciones en etiquetas WCAG A/AA/2.1/2.2 seleccionadas, sobre los estados comprobados. No es certificación WCAG completa |
| Impeccable `detect --json src/components src/app/globals.css` | Resultado [] en impeccable-detect.json; no es prueba suficiente de calidad visual por sí sola |
| `node scripts/inspect-browser.mjs` | Clic mapa cambió latitud a -8.34621, primer foco en enlace de salto, JSON descargado con 540 días y tres estrategias, PDF de impresión generado; sin errores de consola tras corregir worker; advertencias GPU ReadPixels del entorno |
| `node scripts/dependency-inventory.mjs` | 19 dependencias directas con versiones/licencias registradas |
| `npm audit` | 0 vulnerabilidades tras override acotado de minimatch; no se utilizó audit fix --force |
| `node scripts/verify-sources.mjs` | Registra acceso HTTP: páginas Space Apps fallaron; NASA Brand Guidelines 200. Búsqueda web recuperó extractos oficiales por separado |

## Flujos y controles reales de navegador

Identidad y título correctos, pantalla no vacía, sin overlay de Next. Editar coordenadas actualiza punto; cargar caso devuelve datos etiquetados. Consultar produce clima NASA real para 2024-01-01–2025-06-23, tres estrategias incompletas e informe descargable. Se verifica tabla mensual alternativa. Error NASA se inyecta en la respuesta de prueba, claramente como simulación de fallo; la prueba API usa fetch mock con HTTP 503 para verificar degradación servidor. Editar después del cálculo produce aviso de informe pendiente de actualizar.

Chromium desktop 1280×720; Pixel 7 emulado (393×851 CSS); tablet 820×1180. Inspección adicional a 1440×1000 y 390×844, sin desbordamiento horizontal del documento; tablas con scroll interno y foco. Capturas completas desktop/mobile/tablet y capturas de primer viewport; se inspeccionaron visualmente. Móvil requiere desplazamiento lateral dentro de tabla comparativa, indicado en texto.

## Fallos encontrados y resueltos

La primera ejecución de tipado detectó import default de MapLibre no disponible; se sustituyó por namespace. Lint detectó export anónimo; corregido. Primera e2e: 2/6 aprobadas; tabla móvil sin foco y selector de alerta ambiguo. Se añadió tabIndex/región etiquetada y se acotó selector. Luego la inspección de consola encontró worker MapLibre fallido aunque mapa raster visible; se autoaloja el worker ESM instalado y se añaden aserciones console.error. Pasada posterior: 6/6 y consola sin errores de aplicación.

npm audit inicial: 7 avisos moderados en herramientas ESLint/minimatch. `npm audit fix` no bastó; override específico a minimatch 11.0.8, compatible con el Node usado, seguido de lint, tests y build. Resultado audit 0. npm informa que ESLint 9 está fuera de soporte; se conserva por compatibilidad con la configuración Next fijada y se debe revisar su actualización futura.

## Lo que no está probado

Aptitud agronómica local, ensayos de campo, rendimiento, ahorro, balance hídrico, variedades/calendarios peruanos, NDVI, despliegue externo, envío NASA, Safari/Firefox ni dispositivos físicos. La impresión se generó como PDF en Chromium; no se probó impresora física. CI está configurada y su ejecución remota se registra separadamente tras subir código.

CI remota verificada: [run 43625941228](https://github.com/bel001/AgroOrbit-Nexus/actions/runs/43625941228), success sobre 1a40ec5. Ejecutó npm ci, skills, tipado, lint, 40 pruebas y build en Linux; evidence/github-ci.json. No ejecutó e2e ni consultas NASA reales: esas comprobaciones fueron locales. Anotaciones de runtime de actions v4 y transición de imagen del runner fueron informativas.
