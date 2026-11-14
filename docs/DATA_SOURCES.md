# Fuentes de datos y procedencia — AgroOrbit Nexus

**Estado verificado 2026-11-14:** NASA POWER está integrado y fue consultado realmente. El catálogo usa rangos generales FAO. HLS, Dynamic World, GAEZ, MIDAGRI, SENAMHI y SoilGrids siguen como fuentes previstas, sin integración.

**Ampliación mundial:** POWER verificado en seis países, con respuestas separadas en evidence/global y sin transferir reglas del piloto. ESA WorldCover 2021 v200 está integrado como capa contextual opcional WMS, con licencia/atribución y límites del servicio; evidencia de capa, PNG, fecha y CORS en evidence/global/worldcover-service.json. No alimenta el evaluador agronómico ni implementa una serie temporal NDVI. Contratos y alcance actual en GLOBAL_SCOPE.

**Búsqueda de referencia:** Open-Meteo Geocoding/GeoNames para localidades y códigos postales, con selección explícita de coincidencia. No identifica parcelas ni límites. Consulta real documentada en evidence/search; condiciones y caché en LOCATION_SEARCH. GPS usa la API del navegador con permiso; pruebas de posición emuladas, no ensayos de precisión de hardware.

## Evidencia de integración actual

`npm run verify:nasa` guarda respuesta original y URL/fecha/unidades en `docs/evidence/power-viru-2024.json` y `power-request.json`: comunidad AG, T2M/T2M_MIN/T2M_MAX (C), PRECTOTCORR (mm/day), LST, API v2.10.3, 366 días de 2024, coordenadas -8.42/-78.75. Pruebas de navegador consultan además el horizonte 2024-01-01–2025-06-23 (540 días); el JSON exportado incluye consulta exacta y metadatos.

Endpoint: `https://power.larc.nasa.gov/api/temporal/daily/point`. Es información meteorológica de grilla; no se interpreta como sensor de parcela. No se declara una resolución única para todos los productos. Conserva fuentes MERRA2/POWER, versión y escala temporal. Las series no demuestran causalidad agrícola.

No se solicitan radiación, viento o humedad porque todavía no se aplica FAO Penman–Monteith. No se calcula ETo/ETc ni riego. Las fechas/variables ausentes quedan null. Meses parciales se muestran con días válidos y advertencia de agregación.

Catálogo: [FAO Crop Water Needs, tabla 6](https://www.fao.org/4/s2022e/s2022e07.htm), rangos generales de ciclo; no se confirmó una fuente de calendario/variedad para Virú. Licencias y atribuciones en THIRD_PARTY_NOTICES. Accesos oficiales del concurso en NASA_COMPLIANCE; varios fallaron directamente aunque se recuperaron extractos indexados.

Familias botánicas verificadas en Kew: [maíz, Poaceae](https://www.kew.org/plants/maize), [frijol, Fabaceae](https://www.kew.org/plants/common-bean), [sorgo, Poaceae](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A422090-1). Los enlaces taxonómicos se conservan por especie en el catálogo del JSON exportado. Solo se usan hechos taxonómicos, sin reproducir textos o imágenes de Kew.

## Matriz de fuentes

| Fuente | Rol | Estado/prioridad | Advertencia clave |
|---|---|---|---|
| [NASA POWER](https://power.larc.nasa.gov/) | Clima histórico y variables agroclimáticas | P0 / integrado y probado, ver evidencias | Grilla regional, no medición en parcela |
| [NASA HLS](https://hls.gsfc.nasa.gov/) | Reflectancia y series de vegetación (incl. índices derivados) | P1 / evaluación de acceso | No identifica automáticamente causas o especies |
| [Dynamic World](https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_DYNAMICWORLD_V1) | Cobertura de suelo estimada, clase *crops* | P1 / fuente complementaria no NASA | Probabilidades de clasificación, no catastro |
| [FAO-56](https://www.fao.org/4/X0490E/X0490E00.htm) | Método hídrico `ETc = Kc × ETo` | P0 / referencia metodológica | ETc no equivale al riego real |
| [FAO GAEZ](https://gaez.fao.org/) | Referencia sobre aptitud agroecológica | Complementaria | No valida por sí sola una parcela específica |
| [MIDAGRI](https://www.gob.pe/midagri) | Contexto de cultivos y superficie agrícola peruana | Complementaria | Verificar edición, escala y licencia |
| [SENAMHI](https://www.gob.pe/senamhi) | Contexto meteorológico local | Complementaria | Estaciones y series pueden no cubrir el predio |
| [ISRIC SoilGrids](https://docs.isric.org/globaldata/soilgrids/) | Propiedades de suelo espacialmente estimadas | Posible ampliación | No sustituye análisis de laboratorio |

## 1. NASA POWER — fuente principal del MVP

**Documentación oficial:** [Daily API](https://power.larc.nasa.gov/docs/services/api/temporal/daily/) y [comunidades](https://power.larc.nasa.gov/docs/methodology/communities/).

- Para agroclimatología, usar `community=AG` cuando los parámetros estén disponibles.
- La API Daily ofrece datos meteorológicos y solares con resoluciones espaciales **dependientes del producto**. La documentación también menciona la grilla meteorológica global de 0,5°; no asumir que todos los parámetros tienen igual resolución.
- Admitir variables como temperatura media/máxima/mínima, precipitación, radiación, humedad y viento según disponibilidad real del diccionario POWER.
- Registrar tiempo UTC/LST según consulta, fecha, rango, coordenadas, parámetros solicitados, unidades y valores ausentes.
- No sobrecargar el proveedor con consultas redundantes; implementar caché y límites.

**Ejemplo de estructura de consulta documentada (no verificada en tiempo de ejecución):**

```text
https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M&community=AG&longitude=0&latitude=0&start=20250101&end=20250131&format=JSON
```

Las coordenadas `0,0` son solo una **ilustración de sintaxis**, no el área piloto. Antes de usar parámetros adicionales confirmar en el diccionario oficial.

## 2. NASA HLS — evaluación histórica (P1)

[Proyecto HLS de NASA](https://hls.gsfc.nasa.gov/) armoniza observaciones Landsat y Sentinel-2 y entrega productos de reflectancia superficial de 30 m. El proyecto también describe productos de índices de vegetación derivados.

Buenas prácticas: escoger período de cultivo comparable; enmascarar nubes y sombras; documentar calidad; evitar comparar siembra con cosecha como si fueran estados equivalentes; registrar la cantidad de observaciones válidas. El NDVI mide respuesta espectral de la vegetación, **no salud integral del suelo ni plagas concretas**.

**Acceso:** identificar método real de obtención de series y sus condiciones antes de declararlo implementado. Si el proveedor requiere autenticación, no prometer acceso anónimo sin comprobarlo.

## 3. Dynamic World — superficie agrícola estimada (P1)

[Dynamic World V1](https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_DYNAMICWORLD_V1) proporciona etiquetas y probabilidades de nueve clases de cobertura del suelo, a 10 m, derivadas de Sentinel-2, incluidas áreas de cultivo (*crops*). Es una fuente **Google/World Resources Institute**, no una fuente NASA.

Su clase *crops* puede tener incertidumbre, especialmente en temporadas sin vegetación visible o con suelo árido. No afirmar hectáreas oficiales ni rotación real sin verificación. Acceso a través de Earth Engine requiere comprobar condiciones técnicas y de uso.

## 4. FAO-56 — agua

Referencia: [FAO-56, cap. 5](https://www.fao.org/4/x0490e/x0490e0a.htm).

`ETc = Kc × ETo`, donde `ETc` es evapotranspiración estimada del cultivo, `Kc` coeficiente del cultivo y fase, `ETo` evapotranspiración de referencia. Se necesitan datos y supuestos adecuados; una ETc estimada **no es** un volumen real ahorrado. Para estimar riego también debe considerarse precipitación efectiva y balance de agua.

## 5. Campos obligatorios de procedencia

Cada dato o indicador utilizado debe conservar: `provider`, `dataset`, `version`, `url`, `retrieved_at`, `time_range`, `location`, `unit`, `spatial_support`, `quality_flags`, `processing_steps`, `known_limitations` y `input_origin` (`medido | declarado | estimado | desconocido`).

## 6. Control de licencias

Antes de distribuir datos, capturas de mapa o teselas, verificar licencia y atribución vigentes del proveedor. No asumir que toda imagen abierta es reutilizable en cualquier formato. Registrar una comprobación de licencias en la entrega final.

**Fecha de revisión:** 2026-11-14. El bloque inicial describe las integraciones reales; la matriz de referencia histórica de abajo conserva fuentes propuestas que no deben darse por conectadas.
