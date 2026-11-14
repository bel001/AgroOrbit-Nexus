# Contribuir a AgroOrbit Nexus

Gracias por contribuir. El foco es desarrollar un **sistema explicable de apoyo a decisiones agrícolas**, no una herramienta que emita recomendaciones infalibles.

## Primeros pasos

1. Lee [README](README.md), [especificación](docs/PROJECT_SPEC.md), [metodología](docs/METHODOLOGY.md) y [estado](docs/STATUS.md).
2. Selecciona una tarea de prioridad P0 en [ROADMAP](docs/ROADMAP.md).
3. Abre un *issue* indicando problema, comportamiento esperado, fuente científica si aplica y criterio de aceptación.
4. Crea una rama de trabajo e incluye pruebas para cambios científicos o algorítmicos.
5. Presenta un *pull request* con descripción, capturas cuando cambie la interfaz, pruebas y limitaciones.

## Convenciones

- Usar TypeScript con tipado estricto donde exista código.
- Evitar duplicar fórmulas y aislar cálculos científicos de componentes visuales.
- Mantener resultados reproducibles y nombres claros de unidades (`mm`, `°C`, `ha`).
- Identificar datos sintéticos, históricos, estimados y observados.
- No añadir dependencias ni modelos de IA que no mejoren una necesidad verificable.
- No incluir credenciales, datos privados de agricultores ni mapas con información sensible sin permiso.

## Revisión agronómica

Ninguna nueva regla de cultivos, agua, enfermedades o suelo debe presentarse como validada sin: fuente, localidad/variedad aplicable, condiciones, limitaciones y al menos un ejemplo reproducible. Ante insuficiencia de datos, la salida correcta es **evaluación incompleta**.

## Código de conducta

Colaboración respetuosa, revisión basada en evidencias y documentación transparente de desacuerdos técnicos.

## Licenciamiento

La licencia del repositorio está **por decidir**. Antes de aceptar código o recursos de terceros, comprobar derechos de uso y acordar una licencia explícita con el equipo.
