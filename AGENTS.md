# AGENTS.md — Instrucciones para asistentes de desarrollo

Estas instrucciones se aplican a las contribuciones al repositorio de **AgroOrbit Nexus**.

## Objetivo

**Entrega vigente (2026-11-15): publicada en https://agroorbit-nexus.vercel.app** por instrucción expresa del usuario («despliega»). Cualquier otra publicación necesita una instrucción nueva. No incorporar alias personales de cuentas de alojamiento en URLs/documentación. La publicación anterior se restringió; las referencias actuales se retiraron, sin reescribir el historial Git ni prometer borrado de registros del proveedor.

**Alcance obligatorio global:** Virú/La Libertad es únicamente el piloto inicial, todavía sin validación agronómica. No usar coordenadas, cultivos, duraciones o reglas del piloto como valores universales. Mantener catálogo general, perfiles regionales versionados y casos ilustrativos separados. Fuera de un perfil aplicable, ofrecer clima o diagnóstico parcial sin generar recomendaciones. Añadir nuevas regiones/fuentes/idiomas mediante contratos extensibles y pruebas de aislamiento geográfico. Las capas satelitales deben conservar periodo, calidad, atribución y límites; no convertir contexto visual en recomendación.

Construir una aplicación web funcional y científica, con un recorrido completo: ubicación → registro agrícola → clima NASA → comparación de rotaciones → evidencia explicable. **Primero P0; después P1/P2.** Consulta `docs/PROJECT_SPEC.md`, `docs/REQUIREMENTS.md` y `docs/METHODOLOGY.md` antes de programar.

## Reglas de actuación

1. **Inspeccionar antes de modificar:** revisar archivos, dependencias, pruebas y estado real del código.
2. **No fingir:** no declarar APIs conectadas, cálculos validados, despliegues ni pruebas si no se han ejecutado.
3. **Priorizar el recorrido funcional** sobre animaciones, dashboards decorativos y funciones extras.
4. **No inventar agronomía:** toda regla crítica exige referencia, supuesto, rango de aplicación y prueba.
5. **Mantener trazabilidad:** inputs, fechas, unidades, fuente, fórmulas y advertencias deben llegar al informe.
6. **Conservar datos faltantes:** distinguir `null`/`unknown` de valores numéricos reales (en especial cero).
7. **Etiquetar escenarios de ejemplo:** no presentar un caso ficticio como campo observado.
8. **No usar NDVI como diagnóstico causal:** solo tendencias de cobertura/verdor bajo condiciones comparables.
9. **No usar marketing engañoso sobre IA:** reglas/optimización no equivalen a un modelo predictivo entrenado.
10. **No insertar claves ni tokens** en repositorios; no realizar publicaciones externas o cambios destructivos sin autorización.

## Stack propuesto

Next.js + React + TypeScript; Tailwind CSS + shadcn/ui; MapLibre GL JS; Recharts; Zod; Vitest. Añadir Python u otros servicios solo ante una necesidad justificada.

## Orden recomendado de trabajo

1. Implementar perfil del terreno y esquema de validación.
2. Integrar consulta real de NASA POWER con gestión de errores y metadatos.
3. Crear catálogo mínimo de cultivos con fuentes verificables.
4. Implementar restricciones agronómicas y clasificación de alternativas.
5. Comparar tres secuencias y generar un informe explicable.
6. Probar extremos: valores faltantes, calendarios incompatibles, poca agua, API caída.
7. Integrar NDVI/áreas agrícolas **solo cuando** exista fuente usable y validación temporal.
8. Completar documentación de instalación, ejecución, despliegue y pruebas realmente efectuadas.

## Definición de terminado

Un módulo está terminado solo cuando funciona desde la interfaz, valida sus entradas, maneja errores, presenta fuentes y tiene evidencia de prueba. Actualiza `docs/STATUS.md` con pruebas, fecha y pendientes.

## Antes de cada PR

- Describir qué cambia y por qué.
- Declarar si se usan datos de ejemplo o datos reales.
- Ejecutar las pruebas pertinentes y registrar resultados (o explicar por qué no se ejecutaron).
- Mantener consistencia entre código y documentación.
- No declarar precisión, ahorros, rentabilidad, efectos sobre plagas ni incrementos de rendimiento sin validación independiente.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
