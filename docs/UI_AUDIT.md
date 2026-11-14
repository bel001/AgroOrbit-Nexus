# Revisión visual y técnica

## Consolidación de entrega — 2026-11-14

Se preservó el sistema visual y se aclararon cinco pasos; Cultivos abre su panel antes de navegar. Historial con denominadores y distinción riesgo/daño; fichas regionales con alcance y faltantes. Capturas actuales inspeccionadas; tablas mantienen desplazamiento interno/foco. Sin entrevista a agricultores ni prueba táctil física.

Impeccable: context, audit/polish, detector de componentes y portada renderizada en 8787; resultados finales `[]` (evidence/scientific-impeccable-*). Se corrigió un consejo tipográfico con `text-wrap:pretty`. Las pruebas detectaron el aviso ESA atascado y verificaron su corrección. axe sin violaciones en estados global/demo/presentación, sin certificación WCAG.

Evaluación interna acotada según audit: accesibilidad 3/4 (sin lector de pantalla humano); rendimiento 2/4 (mapa pesado, sin métricas de campo); tema 3/4 (tokens, sin modo oscuro); adaptación 3/4 (tres tamaños emulados); integridad 4/4 dentro del alcance inspeccionado. Total 15/20 como juicio de revisión, no medición científica ni certificación.

Bundle público medido, bytes sin comprimir / gzip aproximado: app.js 254 705 / 79 252; mapa diferido 1 084 831 / 297 970; gráfica diferida 424 520 / 122 807; worker MapLibre 519 547 / 147 837; chunk compartido 463 520 / 96 246. No son tiempos de carga ni Core Web Vitals. No se ejecutó Lighthouse, ensayo de carga o prueba en conexión rural; no se promete ese rendimiento. Sin animaciones ni imágenes decorativas nuevas.

## Hito inicial

Impeccable audit/polish y craft-floor aplicados; detector []. No se completó entrevista/torneo de conceptos ni hooks automáticos, por el alcance autónomo solicitado.

| Dimensión | Evidencia | Limitación |
|---|---|---|
| Accesibilidad | Labels nativos, enlace de salto comprobado, foco visible, regiones desplazables con teclado, alternativa de tabla al gráfico/coordenadas al mapa; axe sin violaciones en pasada ejecutada | Sin lector de pantalla ni auditoría humana completa |
| Rendimiento | Mapa/gráfica por import dinámico, fuentes locales, sin animaciones costosas ni solicitudes NASA al cargar la portada | No se midió Lighthouse/Core Web Vitals; mapa sigue siendo dependencia grande |
| Sistema visual | Tokens bosque/marfil/grafito, jerarquía consistente, sin marcas NASA ni cifras decorativas | Algunos colores por serie/cultivo son constantes locales; no hay tema oscuro (fuera de alcance) |
| Adaptación | 1440/1280, tablet y móvil inspeccionados; formulario se apila; documento sin overflow | Tabla comparativa ancha con scroll intencional; no equivale a prueba táctil en dispositivo real |
| Integridad | Controles conectados, faltantes y caso ilustrativo visibles, fuentes e incertidumbre en cada resultado | Evaluación científica incompleta por catálogo local pendiente |

Hallazgos corregidos: foco de tabla móvil, trazo de gráfico incompleto durante animación de captura y error real de carga worker de MapLibre. El worker ahora se copia de la dependencia instalada al ejecutar npm ci/postinstall, con su BSD-3-Clause. Sin errores de consola en la comprobación posterior; se conservaron advertencias del controlador WebGL headless como límite de entorno.

No se asigna una puntuación como si fuera certificación: los controles citados tienen alcance explícito. Capturas en evidence/viewport-desktop.png, viewport-mobile.png, comparison-desktop.png y vistas completas. Se inspeccionaron después de las correcciones.
