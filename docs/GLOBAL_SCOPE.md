# Alcance global de AgroOrbit Nexus

**Revisión local 2026-11-15:** catálogo general de seis especies; polígonos opcionales y MODIS del entorno. No hay nuevas regiones aprobadas. Histórico fijo restringido al punto/calendario exactos de Virú, no a toda su caja geográfica. Moneda de tarifa seleccionable. Los nuevos contratos y límites vigentes están en IMPLEMENTATION_MATRIX, METHODOLOGY y AGRONOMIC_REVIEW.

Requisito obligatorio incorporado el 2026-11-14. Virú es solo el piloto inicial: ni sus coordenadas ni sus cultivos/calendarios limitan el software. El piloto sigue siendo ilustrativo, no un caso agronómico validado.

## Comportamiento actual

La interfaz inicia en mapa mundial, con coordenadas vacías y sin campañas precargadas. Acepta latitud −90…90 y longitud −180…180 para POWER; el mapa Mercator advierte sus límites polares y normaliza longitudes al seleccionar copias del mundo. El botón «Ver mapa mundial» recupera la vista general.

El modo climático usa coordenadas y periodo histórico configurable de 30 a 731 días. Su rango inicial 2024 es una selección de datos históricos, no un calendario agrícola. La consulta conserva LST, fuentes, unidades, versión y faltantes. No se geocodifica país ni se presume uso agrícola por un clic.

En modo de registros se examina únicamente la secuencia aportada por el usuario. B/C solo aparecen si se carga explícitamente la demo de Virú, se conserva `illustrative=true`, se usa su periodo de 540 días y las coordenadas pertenecen al ámbito declarado del perfil. Cambiar coordenadas desactiva la plantilla. Enviar su ID desde Francia, Kenia o Australia no permite reutilizarla. Los registros existentes se conservan para que el usuario los revise; no se trasladan reglas.

La cobertura del informe distingue `climate-only` de `partial`, incluye perfil/version/fuentes y `recommendationsAllowed=false`. **Ninguna región cuenta hoy con análisis agronómico validado**. Un perfil con datos revisados necesitará responsable, fecha y evidencia; esa metadata por sí sola tampoco habilitará recomendaciones: faltan implementación y validación del evaluador local completo.

## Contratos de extensión

| Módulo | Extensión y protección |
|---|---|
| `src/lib/catalog.ts` | Catálogo de hechos generales con identificadores estables, nombres localizados, especie, familia, rangos y fuentes. `createCropCatalog` valida entradas. El enum del formulario se deriva de sus claves; añadir una especie no exige modificar un enum independiente del motor |
| `src/lib/regions.ts` | Perfiles versionados: nombres por idioma, códigos de país, área de aplicación, especies, fuentes, revisión y reglas por variedad/periodo. Contiene el único perfil ilustrativo actual, no un catálogo mundial de aptitud |
| `regionalRuleSchema` | Contrato para reglas de ventanas, pH, temperatura y agua, con especie, variedad, vigencia, parámetros, supuestos y fuente. No hay umbrales regionales aprobados ni ejecución automática de esos parámetros todavía |
| `src/lib/examples/viru.ts` | Caso separado del modelo global. Las duraciones/fechas del ejemplo no inicializan terrenos de otros países |
| `src/lib/locales.ts` | Búsqueda de nombres con fallback y registro de idiomas. Catálogo/perfiles incluyen ES/EN; interfaz completa actual en español. No se afirma traducción completa al inglés |
| `src/lib/sources.ts` | Contrato de fuente por cobertura, producto, versión, periodo, resolución, licencia y límites. No atribuir a NASA productos ESA |

La caja del perfil Virú es un ámbito **aproximado de demostración**, no límite administrativo, predial ni zona de validación científica. `containsLocation` admite cajas que cruzan el antimeridiano; no hace reverse geocoding ni infiere país.

Para incorporar una región: añadir sus especies con fuentes al catálogo; definir perfil y variedad/periodo con revisión y evidencia; implementar y probar el evaluador pertinente con casos independientes; comprobar coordenadas, unidades, faltantes y ausencia de contaminación entre regiones; actualizar el informe de cobertura y la documentación. Los perfiles sin evaluador validado conservan diagnóstico parcial. Para nuevos idiomas se añaden nombres/diccionarios y se traduce la interfaz progresivamente; no cambiar identificadores ni unidades científicas.

## Contexto satelital real y límites

Se integró una capa **opcional** ESA WorldCover 2021 v200 a través del WMS anunciado por [el proveedor](https://esa-worldcover.org/en/data-access). Se comprobó GetCapabilities y una respuesta PNG HTTP 200; `TIME=2021-01-01` es obligatorio. La interfaz indica estado de carga/fallo, periodo, atribución y licencia CC BY 4.0. El servicio anuncia cobertura −60°…83°, no toda la superficie polar.

Es clasificación histórica de cobertura terrestre, que incluye cropland; no identifica una especie ni determina cultivo actual, rotación, límites prediales o aptitud. El informe la registra como fuente contextual sin uso en reglas. No se calculan hectáreas ni cambios de cobertura. HLS/NDVI por parcela, control de nubes y comparación fenológica siguen pendientes; no se añadieron series falsas ni capas NDVI sin validar.

## Verificación reproducible

- `npm run verify:global`: seis respuestas NASA reales, guardadas por separado para Virú, California, Francia, Kenia, India y Australia; cuatro variables y siete días de enero 2024. Son consultas climáticas, no parcelas de estudio validadas.
- `node scripts/verify-worldcover.mjs`: capa/periodo anunciados, firma PNG, CORS, URL y fecha en `docs/evidence/global/worldcover-service.json`.
- `npm test`: pruebas nuevas para ambos hemisferios, latitudes polares, antimeridiano, catálogos ampliables, idiomas y bloqueo de la demo fuera de ámbito. Fixtures climáticos de países distintos son reales; las alteraciones/perfiles de prueba se identifican como sintéticos.
- Playwright: consultas reales de California/India/Australia en escritorio, móvil y tablet; sin estrategias generadas y con informe descargable. Capa real verificada en escritorio; no se repitió la red de teselas en móvil/tablet. Se mantiene la demo de tres estrategias y sus errores controlados.

No se realizaron pruebas de miles de usuarios simultáneos, traducción completa, validación agronómica internacional ni despliegue externo. La arquitectura es extensible, no una afirmación de capacidad de producción masiva: la caché y límites de solicitudes siguen siendo por proceso y necesitan infraestructura compartida al escalar tráfico.
