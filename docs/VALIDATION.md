# Plan de validación — AgroOrbit Nexus

> **Estado:** criterios y casos previstos. **No se han ejecutado pruebas de software ni ensayos de campo como parte de este paquete documental.** Registrar pruebas reales, comandos, resultados y evidencias cuando existan.

## Objetivo

Demostrar que el prototipo integra datos NASA de forma correcta, gestiona incertidumbre y produce comparaciones agrícolas reproducibles, sin afirmar resultados que los datos no respaldan.

## 1. Matriz de pruebas funcionales

| ID | Caso | Resultado esperado | Prioridad |
|---|---|---|---|
| T-01 | Coordenada válida | Consulta permitida y perfil estructurado | P0 |
| T-02 | Latitud fuera de rango | Error de validación, no solicitud a NASA | P0 |
| T-03 | API NASA responde correctamente | Fechas, unidades, metadatos y valores visibles | P0 |
| T-04 | NASA devuelve valores ausentes | Se muestran como desconocidos/no disponibles, nunca cero | P0 |
| T-05 | Servicio NASA no responde | Mensaje claro y sin resultados simulados como reales | P0 |
| T-06 | Secuencia con campañas solapadas | Detecta incompatibilidad o solicita aclaración | P0 |
| T-07 | Falta pH o disponibilidad de riego | Evaluación incompleta si son criterios críticos | P0 |
| T-08 | Tres rotaciones de distinto horizonte | Compara tras normalizar horizonte o bloquea comparación | P0 |
| T-09 | Repetición de maíz declarada | Cuenta campañas consecutivas sin diagnosticar daño del suelo | P0 |
| T-10 | Orden de prioridades cambia | Se actualiza decisión sin modificar los datos climáticos | P1 |
| T-11 | HLS con escena nublada | Enmascara/no usa observación de mala calidad | P1 |
| T-12 | NDVI en épocas no comparables | Advierte sesgo fenológico, evita conclusión causal | P1 |
| T-13 | Parcela demasiado pequeña para HLS | Advierte limitación de píxeles y resultado no concluyente | P1 |
| T-14 | Capa Dynamic World | Etiqueta predicción de cobertura, no título legal | P1 |
| T-15 | Demo en móvil | Navegación, gráficas y formularios legibles | P0 |

## 2. Validación científica

**Revisión agronómica requerida** para:

- Elegir cultivos, variedades y ventanas para el piloto de La Libertad.
- Confirmar fuentes de duración del ciclo y requisitos térmicos/hídricos.
- Determinar cuándo una restricción es esencial o solo informativa.
- Revisar tratamiento de leguminosas, suelo, plagas y continuidad de cultivo.
- Contrastar los resultados del sistema con al menos dos casos preparados por un agrónomo (uno viable y otro incompatible) y registrar discrepancias.

**Revisión de índices de vegetación requerida** para:

- Producto HLS y bandas correctas; máscara de calidad y ausencia de nubes.
- Comparabilidad estacional/fenológica.
- Cantidad de píxeles y área de la parcela.
- Claridad de los términos: «cambio de verdor» ≠ «degradación confirmada».

## 3. Validación de datos

Guardar para cada consulta: URL/referencia del origen, fecha, parámetros, unidades, versión y cantidad de muestras válidas. Verificar que datos faltantes y valores fuera de rango no entren a cálculos numéricos sin tratamiento explícito.

## 4. Evidencias por adjuntar al ejecutar

```text
Fecha/hora de la prueba: PENDIENTE
Commit o versión: PENDIENTE
Entorno: PENDIENTE
Comando o pasos: PENDIENTE
Datos de entrada (sin información privada): PENDIENTE
Resultado observado: NO EJECUTADO
Resultado esperado: (ver matriz)
Captura/log referenciado: PENDIENTE
Responsable de revisión: PENDIENTE
```

## 5. Criterios de aceptación del MVP

- [ ] Al menos un caso completo se ejecuta desde el formulario hasta el informe.
- [ ] La consulta NASA POWER es real y reproducible.
- [ ] Las alternativas muestran razones y restricciones específicas.
- [ ] Se distingue evidencia real de escenario ilustrativo.
- [ ] Se evita transformar datos desconocidos en números ficticios.
- [ ] Interfaz pública probada en escritorio y móvil.
- [ ] Los criterios científicos críticos tienen fuente y prueba.
- [ ] La documentación describe con precisión lo efectivamente construido.

## 6. Límites de la validación

Pruebas de software y revisiones de un especialista **no demuestran** aumento de cosecha, ahorro real de agua, cambios en la salud del suelo o eficacia económica. Esos impactos requieren seguimiento de campo o evidencia independiente.
