# Sistema de diseño — AgroOrbit Nexus Design Preview (Atlas de Campo)

Documento independiente del sistema visual vigente (`DESIGN.md`). Describe la propuesta de rediseño visual contenida en la ruta `/design-preview`. No sobrescribe la documentación de producción.

## Concepto
**AgroOrbit Nexus — Atlas de Campo.** Una plataforma geoespacial y agrícola contemporánea inspirada en atlas territoriales, cuadernos técnicos y publicaciones agronómicas. Natural pero tecnológica, científica pero comprensible, elegante sin lujo.

## Paleta (base del repositorio + evolución para evitar aspecto genérico)

Identidad conservada:
- Verde principal (marca): `#1F6B4F` (`--brand`)
- Verde profundo: `#134634` (`--brand-strong`)

Entorno cromático evolucionado (piedra/cobre, menos «SaaS verde+azul+crema»):
- Fondo: `#F1ECE2` (piedra cálida)
- Superficie: `#FBF8F2`
- Superficie 2: `#EBE4D6`
- Texto: `#1A1612` (casi negro cálido)
- Texto secundario: `#5A5046`
- Línea: `#D8CFBF`
- Agua/clima: `#2C5F6F` (teal pizarra, menos azul por defecto)
- Acento cálido: `#9A6B2F` (ocre, sustituye al amarillo sol)
- Arena: `#E4DCC8`
- Vegetación secundaria: `#5F7A3A`

## Tipografía
- Única familia: Source Sans 3 (400/600/700), ya autoalojada.
- Jerarquía por tamaño, peso y espaciado, no por familias distintas.
- Números científicos con `font-variant-numeric: tabular-nums`.

## Espaciado
Tokens `--s1`…`--s8` (4/8/12/16/24/32/48/72 px). Radios `--r-sm`…`--r-xl` (8/12/20/28). Sombras `--shadow-sm/md/lg`.

## Componentes clave del preview
- Cabecera fija translúcida con navegación de 5 pasos y selector ES/EN.
- Hero editorial con fotografía documental y transición a contenido técnico.
- Ficha cartográfica con mapa SVG esquemático, marcador, cuadrícula y leyenda.
- Línea de tiempo agrícola con imágenes botánicas.
- Panel climático con gráfica principal y KPIs discretos.
- Comparación de tres alternativas con barras de agua proporcionales y vistas Agua/Suelo/El Niño.
- Informe técnico visual con advertencia visible.
- Pie con créditos y referencias.

## Movimiento
- Solo `transform` y `opacity`.
- Interacciones 150–200 ms; revelados más lentos solo cuando aportan valor.
- Respeta `prefers-reduced-motion: reduce`.
- Sin animaciones infinitas (salvo el marcador del mapa, que se desactiva en reduced motion).

## Responsive
Diseñado expresamente para 320, 390, 768, 1024 y 1440 px. Sin desbordamiento horizontal. Tablas con scroll horizontal cuando sea necesario.

## Aislamiento
- Ruta: `/design-preview`
- Componentes: `src/components/design-preview/`
- Recursos: `public/design-preview/`
- Estilos: `design-preview.module.css` con alcance específico. No se modificó `workspace.tsx` ni `page.tsx` de producción.