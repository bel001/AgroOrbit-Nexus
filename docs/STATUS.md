# Estado verificado — AgroOrbit Nexus

2026-11-14, America/Lima. Este estado sustituye los totales de hitos anteriores conservados en Git. No hay envío ni comprobante de recepción NASA.

## Funciones terminadas en software

- Mapa mundial, coordenadas, búsqueda real de localidad/código postal y GPS bajo permiso. Punto de referencia, sin delimitación predial.
- Perfil con campañas, fechas, procedencia, suelo/agua opcionales y exclusiones. Inicio sin coordenadas ni campañas; demo Virú explícitamente ilustrativa.
- NASA POWER real, cuatro variables AG/LST, periodos históricos configurables, unidades, grilla, versión, faltantes, caché acotada, timeout y error sin sustitución ficticia.
- Cinco pasos visibles: terreno → cultivos → condiciones → alternativas → evidencias. Gráficas con alternativa tabular; edición pendiente de recalcular visible.
- Historial: especies/familias, racha, dominancia por registros, transiciones de especie/familia e intervalos entre campañas. Riesgos potenciales separados de daño comprobado. Desconocidos/solapamientos impiden indicadores interpretables.
- Comparación descriptiva de A/B/C únicamente en demo aplicable; fuera de ella no se extrapolan plantillas. Ninguna región habilita recomendaciones. Fechas, exclusiones y ausencia declarada de toda agua se comprueban; aptitud regional permanece incompleta.
- Fichas INIA 619/404, MIDAGRI y FAO con edición/página, alcance y faltantes en UI/JSON. Frijol de demo: supuesto de 135 días a cosecha, sin confundir madurez fisiológica. Investigación: `research/VIRU_SOURCE_NOTES.md`.
- JSON 2.1 trazable e impresión. Deck inglés de siete diapositivas y PDF verificado de siete páginas. Capa ESA WorldCover 2021 opcional; estado de teselas corregido y probado sin depender del mapa base.

## Actualización 2026-11-14 (noche): usabilidad del flujo con terreno propio

Revisión manual del recorrido como usuario nuevo (escritorio y móvil) y correcciones:

- Errores de validación visibles (se centran y reciben foco) y redactados en lenguaje claro, sin nombres internos; aviso específico si falta la ubicación (`noValidate` sustituye la burbuja genérica del navegador). Los avisos se retiran al corregir un dato.
- Mover el punto ya no devuelve el análisis a «Solo clima»; solo anula la plantilla regional.
- Campañas nuevas: empiezan tras la anterior, duran el mínimo del rango FAO del cultivo y tienen procedencia «declarado» (antes: 1 día y «desconocido»).
- Alternativas propias (hasta 2) para comparar con A fuera de Virú; validadas igual que A, marcadas como escenarios del usuario y no como recomendaciones. Informe JSON con `alternatives` (por defecto `[]`, compatible con perfiles anteriores).
- Marcador del mapa: la animación movía el marcador a la esquina; corregido.
- Textos: «Lo que ya sembraste», «Lo que planeas sembrar (A)» y ayuda sobre «Procedencia».
- Pruebas: 94 unitarias (6 nuevas) y 25 e2e aprobadas (nueva `e2e/user-flow.spec.ts` en tres dispositivos), 2 omitidas deliberadamente; axe sin violaciones.
- Pendiente: aviso si el punto cae en el mar, persistencia del formulario e importación del JSON.

## Actualización 2026-11-14 (tarde): demanda hídrica FAO-56

- Nuevo `src/lib/water.ts`: ETo Hargreaves (FAO-56 ec. 52), Kc por etapas (tablas 11-12), ETc, lluvia de grilla y déficit bruto por campaña; grados-día base 10 °C para maíz y sorgo. Detalle y supuestos en METHODOLOGY.
- La tabla comparativa muestra ETc, lluvia, déficit y grados-día; el JSON 2.2 incluye `water` por estrategia con método y supuestos.
- Pruebas: 88 unitarias/API en siete archivos aprobadas (10 nuevas, incluido el ejemplo 8 de FAO-56), tipado, lint y build de Next.js correctos. Comprobado en localhost con NASA POWER real para el caso Virú (A 1312 mm, B 1272 mm, C 1173 mm de ETc estimada). Playwright contra localhost: 22 e2e aprobadas y 2 omitidas deliberadamente (capa ESA en móvil/tablet), 53 s.
- Pendiente: Penman-Monteith con radiación, humedad y viento; lluvia efectiva; validación agronómica.
- Se retiraron los identificadores del alojamiento anterior y `.openai/hosting.json` del repositorio.

## Pruebas ejecutadas en esta consolidación

78 unitarias/API en seis archivos aprobadas; tipado, lint, cuatro skills descubribles, auditoría npm (0 vulnerabilidades), build Next.js y build Worker correctos. Worker local: **22 e2e aprobadas, 2 omitidas deliberadamente**, 53,5 s; Chromium escritorio, Pixel 7 y tablet emulados, NASA/geocoding reales. Pasada adicional Next.js: tres pruebas de escritorio aprobadas (flujo real, fallo simulado, presentación). axe sin violaciones en estados comprobados; detector Impeccable de componentes y portada renderizada `[]`. No constituye certificación WCAG ni validación agronómica. Detalle: VALIDATION/UI_AUDIT.

La primera pasada completa tuvo 21 aprobadas, 1 fallo y 2 omitidas: estado ESA atascado aunque llegaba PNG. Se corrigió usando el evento de tesela cargada de MapLibre y se repitió la suite completa hasta el resultado anterior. No se ocultó el fallo ni se sustituyó el servicio por una imagen ficticia.

## Publicación y sincronización

**Solo localhost por instrucción del usuario.** Servidor en http://127.0.0.1:3000. Se restringió el alojamiento anterior y se comprobó HTTP 401 sin sesión; no existe un enlace público aprobado para esta entrega. Las pruebas públicas históricas de la versión anterior tuvieron seis comprobaciones de contenido/API y 22 e2e aprobadas, dos omitidas y cero fallos. Se conservan sus resultados con la dirección retirada y estado actual explícito. La corrección posterior de impresión se probó en Next local. No se confunden esos antecedentes con disponibilidad pública actual. Sin reescribir commits anteriores ni prometer borrado del historial. Sincronización/CI: DELIVERY.

## Límites científicos y operativos

No hay historia ni análisis de campo validados. Las fichas varietales no certifican parcela o rotación; sorgo carece de evidencia local suficiente. Faltan calendario revisado, identidad varietal, suelo/salinidad/drenaje, ETo/Kc y suministro de agua por periodo. No se calcula ETc, ahorro, rendimiento, salud de suelo, fijación de nitrógeno, rentabilidad ni ranking. Prioridad solo orienta revisión.

Clima mundial probado con seis consultas internacionales previas y nuevos recorridos en ambos hemisferios; no equivale a carga masiva ni aptitud de esos países. Caché y límites son por instancia, sin protección global distribuida; servicios públicos de mapas/geocoding sujetos a sus condiciones. Sin cuentas/base de datos; recargar pierde el formulario y no hay importador JSON. Interfaz española, sin traducción completa. Pruebas Chromium emuladas, sin hardware GPS, Safari/iOS, lector de pantalla ni evaluación de agricultores. HLS/NDVI y funciones avanzadas siguen pendientes.

Reglamento/guía y Resources específicos no completamente recuperados: NASA_COMPLIANCE distingue lo confirmado de lo pendiente. Equipo debe revisar elegibilidad, fuente NASA admitida, sede/miembros, condiciones y formulario, y realizar el envío.
