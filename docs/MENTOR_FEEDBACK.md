# Mentoría — Hallazgos y refinamientos

**Base:** transcripción proporcionada por el equipo en la conversación. La transcripción tiene posibles errores de reconocimiento de voz; este archivo **parafrasea** las ideas principales y no debe leerse como acta literal aprobada por el asesor.

## 1. Lectura principal del comentario

El asesor valoró el dashboard, pero señaló que **mostrar temperatura, humedad y precipitación no alcanza** para explicar el problema agrícola. Sugirió **detectar, cuantificar y mostrar la problemática a través del tiempo o del espacio** antes de plantear una solución.

También habló de enfocar zonas agrícolas, examinar si hay rotación o repetición de cultivos, revisar indicadores de vegetación mediante imágenes de Sentinel-1/Sentinel-2, usar un historial de varios años y hacer que la herramienta sea escalable a otros lugares. Planteó como ejemplo una superficie donde se cultiva maíz repetidamente y el agricultor quiere comprender posibles consecuencias y alternativas.

## 2. Correspondencia con el proyecto original

| Sugerencia de mentoría | Lo que AgroOrbit AI ya contemplaba | Refinamiento para AgroOrbit Nexus |
|---|---|---|
| Seleccionar áreas | Mapa de ubicación | Añadir polígono y capa de cobertura (P1) |
| Explorar historial | Clima histórico NASA POWER | Añadir historia agrícola explícita y NDVI opcional |
| Cuantificar problemas | Indicadores de agua y diversidad | Exponer repetición de cultivos, faltantes y tendencias verificables |
| Mostrar solución | Comparador de tres rotaciones | Conectar cada criterio del diagnóstico con su alternativa |
| Escala amplia | Arquitectura conceptual global | Piloto realista, reglas parametrizables para otras zonas |
| Usar sensores satelitales | NASA POWER como núcleo | Evaluar NASA HLS para monitor de vegetación (P1) |

## 3. Decisiones propuestas del equipo (no validadas por el asesor)

1. Mantener el nombre nuevo **AgroOrbit Nexus**.
2. Conservar **rotaciones agrícolas** como núcleo, coherente con Field Shift.
3. Usar como demostración una secuencia **declarada** de maíz repetido, no un diagnóstico satelital inventado.
4. Hacer que los resultados respondan: **¿qué observamos?, ¿qué podemos cuantificar?, ¿qué no sabemos?, ¿qué alternativas son compatibles?**
5. Elegir un piloto en La Libertad (Virú sugerido), con posibilidad de adaptación posterior.
6. Evaluar HLS/NDVI y cobertura agrícola como mejoras si existen tiempo, acceso y datos válidos.

## 4. Advertencia metodológica esencial

El mentor propuso imágenes históricas para observar cambios en cultivos. **Inferencia científica responsable:** una disminución de NDVI puede reflejar muchas causas; no demuestra por sí sola deterioro del suelo, plagas, ni que se sembró maíz cada año. El historial declarado, observaciones de campo o clasificación validada son insumos separados.

## 5. Preguntas pendientes para una siguiente revisión

- ¿Qué dos o tres especies y variedades son representativas del piloto de Virú?
- ¿Qué variables del suelo y del riego son indispensables, y cuáles pueden quedar desconocidas?
- ¿Qué definición operacional de «riesgo de monocultivo» considera agronómicamente defendible?
- ¿Qué ventanas de fechas deberíamos comparar en series NDVI para no confundir cosecha con daño?
- ¿Qué evidencia mínima permitiría confirmar que nuestras rotaciones candidatas son viables?

## 6. Criterio de éxito derivado de la mentoría

La demostración debe contar una secuencia comprensible:

```text
PARCELA / HISTORIA AGRÍCOLA
         ↓
PROBLEMA E INDICADORES CUANTIFICADOS
         ↓
CONTEXTO CLIMÁTICO Y LIMITACIONES
         ↓
COMPARACIÓN DE ROTACIONES
         ↓
EVIDENCIAS Y PRÓXIMAS VERIFICACIONES
```

La meta no es añadir muchas pantallas, sino explicar mejor el valor práctico de las que existan.
