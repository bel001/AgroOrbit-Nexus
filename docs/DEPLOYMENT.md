# Despliegue y operación

2026-11-14. Se conservan dos destinos con los mismos componentes, validaciones, motor y adaptador NASA. No requieren claves ni base de datos.

## Localhost con Next.js

Node.js 24 y npm: `npm ci`, `npm run dev`; abrir http://127.0.0.1:3000. Producción local: `npm run build`, después `npm start`. El servidor permanece ligado a 127.0.0.1. No hace falta publicar para probar localmente. Para hosting Node propio usar `npx next start --hostname 0.0.0.0 --port 3000` detrás de TLS/proxy; no exponer servidor de desarrollo. GitHub Pages estático no ejecuta estas API.

## Paquete público para Sites

`npm run build:hosting` genera `dist/server/index.js`: Worker ESM con fetch y assets gzip embebidos, sin dependencias Node en ejecución. `hosting/client.tsx` monta los componentes React compartidos; las rutas API usan los mismos handlers Request/Response que Next. Es un destino cliente/Worker, no Next SSR. El alias de carga dinámica solo se aplica en este build. esbuild/PostCSS son dependencias fijadas en lockfile.

Para comprobar el artefacto: `node scripts/preview-hosting.mjs`, abrir http://127.0.0.1:8787; fijar `PLAYWRIGHT_BASE_URL` para ejecutar e2e contra ese puerto o una URL desplegada. El puente Node es solo para prueba local, no el servidor de producción. Build actual: 15 assets, Worker 1 673 407 bytes; el tamaño puede variar al cambiar contenido o compilador.

El plugin oficial Sites registra identidad en `.openai/hosting.json`, sincroniza fuente con su helper oficial y empaqueta el build. Credenciales temporales solo en memoria/stdin del helper. `origin` de GitHub se conserva; no se guarda token ni se fuerza historial. Fuente exacta y archive deben corresponder al commit publicado. CI comprueba ambos builds; no despliega automáticamente.

## Resultado de publicación

Sitio registrado, audiencia pública configurada conforme a petición del usuario. **Publicación pendiente de ejecución y verificación.** No presentar la URL prevista como un despliegue probado. Se completará aquí el resultado real, versión, commit y pruebas del enlace.

Producto: `/`. Demo de siete diapositivas: `/submission/index.html` (también `/submission/` en Worker). PDF: `/submission/agroorbit-nexus-demo.pdf`. La presentación no realiza el envío al portal NASA.

## Operación y límites

Salida HTTPS necesaria a NASA POWER y geocoding; navegador solicita teselas OSM/ESA. POWER: caché exacta de 64 consultas/24 h, cuatro peticiones en vuelo y 25 s de timeout por instancia. No es límite distribuido. Cuerpo máximo de perfil 32 KiB; no hay base de datos de usuarios ni persistencia de perfiles. NASA solo recibe coordenadas/fechas/parámetros, no nombre del terreno.

Este alojamiento se prepara para demostración pública, sin ensayo de carga ni SLA. Para producción con tráfico sostenido hacen falta cuota/caché distribuidas, observabilidad y proveedor de mapas/geocoding acorde a sus términos. Los informes descargados contienen datos aportados: revisar nombre/coordenadas antes de compartirlos. Límites del proveedor y dependencias: THIRD_PARTY_NOTICES/LOCATION_SEARCH.

NASA caída → error visible e informe sin clima; no fallback inventado. Teselas/WebGL caídos → coordenadas alternativas. Fuentes locales insuficientes → evaluación incompleta. Sin HLS/NDVI, cuentas, importador de perfiles ni predicción económica.
