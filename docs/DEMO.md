# Demo y envío — AgroOrbit Nexus

Preparado 2026-11-14. Presentación real de siete diapositivas en inglés: `public/submission/index.html`; PDF `public/submission/agroorbit-nexus-demo.pdf`, verificado con pypdf (7 páginas). Prueba Playwright de navegación, móvil/tablet/escritorio y axe. Enlaces públicos y estado de publicación en DEPLOYMENT; no hay video ni comprobante de envío NASA. Catálogo sin validación agronómica regional.

## Demostración reproducible

Arrancar `npm run build` y `npm start`. Abrir http://127.0.0.1:3000, cargar caso ilustrativo de Virú, conservar su etiqueta, consultar clima, revisar 540 días reales de NASA, comparar A/B/C y descargar JSON. A tiene tres campañas de maíz; B y C dos familias. Estos conteos describen escenarios y no demuestran recuperación del suelo. Abrir restricciones para explicar los datos faltantes.

Mostrar un descarte: en suelo/agua/preferencias excluir frijol y consultar de nuevo. B/C pasan a incompatibles por esa prohibición. Para demostrar ausencia total de suministro, agua = 0 mm y procedencia declarada; incluye lluvia. Agua desconocida no se cambia a cero. No afirmar ahorro ni suficiencia.

## Guion español (revisar duración al grabar)

«AgroOrbit Nexus conecta la historia declarada de un terreno con clima histórico real de NASA POWER. En este caso ilustrativo de Virú comparamos tres secuencias en el mismo horizonte. Mostramos diversidad, restricciones y los datos que faltan, sin prometer rendimientos. Cada resultado conserva sus fuentes para revisarlo con un agrónomo».

## English script

“AgroOrbit Nexus connects farmer-provided history with real NASA POWER historical climate. This illustrative Peru case compares three crop sequences over the same period. It shows diversity, constraints and evidence gaps, without predicting yields. Every result keeps its sources so farmers and agronomists can review the assumptions together.”

## Presentación implementada (siete diapositivas)

1. Producto y alcance: clima mundial, piloto ilustrativo.
2. Problema cuantificado: 3 campañas, 1 familia, 3/3 registros de maíz; sin daño demostrado.
3. Recorrido de cinco pasos y reproducción del caso.
4. NASA POWER: variables, unidades, faltantes y límites de grilla.
5. Comparación A/B/C: familias y evaluación incompleta; sin ganador inventado.
6. Evidencia INIA/MIDAGRI/FAO y datos locales pendientes.
7. Código abierto, verificación, declaración IA y validación futura.

## Verificación y envío del equipo

La aclaración oficial [NASA Space Apps #1991](https://github.com/nasa/spaceapps/discussions/1991) indica video de **menos de 30 segundos** O presentación de máximo 7 diapositivas y enlaces separados a demo/producto. No se midió duración de un video: no se ha grabado. Confirmar el formulario y la [guía 2026](https://www.spaceappschallenge.org/resources/project-submission-guide/), cuyo acceso directo falló en esta sesión.

El extracto indexado de la [página oficial 2026](https://www.spaceappschallenge.org/2026/) confirma cierre el 15 de noviembre, 23:59 hora local. Confirmar zona de la sede. No traducirlo automáticamente en un plazo distinto para el equipo.

Pasos: verificar registro/miembros y Field Shift → revisar condiciones/licencias/idioma/IA → publicar producto con endpoint servidor → grabar y publicar demo o slides → abrir ambos enlaces en ventana privada → completar ficha oficial, fuentes, límites y declaración IA → enviar antes del plazo → guardar comprobante con fecha/hora. Véase NASA_COMPLIANCE para qué está corroborado y qué sigue pendiente. Un push no completa este recorrido.
