# Entrega comprobada — 2026-11-14

Estado: recorrido funcional **local** implementado y probado; validación agronómica regional y despliegue público pendientes. No se declara el cierre científico completo de P0 ni se inicia P1.

## Repositorio y sincronización

Directorio inicial con 16 documentos, sin aplicación ni `.git`; remoto público vacío. Se preservó la documentación original en el primer commit. Cuenta GitHub `bel001` verificada; no se almacenaron credenciales. Rama `main`; origin exacto `https://github.com/bel001/AgroOrbit-Nexus.git`.

Se ejecutó fetch y se comprobó que no había ramas remotas antes de `git push -u origin main`. Push exitoso; `HEAD` y `refs/heads/main` remota coincidían en `1a40ec5b5738ff32e9b42e4bb9d9e17ea48b70d9`. No se utilizó force ni se sobrescribió historial remoto. Este registro añade un commit documental posterior; el hash definitivo se comprueba en GitHub y con `git log`.

| Commit | Mensaje |
|---|---|
| 7d04d0c | docs: conservar especificación y documentación inicial del proyecto |
| 4832d30 | feat(ciencia): integrar NASA POWER y evaluar rotaciones con trazabilidad |
| c4c3cec | feat(interfaz): completar recorrido del terreno al informe explicable |
| 95eab28 | feat(skills): incorporar Impeccable y procedimientos científicos originales |
| 44fa415 | style(skills): normalizar espacios de referencias sin alterar instrucciones |
| 5ea84ad | test(mvp): verificar flujo NASA en tres tamaños y añadir CI |
| 1a40ec5 | docs: registrar metodología real, licencias y pendientes de entrega NASA |

Revisión previa: diff --check, archivos staged y patrones habituales de secretos. Ningún token, archivo .env real ni binario Impeccable se versionó. `.env.example` contiene solo explicación sin claves.

## Verificación remota

[GitHub Actions 43625941228](https://github.com/bel001/AgroOrbit-Nexus/actions/runs/43625941228) **success**, job quality en Linux: `npm ci`, `verify:skills`, `typecheck`, `lint`, `npm test` y `npm run build`. Detalles guardados en evidence/github-ci.json. E2E con datos NASA se ejecutaron localmente, no en este workflow.

Anotaciones informativas del runner: acciones v4 usan runtime Node 20 migrado a 24 por GitHub; aviso de transición de imagen ubuntu-latest. El runtime del proyecto se seleccionó en Node 24. No causaron fallos. ESLint 9 conserva compatibilidad con la configuración Next fijada, con aviso npm de fin de soporte; revisar mantenimiento posterior.

## Producto, ciencia y calidad

- Implementado: mapa y coordenadas, perfil/historial/procedencia, NASA POWER real, gráfica y tabla, tres estrategias históricas, restricciones, indicadores y reporte JSON/imprimible.
- Probado: 40 unitarias/API, 6 e2e en Chromium escritorio/móvil/tablet, axe sin violaciones en los estados evaluados, detector Impeccable [], consola sin errores de aplicación tras corregir worker. Capturas e informes en evidence/. No hubo ensayos de campo ni certificación WCAG completa.
- NASA: Daily/point, AG/LST, T2M/T2M_MIN/T2M_MAX en C y PRECTOTCORR en mm/day, API v2.10.3; grilla regional, sin medición del predio. Fixture real de 366 días y consulta UI de 540 días.
- Catálogo: rangos generales FAO, familias Kew. Calendarios/variedades locales y balance hídrico no validados; se conserva evaluación incompleta. No se calculan ETc, ahorros, productividad, nitrógeno fijado ni rentabilidad.
- Skills: Impeccable CLI 4.9.1 instalado en proyecto (skill 4.9.0, motor 0.1.23), más tres procedimientos originales MIT; uso y licencias en SKILLS. Skills oficiales/plugin usadas desde el entorno, sin copiar sus textos.
- MIT elegida por el usuario, atribuciones en THIRD_PARTY_NOTICES, declaración real de Codex en AI_USAGE. Reglas Space Apps parcialmente verificadas mediante fuentes oficiales indexadas y aclaraciones; lectura íntegra bloqueada, ver NASA_COMPLIANCE.

La búsqueda regional encontró un extracto oficial de condiciones agrometeorológicas enero 2024 con contexto de frijol/Laredo, pero [el PDF](https://cdn.www.gob.pe/uploads/document/file/5676659/5038894-condiciones-agrometeorologicas-2023-2024.pdf) devolvió 403 al abrirlo. No se extrajeron umbrales ni ventanas locales de ese extracto, ni se generalizaron a Virú.

## Pendientes para publicación y concurso

No existe URL pública de aplicación verificada. El repositorio público es código, no hosting. DEPLOYMENT detalla cómo desplegar Next con backend y ejecutar comprobaciones externas. La app local queda en http://127.0.0.1:3000 mientras el proceso de esta sesión siga activo.

El equipo debe: validar fuentes/reglas con agrónomo; abrir guía/condiciones 2026 y confirmar registro, idioma y hora de sede; desplegar y verificar enlaces sin login; producir video de menos de 30 s o hasta 7 slides según aclaración oficial y confirmar formulario; completar ficha Field Shift con datos NASA, licencias y declaración IA; enviar y guardar comprobante antes del cierre confirmado. DEMO incluye guion ES/EN. No se publicó demo ni se envió al portal NASA.
