# Revisión visual y técnica

2026-11-14. Impeccable: referencias audit/polish y craft-floor aplicadas a una herramienta de operación; detector ejecutado con resultado []. No se completó el flujo de entrevista/torneo de conceptos ni hooks automáticos, según alcance autónomo solicitado.

| Dimensión | Evidencia | Limitación |
|---|---|---|
| Accesibilidad | Labels nativos, enlace de salto comprobado, foco visible, regiones desplazables con teclado, alternativa de tabla al gráfico/coordenadas al mapa; axe sin violaciones en pasada ejecutada | Sin lector de pantalla ni auditoría humana completa |
| Rendimiento | Mapa/gráfica por import dinámico, fuentes locales, sin animaciones costosas ni solicitudes NASA al cargar la portada | No se midió Lighthouse/Core Web Vitals; mapa sigue siendo dependencia grande |
| Sistema visual | Tokens bosque/marfil/grafito, jerarquía consistente, sin marcas NASA ni cifras decorativas | Algunos colores por serie/cultivo son constantes locales; no hay tema oscuro (fuera de alcance) |
| Adaptación | 1440/1280, tablet y móvil inspeccionados; formulario se apila; documento sin overflow | Tabla comparativa ancha con scroll intencional; no equivale a prueba táctil en dispositivo real |
| Integridad | Controles conectados, faltantes y caso ilustrativo visibles, fuentes e incertidumbre en cada resultado | Evaluación científica incompleta por catálogo local pendiente |

Hallazgos corregidos: foco de tabla móvil, trazo de gráfico incompleto durante animación de captura y error real de carga worker de MapLibre. El worker ahora se copia de la dependencia instalada al ejecutar npm ci/postinstall, con su BSD-3-Clause. Sin errores de consola en la comprobación posterior; se conservaron advertencias del controlador WebGL headless como límite de entorno.

No se asigna una puntuación como si fuera certificación: los controles citados tienen alcance explícito. Capturas en evidence/viewport-desktop.png, viewport-mobile.png, comparison-desktop.png y vistas completas. Se inspeccionaron después de las correcciones.
