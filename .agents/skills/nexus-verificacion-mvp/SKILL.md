---
name: nexus-verificacion-mvp
description: Verificar un hito de AgroOrbit Nexus antes de marcarlo probado, documentar su evidencia y preparar sincronización GitHub sin alterar historial remoto.
---

# Evidencia del MVP

Entrada: cambios revisados, entorno local y remoto esperado `https://github.com/bel001/AgroOrbit-Nexus.git`.

Incluir el flujo global: ubicación sin campañas precargadas → NASA por coordenadas → cobertura climática/parcial → informe sin recomendaciones. Probar la demo por separado y bloquear sus plantillas fuera de ámbito. Ver GLOBAL_SCOPE para fixtures internacionales, polos/antimeridiano y capa ESA real opcional; registrar pruebas omitidas y no confundir pruebas de varios países con ensayos de carga masiva.

1. Ejecutar skills, tipado, lint, pruebas y build con scripts de package.json. Registrar comandos, fecha y resultado; una compilación no demuestra interacción.
2. Sin Browser plugin, usar Playwright; servir la app en `http://127.0.0.1:3000`. Probar consulta real, tres estrategias, descarga, fallo NASA simulado y aviso de datos modificados en móvil, tablet y escritorio. Distinguir el fallo simulado de la consulta real.
3. Inspeccionar capturas y consola; revisar a11y automatizada sin afirmar conformidad WCAG completa. Actualizar `docs/STATUS.md` y `docs/VALIDATION.md`.
4. Consultar `docs/NASA_COMPLIANCE.md`: publicar código no equivale a enviar al concurso. Los requisitos no accesibles siguen pendientes.
5. Antes del commit revisar diff, archivos staged y secretos; agrupar explícitamente y mensajes en español. Antes del push verificar origin, fetch y ancestros. Nunca forzar; en divergencia preservar ambas ramas y reportar.

Salida: hito reproducible, evidencia, commits y resultado real de GitHub. No declarar despliegue ni envío NASA sin verificación externa.

Procedimiento original del proyecto, MIT. Complementa Impeccable y la skill de pruebas frontend; no reproduce sus textos.
