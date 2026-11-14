# Skills evaluadas y usadas

Revisión: 2026-11-14. Instalación de proyecto bajo `.agents/skills/`; validación con `npm run verify:skills`. Este comando verifica directorios y encabezados, no simula un nuevo arranque de Codex. Las skills nuevas se leyeron explícitamente y se aplicaron en esta sesión; su selección automática en otro turno depende del cliente.

| Skill | Fuente / versión | Licencia | Evidencia de uso |
|---|---|---|---|
| Impeccable global | `C:/Users/Rodrigo/.codex/skills/impeccable`, 4.8.2, [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Apache-2.0 | `context` ejecutado; init/new-work/craft-floor leídos; PRODUCT y DESIGN creados a partir del brief |
| Impeccable del proyecto | npm CLI 4.9.1; SKILL declara 4.9.0; motor 0.1.23 | Apache-2.0; LICENSE conservada junto a SKILL | `npx impeccable@4.9.1 install --providers=codex --scope=project --no-hooks --yes`; audit/polish leídos y detector real en `docs/evidence/impeccable-detect.json` |
| skill-creator | oficial OpenAI, preinstalada, sin versión declarada; [openai/skills](https://github.com/openai/skills) | Consultar licencia por skill del upstream; no se redistribuye su texto | Se usó para crear tres procedimientos originales con activación, entradas, salidas y verificación |
| skill-installer | oficial OpenAI, preinstalada | No redistribuida | Evaluada; no se usó su instalador porque Impeccable tiene instalador oficial y ya existen skills oficiales pertinentes |
| react-best-practices | plugin Build Web Apps, metadata 1.0.0, autor Vercel | No redistribuida; consultar distribución instalada | Imports dinámicos de mapa y gráfica; solicitudes disparadas por acción; estado derivado sin efectos innecesarios |
| frontend-testing-debugging | plugin Build Web Apps, paquete 0.1.2 | No redistribuida | Browser plugin no disponible; Playwright Chromium, capturas y axe en escritorio/móvil/tablet |
| openai-docs | oficial preinstalada | No redistribuida | Consulta de documentación de skills; no integración API OpenAI |
| nexus-datos-terrestres | original, `.agents/skills/nexus-datos-terrestres/SKILL.md`, 2026-11-14 | MIT del proyecto | Leída para revisar POWER; fixture real, normalización, faltantes y llamada `verify:nasa` |
| nexus-rotaciones-agronomicas | original, `.agents/skills/nexus-rotaciones-agronomicas/SKILL.md` | MIT | Leída para revisar reglas; se corrigió conteo de historial desconocido/solapado y se probaron extremos |
| nexus-verificacion-mvp | original, `.agents/skills/nexus-verificacion-mvp/SKILL.md` | MIT | Leída para ejecutar verificación, registrar resultados y sincronizar sin forzar |

No se copiaron ni rebautizaron skills ajenas. No se crearon seis skills redundantes: los tres procedimientos originales cubren las necesidades científicas y de evidencia que no resuelve el diseño general. No se delegó en subagentes.

Impeccable: no se afirma haber completado su entrevista, torneo de conceptos ni hooks automáticos. Se simplificó ese flujo por la instrucción explícita de decisiones técnicas autónomas. La revisión visual se documenta como controles técnicos y refinamiento sobre capturas reales. No se genera una puntuación de calidad que parezca validación científica.

El motor binario descargado (22 MB) no se versiona. El launcher y el manifiesto de checksums quedan en el repositorio y permiten recuperar el motor fijado. El instalador no incluyó LICENSE; se incorporó la licencia Apache-2.0 del upstream. El upstream no tiene archivo NOTICE en la URL consultada (404); no se fabricó uno.

Documentación: [skills Codex](https://developers.openai.com/codex/skills/), [Impeccable](https://impeccable.style/). HEAD upstream observado: `1995764b4936f2bfbf4eb719cb37b384a45ceacb`; no equivale al contenido exacto del paquete npm instalado.
