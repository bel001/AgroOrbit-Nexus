# Sistema visual — AgroOrbit Nexus (v2, 2026-11-14)

Interfaz guiada en cinco pasos, moderna y tranquila: tarjetas claras sobre fondo marfil con degradados suaves, verde forestal como marca y azul cielo para el agua y el clima. El color nunca es la única señal: siempre va acompañado de texto. Fuente de los tokens: `src/app/globals.css` (`:root`).

## Tokens

| Categoría | Tokens | Uso |
|---|---|---|
| Marca | `--brand` #1f6b4f, `--brand-strong` #134634, `--brand-soft`, `--brand-tint` | Acciones principales, pasos completados, foco de inputs |
| Neutros | `--bg`, `--surface`, `--surface-2`, `--ink` #13261f, `--ink-2` #46594f, `--line`, `--line-strong` | Fondo, tarjetas, texto principal y secundario (≥ 4,5:1) |
| Acentos | `--sun` (decorativo), `--sky` #3f87b5 (agua y lluvia) | Ilustración, barras de demanda hídrica, gráfica de lluvia |
| Estados | `--warn-*`, `--error-*`, `--focus` | Avisos, errores, contorno de foco de 3 px |
| Tipografía | Source Sans 3 (400/600/700, OFL-1.1, autoalojada). `--h1` 40–66 px, `--h2` 26–34 px, `--h3` 20 px; cuerpo 17 px | Títulos en 700 con tracking negativo |
| Espacio | `--s1`…`--s8` = 4/8/12/16/24/32/48/72 px | Rellenos y separaciones |
| Forma | `--r-sm` 8, `--r-md` 12, `--r-lg` 20, `--r-xl` 28, `--r-pill` | Inputs 12, tarjetas 28, botones en píldora |
| Elevación | `--shadow-sm`, `--shadow-md`, `--shadow-lg` | Tarjetas (md), barra de acción (lg) |
| Movimiento | `--ease`, `--ease-spring`, `--t-fast` 150 ms, `--t-med` 260 ms, `--t-slow` 520 ms | Transiciones y entradas |

## Componentes

- **Botón** (`.button`): primario verde; variantes `secondary`, `ghost`, `light`, `big`; `icon-button` para quitar filas. Estados: hover (eleva 2 px y brillo, solo con puntero fino), active (escala 0,98), disabled (opacidad 0,6), foco visible.
- **Navegación de pasos** (`.steps` en la cabecera fija): resalta el paso visible según el scroll y marca con ✓ los completados; barra de progreso de 5 tramos con `role="progressbar"`.
- **Tarjeta** (`.card`, `.section.card`) con insignia «Paso N» (`.step-badge`).
- **Selector segmentado** (`.segmented`): radios accesibles para elegir «Solo clima global» o «Revisar mis registros».
- **Chips** (`.chip-check`) para excluir cultivos; **píldoras** (`.pill`) para el resumen de la consulta.
- **Barra de acción** (`.action-bar`): resumen de ubicación, periodo y modo, junto con el botón de consulta. Es fija abajo solo en pantallas de más de 1000 px, para no tapar controles del mapa en tablet o móvil.
- **KPI** (`.kpi`), **barras de agua** (`.water-bars`), **carga** (`.loader-card`, con órbita y barra indeterminada), **esqueleto** (`.skeleton`), **acordeones** (`.soft-details`, `.strategy-details`).
- **Mapa**: marcador propio con caída y pulso; botón flotante «Ver mapa mundial»; desplazamiento suave de la cámara.

## Movimiento

Entrada escalonada del hero y de los resultados (`rise`), satélite en órbita (`orbit`), tarjetas flotantes (`float`), contadores que suben (`CountUp`), barras que crecen (`grow`), pasos que «saltan» al completarse (`pop`), sacudida en errores (`shake`) y desplegables con chevron animado. Con `prefers-reduced-motion: reduce` se anulan animaciones y transiciones, se oculta el pulso del mapa, los contadores muestran el valor final y la cámara del mapa no se anima. Los efectos de hover que desplazan elementos solo se aplican con `(hover: hover) and (pointer: fine)`.

## Composición

Cabecera fija translúcida → hero con «Probar demo de Virú» (carga y analiza en un clic) → Paso 1 Terreno (búsqueda, coordenadas, mapa fijo a la derecha en escritorio) → Paso 2 Cultivos y periodo → barra de acción → Paso 3 Condiciones (KPI, gráfica, historial) → Paso 4 Alternativas (barras de agua, tabla, restricciones) → Paso 5 Evidencias. Por debajo de 1000 px las columnas se apilan; por debajo de 760 px los botones ocupan todo el ancho y las tablas se desplazan en horizontal sin desbordar la página. La impresión oculta la interfaz interactiva y conserva el informe.

## Verificación

Playwright (escritorio, Pixel 7 y tablet 820 px): 22 pruebas aprobadas y 2 omitidas deliberadamente; axe (WCAG 2.0/2.1/2.2 A y AA) sin violaciones en los estados probados. No equivale a una certificación WCAG ni a pruebas con usuarios.
