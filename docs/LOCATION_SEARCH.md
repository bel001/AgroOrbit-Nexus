# Encontrar el terreno

Actualización 2026-11-14: buscador global de localidades/códigos postales y ubicación del dispositivo, accesibles desde el perfil agrícola.

## Recorrido

1. Escribir una localidad cercana; añadir país o región ayuda a distinguir homónimos. Pulsar «Buscar lugar» o Enter, sin enviar todavía el análisis climático.
2. Elegir entre hasta cinco resultados con región, país y coordenadas. El mapa se centra y se acerca al punto de referencia.
3. Ajustar el lugar de siembra con zoom/clic en el mapa o coordenadas. La búsqueda no identifica automáticamente una parcela ni sus límites.
4. Si el usuario está en el terreno, «Usar mi ubicación» pide permiso al navegador y muestra la precisión aproximada comunicada por el dispositivo. No se consulta GPS al abrir la página ni se hace seguimiento continuo. Si cambió el punto mientras llegaba la respuesta GPS, se conserva la selección manual.

Las búsquedas no generan recomendaciones ni activan el perfil regional de Virú. Se conserva la protección de alcance global. El nombre del terreno y los datos agronómicos siguen siendo aportados por el usuario.

## Fuente y operación

[Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api), basado en GeoNames; atribución en la interfaz. Sirve para localidades/códigos postales, no garantiza nombres de fundos, direcciones de calles ni catastro. Solo se consulta tras una acción explícita, con término de 3–120 caracteres y máximo cinco coincidencias. No hay autocompletado por cada tecla.

API de aplicación: `GET /api/locations?q=...`, validación Zod, timeout upstream 10 s, deduplicación y caché acotada a 128 términos por 24 h; máximo una nueva consulta por segundo y proceso. Fallos, ausencia de resultados y rate limit tienen mensajes y conservan las alternativas manuales. Para varias instancias se necesita limitación compartida y revisar cuotas del proveedor.

Se usa el servicio gratuito para el prototipo no comercial; [sus condiciones](https://open-meteo.com/en/terms) requieren otro plan para uso comercial. Los datos tienen atribución CC BY 4.0; no se confunde esa licencia con las condiciones de acceso al servicio. No se añadieron claves, costes ni paquetes. El clima continúa consultándose a NASA POWER.

La geolocalización requiere permiso y un contexto seguro; localhost permite probarla en navegadores compatibles. Puede fallar o ser poco precisa en un equipo de escritorio. La posición se mantiene en el formulario; al consultar clima se usan esas coordenadas. La app no envía la precisión GPS al buscador ni determina propiedad del terreno.

## Evidencia

`node scripts/verify-geocoding.mjs`: consulta real de «Virú, Perú», HTTP 200, cinco coincidencias; URL/fecha y respuesta original en `docs/evidence/search/`. No son cinco parcelas de campo validadas.

Pruebas nuevas: normalización/ambigüedad/cero geográfico, límites, error upstream, cache/deduplicación; navegador con búsqueda real, actualización de coordenadas, ausencia de solicitud climática automática, GPS emulado con precisión, permiso denegado y caída simulada del buscador. El GPS real de hardware no fue medido. Capturas e inspección accesible: `docs/evidence/search/`.
