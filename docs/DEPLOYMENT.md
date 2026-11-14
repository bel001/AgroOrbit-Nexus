# Despliegue y operación

Actualizado: 2026-11-14. Compilación y servidor de producción local verificados; **no hay URL pública de despliegue probada**.

## Operación reproducible

Node.js 24 y npm. `npm ci`, `npm run build`, `npm start`. URL local http://127.0.0.1:3000. Para desarrollo `npm run dev`. El script fija 127.0.0.1 para pruebas locales. No hay variables obligatorias ni API keys: POWER es público y OSM se carga interactivamente. La aplicación necesita salida HTTPS a ambos servicios.

La caché de clima es por proceso, máximo 64 consultas exactas durante 24 h, 4 peticiones en vuelo y timeout 25 s. No constituye limitación global distribuida. El cuerpo del perfil se valida en servidor (32 KiB). No se persisten perfiles; los informes JSON pueden contener nombre y coordenadas aportados por el usuario: compartirlos conscientemente.

## Publicar en un proveedor compatible con Next.js

1. Importar el repositorio en una cuenta autorizada de Vercel u otro servicio con rutas de servidor Node. GitHub Pages estático no ejecuta este endpoint.
2. Seleccionar Node 24; instalación `npm ci`, build `npm run build`. En contenedor propio, ejecutar `npx next start --hostname 0.0.0.0 --port 3000` y colocar TLS/proxy del proveedor. No exponer el servidor de desarrollo.
3. Reservar tiempo de ejecución superior al timeout NASA (al menos 35 s). Para tráfico compartido, añadir rate limit/caché externos y proveedor de teselas apropiado: los límites actuales son por instancia.
4. Respetar políticas y atribución OSM; no precargar teselas. Verificar disponibilidad de NASA desde la región de alojamiento.
5. Probar sin login en ventana privada: mapa/coordenadas, consulta NASA, error visible, tres estrategias y descarga JSON. Revisar móvil y teclado.
6. Registrar URL, commit, fecha y capturas del servicio público en STATUS. No sustituir una URL prevista por una publicación comprobada.

No se creó una cuenta de hosting ni se realizó despliegue. No hubo credenciales de hosting verificadas en esta sesión. GitHub Actions comprueba código, pero no despliega ni envía al portal NASA.

## Degradación segura

NASA caída: error explícito e informe sin clima. Teselas/WebGL no disponibles: coordenadas editables y advertencia. Datos locales incompletos: no certificar viabilidad. HLS/NDVI: P1 sin implementación. Recargar página descarta cambios en memoria; el JSON descargado conserva el informe, sin importador de perfiles todavía.
