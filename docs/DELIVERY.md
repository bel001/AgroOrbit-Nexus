# Entrega verificable — 2026-11-14

Producto público: [dirección retirada]. [Demo inglesa de siete diapositivas]([dirección retirada]/submission/index.html) y [PDF]([dirección retirada]/submission/agroorbit-nexus-demo.pdf). Sin login; Next local también disponible en http://127.0.0.1:3000 mientras el proceso esté activo. No hay envío NASA comprobado.

## Resultado funcional y científico

Mapa mundial, buscador de localidades, coordenadas/GPS, registro agrícola, NASA POWER real, indicadores de historial, comparación regional y JSON/impresión. Recorrido visible de cinco pasos. Catálogo general separado de fichas INIA 619/404, contexto MIDAGRI y FAO: edición/página, alcance, procedencia y faltantes en pantalla e informe.

La demo de Virú tiene datos agrícolas ilustrativos. El frijol supone 135 días hasta cosecha; 98 es madurez fisiológica en su ficha candidata. No se identifica variedad realmente sembrada ni se valida la secuencia. Maíz tiene duración dependiente de estación/variedad; sorgo carece de evidencia local suficiente. Conteos de registros/familias/transiciones no son daños comprobados. Ninguna región habilita recomendaciones. No se calcula ahorro, ETc, rendimiento, rentabilidad o recuperación del suelo. HLS/NDVI no se priorizó.

## Pruebas y publicación

78 unitarias/API; lint, tipado, cuatro skills verificables, npm audit sin vulnerabilidades y ambos builds aprobados. Worker local: 22 e2e aprobadas, 2 omitidas. Next local: tres comprobaciones adicionales de escritorio aprobadas. **URL pública: seis comprobaciones de contenido/API y 22 e2e aprobadas, dos omitidas, cero fallos**, en Chromium escritorio, Pixel 7 y tablet emulados; NASA/geocoding/ESA reales, exportación y axe. No certifica WCAG, dispositivos físicos, carga masiva ni agronomía.

Sites versión 2 corresponde a `66f2ace530db3a045050786881d2c0677f408b7b`. La primera publicación detectó doble compresión; se corrigió y se verificó HTML/JS/PDF descomprimidos antes de repetir toda la suite pública. Estado nativo succeeded, audiencia public. Metadatos, fuente, hash del artefacto y resultados en `evidence/public-deployment.json` y `public-http.json`. Capturas e informes más recientes proceden de las pruebas públicas. DEPLOYMENT permite reproducir ambos destinos.

## Commits de esta consolidación

| Commit | Cambio |
|---|---|
| `f83a3f9` | Fuentes varietales oficiales e indicadores cuantificables de repetición |
| `41ff17c` | Destino público con lógica compartida, estado ESA corregido, CI con ambos builds y deck de siete slides |
| `4f25264` | Requisitos NASA corroborados/pendientes, revisión Impeccable y evidencia de pruebas |
| `66f2ace` | Corrección de doble compresión Cloudflare y comprobación de contenido público |

Los commits documentales posteriores registran publicación, evidencias y sincronización; no cambian el código desplegado. El historial anterior se conserva. `origin` permanece `https://github.com/bel001/AgroOrbit-Nexus.git`, rama main. No se fuerza el historial; el helper de Sites usa su destino por separado sin reemplazar origin. Credenciales temporales solo por stdin, sin persistencia.

Push seguro comprobado: `178b321` → `66f2ace` en main; `ls-remote` coincidió con HEAD. [Actions 43635932990](https://github.com/bel001/AgroOrbit-Nexus/actions/runs/43635932990) concluyó **success** para `66f2ace`: instalación, skills, tipado, lint, 78 tests y builds Next/Worker en Linux. Los commits siguientes registran evidencia y ajuste de impresión; su sincronización se comprueba de nuevo al terminar. Las pruebas con servicios reales se ejecutaron sobre servidores local/público, no en Actions.

La inspección final del PDF generado al imprimir el HTML público detectó una octava página vacía, aunque el PDF descargable siempre tuvo siete. Se eliminó el salto tras la última diapositiva y se ocultan elementos de hosting al imprimir. La prueba de navegador ahora exige exactamente siete páginas, además de siete secciones HTML; se verificó primero en Next local. La siguiente versión pública incorpora esa corrección sin alterar datos ni motor agrícola.

## Skills y revisión

Impeccable de proyecto (context/audit/polish/detect), tres skills Nexus y plugin oficial Sites. Investigación documental acotada delegada; integración/verificación/publicación desde el agente principal. Fuentes, versiones y licencias en SKILLS. MIT para código original, Apache-2.0 conservada para Impeccable; condiciones de datos/documentos/servicios separadas. No hay imágenes/videos generados. Codex declarado en AI_USAGE y deck; reglas deterministas sin LLM en ejecución.

## Intervención humana pendiente

1. Agrónomo y productor: confirmar parcela/historial, variedad, suelo/salinidad/drenaje, calendario y agua por periodo; validar la secuencia antes de usarla para decidir.
2. Equipo: abrir guía/condiciones y Resources de Field Shift; confirmar que POWER sea una fuente admitida para Global Awards (lista específica no recuperada), sede, miembros, elegibilidad, fechas y campos del formulario. Aclaraciones oficiales y sus límites en NASA_COMPLIANCE.
3. Revisar borrador inglés SUBMISSION, citas/licencias y declaración IA; pegar enlaces separados a producto y demo, enviar desde la cuenta registrada y guardar comprobante. No compartir credenciales; la publicación y GitHub no realizan el envío NASA.

No se garantiza servicio masivo: caché/límites por instancia y proveedores públicos sujetos a condiciones. Interfaz completa aún en español; sin importador JSON, persistencia de perfiles, Safari/iOS o ensayo con agricultores. No se afirman precisión, beneficios productivos ni aceptación al concurso.
