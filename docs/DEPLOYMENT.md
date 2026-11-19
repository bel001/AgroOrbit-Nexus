# Despliegue y operación

**Revisión local 2026-11-15:** las correcciones de IMPLEMENTATION_MATRIX quedaron publicada en Vercel el 2026-11-19 (commit `24a06b9`, https://agroorbit-nexus.vercel.app); Vercel reporta la producción como Ready. Las pruebas de navegador contra el link público no se repitieron para esta versión: la red de desarrollo bloquea `*.vercel.app`. Las 31 pruebas aprobadas contra el link público del 2026-11-15 corresponden a la versión anterior (`27ac90f`).

**2026-11-15: producción en Vercel** (https://agroorbit-nexus.vercel.app), proyecto Next.js estándar (`next build`), desplegado con la CLI de Vercel por instrucción del usuario; sin variables de entorno ni claves. Los snapshots NASA de `src/data/` viajan en el build del servidor y sostienen la demo si la API falla. Verificación: suite e2e completa con `PLAYWRIGHT_BASE_URL` apuntando a esa URL.

2026-11-14. **Modalidad anterior: solo localhost.** El usuario retiró la autorización de acceso público al alojamiento anterior. Se conservan dos destinos técnicos con los mismos componentes, validaciones, motor y adaptador NASA; ninguno se debe publicar sin una instrucción posterior. No requieren claves ni base de datos.

## Localhost con Next.js

Node.js 24 y npm: `npm ci`, `npm run dev`; abrir http://127.0.0.1:3000. Producción local: `npm run build`, después `npm start`. El servidor permanece ligado a 127.0.0.1. No hace falta publicar para probar localmente. Para hosting Node propio usar `npx next start --hostname 0.0.0.0 --port 3000` detrás de TLS/proxy; no exponer servidor de desarrollo. GitHub Pages estático no ejecuta estas API.

## Paquete público para Sites

`npm run build:hosting` genera `dist/server/index.js`: Worker ESM con fetch y assets gzip embebidos, sin dependencias Node en ejecución. `hosting/client.tsx` monta los componentes React compartidos; las rutas API usan los mismos handlers Request/Response que Next. Es un destino cliente/Worker, no Next SSR. El alias de carga dinámica solo se aplica en este build. esbuild/PostCSS son dependencias fijadas en lockfile.

Para comprobar el artefacto: `node scripts/preview-hosting.mjs`, abrir http://127.0.0.1:8787; fijar `PLAYWRIGHT_BASE_URL` para ejecutar e2e contra ese puerto o una URL desplegada. El puente Node es solo para prueba local, no el servidor de producción. Build actual: 15 assets, Worker 1 673 407 bytes; el tamaño puede variar al cambiar contenido o compilador.

El plugin oficial Sites registra identidad en `.openai/hosting.json`, sincroniza fuente con su helper oficial y empaqueta el build. Credenciales temporales solo en memoria/stdin del helper. `origin` de GitHub se conserva; no se guarda token ni se fuerza historial. Fuente exacta y archive deben corresponder al commit publicado. CI comprueba ambos builds; no despliega automáticamente.

## Antecedente del alojamiento retirado (no corresponde a Vercel)

**Acceso público retirado y verificado:** política restringida a la cuenta propietaria y HTTP 401 sin sesión. En esa etapa no había URL pública aprobada; Vercel se publicó posteriormente, como se identifica al inicio. Se eliminaron de los archivos vigentes las referencias a la dirección anterior. Los antecedentes de pruebas conservan resultados sin esa dirección; no prueban disponibilidad actual. No se borraron commits anteriores ni el registro privado del proveedor: las herramientas disponibles no permiten eliminar el sitio, y no se fuerza el historial Git.

La versión 1 devolvía assets con doble gzip: Cloudflare recomprimía bytes ya comprimidos. Corregido con `encodeBody: manual`, según [Response de Cloudflare](https://developers.cloudflare.com/workers/runtime-apis/response/). Se verificó contenido descomprimido HTML/JS y firma PDF, no solo HTTP 200. Worker corregido: 1 673 431 bytes.

Antes del retiro se aprobaron seis comprobaciones de contenido/API y 22 e2e, con dos repeticiones ESA omitidas y cero fallos. Hubo NASA/geocoding/ESA reales y axe. Son antecedentes históricos, separados de la corrección final de impresión probada en Next local. Para un futuro alojamiento autorizado, `node scripts/verify-public.mjs <URL_APROBADA>` comprueba el contenido; no usar una dirección con alias personal sin acuerdo del usuario. Sin prueba de carga masiva ni certificación WCAG.

Producto: `/`. Demo de siete diapositivas: `/submission/index.html` (también `/submission/` en Worker). PDF: `/submission/agroorbit-nexus-demo.pdf`. La presentación no realiza el envío al portal NASA.

## Operación y límites

Salida HTTPS necesaria a NASA POWER y geocoding; navegador solicita teselas OSM/ESA. POWER: caché exacta de 64 consultas/24 h, cuatro peticiones en vuelo y 25 s de timeout por instancia. No es límite distribuido. Cuerpo máximo de perfil 32 KiB; no hay base de datos de usuarios ni persistencia de perfiles. NASA solo recibe coordenadas/fechas/parámetros, no nombre del terreno.

Una futura demostración pública requerirá alojamiento aprobado, sin prometer SLA o carga masiva. Para tráfico sostenido hacen falta cuota/caché distribuidas, observabilidad y proveedor de mapas/geocoding acorde a sus términos. Los informes descargados contienen datos aportados: revisar nombre/coordenadas antes de compartirlos. Límites: THIRD_PARTY_NOTICES/LOCATION_SEARCH.

NASA caída → error visible e informe sin clima; no fallback inventado. Teselas/WebGL caídos → coordenadas alternativas. Fuentes locales insuficientes → evaluación incompleta. Sin HLS/NDVI, cuentas, importador de perfiles ni predicción económica.
