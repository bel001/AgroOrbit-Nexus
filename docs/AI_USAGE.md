# Uso de inteligencia artificial — AgroOrbit Nexus

**Estado 2026-11-14:** declaración de desarrollo real, pendiente de revisión humana y de campos finales del portal.

## Uso ejecutado durante la implementación

Codex (asistente basado en GPT-6; sin identificador de snapshot expuesto) leyó el prompt maestro y documentación, investigó fuentes oficiales, escribió TypeScript/React/CSS, reglas y pruebas, ejecutó comandos, inspeccionó capturas y preparó documentación/commits. Herramientas: terminal, navegador web de consulta, npm, Git/GitHub CLI, Impeccable y Playwright/axe. No se generaron imágenes ni observaciones satelitales sintéticas.

Entradas de IA: instrucciones del equipo, documentos del repositorio, documentación pública NASA/FAO/librerías y datos meteorológicos públicos POWER. Perfil de demo expresamente ficticio. No hubo datos personales de agricultores ni entrenamiento de un modelo.

Producto implementado: reglas deterministas e indicadores descriptivos; no usa API de IA en ejecución ni genera recomendaciones con un LLM. Tests automatizados y revisión del propio asistente no equivalen a revisión científica humana. El usuario eligió MIT; faltan validación agronómica local y revisión final del equipo.

Declaración breve para adaptar al portal: «Utilizamos Codex para asistir en programación, pruebas y documentación. El producto consulta NASA POWER y aplica reglas deterministas trazables, sin modelo predictivo entrenado. El historial del caso piloto es ilustrativo. Conservamos incertidumbres y limitaciones; no validamos mejoras de rendimiento o ahorro hídrico».

Las tablas originales siguientes describen la propuesta inicial; AgroMonitor, clustering y generación automática de explicaciones siguen sin implementarse.

## 1. Distinción técnica fundamental

La especificación propone un **sistema inteligente de apoyo a decisiones**, basado inicialmente en **reglas, restricciones agronómicas y análisis multicriterio**. Esto **no equivale** automáticamente a un modelo de machine learning entrenado.

| Componente | Tipo de técnica | Estado |
|---|---|---|
| Rotation Intelligence | Reglas verificables y comparación con restricciones, sin optimización validada | Implementado; validación regional pendiente |
| Comparador climático | Agregaciones descriptivas mensuales de series históricas | Implementado con NASA real |
| AgroMonitor | Procesamiento de índices espectrales | Opcional, propuesto |
| Clustering de años climáticos | Aprendizaje no supervisado | Posible ampliación; no implementado |
| Redacción explicativa automática | Generación de lenguaje natural | Posible ampliación; no implementado |

No atribuir capacidad predictiva, «precisión del 95 %», entrenamiento ni optimización validada sin código, datos y pruebas correspondientes.

## 2. Asistencia de IA en la documentación

**Esta versión inicial de los documentos Markdown ha sido redactada con asistencia de un modelo de IA**, a partir de la propuesta facilitada por el equipo, la transcripción de la mentoría y documentación pública. **El equipo debe revisar** contenido, fuentes, afirmaciones científicas y requisitos antes de publicarlos como propios.

## 3. Registro de IA usada en el desarrollo (por completar)

| Herramienta/modelo | Actividad | Archivos o resultados | Revisión humana | Fecha |
|---|---|---|---|---|
| Asistente de IA (documentación) | Preparación de borradores Markdown | `README.md`, `docs/*.md`, `AGENTS.md`, `CONTRIBUTING.md` | Pendiente de revisión del equipo | 2026-11-14 |
| Codex (GPT-6; snapshot no expuesto) | Programación, investigación, pruebas, inspección visual, documentación y Git | src/, tests/, e2e/, docs/, skills originales | Revisión del asistente; revisión humana y agronómica pendientes | 2026-11-14 |

**No afirmar** que una IA programó, probó o entrenó componentes hasta que exista evidencia real.

## 4. Salvaguardas

- Ninguna explicación en lenguaje natural podrá modificar resultados calculados.
- Las fuentes científicas se citan; las fórmulas se prueban con casos conocidos.
- Resultados generados o simulados deben distinguirse explícitamente.
- No introducir datos confidenciales de agricultores en servicios externos sin base y autorización apropiadas.
- Evitar imágenes generadas que aparenten ser observaciones satelitales reales.
- Comprobar normas de atribución y uso de marcas de NASA Space Apps 2026.

## 5. Declaración final para la presentación

**Rellenar con hechos verificados:** «Utilizamos [herramientas] para [tareas]; el motor de evaluación utiliza [reglas/modelo real]; revisamos [método] y validamos [pruebas]. Las funciones no implementadas se describen como trabajo futuro».

Referencia del evento: [NASA Space Apps 2026](https://www.spaceappschallenge.org/2026/).
