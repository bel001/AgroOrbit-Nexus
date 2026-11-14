# Roadmap de implementación — AgroOrbit Nexus

**Fecha del plan:** 2026-11-14. **Evento:** NASA Space Apps Challenge, 14–15 de noviembre de 2026. El plan no constituye evidencia de tareas completadas.

## P0 — MVP indispensable

| Orden | Entrega | Condición de terminación |
|---|---|---|
| 1 | Mapa + perfil agrícola | Coordenada válida, historial de cultivos y datos faltantes controlados |
| 2 | NASA POWER | Serie histórica real con unidades, fechas, fuentes y errores |
| 3 | Catálogo mínimo | 2–3 cultivos con fichas locales documentadas y restricciones relevantes |
| 4 | Reglas de rotación | Compara fechas, clima, suelo conocido y agua sin inventar valores |
| 5 | Comparador de 3 estrategias | Actual + dos alternativas, mismo horizonte, explicación de diferencias |
| 6 | Diagnóstico cuantificado mínimo | Repetición declarada y diversidad con interpretación prudente |
| 7 | Informe de evidencias | Datos usados, decisiones, faltantes e incertidumbre |
| 8 | Pruebas y demo pública | Flujo probado, acceso sin permisos especiales y documentación real |

**Regla de protección del MVP:** no comenzar una integración satelital compleja si impide terminar el recorrido P0.

## P1 — Refinamiento sugerido por el mentor

- **AgroMonitor:** una serie NDVI histórica válida y comparable para la parcela/caso piloto.
- **Capa agrícola:** visualizar predicción de cobertura mediante una fuente con probabilidad y atribución clara.
- **Polígono:** dibujar y estimar superficie con coordenadas (nunca afirmar límites oficiales).
- **Escenarios:** contrastar periodos históricos climáticamente secos/habituales/lluviosos, según regla documentada.
- **Sensibilidad:** mostrar cómo cambian los resultados cuando cambian prioridades.

Si no hay acceso confiable a HLS o capacidad de validar la serie, dejar el módulo claramente marcado **propuesto / no implementado**.

## P2 — Después de un MVP estable

- Biblioteca amplia de cultivos y reglas locales para otras regiones.
- Integración de proyecciones climáticas identificadas como escenarios.
- Clasificación de cultivos específica y validada con datos de entrenamiento.
- Análisis territorial masivo y estimaciones estadísticas de áreas agrícolas con incertidumbre.
- Integración de datos económicos, solo con mercados y fuentes actualizadas.
- Estudios de campo para evaluar beneficios reales.

## Matriz de decisión de alcance

| Función | Por qué sí/no ahora |
|---|---|
| NASA POWER | Obligatorio para conectar datos NASA y decisión |
| Rotaciones | Es el objetivo central del desafío Field Shift |
| Historial de maíz repetido | Problema claro y cuantificable con datos declarados |
| HLS / NDVI | Valioso, pero requiere procesamiento y control de calidad |
| Clasificar automáticamente qué cultivo hay en cada parcela del mundo | Fuera de alcance por datos, validación y escala |
| Predecir precio de productos | Fuera de alcance: distrae del problema central |
| Recomendar una sola rotación «perfecta» | No válido sin demostrar reglas, datos y preferencias |

## Bloqueos que deben resolverse

1. Selección de parcela piloto y confirmación de especies/variedades.
2. Acceso real a NASA POWER y pruebas del flujo de datos.
3. Fuentes de calendarios y necesidades hídricas aplicables a la zona.
4. Disponibilidad de especialista para revisar reglas.
5. Tiempo y datos disponibles para analizar NDVI.
6. Plataforma de publicación y permisos del equipo.

## Entrega

El 15 de noviembre de 2026, la web oficial anuncia el cierre a las **11:59 p. m. en hora local**. Revisar el formulario oficial y sus condiciones vigentes, completar la documentación de uso de IA y proporcionar enlaces públicos. Fuente: [NASA Space Apps 2026](https://www.spaceappschallenge.org/2026/).
