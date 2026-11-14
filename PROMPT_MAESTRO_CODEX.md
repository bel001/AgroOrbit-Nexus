# PROMPT MAESTRO PARA CODEX — AGROORBIT NEXUS

## Rol y misión

Actúa como un equipo interdisciplinario de ingeniería de software, arquitectura, diseño de producto y UI/UX, ciencias de datos, teledetección, agronomía, QA, seguridad y DevOps. **No te limites a darme un plan, una maqueta o pseudocódigo: trabaja en el repositorio, implementa, ejecuta, prueba, documenta y registra resultados reales con las herramientas disponibles.** No asegures haber ejecutado acciones que no hayas podido comprobar.

**Proyecto:** AgroOrbit Nexus — *From Space to Soil*.
**Repositorio GitHub previsto:** `https://github.com/bel001/AgroOrbit-Nexus.git`.
**Evento:** NASA Space Apps Challenge 2026, desafío *Field Shift: Adapting Farms with NASA Data*.
**Caso piloto:** La Libertad, Perú (Virú/Chao como opción por validar), con arquitectura escalable a otras regiones.
**Idioma:** interfaz principal en español y contenido breve en inglés para la presentación internacional; documentación técnica y mensajes de commits en español cuando resulte natural.
**Prioridad:** un prototipo funcional, veraz, accesible, visualmente excepcional y demostrable, no una colección de pantallas ficticias.

La aplicación ayuda a agricultores y asesores a seleccionar una ubicación agrícola, registrar las características conocidas del terreno y el historial de cultivos, consultar clima histórico de NASA POWER, diagnosticar riesgos observables y comparar tres estrategias de rotación por compatibilidad agronómica, agua, manejo potencial del suelo, diversidad y restricciones. Debe mostrar evidencia, fuentes, límites e incertidumbre. El diagnóstico histórico de vegetación con HLS/NDVI y la clasificación de cobertura agrícola son ampliaciones **P1**, no requisitos que deban poner en peligro el MVP.

## 0. Reglas no negociables

1. **Lee antes de construir:** inspecciona el repositorio y consulta `AGENTS.md`, `README.md`, `docs/PROJECT_SPEC.md`, `docs/REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/METHODOLOGY.md`, `docs/DATA_SOURCES.md`, `docs/VALIDATION.md`, `docs/ROADMAP.md`, `docs/MENTOR_FEEDBACK.md`, `docs/STATUS.md`, `docs/AI_USAGE.md`, `docs/DEMO.md` y `docs/DEPLOYMENT.md` si existen. No sobrescribas archivos existentes sin revisarlos. Si faltan, genera los mínimos correspondientes respetando la especificación ya disponible.
2. **La fuente de verdad es la evidencia:** distingue siempre `planificado`, `implementado`, `probado` y `bloqueado`. No simules llamadas a NASA ni inventes cifras de ahorro hídrico, mejora del suelo, rendimiento, detección de plagas, exactitud predictiva o precios.
3. **Haz cambios de extremo a extremo:** cada funcionalidad visible debe estar conectada, manejar estados vacíos/errores y funcionar con datos verificables o, si es demostración, indicar expresamente `Caso ilustrativo / datos de ejemplo`.
4. **Prioriza P0** según `docs/ROADMAP.md`; ejecuta P1 solo con un MVP estable. No comprometas tiempo ni estabilidad construyendo un modelo mundial de clasificación de cultivos.
5. **Investiga fuentes actuales:** antes de adoptar librerías, APIs, skills, requisitos legales o reglas del concurso, consulta documentación oficial vigente. Registra URL, fecha de consulta y qué verificaste. Si no hay navegación o conectividad, describe el bloqueo, usa lo ya documentado sin fingir una consulta y sigue con trabajo local.
6. **No instales código desconocido sin revisión:** inspecciona procedencia, mantenedor, licencia, cambios y comandos de instalación de skills/paquetes antes de ejecutarlos.
7. No publiques secretos, tokens, claves ni datos personales. No ejecutes comandos destructivos ni `git push --force`; no borres el trabajo preexistente. Para credenciales, gastos, permisos de marca y acciones irreversibles, sigue las autorizaciones y permisos disponibles.
8. Realiza primero las acciones y verificaciones posibles, sin detenerte para solicitar confirmación por decisiones técnicas ordinarias. Si falta una autorización obligatoria, deja el resultado local verificable y explica exactamente el paso bloqueado.

## 1. Reconocimiento del entorno y sincronización GitHub

- Ejecuta e interpreta `pwd`, `ls -la`, `git status --short --branch`, `git remote -v`, `git branch -a`, `git log -5 --oneline` cuando proceda, y reconoce si existe un proyecto Node o un repositorio vacío.
- Verifica disponibilidad de `git`, `node`, `npm`/gestor existente, `gh` y autorización con `gh auth status` cuando esté instalado. Jamás imprimas tokens.
- Usa como repositorio remoto esperado **exactamente** `https://github.com/bel001/AgroOrbit-Nexus.git`.
- Si trabajas fuera de un repositorio y la carpeta no contiene cambios importantes, **prefiere clonar el repositorio existente** y examinarlo antes de modificarlo. Si no existe repo remoto con historial y el directorio ya contiene el proyecto, inicializa Git de forma segura. No hagas `echo ... >> README.md` si ya hay un README.
- Si `origin` falta, añade `git remote add origin https://github.com/bel001/AgroOrbit-Nexus.git`. Si existe y apunta a otra URL, **no lo sustituyas silenciosamente**: informa el conflicto y preserva los datos. Si coincide, reutilízalo.
- Antes de subir, consulta el historial remoto (`git fetch`, si tienes acceso), determina si `main` existe y evita sobrescribir commits remotos. Para divergencias, detente y expón una solución no destructiva; nunca fuerces el push.
- Deja como rama final `main` **solo cuando sea seguro y compatible con el remoto**. Si el remoto está vacío, utiliza un primer commit real en español, no uno de relleno.
- Efectúa commits pequeños y lógicos **con descripción en español**, preferiblemente siguiendo Conventional Commits: `docs: organizar documentación del proyecto`, `feat(mapa): incorporar selección de terreno`, `feat(clima): integrar datos históricos de NASA POWER`, `test(rotaciones): verificar restricciones agronómicas`, `fix(api): gestionar valores faltantes`, `style(ui): perfeccionar diseño adaptable`. Se permiten prefijos técnicos estándar; el texto explicativo debe estar en español.
- Revisa `git diff --check`, archivos staged y secretos antes de cada commit. Evita `git add .` indiscriminado; agrupa por propósito. Si tienes acceso autorizado y el push es seguro, ejecuta `git push -u origin main` al finalizar hitos verificados. **Un push a GitHub NO equivale a entregar el proyecto a NASA Space Apps.**

## 2. Descubrir, evaluar, instalar y crear SKILLS

Investiga las capacidades de skills disponibles en la sesión Codex, leyendo la documentación vigente de Codex y los recursos locales. Busca primero skills ya instaladas o disponibles: `skill-installer`, `skill-creator`, skills oficiales de OpenAI y skills de revisión frontend, pruebas, accesibilidad, documentación, seguridad, Git/GitHub, teledetección y datos científicos. **No inventes comandos ni nombres de skills**: confirma disponibilidad. Si una skill oficial o de terceros mejora el proyecto, instálala y úsala de acuerdo con su licencia y documentación; si no es accesible, registra la causa y crea un procedimiento original equivalente cuando tenga sentido.

**Impeccable, específicamente:**

1. Investiga su fuente original y documentación: `https://github.com/pbakaus/impeccable` y `https://impeccable.style/`. Comprueba compatibilidad y licencia.
2. Cuando el entorno permita Node/npx y sea apropiado, usa la instalación oficial `npx impeccable install` seleccionando el alcance de **proyecto/Codex**; no supongas que ya está instalado. Inspecciona lo que agrega al repositorio. Sigue los pasos de confianza/reinicio de Codex si la instalación lo requiere.
3. Si la skill está disponible, inicializa el contexto de producto mediante su flujo `impeccable init` y usa sus capacidades de `shape`, `critique`, `audit`, `polish`, `harden` y `adapt` de acuerdo con la sintaxis soportada por Codex (por ejemplo, `$impeccable ...`). Genera y conserva `PRODUCT.md`/`DESIGN.md` cuando correspondan.
4. Usa sus criterios para mejorar **pantallas reales** y comprueba visualmente el resultado. No declares una auditoría Impeccable ejecutada si no se ejecutó. Si no puede instalarse, documenta el bloqueo y aplica manualmente controles originales de jerarquía visual, contraste, responsividad, formularios, estados y consistencia. No copies una skill de terceros ni la rebautices si no tienes los derechos o la licencia correspondiente.

**Skills propias del proyecto:** utiliza `$skill-creator` si existe o crea manualmente skills válidas bajo `.agents/skills/<nombre>/SKILL.md`, con YAML inicial `name` y `description`, instrucciones concretas, criterios de activación, entradas, salidas, verificaciones y, cuando ayuden, `references/` o `scripts/`. Crea **solo las que aporten valor no cubierto por skills existentes**; evita duplicaciones. Propongo evaluar estas seis:

- `nexus-validacion-nasa`: desafío Field Shift, condiciones del concurso, atribuciones, licencias y control de afirmaciones.
- `nexus-datos-terrestres`: NASA POWER/HLS, metadatos, unidades, calidad espacial y temporal, nubes, trazabilidad.
- `nexus-rotaciones-agronomicas`: restricciones, calendarios, compatibilidad, incertidumbre, casos de prueba y comparaciones.
- `nexus-calidad-frontend`: aplicación profesional, accesibilidad, evaluación visual, adaptación móvil y estados; **complementa, no duplica Impeccable**.
- `nexus-verificacion-mvp`: pruebas, matrices de aceptación, experiencia de demo reproducible y evidencias.
- `nexus-git-espanol`: commits por unidad lógica, revisión de secretos, sincronización segura con el remoto y reporte de push.

Verifica que Codex pueda descubrir las skills creadas, que cada `SKILL.md` tenga encabezado válido y que al menos una tarea real active y use correctamente cada skill necesaria. Documenta fuente, versión/commit o fecha de consulta, licencia y propósito de cada skill externa en `docs/SKILLS.md`. **No sacrifiques el MVP para construir una infraestructura extensa de skills.**

## 3. Cumplimiento NASA Space Apps 2026 y propiedad intelectual

Consulta y contrasta las fuentes oficiales más recientes:

- Desafío: `https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/`
- Evento y entrega: `https://www.spaceappschallenge.org/2026/`
- Condiciones: `https://www.spaceappschallenge.org/legal/`
- Guía de envío: `https://www.spaceappschallenge.org/resources/project-submission-guide`
- Marca NASA: `https://www.nasa.gov/nasa-brand-center/brand-guidelines/`

Construye `docs/NASA_COMPLIANCE.md` con una matriz de requisitos y **pruebas verificables** de cumplimiento, sin atribuir carácter obligatorio a una recomendación que no lo tiene. Alinea la entrega con impacto, creatividad, validez, relevancia y presentación, y con los requisitos vigentes de la página oficial del evento.

**Obligaciones esenciales:** registra todas las fuentes de datos, código, imágenes, iconos, mapas, bibliotecas, modelos de IA y skills reutilizadas; identifica licencias y condiciones de uso. Asegura que el contenido original se publique con una licencia open source compatible con la OSI y que los materiales de terceros sean aptos para la entrega según las condiciones. Si no existe licencia del proyecto y no hay una decisión previa, prepara **Apache-2.0 como opción documentada** y comprueba si el equipo debe aprobar la selección antes de publicarla. No pegues materiales con licencias incompatibles ni imágenes de búsqueda sin atribución/derechos.

No uses el logotipo, insignia o sello de NASA como marca de AgroOrbit Nexus sin autorización aplicable. Usa una identidad visual propia y atribuye a NASA como **fuente de datos** sin insinuar patrocinio, aval ni pertenencia institucional. Acredita NASA HLS correctamente cuando incorpore observaciones ESA Sentinel.

Registra el uso real de herramientas de IA en `docs/AI_USAGE.md` y prepara los campos para el formulario oficial. Verifica requisitos de demo (video corto o presentación), idioma, acceso público, enlaces y plazo **antes** de afirmar que la entrega cumple. Para 2026, la web anuncia el evento del 14–15 de noviembre y cierre del envío el día 15 a las 23:59 hora local; vuelve a comprobar la hora y las instrucciones oficiales. Solo el equipo puede completar el envío final en el portal si Codex no tiene acceso autorizado.

## 4. Arquitectura y stack

Respeta el stack planteado salvo justificación técnica: **Next.js, React, TypeScript estricto, Tailwind CSS, shadcn/ui, MapLibre GL JS, Recharts, Zod y Vitest**. Elige gestor de paquetes según el repositorio; usa dependencias estables y compatibles verificadas. Backend con capacidades servidor de Next.js, adaptadores de fuentes, validación con Zod y lógica de negocio independiente de la UI. Python solamente si hace falta para un procesamiento científico concreto. Evita una base de datos y cuentas obligatorias en el MVP si no aportan valor demostrable.

Define módulos separados: `GeoFarm`, `ClimateScope`, `CropKnowledge`, `RotationIntelligence`, `SoilCare`, `WaterBalance`, `EvidenceReport` y `AgroMonitor` (P1). Define contratos tipados, entradas y salidas, y preserva procedencia/fecha/unidades/advertencias. El sistema ha de ser robusto ante errores de red, timeouts, cuotas, datos incompletos y caídas de API. Agrega caché responsable para no repetir solicitudes NASA POWER sobre la misma celda y periodo.

## 5. Implementación P0: recorrido completo y verificable

1. **Terreno:** mapa navegable; escoger coordenadas válidas; nombre, área opcional, suelo, riego, historial de cultivos y prioridades. Diferenciar claramente valores `desconocido`, estimados y medidos. No inferir límites legales por un clic.
2. **Clima:** integrar la API diaria **real** de NASA POWER según documentación actual (`https://power.larc.nasa.gov/docs/services/api/temporal/daily/`). Mostrar variable, unidad, periodo, fuente, resolución/limitación y errores; manejar `fill values`/nulos sin convertirlos en cero. Visualizar temperatura, lluvia y otras variables justificadas; aclarar que no son mediciones de la parcela.
3. **Cultivos:** catálogo pequeño (2–3 especies/variedades seleccionadas con documentación aplicable al piloto), ficha de duración, requerimientos, calendario, familia y fuente. No inventar calendarios regionales ni coeficientes hídricos. Si la fuente local falta, clasificar la evaluación como incompleta.
4. **Motor de rotaciones:** registrar estrategia A (existente) y generar/evaluar B y C con igual horizonte temporal. Verificar restricciones duras antes de puntuar criterios blandos; incluir fechas de siembra/cosecha, suelo conocido, agua disponible, compatibilidad térmica, preferencias y prohibiciones. Clasificar `viable bajo supuestos`, `incompatible` o `evaluación incompleta`. Explicar decisiones y compensaciones; no declarar un óptimo universal.
5. **Suelo y agua:** mostrar diversidad de familias botánicas, repetición de cultivo, cobertura potencial y necesidades hídricas **estimadas** únicamente cuando haya datos suficientes. Para ETc y ETo, aplicar FAO-56 y coeficientes de cultivo apropiados con fórmula, unidades, etapa y fuentes verificables; diferenciar ETc de riego efectivamente aplicado. No prometer fijación real de nitrógeno ni ahorro de agua, productividad o regeneración medida.
6. **Resultado:** dashboard con mapa, línea de tiempo, 3 estrategias, métricas descriptivas, restricciones incumplidas, diferencias, supuestos, incertidumbre y **fuente de cada conclusión**. Caso demostrativo de maíz continuo en La Libertad claramente marcado como ilustrativo si no hay datos de campo.
7. **Ejecución y UX:** aplicación navegable sin login, móvil y escritorio, con estados de carga, error, vacío, éxito; inputs validados; un reporte visible y accesible. No controles sin función.

## 6. P1 opcional: datos satelitales y problemática cuantificada

Solo después de completar P0, analiza la viabilidad de un `AgroMonitor` para **una parcela/caso piloto** usando NASA HLS (`https://hls.gsfc.nasa.gov/`) e índices de vegetación, preferentemente NDVI con filtrado de calidad, nubes, fechas y comparaciones de la **misma etapa fenológica**. Puedes evaluar capas de cropland/cobertura como Dynamic World o fuentes oficiales peruanas respetando sus licencias; no atribuyas a NASA datos de ESA/Google. Distingue serie real de ejemplo y deja visible fuente y resolución. HLS se distribuye a 30 m; no prometas observación individual de pequeñas plantas o límites exactos. Su descarga/acceso puede requerir cuenta Earthdata: usa un flujo de acceso permitido y no embebas credenciales en cliente o repositorio.

**Restricción científica fundamental:** NDVI indica cambios en verdor/cobertura vegetal, NO prueba degradación del suelo, monocultivo, plagas, variedades específicas ni causa de una caída de rendimiento. Para demostrar monocultivo se necesita historial declarado o clasificación de cultivos entrenada y validada; para afirmar daño al suelo se requieren indicadores adicionales. Si faltan datos para un análisis fiable, conserva el módulo como `P1 pendiente` y muestra el diagnóstico básico P0.

## 7. Experiencia visual profesional con Impeccable

Crea una marca propia **AgroOrbit Nexus**: agricultura + observación terrestre + claridad científica. Define tokens y documenta `DESIGN.md`: verde bosque, esmeralda, marfil/blanco y grafito como punto de partida, ajustables para contraste. Evita UI genérica, abuso de gradientes y cards, datos ornamentales y paneles saturados. Cada pantalla debe guiar una decisión:

- Portada: problema concreto, promesa honesta, CTA `Analizar mi terreno`, mini-demo comprobable.
- Mi terreno: mapa útil + formulario progresivo y contexto agrícola.
- Diagnóstico: series reales, unidades, línea temporal y lectura comprensible; riesgos como hipótesis investigables.
- Rotaciones: secuencias visuales por ciclos, comparador de 3 escenarios y motivos de descarte.
- Evidencias: detalles del modelo, fuentes, advertencias y resumen de resultados.

Aplica WCAG 2.2 AA como objetivo de calidad del producto (contraste, foco, etiquetas, navegación teclado, mensajes de error, accesibilidad de mapas/gráficos con alternativas textuales), sin atribuirlo automáticamente a una obligación formal del concurso. Verifica pantallas en móvil, tablet y desktop, con imágenes/capturas o navegador real si está disponible. Ejecuta auditorías de Impeccable disponibles, además de controles de rendimiento y accesibilidad. Documenta problemas detectados y corregidos con evidencia.

## 8. Pruebas, seguridad y CI

- Añade pruebas unitarias de transformación de datos NASA, validaciones Zod, fechas, unidades, faltantes, duplicaciones y reglas agronómicas.
- Agrega casos controlados: maíz repetido, rotación incompatible, agua insuficiente o desconocida, cultivo fuera de calendario, campos vacíos, error NASA, comparación de estrategias con igual horizonte.
- Ejecuta comandos reales disponibles de `lint`, `typecheck`, `test` y `build`; incorpora pruebas de integración/e2e si el alcance y herramientas lo permiten. Registra comando, resultado, fecha y errores; no afirmes pruebas que no realizaste.
- Configura GitHub Actions de CI de mínimo privilegio para instalación reproducible, tipado, lint, test y compilación cuando el proyecto esté listo. No publiques secretos ni uses flujos innecesariamente privilegiados.
- Asegura validación del lado servidor, manejo de excepciones, límite razonable de tamaño/peticiones, tiempo de espera, datos públicos y no PII, `.env.example`, `.gitignore` y sin claves en el frontend.
- Revisa dependencia/licencia y accesibilidad antes de añadir herramientas externas.

## 9. Documentación y demo de concurso

Mantén actualizados: `README.md` (valor, instalación, comandos, demo, límites), `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/DATA_SOURCES.md`, `docs/METHODOLOGY.md`, `docs/VALIDATION.md`, `docs/STATUS.md`, `docs/AI_USAGE.md`, `docs/SKILLS.md`, `docs/NASA_COMPLIANCE.md`, `docs/DEPLOYMENT.md` y `docs/DEMO.md`. No generes documentos vacíos para simular profesionalismo; cada documento debe contener información verificable y mantener coherencia con el código.

Prepara una historia de demo: agricultor de La Libertad → maíz repetido (dato de ejemplo claramente indicado) → clima NASA real → restricciones visibles → tres rotaciones evaluadas → evidencias → qué debe verificar un agrónomo. Prepara resumen y guion breves en español e inglés. Contrasta la guía oficial de presentación: enlace público al producto, demo breve en formato permitido, referencias, declaración IA y envío en la ficha del equipo. No simules que una presentación está publicada ni el proyecto enviado.

## 10. Secuencia obligatoria de ejecución

**Fase A: auditoría inicial.** Lee la documentación y archivos existentes, determina qué hay realmente implementado, verifica repo remoto y normas actualizadas. Devuelve un resumen conciso de hallazgos, no te detengas ahí.

**Fase B: skills y diseño base.** Revisa/install skills pertinentes (Impeccable primero si es seguro/posible), crea skills originales específicas solo si aportan valor, establece el diseño y registra fuentes/licencias.

**Fase C: núcleo funcional.** Implementa P0 de extremo a extremo en orden: terreno → NASA POWER → catálogo → reglas → comparación → evidencias. No dejes botones o métricas ficticias que aparenten funcionar.

**Fase D: calidad.** Ejecuta pruebas, build, inspección visual y ajustes con skills; registra evidencia de lo realmente comprobado. Corrige errores bloqueantes antes de funciones opcionales.

**Fase E: extras condicionales.** Si P0 está estable, considera un análisis NDVI/HLS para un único terreno; de lo contrario, deja bien documentado el alcance P1.

**Fase F: GitHub y entrega.** Actualiza documentación, comprueba licencias/citas/secretos, agrupa commits en español, sincroniza/push a `main` si hay permisos y no hay conflictos. Preparar instrucciones concretas para completar la entrega en NASA Space Apps.

## 11. Criterios de aceptación y reporte final

Solo declara finalizado el MVP si hay código que arranca, navegación real, consulta NASA POWER comprobada o limitación explícita, validación de entradas, tres estrategias evaluables con reglas documentadas, reporte de evidencia, fallos gestionados, pruebas ejecutadas, README reproducible y un caso demo claramente etiquetado.

En el reporte final incluye obligatoriamente:

1. Qué había en el repositorio al empezar y qué cambió.
2. Qué skills encontraste, cuáles instalaste o creaste, ubicación, versión/fuente, licencia y evidencia de uso; estado de Impeccable.
3. Funcionalidades implementadas frente a las pendientes; cuáles dependen de datos externos.
4. APIs realmente consultadas, endpoints/productos, unidades y limitaciones científicas.
5. Pruebas/comandos ejecutados, resultados, errores no resueltos y estado visual/responsivo.
6. Cumplimiento documentado con el desafío y las reglas NASA, licencias, citas y uso de IA; advertir qué sigue sin verificarse.
7. Commits realizados **con mensajes en español**, hash corto, rama, `origin` y resultado real del `push` (o por qué se bloqueó).
8. URL pública del despliegue **solo si existe y fue probada**; de lo contrario, pasos pendientes.
9. Pasos exactos para completar presentación/envío en NASA, sin afirmar que ya se hizo.

**Empieza ahora inspeccionando el proyecto y el remoto. Después trabaja de forma autónoma en las fases anteriores, priorizando entregables comprobables sobre promesas.**
