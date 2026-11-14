# Estado verificado — AgroOrbit Nexus

Actualizado: 2026-11-14, America/Lima. Al inicio había solo 16 documentos, sin aplicación ni Git local. El remoto público respondía vacío; cuenta GitHub bel001 autenticada. Documentación original conservada en el primer commit.

## Implementado y probado localmente

| Área | Evidencia y alcance |
|---|---|
| GeoFarm | Mapa MapLibre/OSM con selección por clic, coordenadas alternativas, perfil, historial editable, procedencia y faltantes |
| ClimateScope | Consulta real NASA POWER Daily/point; cuatro variables, AG/LST, unidades, versión, caché, timeout y error sin sustitución |
| CropKnowledge | Maíz grano, frijol seco y sorgo; rangos FAO y familias Kew. Fuente regional/variedad pendientes |
| RotationIntelligence | Tres secuencias, mismo horizonte histórico de 540 días, fechas, exclusiones, agua total nula y comprobaciones incompletas explícitas |
| SoilCare / WaterBalance | Familias, repetición e intervalos sin cultivo registrado; no se calculan salud de suelo ni ETc/ahorro |
| EvidenceReport | Informe visible, JSON descargable con clima diario y trazabilidad, vista de impresión/PDF local |
| Interfaz | Español, diseño propio con Impeccable, escritorio 1280×720/1440×1000, móvil Pixel 7/390×844, tablet 820×1180 |
| QA | 40 pruebas unitarias/API y 6 e2e; lint, tipado, build, axe y detector Impeccable sin hallazgos reportados en las comprobaciones ejecutadas |
| Dependencias | npm audit: 0 vulnerabilidades. Override minimatch 11.0.8 para dependencia de herramientas ESLint; lint/tests ejecutados tras el cambio |
| Skills | Impeccable de proyecto y tres skills originales; encabezados y rutas verificados; lectura/aplicación explícita en esta sesión |
| Licencia | MIT elegida expresamente por el usuario; Apache-2.0 conservada para Impeccable; atribuciones documentadas |

## Límites y pendientes que impiden declarar cierre científico de P0

- No hay parcela de campo ni historial real validados. Demo de Virú expresamente ilustrativa; clima NASA real.
- Catálogo sin calendario/variedad, ficha térmica/suelo y balance hídrico locales. Se devuelve evaluación incompleta; ninguna alternativa se certifica viable con estas fuentes.
- Agua positiva no se clasifica suficiente/insuficiente sin demanda fiable. ETo/ETc pendiente por datos/Kc adecuados; no ahorro, rendimiento ni rentabilidad.
- Prioridad orienta revisión, sin ranking multicriterio ni sensibilidad implementados.
- Caché por consultas exactas, no por celdas nativas; límites por proceso, sin control distribuido. Reforzar antes de exposición de tráfico público.
- HLS/NDVI y capas agrícolas siguen P1, no implementados. No se comienza procesamiento satelital con estas brechas P0 abiertas.
- Lectura íntegra de las condiciones/guía 2026 bloqueada por acceso directo; extractos oficiales y aclaraciones recuperados, detalle en NASA_COMPLIANCE.
- No hay despliegue público, video/slides publicados ni envío NASA. Pasos en DEPLOYMENT y DEMO.
- Pruebas en Chromium emulado, sin iOS/Safari/Firefox, dispositivo físico ni evaluación humana completa WCAG. Advertencias GPU ReadPixels del navegador de prueba; sin errores JS/console.error en la pasada corregida.

## Correcciones surgidas de pruebas

Importación MapLibre ESM con namespace; worker servido desde dependencia local para evitar fallo de carga del bundle; tabla desplazable accesible por teclado; línea/barra sin animaciones para capturas íntegras; conteo de historial desconocido/solapado conservado como null; selector e2e acotado para no confundir anunciador Next con alerta del producto.

La evidencia y comandos están en VALIDATION y docs/evidence. Los resultados no equivalen a validación agronómica independiente. El estado GitHub se comprueba mediante historial y referencias remotas al cerrar la entrega; no se presupone éxito por disponer de credenciales.

**Sincronización comprobada:** primer push a main exitoso, hash local/remoto 1a40ec5b5738ff32e9b42e4bb9d9e17ea48b70d9. GitHub Actions 43625941228 finalizó success en Linux (instalación limpia, skills, tipado, lint, 40 pruebas y build). Registro y commits en DELIVERY; este cierre documental añade un commit posterior, sin alterar código de aplicación.
