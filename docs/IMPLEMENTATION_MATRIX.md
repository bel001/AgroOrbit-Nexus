# Matriz vigente de implementación

2026-11-15. Esta matriz describe el código local revisado; las correcciones de esta revisión **no se han desplegado**. Estado y resultados ejecutados: [STATUS](STATUS.md), [VALIDATION](VALIDATION.md). Implementado no significa validado agronómicamente.

| Requisito | Estado local | Evidencia / límite |
|---|---|---|
| RF-01 Ubicación | Implementado | Búsqueda/coordenadas/GPS, mapa mundial y polígono opcional con alternativa textual. Pruebas globales y geométricas. Polígono no catastral. |
| RF-02 Perfil | Implementado con faltantes admitidos | Variedad, suelo/agua, procedencia; análisis de suelo opcional. Borrador local versionado, exportación e importación validada. |
| RF-03 NASA POWER | Implementado | Cuatro variables base u ocho con Penman–Monteith; unidades, LST, fuente, versión, fechas y faltantes. Acceso real Virú/Cusco registrado. |
| RF-04 Diagnóstico climático | Implementado | Gráficas/tablas y completitud; lluvia sin observaciones = null, suma parcial identificada. |
| RF-05 Catálogo local | Parcial | Seis especies con referencias generales; fichas del piloto documentales, sin aprobación agronómica. Nuevos cultivos sin Kc pertinente → null. |
| RF-06 Secuencias | Implementado | Historial y plan A; hasta dos alternativas del usuario. Fuera del piloto no se crean plantillas. |
| RF-07 Restricciones | Parcial científico | Fechas/exclusiones/agua total nula evaluables. Aptitud de suelo, calendario y clima local sin validar. Expediente para especialista disponible. |
| RF-08 Comparación | Implementado descriptivamente | Horizonte común, estados incompletos e incompatibles; histórico fijo solo para punto y calendario exactos. |
| RF-09 Manejo | Implementado descriptivamente | Familias, leguminosas, repetición e intervalos; no se afirma salud medida del suelo ni control de plagas. |
| RF-10 Informe | Implementado | JSON 3.0: entradas, clima, métodos, supuestos, ranking, tarifa/moneda, polígono y MODIS consultado. Importación recupera entradas y exige recalcular. |
| RF-11 Vegetación por parcela | Parcial | MODIS/ORNL real, un píxel nominal de 250 m, calidad, fechas y procedencia; solo entorno. HLS por parcela y comparación fenológica validados pendientes. |
| RF-12 Cobertura agrícola | Parcial | WorldCover 2021 contextual; no clasifica cultivo actual ni superficie oficial. |
| RF-13 Prioridades | Implementado exploratorio | Ranking relativo con fórmula, sensibilidad en controles, exclusión de incompatibles y criterios sin datos. No recomendación. |
| RF-14 Nuevas regiones | Contratos implementados; validación pendiente | Catálogo y perfiles versionados; ninguna región revisada ni evaluador aprobado. Protocolo: AGRONOMIC_REVIEW. |

## Correspondencia con los ocho puntos de la revisión

| Punto | Respuesta |
|---|---|
| 1 Fallos | Guardia de tabla histórica vacía y lluvia null/parcial; regresiones unitarias y de interfaz. |
| 2 Ubicación histórica | Contrato explícito de punto y calendario; sin histórico fijo en otra celda ni otro inicio. |
| 3 Agronomía | Captura y expediente implementados. La revisión independiente sigue pendiente y bloquea recomendaciones. |
| 4 Guardado | Borrador local, eliminación explícita, importación/exportación y validación; sin cuenta obligatoria. |
| 5 Agua e indicadores | Penman–Monteith opcional, supuestos documentados de lluvia/eficiencia y etiquetas prudentes; pendiente contraste local. |
| 6 Pruebas | 154 unitarias/API; regresiones en cinco proyectos / tres motores y ESA real tras corregir la dependencia del mapa base. Rondas, omisiones y fallo inicial detallados en VALIDATION; CI configurado, sin resultado remoto supuesto. |
| 7 Documentación | Esta matriz centraliza el estado y diferencia implementación, ciencia, evidencia y despliegue. |
| 8 Ampliaciones | Polígonos, catálogo de seis especies y MODIS contextual reales. Regiones aprobadas y HLS parcelario no se simulan. |
