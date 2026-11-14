# AgroOrbit Nexus 🌱🛰️

**From Space to Soil — Datos espaciales para decisiones agrícolas más informadas.**

> **Estado del repositorio:** especificación y documentación de un prototipo propuesto. La presencia de funcionalidades en estos documentos **no significa** que ya estén implementadas. El estado real se registra en [`docs/STATUS.md`](docs/STATUS.md).

**AgroOrbit Nexus** es una propuesta de aplicación web de apoyo a decisiones agrícolas para el desafío **[Field Shift: Adapting Farms with NASA Data](https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/)** del **NASA Space Apps Challenge 2026**.

El sistema busca unir **datos ambientales de NASA**, información proporcionada por el agricultor, reglas agronómicas verificables y —como refinamiento propuesto— un diagnóstico histórico de vegetación. Su propósito es ayudar a comparar **estrategias de rotación de cultivos**, no prometer rendimientos ni sustituir al ingeniero agrónomo.

**Piloto sugerido:** una zona agrícola de **Virú, La Libertad, Perú**, por confirmar según disponibilidad de información. **Diseño:** escalable a otras ubicaciones cuando los datos y las reglas locales sean suficientes.

## El problema

Un productor puede repetir maíz durante varias campañas, enfrentarse a restricciones hídricas o notar cambios en su cultivo sin contar con una herramienta que conecte historial de siembras, clima, condiciones del suelo y posibles alternativas. Un mapa climático, por sí solo, no explica el riesgo ni justifica una nueva rotación.

## La solución planteada

1. **Ubicar:** seleccionar un punto o delimitar una parcela; distinguir cobertura agrícola estimada de límites oficiales.
2. **Caracterizar:** registrar suelo, riego, cultivos, historial de campañas y prioridades; admitir datos desconocidos.
3. **Contextualizar:** consultar clima histórico de **NASA POWER**.
4. **Diagnosticar (ampliación):** examinar series históricas de vegetación mediante **NASA HLS**; mostrar cambios, no causas confirmadas.
5. **Comparar:** evaluar una rotación actual frente a dos alternativas según reglas agrícolas, calendario, clima y agua.
6. **Explicar:** informar qué se calculó, de dónde provienen los datos, los supuestos y qué debe validar un especialista.

### Ejemplo de demostración

**Caso ilustrativo (no corresponde a una parcela real medida):** un agricultor declara que sembró maíz durante tres campañas sucesivas. AgroOrbit Nexus registra la continuidad del cultivo, consulta el clima y contrasta la secuencia reportada con dos rotaciones candidatas. Las alternativas solo se etiquetan *viables bajo supuestos*, *incompatibles* o *evaluación incompleta* después de comprobar restricciones documentadas.

**Importante:** el NDVI no prueba por sí mismo agotamiento de nutrientes, plagas ni monocultivo; para esas conclusiones se requieren datos adicionales.

## Alcance y prioridades

| Prioridad | Componente | Meta |
|---|---|---|
| P0 | GeoFarm | Ubicación y formulario agrícola |
| P0 | ClimateScope | Clima histórico real mediante NASA POWER |
| P0 | CropKnowledge | Catálogo pequeño de cultivos y fuentes |
| P0 | Rotation Intelligence | Comparación de tres estrategias con reglas trazables |
| P0 | SoilCare / WaterBalance | Indicadores básicos, sin promesas de efectos reales |
| P0 | Evidence Report | Informe comprensible y reproducible |
| P1 | AgroMonitor | Una serie histórica validada de vegetación/NDVI |
| P1 | Capa de áreas agrícolas | Referencia de cobertura con probabilidades y límites claros |
| P2 | Expansión geográfica y modelos avanzados | Solo después de validar piloto y fuentes |

## Arquitectura propuesta

- **Web:** Next.js, React, TypeScript.
- **Interfaz:** Tailwind CSS, shadcn/ui.
- **Mapa y gráficos:** MapLibre GL JS, Recharts.
- **Validación:** Zod; **pruebas:** Vitest.
- **Datos:** NASA POWER (P0); NASA HLS y Dynamic World (opcionales, sujetos a acceso e integración).
- **Motor:** reglas agronómicas y comparación multicriterio explicable en TypeScript.
- **Despliegue propuesto:** Vercel, sujeto a verificación.

Estos son **componentes previstos**; no se declaran instalados ni probados hasta que se comprueben en el repositorio.

## Documentación del proyecto

| Archivo | Contenido |
|---|---|
| [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md) | Propuesta de producto y alcance |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Requisitos e historias de usuario |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Módulos, flujos y diseño técnico |
| [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) | APIs, fuentes, unidades y límites |
| [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) | Reglas, indicadores y cautelas científicas |
| [`docs/VALIDATION.md`](docs/VALIDATION.md) | Plan de pruebas y criterios de aceptación |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Prioridades y secuencia de desarrollo |
| [`docs/MENTOR_FEEDBACK.md`](docs/MENTOR_FEEDBACK.md) | Hallazgos de la asesoría y decisiones propuestas |
| [`docs/DEMO.md`](docs/DEMO.md) | Guion de demostración y entrega |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Preparación de publicación |
| [`docs/AI_USAGE.md`](docs/AI_USAGE.md) | Declaración revisable del uso de IA |
| [`docs/STATUS.md`](docs/STATUS.md) | Estado comprobado y decisiones abiertas |
| [`AGENTS.md`](AGENTS.md) | Instrucciones para asistentes de programación |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Convenciones de colaboración |

## Para ejecutar la aplicación

**Aún no se declara una aplicación ejecutable en este paquete:** los archivos entregados son documentación Markdown. Cuando exista código fuente, completar aquí los comandos **reales y probados** de instalación y ejecución; no se proporcionan comandos ficticiamente verificados.

## Principios científicos

- No tratar imágenes clasificadas como límites de propiedad o inventarios definitivos de cultivos.
- No atribuir una caída del NDVI al monocultivo sin otras evidencias.
- No convertir información ausente en cero ni inventar precisión, rendimiento, ahorro de agua o salud del suelo.
- Separar datos **medidos**, **estimados**, **declarados por el usuario** y **desconocidos**.
- Mostrar la fecha, ubicación, fuente y limitación de cada cálculo.

## English summary

**AgroOrbit Nexus** is a proposed explainable agricultural decision-support web app. It combines NASA environmental observations, farmer-provided soil and cropping history, and documented agronomic constraints to compare crop-rotation strategies. A historical vegetation-monitoring component is planned as an enhancement. The pilot focuses on La Libertad, Peru, with a scalable architecture. **It does not claim to diagnose soil degradation or predict farm yields from satellite imagery alone.**

## Recursos oficiales

- [NASA Space Apps — Field Shift](https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/)
- [NASA POWER — Daily API](https://power.larc.nasa.gov/docs/services/api/temporal/daily/)
- [NASA — Harmonized Landsat Sentinel-2](https://hls.gsfc.nasa.gov/)
- [FAO-56 — Crop Evapotranspiration](https://www.fao.org/4/X0490E/X0490E00.htm)

## Licencia y créditos

**Pendiente de decisión del equipo:** elegir e incorporar una licencia de código adecuada, comprobar licencias de dependencias, mapas y datos, y registrar las contribuciones. No se concede implícitamente una licencia con esta documentación. AgroOrbit Nexus no es un producto oficial de NASA ni está respaldado por NASA.
