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

## Pruebas ejecutadas en esta consolidación

78 unitarias/API en seis archivos aprobadas; tipado, lint, cuatro skills descubribles, auditoría npm (0 vulnerabilidades), build Next.js y build Worker correctos. Worker local: **22 e2e aprobadas, 2 omitidas deliberadamente**, 53,5 s; Chromium escritorio, Pixel 7 y tablet emulados, NASA/geocoding reales. Pasada adicional Next.js: tres pruebas de escritorio aprobadas (flujo real, fallo simulado, presentación). axe sin violaciones en estados comprobados; detector Impeccable de componentes y portada renderizada `[]`. No constituye certificación WCAG ni validación agronómica. Detalle: VALIDATION/UI_AUDIT.

La primera pasada completa tuvo 21 aprobadas, 1 fallo y 2 omitidas: estado ESA atascado aunque llegaba PNG. Se corrigió usando el evento de tesela cargada de MapLibre y se repitió la suite completa hasta el resultado anterior. No se ocultó el fallo ni se sustituyó el servicio por una imagen ficticia.

## Publicación y sincronización

Sitio registrado con manifiesto persistido; acceso público autorizado por el usuario y configurado. **Aún no hay despliegue público verificado en este punto del registro.** Resultado definitivo y URL: DEPLOYMENT. `main`, origin esperado GitHub; commits de ciencia/alojamiento creados. Sincronización final y CI se registran al cerrar en DELIVERY.

## Límites científicos y operativos

No hay historia ni análisis de campo validados. Las fichas varietales no certifican parcela o rotación; sorgo carece de evidencia local suficiente. Faltan calendario revisado, identidad varietal, suelo/salinidad/drenaje, ETo/Kc y suministro de agua por periodo. No se calcula ETc, ahorro, rendimiento, salud de suelo, fijación de nitrógeno, rentabilidad ni ranking. Prioridad solo orienta revisión.

Clima mundial probado con seis consultas internacionales previas y nuevos recorridos en ambos hemisferios; no equivale a carga masiva ni aptitud de esos países. Caché y límites son por instancia, sin protección global distribuida; servicios públicos de mapas/geocoding sujetos a sus condiciones. Sin cuentas/base de datos; recargar pierde el formulario y no hay importador JSON. Interfaz española, sin traducción completa. Pruebas Chromium emuladas, sin hardware GPS, Safari/iOS, lector de pantalla ni evaluación de agricultores. HLS/NDVI y funciones avanzadas siguen pendientes.

Reglamento/guía y Resources específicos no completamente recuperados: NASA_COMPLIANCE distingue lo confirmado de lo pendiente. Equipo debe revisar elegibilidad, fuente NASA admitida, sede/miembros, condiciones y formulario, y realizar el envío.
