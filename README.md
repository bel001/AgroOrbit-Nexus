# AgroOrbit Nexus — From Space to Soil

Plataforma agrícola de alcance mundial: clima histórico NASA POWER para coordenadas globales y análisis agrícola condicionado a la evidencia regional. Virú, Perú, es solo la demostración inicial. Sin login ni base de datos.

**Publicado y verificado el 14 de noviembre de 2026:** [abrir AgroOrbit Nexus]([dirección retirada]) · [demo de siete diapositivas en inglés]([dirección retirada]/submission/index.html) · [PDF]([dirección retirada]/submission/agroorbit-nexus-demo.pdf). También funciona en localhost. Clima NASA real; Virú ilustrativo con fichas INIA/MIDAGRI/FAO, sin validación agronómica de parcela o rotaciones. HLS/NDVI pendiente. Sin envío NASA comprobado.

## Ejecutar

Requisitos: Node.js 24, npm y acceso a NASA POWER/teselas OSM.

```powershell
npm ci
npm run dev
```

Abrir http://127.0.0.1:3000. Para producción local: `npm run build` y `npm start`. No se requieren claves. `.env.example` documenta esa ausencia; no guardar secretos en Git.

## Recorrido comprobable

1. Buscar una localidad/código postal, elegir un resultado y ajustar el punto en el mapa. También hay «Usar mi ubicación» con permiso del navegador y entrada manual de coordenadas. Al iniciar no hay coordenadas ni campañas precargadas. [Cómo encontrar el terreno](docs/LOCATION_SEARCH.md).
2. Consultar clima global o registrar una secuencia propia para diagnóstico parcial. No se generan alternativas sin un perfil regional aplicable. Para reproducir el piloto, pulsar «Cargar caso ilustrativo».
3. Elegir un periodo histórico de 30 a 731 días; solo la demo de Virú usa 540 días. Se descargan temperatura media/mínima/máxima y precipitación corregida de NASA POWER (comunidad AG, LST).
4. Examinar gráfica, tabla mensual, unidades, días ausentes, fuente y fecha. La grilla no es una medición de la parcela.
5. En la demo explícita de Virú, comparar A con maíz–frijol–maíz (B) y maíz–sorgo–frijol (C). Estas plantillas no se reutilizan en otros países. No existe todavía ninguna región con análisis agronómico validado ni recomendaciones habilitadas.
6. Abrir restricciones y fuentes; descargar JSON con entradas, clima diario, metadatos, reglas y límites. Imprimir el informe desde el navegador.

Si NASA falla, aparece un error y un informe parcial; no hay clima simulado de respaldo. Al editar datos, se señala que el informe anterior requiere recalcularse. El fixture NASA de pruebas no se usa en producción.

## Verificar

```powershell
npm run verify:skills
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:nasa
npm run verify:global
node scripts/verify-worldcover.mjs
npx playwright install chromium
```

Con `npm start` en otra terminal, ejecutar `npm run test:e2e`. Las pruebas de navegador requieren red; las unitarias usan un fixture NASA real y alteraciones controladas. Resultados y capturas: [VALIDATION](docs/VALIDATION.md), [STATUS](docs/STATUS.md), [evidencias](docs/evidence/).

## Alcance científico

- Catálogo general FAO separado de fichas INIA 619/404 y contexto MIDAGRI. Variedades candidatas documentadas, sin identificar la realmente sembrada ni validar calendario local. Frijol de demo: supuesto de 135 días hasta cosecha, no 98 de madurez fisiológica. Fuentes/páginas/límites visibles y exportados.
- Horizonte común configurable; la demo mantiene 540 días. Intervalos [siembra,cosecha), conteos de repetición/familias e intervalos sin cultivo registrado.
- No se calcula ETo/ETc, ahorro de riego, nitrógeno fijado, rentabilidad, rendimiento ni daño del suelo. Un presupuesto positivo de agua no demuestra suficiencia.
- La prioridad guía la revisión; no existe puntuación ni ranking validado. En el catálogo actual ninguna alternativa se certifica viable.
- Capa opcional de cobertura terrestre ESA WorldCover 2021, con fuente/licencia y sin uso para recomendar cultivos. Sin procesamiento HLS/NDVI, clasificación propia ni modelo predictivo entrenado.

Catálogo ampliable, perfiles regionales versionados, nombres localizados y contratos de fuentes/reglas: [alcance global y pruebas internacionales](docs/GLOBAL_SCOPE.md). La interfaz completa actual está en español; el registro admite contenido de nuevos idiomas. Las pruebas verifican seis consultas NASA internacionales; no acreditan aptitud agronómica ni carga masiva.

## Tecnología y diseño

Next.js 16, React 19, TypeScript estricto, Tailwind 4, MapLibre 6, Recharts 3, Zod 4, Vitest 5, Playwright y axe. Versiones exactas en package-lock.json. Formularios nativos accesibles; no se añadió shadcn/ui para duplicarlos. Impeccable instalado en `.agents/skills/impeccable`; tres skills originales científicas/de verificación en el mismo directorio. [Fuentes, versiones y uso](docs/SKILLS.md), [contexto](PRODUCT.md), [diseño](DESIGN.md).

## Entrega y licencias

Código original MIT, elegido por el usuario. [Atribuciones y condiciones de terceros](docs/THIRD_PARTY_NOTICES.md). NASA POWER es fuente de datos; no hay afiliación ni aval NASA.

[Cumplimiento 2026 y puntos sin verificar](docs/NASA_COMPLIANCE.md), [uso real de IA](docs/AI_USAGE.md), [guion ES/EN y envío](docs/DEMO.md), [despliegue](docs/DEPLOYMENT.md). El push a GitHub no publica la aplicación ni envía el proyecto al concurso.

Repositorio esperado: https://github.com/bel001/AgroOrbit-Nexus.git. Documentación inicial conservada en el primer commit; metodología actual en [METHODOLOGY](docs/METHODOLOGY.md).

> AgroOrbit Nexus is an explainable crop-rotation scenario tool. It combines real NASA POWER historical climate with farmer-provided context and transparent evidence gaps. It does not certify local agronomic suitability or predict yields.
