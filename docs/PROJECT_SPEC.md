# AgroOrbit Nexus — Especificación del proyecto

**Versión documental:** 0.1 · **Fecha:** 2026-11-14 · **Estado:** diseño propuesto, no verificación de implementación.

## 1. Resumen ejecutivo

**AgroOrbit Nexus — From Space to Soil** es una propuesta de plataforma web que transforma información ambiental de NASA y datos agrícolas locales en comparaciones de estrategias de rotación de cultivos. Integra el enfoque original de AgroOrbit AI con una mejora derivada de la mentoría: **mostrar y cuantificar indicadores de un problema antes de presentar alternativas**.

**Desafío:** [NASA Space Apps 2026 — Field Shift: Adapting Farms with NASA Data](https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/).
**Piloto:** zona por confirmar de Virú/La Libertad, Perú.
**Usuarios:** agricultor, técnico agrónomo, investigador/estudiante.
**Producto:** aplicación web responsiva y pública, inicialmente sin cuentas obligatorias.
**Enfoque:** asistencia para decisiones, no prescripción agronómica automática.

**Requisito global obligatorio (2026-11-14):** la plataforma sirve ubicaciones de todo el mundo. Virú es solo una demostración inicial y futuro caso de validación regional. La interfaz admite mapa mundial e inicia en modo climático; no presupone cultivos ni calendarios. El catálogo contiene hechos generales; las reglas requieren región, variedad, periodo, fuentes y revisión. No existe todavía ninguna región con análisis agronómico validado. Consultar GLOBAL_SCOPE para contratos, pruebas y límites actuales.

## 2. Problema central refinado

Los productores pueden enfrentar presión climática, restricciones de agua y sistemas de cultivo repetitivos. Con frecuencia, les resulta difícil integrar datos ambientales, historial de siembras, suelo y requerimientos de cultivos para **identificar indicadores de riesgo, comprender incertidumbres y comparar rotaciones viables**. El problema no se resuelve mostrando solo estadísticas de temperatura o lluvia.

Una rotación es una secuencia temporal de cultivos; no equivale a recomendar una especie aislada. El monocultivo continuo **puede** elevar ciertos riesgos agronómicos, pero sus efectos reales dependen del manejo, suelo, nutrición, plagas, riego y contexto. No deben afirmarse daños sin evidencia.

## 3. Objetivo general

Desarrollar un prototipo web explicable que combine observaciones de NASA, información local del terreno, requerimientos agronómicos y prioridades del productor para **caracterizar un problema agrícola y comparar estrategias de rotación** con reglas verificables.

## 4. Objetivos específicos

1. Consultar series históricas de clima mediante NASA POWER.
2. Registrar ubicación, superficie opcional, suelo, agua, historial de cultivos y prioridades.
3. Incorporar un catálogo pequeño de cultivos adaptado al caso de estudio y documentado.
4. Cuantificar señales disponibles: repeticiones de cultivo, diversidad botánica, períodos sin cultivo cuando se conocen, variabilidad climática y restricciones declaradas.
5. Evaluar tres secuencias de rotación en horizontes temporales equivalentes.
6. Identificar incompatibilidades de calendario, clima, suelo, agua y manejo.
7. Comparar demanda hídrica estimada **solo si** los datos respaldan el cálculo.
8. Mostrar fuentes, supuestos, incertidumbres y razones de cada alternativa.
9. **Ampliación:** estudiar cambios de vegetación (NDVI) y cobertura agrícola mediante insumos satelitales para un caso validado.
10. Diseñar una arquitectura que pueda adaptarse a otras regiones al incorporar datos y reglas locales.

## 5. Usuarios y necesidades

- **Agricultor:** comprender escenarios, registrar restricciones y comparar opciones sin dominar meteorología.
- **Agrónomo:** auditar el origen de datos, modificar restricciones, verificar criterios.
- **Investigador/estudiante:** repetir el cálculo, inspeccionar parámetros y limitaciones.

## 6. Recorrido del usuario

1. **GeoFarm:** seleccionar punto de referencia; opcionalmente dibujar un polígono. Una coordenada no define límites legales.
2. **Perfil agrícola:** declarar cultivos, fechas, suelo, sistema de riego y prioridades. Se admite `desconocido`.
3. **ClimateScope:** descargar clima NASA por ubicación y período; presentar datos ausentes y representatividad espacial.
4. **AgroMonitor (P1):** visualizar tendencias de vegetación con fechas comparables y control de nubes/calidad.
5. **CropKnowledge:** cargar fichas científicas de cultivos candidatos.
6. **Rotation Intelligence:** generar/recibir alternativas, aplicar restricciones, calcular indicadores y comparar tres estrategias.
7. **Evidence Report:** explicar resultado y exportar/compartir resumen cuando esté implementado.

## 7. Módulos

| Módulo | Responsabilidad | Prioridad |
|---|---|---|
| GeoFarm | Terreno, parcela, restricciones y procedencia | P0 |
| ClimateScope | NASA POWER y clima histórico | P0 |
| CropKnowledge | Cultivos y requerimientos con fuentes | P0 |
| Rotation Intelligence | Reglas y alternativas explicables | P0 |
| SoilCare | Indicadores de manejo potencial y diversidad | P0 |
| WaterBalance | Indicadores hídricos parciales o cálculo validado | P0 |
| Evidence Report | Explicación, incertidumbre y rastreabilidad | P0 |
| AgroMonitor | Serie histórica de vegetación y cambios | P1 |
| Agricultural Layers | Áreas agrícolas clasificadas y sus probabilidades | P1 |
| Scenario Lab | Comparación de temporadas históricas extremas | P1/P2 |

## 8. Caso demostrativo ilustrativo

**Supuesto declarado, no observación real:** una parcela de superficie conocida reporta maíz durante tres campañas consecutivas y agua limitada.

- **Estrategia A:** maíz → maíz → maíz (historial registrado).
- **Estrategia B:** maíz → leguminosa candidata → maíz.
- **Estrategia C:** maíz → otro cultivo anual compatible → leguminosa candidata.

Las opciones B/C son **ejemplos** y no constituyen recomendaciones locales hasta identificar especies, variedades, ventanas, duración, recursos y restricciones reales. El sistema puede concluir que faltan datos.

## 9. Alcance del MVP

**Debe mostrar un flujo de extremo a extremo** con ubicación, entrada de información, consulta NASA, comparación reproducible de rotaciones y explicación verificable. No es indispensable clasificar cultivos automáticamente por imagen ni predecir rendimiento.

**Después del núcleo:** NDVI de una única parcela/caso y capa agrícola. **Posteriormente:** análisis geográfico masivo, proyecciones de clima, validación de modelos predictivos y datos económicos.

## 10. Lo que NO afirma el sistema

No identifica por sí solo el cultivo exacto, años de monocultivo, límites prediales, degradación del suelo, plagas, ahorro real de agua, fertilidad recuperada, rendimiento futuro ni rentabilidad. Una serie NDVI **no establece causalidad**.

## 11. Qué constituye una entrega exitosa

El usuario consigue comparar alternativas sin resultados inventados; cada cifra y regla tiene fuente; los errores de las APIs y la ausencia de datos no producen falsas certezas; el prototipo puede ejecutarse y demostrarse sin permisos especiales.

## 12. Referencias

- NASA Space Apps — [Field Shift](https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/).
- NASA POWER — [Daily API](https://power.larc.nasa.gov/docs/services/api/temporal/daily/).
- NASA HLS — [proyecto](https://hls.gsfc.nasa.gov/).
- FAO — [Evapotranspiración FAO-56](https://www.fao.org/4/X0490E/X0490E00.htm).

Véanse también [`REQUIREMENTS.md`](REQUIREMENTS.md), [`METHODOLOGY.md`](METHODOLOGY.md) y [`MENTOR_FEEDBACK.md`](MENTOR_FEEDBACK.md).
