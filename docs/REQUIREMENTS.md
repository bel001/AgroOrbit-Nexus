# Requisitos de producto — AgroOrbit Nexus

**Estado actualizado 2026-11-14:** RF-01/02/03/04/06/08/09/10 tienen implementación y pruebas locales; RF-05/07 parciales por falta de calendario/variedad y reglas regionales. RF-11/12/13/14 pendientes; prioridad capturada sin ranking validado. Acceso público RNF-08 pendiente. Véanse STATUS y VALIDATION; la tabla siguiente conserva los criterios de aceptación, no acredita por sí sola su cierre.

## Requisitos funcionales

**Alcance mundial obligatorio:** RF-01/03 deben operar globalmente; RF-05/07/08 dependen de perfiles regionales y no pueden extrapolar la demo. El periodo es configurable, sin ventanas agrícolas universales. La aplicación distingue clima/diagnóstico parcial, no recomienda sin evidencia suficiente, admite crecimiento de países/catálogos/idiomas y documenta la cobertura real de fuentes satelitales. Implementación y matriz de pruebas internacionales: GLOBAL_SCOPE.

| ID | Prioridad | Requisito | Criterio de aceptación |
|---|---|---|---|
| RF-01 | P0 | Seleccionar ubicación válida | Mapa/coordenadas y verificación de latitud/longitud |
| RF-02 | P0 | Registrar perfil agrícola | Soporta suelo, riego, prioridades, historial y desconocido |
| RF-03 | P0 | Consultar NASA POWER | Solicitud real con rango, comunidad AG, unidades y errores visibles |
| RF-04 | P0 | Mostrar diagnóstico climático | Gráficos y metadatos de fuente/fecha/resolución; faltantes explícitos |
| RF-05 | P0 | Catálogo documentado | Cada cultivo incluye fuente, zona/variedad aplicable y fechas |
| RF-06 | P0 | Capturar rotación actual | Secuencia con cultivo y comienzo/fin de cada ciclo |
| RF-07 | P0 | Evaluar restricciones | Calendario, agua conocida, clima y suelo sin reemplazar faltantes |
| RF-08 | P0 | Comparar tres estrategias | Horizonte común y diferencias explicadas sin ranking arbitrario |
| RF-09 | P0 | Indicadores de manejo | Diversidad/repetición y cobertura solo cuando datos lo permitan |
| RF-10 | P0 | Informe trazable | Fuentes, supuestos, incertidumbre, datos y advertencias |
| RF-11 | P1 | Monitor histórico de vegetación | Un caso con serie comparable, calidad y fecha verificables |
| RF-12 | P1 | Capa de cobertura agrícola | Probabilidad/clase de cobertura, no límites ni cultivo específico |
| RF-13 | P1 | Recalcular al variar prioridad | Resultados consistentes con entradas y criterios |
| RF-14 | P2 | Escalar a nuevas regiones | Configurar catálogos y reglas regionales sin recodificar el núcleo |

## Requisitos no funcionales

- **RNF-01 Usabilidad:** interfaz en español, responsiva, navegable y comprensible para agricultores.
- **RNF-02 Transparencia:** cada resultado indica su fuente, fecha, unidad y supuesto.
- **RNF-03 Reproducibilidad:** mismo conjunto de entradas + datos/versiones produce mismo resultado.
- **RNF-04 Robustez:** errores de API, datos vacíos o valores inesperados no generan resultados falsos.
- **RNF-05 Privacidad:** sin cuentas obligatorias en MVP; no subir datos personales sin necesidad.
- **RNF-06 Seguridad:** entradas validadas, credenciales fuera del repositorio y servicios controlados.
- **RNF-07 Rendimiento:** caché y carga diferida donde sea apropiado, sin saturar proveedores.
- **RNF-08 Acceso:** enlace público demostrable, cuando el despliegue haya sido verificado.

## Datos mínimos por entidad

### Terreno

- `id_local`, ubicación (`lat`, `lon`), nombre opcional, `area_ha` opcional, polígono opcional.
- Suelo: textura, pH opcional, drenaje, materia orgánica opcional y fuente.
- Agua: tipo de riego y disponibilidad conocida o desconocida.

### Campaña

- Cultivo identificado (especie/variedad cuando se conoce).
- Fechas de siembra/cosecha o período estimado.
- Tipo de procedencia: **declarado / medido / estimado / desconocido**.

### Dato climático

- Fuente/producto, variable, unidad, fecha, valor, identificador de versión y banderas de calidad.

### Resultado

- Alternativa, restricciones satisfechas/incumplidas/no evaluables, indicadores, explicación y evidencias.

## Historias de usuario

1. **Como agricultor**, quiero registrar que sembré maíz varias campañas para comparar opciones sin tener que interpretar fórmulas.
2. **Como agrónomo**, quiero revisar por qué se descartó una secuencia antes de aceptar cualquier sugerencia.
3. **Como usuario**, quiero saber si el sistema no conoce mi tipo de suelo, en vez de recibir valores inventados.
4. **Como evaluador**, quiero reproducir un caso y comprobar que los resultados provienen de la misma entrada.
5. **Como investigador (P1)**, quiero comparar un índice de vegetación en fechas equivalentes sin confundir cosecha con degradación.

## Fuera de alcance del MVP

- Identificación automática verificable de especies de cultivos en todo el mundo.
- Diagnóstico de plagas, fertilidad, erosión o enfermedad desde NDVI por sí solo.
- Pronóstico de precios, ingresos, rendimiento o ahorros reales de riego.
- Recomendación obligatoria o sustitución del especialista agrónomo.

## Criterio de cierre

Solo marcar un RF como implementado cuando haya código ejecutable, prueba o evidencia de funcionamiento, y actualización de [`STATUS.md`](STATUS.md).
