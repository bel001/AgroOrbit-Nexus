# Estado y decisiones — AgroOrbit Nexus

**Última actualización documental:** 2026-11-14. Este archivo describe únicamente lo constatado al preparar la documentación a partir del material aportado, **no una auditoría del repositorio de código**.

## 1. Estado actual conocido

| Área | Estado registrado |
|---|---|
| Nombre definitivo | **AgroOrbit Nexus** (indicado por el usuario) |
| Propuesta científica | Documentada en `PROJECT_SPEC.md` |
| Mentoría | Observaciones incorporadas conceptualmente |
| MVP | Requisitos definidos; implementación **no verificada** |
| NASA POWER | Fuente priorizada; integración **no verificada** |
| Motor de rotaciones | Diseñado conceptualmente; algoritmo y reglas **sin validar** |
| HLS/NDVI | Extensión propuesta, sin integración demostrada |
| Dynamic World / áreas agrícolas | Extensión propuesta, sin integración demostrada |
| Pruebas automatizadas | No ejecutadas en este paquete |
| Despliegue público | Ningún enlace comprobado en este paquete |
| Licencia de código | Pendiente de decisión del equipo |

## 2. Decisiones tomadas en la documentación

- Conservar la finalidad del desafío **Field Shift**: rotaciones agrícolas, decisiones y resiliencia.
- Combinar el enfoque original de AgroOrbit AI con diagnóstico **cuantificable**, sin asumir causalidad.
- Separar **NASA POWER (P0)** de **HLS/NDVI y áreas agrícolas (P1)**.
- Mantener el piloto regional y diseñar la posibilidad de expansión internacional.
- No afirmar efectos reales de ahorro de agua, salud del suelo, rendimiento, mercado o plagas.
- Usar una secuencia de maíz continuo únicamente como **caso ilustrativo** hasta obtener historial real o validado.

## 3. Decisiones abiertas (por cerrar)

- [ ] Ubicación/parcela exacta del piloto (Virú es una sugerencia).
- [ ] Cultivos, variedades y calendarios con fuentes peruanas.
- [ ] Reglas críticas validadas por asesor agrónomo.
- [ ] Horizonte histórico climatológico y ventanas de cultivo.
- [ ] Método de obtención de NDVI y nivel de calidad exigido.
- [ ] Estrategia de almacenamiento y tratamiento de datos personales.
- [ ] Repositorio de código y dependencias efectivas.
- [ ] Licencia de código y atribución de recursos.
- [ ] Enlace público de despliegue y prueba de acceso.
- [ ] Registro de uso de herramientas IA en código y presentación.

## 4. Plantilla de registro de avances

```text
Fecha:
Responsable:
Módulo:
Cambio/commit:
Estado: propuesto | en curso | implementado | probado | bloqueado
Prueba ejecutada:
Resultado obtenido:
Fuente/captura/log:
Limitación conocida:
Siguiente acción:
```

## 5. Regla para declarar «terminado»

Un documento no demuestra funcionamiento: únicamente se marcará una función como **probada** cuando exista código ejecutable, evidencia de prueba y una revisión de que el resultado no induce a error agronómico.
