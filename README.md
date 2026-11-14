# AgroOrbit Nexus — From Space to Soil

Prototipo web en español para comparar tres secuencias de cultivo con historial agrícola aportado por el usuario, clima histórico NASA POWER y restricciones explicables. Sin login ni base de datos.

**Estado al 14 de noviembre de 2026:** recorrido funcional local implementado. No se considera una recomendación agronómica validada: faltan variedades, calendarios y requisitos locales. HLS/NDVI y despliegue público pendientes. El caso de Virú es ilustrativo; el clima se consulta realmente.

## Ejecutar

Requisitos: Node.js 24, npm y acceso a NASA POWER/teselas OSM.

```powershell
npm ci
npm run dev
```

Abrir http://127.0.0.1:3000. Para producción local: `npm run build` y `npm start`. No se requieren claves. `.env.example` documenta esa ausencia; no guardar secretos en Git.

## Recorrido comprobable

1. Seleccionar un punto del mapa o escribir latitud/longitud; completar nombre, área opcional, suelo, riego, agua, procedencia e historial.
2. Mantener la etiqueta de caso ilustrativo para el ejemplo de maíz; editar la secuencia A y las fechas.
3. Consultar un horizonte histórico de 540 días. Se descargan temperatura media/mínima/máxima y precipitación corregida de NASA POWER (comunidad AG, LST).
4. Examinar gráfica, tabla mensual, unidades, días ausentes, fuente y fecha. La grilla no es una medición de la parcela.
5. Comparar A con maíz–frijol–maíz (B) y maíz–sorgo–frijol (C). Fechas, exclusiones y agua total nula pueden invalidar una estrategia. Calendario, térmica y suelo quedan incompletos cuando faltan reglas locales.
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
npx playwright install chromium
```

Con `npm start` en otra terminal, ejecutar `npm run test:e2e`. Las pruebas de navegador requieren red; las unitarias usan un fixture NASA real y alteraciones controladas. Resultados y capturas: [VALIDATION](docs/VALIDATION.md), [STATUS](docs/STATUS.md), [evidencias](docs/evidence/).

## Alcance científico

- Catálogo de tres especies con rangos generales FAO. No se confirmó calendario/variedad del piloto de La Libertad; las fechas B/C son supuestos de exploración.
- Igual horizonte de 540 días; intervalos [siembra,cosecha), conteos de repetición/familias e intervalos sin cultivo registrado.
- No se calcula ETo/ETc, ahorro de riego, nitrógeno fijado, rentabilidad, rendimiento ni daño del suelo. Un presupuesto positivo de agua no demuestra suficiencia.
- La prioridad guía la revisión; no existe puntuación ni ranking validado. En el catálogo actual ninguna alternativa se certifica viable.
- Sin HLS/NDVI, clasificación satelital ni modelo predictivo entrenado. P1 se pospone para cerrar primero validación agronómica y operación P0.

## Tecnología y diseño

Next.js 16, React 19, TypeScript estricto, Tailwind 4, MapLibre 6, Recharts 3, Zod 4, Vitest 5, Playwright y axe. Versiones exactas en package-lock.json. Formularios nativos accesibles; no se añadió shadcn/ui para duplicarlos. Impeccable instalado en `.agents/skills/impeccable`; tres skills originales científicas/de verificación en el mismo directorio. [Fuentes, versiones y uso](docs/SKILLS.md), [contexto](PRODUCT.md), [diseño](DESIGN.md).

## Entrega y licencias

Código original MIT, elegido por el usuario. [Atribuciones y condiciones de terceros](docs/THIRD_PARTY_NOTICES.md). NASA POWER es fuente de datos; no hay afiliación ni aval NASA.

[Cumplimiento 2026 y puntos sin verificar](docs/NASA_COMPLIANCE.md), [uso real de IA](docs/AI_USAGE.md), [guion ES/EN y envío](docs/DEMO.md), [despliegue](docs/DEPLOYMENT.md). El push a GitHub no publica la aplicación ni envía el proyecto al concurso.

Repositorio esperado: https://github.com/bel001/AgroOrbit-Nexus.git. Documentación inicial conservada en el primer commit; metodología actual en [METHODOLOGY](docs/METHODOLOGY.md).

> AgroOrbit Nexus is an explainable crop-rotation scenario tool. It combines real NASA POWER historical climate with farmer-provided context and transparent evidence gaps. It does not certify local agronomic suitability or predict yields.
