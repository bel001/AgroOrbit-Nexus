# Entrega verificable — 2026-11-14

**Solicitud posterior del usuario (2026-11-15):** sincronizar el proyecto revisado con GitHub y excluir la carpeta Claude. `.gitignore` excluye `.claude/` y `claude/`; sus contenidos locales no se borran ni se incorporan al commit. La autorización corresponde al código en GitHub; no se ejecuta un despliegue web adicional. Las notas siguientes conservan el contexto de las revisiones anteriores.

**Revisión local 2026-11-15:** ver IMPLEMENTATION_MATRIX, STATUS y VALIDATION. Estas correcciones no se han desplegado. La publicación Vercel autorizada anterior puede diferir. No se efectuó nuevo commit, push, publicación ni envío NASA.

Respuestas nuevas POWER/MODIS reales en `evidence/revision-2026-11-15/`; pruebas con fallos simulados separadas. Historial agrícola ilustrativo, sin casos de campo validados. Las evidencias preexistentes se conservan; artefactos automáticos nuevos en `test-results/`.

## Antecedentes conservados (no describen el estado de esta revisión)

**Actualización 2026-11-15:** publicada en Vercel por instrucción del usuario: https://agroorbit-nexus.vercel.app (demo y PDF bajo `/submission/`). El resto de este documento describe la entrega del 2026-11-14.

**Entrega 2026-11-14: solo localhost**, por instrucción expresa del usuario. Aplicación en http://127.0.0.1:3000 mientras el proceso esté activo; demo y PDF bajo `/submission/`. Alojamiento anterior restringido: HTTP 401 sin sesión comprobado. Se retiraron las referencias a su dirección de los archivos vigentes; no se volverá a publicar sin nueva instrucción. No hay envío NASA comprobado.

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

La impresión del HTML alojado produjo una página vacía adicional; el PDF descargable siempre tuvo siete. Se corrigió el salto final y se añadió una aserción de siete páginas, aprobada en Next local. Una publicación posterior incorporó esa corrección y después se retiró el acceso público a petición del usuario. No se afirma haber repetido la suite pública sobre esa revisión, pues se suspendió al retirar el alojamiento.

Límite de la limpieza: los archivos vigentes ya no contienen la dirección retirada. Los commits anteriores publicados y esta conversación conservan historial; no se han reescrito ni se usó push forzado. El proveedor mantiene su registro privado, que no puede eliminarse con las herramientas disponibles. Esto no equivale a un borrado completo de registros históricos.

## Skills y revisión

Impeccable de proyecto (context/audit/polish/detect), tres skills Nexus y plugin oficial Sites. Investigación documental acotada delegada; integración/verificación/publicación desde el agente principal. Fuentes, versiones y licencias en SKILLS. MIT para código original, Apache-2.0 conservada para Impeccable; condiciones de datos/documentos/servicios separadas. No hay imágenes/videos generados. Codex declarado en AI_USAGE y deck; reglas deterministas sin LLM en ejecución.

## Intervención humana pendiente

1. Agrónomo y productor: confirmar parcela/historial, variedad, suelo/salinidad/drenaje, calendario y agua por periodo; validar la secuencia antes de usarla para decidir.
2. Equipo: abrir guía/condiciones y Resources de Field Shift; confirmar que POWER sea una fuente admitida para Global Awards (lista específica no recuperada), sede, miembros, elegibilidad, fechas y campos del formulario. Aclaraciones oficiales y sus límites en NASA_COMPLIANCE.
3. Revisar borrador inglés SUBMISSION, citas/licencias y declaración IA; pegar enlaces separados a producto y demo, enviar desde la cuenta registrada y guardar comprobante. No compartir credenciales; la publicación y GitHub no realizan el envío NASA.

No se garantiza servicio masivo: caché/límites por instancia y proveedores públicos sujetos a condiciones. Interfaz completa aún en español; sin importador JSON, persistencia de perfiles, Safari/iOS o ensayo con agricultores. No se afirman precisión, beneficios productivos ni aceptación al concurso.
