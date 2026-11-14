---
name: nexus-rotaciones-agronomicas
description: Modificar o auditar las restricciones de rotaciones de AgroOrbit Nexus, evitando calendarios regionales inventados y falsos estados de viabilidad.
---

# Rotaciones trazables

Entrada: perfil validado, tres secuencias, horizonte y fuentes aplicables a especie/variedad/zona.

En modo climático global no generar secuencias. Fuera de un perfil regional aplicable revisar solo los registros aportados; las tres secuencias de Virú requieren activación ilustrativa explícita. Probar intentos de reutilizar el ID peruano en otros continentes. No llamar «validado» al perfil por disponer de una fuente: falta revisión del evaluador y sus casos locales.

1. Leer `docs/METHODOLOGY.md`, `src/lib/catalog.ts` y `src/lib/rotations.ts`.
2. Conservar intervalos [siembra,cosecha), mismo horizonte, exclusiones antes de ventajas. Rechazar solapamientos y campañas fuera de horizonte.
3. Los rangos generales FAO no son ventanas locales ni restricciones universales. Sin fuente regional, devolver desconocido; nunca promover a viable por ausencia de fallos.
4. Agua null no es cero. Agua positiva no prueba suficiencia. Cero de agua total, incluida lluvia, es ausencia declarada de suministro. No calcular ETc sin ETo y Kc por etapas ni equipararla a riego aplicado.
5. Revisar procedencia del historial antes de contar repeticiones; fechas incompatibles o procedencia desconocida impiden un conteo interpretable.
6. Probar agua nula/cero, exclusión, solapamiento, familia compartida, calendario ausente y conservación del clima al cambiar prioridad con `npm test`.

Salida: comprobaciones con fuente, estado y razón; informe con supuestos y pruebas. Diversidad no acredita regeneración, rendimiento, ahorro ni nitrógeno fijado. Reglas locales requieren revisión humana independiente.

Procedimiento original del proyecto, MIT. Referencias: FAO Crop Water Needs tabla 6, FAO-56 y documentación Nexus.
