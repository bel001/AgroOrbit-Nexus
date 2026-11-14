---
name: nexus-datos-terrestres
description: Integrar o revisar NASA POWER en AgroOrbit Nexus conservando faltantes, unidades, soporte espacial y procedencia. Aplicar al modificar el adaptador climático o informes.
---

# Datos terrestres de Nexus

Entrada: consulta validada, respuesta original y contrato `src/lib/model.ts`.

El alcance climático es mundial. `npm run verify:global` comprueba países y hemisferios distintos; no reutilizar respuestas de un país como si fueran de otro. WorldCover es una capa ESA contextual con periodo/cobertura/licencia; no entra al motor ni sustituye la validación temporal de HLS/NDVI.

1. Leer `docs/DATA_SOURCES.md` y `src/lib/power.ts`. Consultar la documentación oficial si cambia el contrato.
2. Rechazar unidades inesperadas. Mantener LST explícito y fechas UTC de procesamiento separadas de la escala del producto.
3. Enumerar todos los días solicitados. Convertir fill/null/ausente a null, conservar cero de precipitación. No promediar nulos ni llamar completo a un total parcial.
4. Conservar URL, consulta, versión, fecha de consulta, unidades, fuentes y conteos faltantes en el JSON descargable. No usar el fixture para sustituir una llamada de producción fallida.
5. Ejecutar `npm test -- tests/science.test.ts` y `npm run verify:nasa` cuando se necesita probar acceso real. El primero usa un fixture NASA y mutaciones sintéticas; el segundo accede a red.

Salida: contrato tipado, pruebas y evidencia de consulta en `docs/evidence/`. Señalar que el clima es de grilla y no una medición de parcela. HLS queda P1; NDVI nunca prueba causalidad.

Procedimiento original del proyecto, MIT. Fuentes técnicas: NASA POWER Daily API y metodología del repositorio.
