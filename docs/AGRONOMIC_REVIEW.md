# Revisión agronómica independiente

2026-11-15. **Pendiente: no se ha recibido revisión profesional ni ensayo de campo.** El software no permite convertir un informe importado, una ficha bibliográfica o un dato aportado en una aprobación agronómica.

## Expediente disponible

En Evidencias → «Descargar expediente para revisión» se exportan las entradas, la versión metodológica, los requisitos pendientes y campos vacíos para responsable, fecha, fuentes y casos independientes. Variedad por campaña, drenaje, salinidad, materia orgánica, fecha y referencia del análisis son opcionales; se conserva lo desconocido. Aportar todos estos datos no habilita recomendaciones.

## Condiciones para revisar una región

1. Identificar parcela/caso, región, especie, variedad, periodo, finalidad y sistema de manejo. Una caja geográfica es un ámbito declarado, no un límite administrativo.
2. Adjuntar referencias aplicables a ventanas de siembra, duración, temperatura, suelo, drenaje, salinidad y agua. Separar reglas de exclusión de rangos generales de referencia.
3. Documentar cada regla: identificador/versionado, fuente y sección, supuesto, límites espaciales/temporales, unidades, tratamiento de faltantes y responsable.
4. Aportar como mínimo dos casos independientes del desarrollo: entradas, procedencia, datos climáticos, resultado esperado y razones. Incluir un caso incompatible y otro incompleto/compatible bajo evidencia suficiente. No inventar una etiqueta «viable» para completar el formulario.
5. Contrastar el resultado del motor con la evaluación del especialista y registrar discrepancias, cambios y fecha de nueva revisión. Pruebas sintéticas y ejemplos FAO verifican software, no adaptación local.
6. Incorporar al repositorio el perfil revisado y el evaluador pertinente, con pruebas de aislamiento respecto a otras regiones, cultivares y periodos. Revisar antes de publicar.

`regionProfileSchema` exige responsable/evidencia para un estado `reviewed`. El motor sigue devolviendo `recommendationsAllowed: false`: todavía no hay un evaluador regional validado. No existe un interruptor de aprobación en el navegador.

## Ampliación de regiones

El mismo protocolo sirve para costa, sierra, selva y otros países. No se crean perfiles aprobados copiando Virú. El catálogo general incluye maíz, frijol, sorgo, papa, arroz y trigo; el catálogo no afirma aptitud local. Papa/arroz/trigo carecen de Kc aplicable revisado en este producto y devuelven demanda desconocida.

Pendientes externos: selección de casos reales, acceso a análisis de suelo/agua, especialista identificado, revisión y ensayo local. El equipo debe obtenerlos; no han sido sustituidos por datos ficticios.
