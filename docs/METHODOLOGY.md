# Metodología científica — AgroOrbit Nexus

**Estado 2026-11-14:** reglas de integridad temporal, exclusión e indicadores implementados y probados en software. **No hay validación experimental ni agronómica local.**

## Reglas efectivamente implementadas (versión p0-2026-11-14)

**Actualización `global-2026-11-14`:** el periodo global es configurable (30–731 días) y no contiene calendarios de siembra implícitos. El caso de 540 días descrito abajo queda exclusivamente en la demo de Virú (`examples/viru.ts` + perfil regional). Sus plantillas B/C requieren modo ilustrativo, coordenadas dentro del ámbito de demostración e igual horizonte. El modo climático produce cero estrategias; fuera del perfil solo se revisa la secuencia aportada, sin recomendaciones. El catálogo general separa rangos de referencia de reglas por variedad/región/periodo. HLS/NDVI derivado sigue sin implementarse; WorldCover se visualiza como contexto histórico y no interviene en decisiones. GLOBAL_SCOPE especifica límites y pruebas de aislamiento.

Comparación histórica en 540 días exclusivamente para la demo. Intervalos [siembra,cosecha), con fin exclusivo; NASA incluye hasta fin menos un día. A es editable; B/C son supuestos con inicios en días 0, 180 y 360. Maíz 150 y sorgo 125 días siguen siendo supuestos; frijol se ajustó de 100 a **135 días hasta cosecha**, inspirado en INIA 404 (edición PDF 2009), sin atribuir esa variedad al predio ni certificar su adaptación. La ficha distingue 98 días a madurez fisiológica. Los rangos generales [FAO, tabla 6](https://www.fao.org/4/s2022e/s2022e07.htm) siguen separados: una discrepancia solicita revisar variedad, no invalida una ficha específica ni prueba aptitud.

`regional-evidence.ts` incorpora revisión documental INIA/MIDAGRI/FAO con edición, página, alcance y faltantes. Solo se adjunta con perfil geográfico aplicable; no son reglas regionales aprobadas. INIA 619 distingue verano/invierno; INIA 404 aporta orientación marzo–julio. La demo C puede situar el frijol fuera de esa orientación. Sin variedad identificada ni revisión local, calendario sigue **desconocido**, no cumple ni incumple automáticamente. Sorgo carece de variedad/ensayo local verificados. Investigación y hashes de documentos: [VIRU_SOURCE_NOTES](research/VIRU_SOURCE_NOTES.md).

Versión de informe `2.1`, metodología `scientific-review-2026-11-14`. El historial se ordena por fecha: especies/familias distintas, máxima racha, especie dominante dividida por número de registros, pares consecutivos de igual especie/familia y suma de intervalos entre campañas. Campañas desconocidas o fechas inválidas/solapadas hacen esos indicadores `null`. Con un único registro no hay intervalo calculable. No son porcentajes de superficie, años completos ni índices de salud de suelo. Se distingue riesgo potencial de daño comprobado; este informe no aporta mediciones de daño. Fórmulas, advertencia y fuente FAO viajan en `historyDiagnostics` del JSON.

| Regla | Aplicación / supuesto | Resultado / prueba |
|---|---|---|
| Intervalos y horizonte | Una misma superficie no admite dos campañas activas a la vez en este modelo simplificado; intercalados fuera de alcance | Solapamiento, orden inverso o campaña fuera del horizonte → incompatible; science.test.ts |
| Exclusión | Prohibición expresa del usuario para cualquier cultivo de la secuencia | Incumplimiento → incompatible antes de considerar diversidad |
| Agua total nula | El valor declarado incluye toda agua utilizable, también lluvia; no representa solo riego | 0 → incompatible por ausencia de suministro; null o cantidad positiva sin demanda → incompleta. No se establece umbral de insuficiencia inventado |
| Suelo, térmica, ventanas locales | Sin ficha regional por variedad, drenaje y requisitos de suelo no se aplican umbrales universales | Desconocido, aun con datos NASA y pH aportados. Los rangos de ciclo solo orientan revisión |
| Estado final | Incumplimiento esencial prevalece sobre faltantes; faltantes prevalecen sobre ventajas | Incompatible / evaluación incompleta. Con este catálogo no se certifica viabilidad; faltan reglas locales |
| Historial | Registros ordenados por siembra. Fechas solapadas/inválidas o procedencia desconocida impiden racha interpretable | Conteo máximo null con advertencia; cero campañas significa cero registros, no ausencia demostrada de agricultura |
| Indicadores | Familias distintas, repetición máxima y suma de días de cultivo válidos; intervalos sin cultivo = 540 − días registrados | Son descripciones de escenarios, sin equivalencia con cobertura real, salud de suelo o rendimiento |
| Clima | Media mensual de T2M válida, suma de PRECTOTCORR válida; informar días válidos/total | Fill -999, ausentes y lluvia negativa → null; cero real conservado. Sin imputación ni pronóstico |

No se usa ranking ponderado: la prioridad seleccionada organiza la conversación de revisión, sin modificar cálculos ni favorecer una alternativa por una puntuación no validada. La mejora P1 exige definir pesos con el equipo y probar sensibilidad.

### Demanda hídrica estimada (versión fao56-water-2026-11-14)

Implementado en `src/lib/water.ts` y probado en `tests/water.test.ts`:

| Paso | Fórmula | Fuente |
|---|---|---|
| Radiación extraterrestre Ra | FAO-56 ec. 21, con dr (ec. 23), δ (ec. 24) y ωs (ec. 25); ωs acotado en latitudes polares | FAO-56 cap. 3; reproduce el ejemplo 8 (20°S, 3 sep → 32,2 MJ m⁻² día⁻¹) |
| ETo diaria | Hargreaves, ec. 52: 0,0023 · (Tmedia + 17,8) · (Tmáx − Tmín)^0,5 · 0,408·Ra, con Tmedia = (Tmáx + Tmín)/2 de NASA POWER | FAO-56 cap. 3 |
| Kc diario | Curva por etapas (fig. 25): ini constante, lineal a mid, mid constante, lineal a end. Etapas de la tabla 11 escaladas a la duración de cada campaña | FAO-56 tablas 11 y 12 |
| ETc | Σ Kc · ETo en [siembra, cosecha) | FAO-56 cap. 6 |
| Déficit bruto | máx(0, ETc − precipitación total de grilla) por campaña | Convención del proyecto |
| Grados-día | Σ máx(0, (Tmáx + Tmín)/2 − Tbase); base 10 °C solo para maíz y sorgo | McMaster y Wilhelm (1997), doi:10.1016/S0168-1923(97)00027-0 |

Valores Kc (ini/mid/end) y etapas usados: maíz grano 0,30/1,20/0,35, etapas 30/50/60/40; frijol seco 0,40/1,15/0,35, etapas 20/30/40/20; sorgo grano 0,30/1,05/0,55 (tabla: 1,00–1,10), etapas 20/35/40/30. El frijol no recibe grados-día porque no se documentó una temperatura base.

Supuestos y límites:

- Si falta un solo día de temperatura o lluvia en una campaña, su ETc, lluvia y déficit quedan `null`; nunca se informa un total parcial como si fuera completo.
- Hargreaves se usa porque solo requiere temperaturas ya consultadas. FAO-56 lo indica como alternativa cuando faltan radiación, humedad y viento; puede sobrestimar en zonas húmedas o costeras nubosas. Penman-Monteith con `ALLSKY_SFC_SW_DWN`, `RH2M` y `WS2M` es la mejora siguiente.
- Kc genéricos para clima subhúmedo (RHmín ≈ 45 %, u2 ≈ 2 m/s), sin ajuste ec. 62 ni por frecuencia de humedecimiento. Etapas escaladas, no fenología observada.
- La precipitación de grilla MERRA-2 corregida puede diferir mucho de la lluvia local, en especial en desiertos costeros como Virú; no es lluvia efectiva. Por eso el déficit bruto subestima el riego y no incluye eficiencia de aplicación ni lavado de sales.
- El estado de la regla "Agua utilizable" sigue siendo `desconocido` (salvo 0 mm declarados): la ETc estándar es demanda de un cultivo sano, no un mínimo de supervivencia, así que no se declara incompatibilidad por agua menor que la ETc.
- No se interpreta la diferencia de ETc entre alternativas como agua ahorrada.

Validar con dos casos independientes de un agrónomo sigue pendiente.

## 1. Principio de evaluación

No confundir *indicador*, *evidencia*, *diagnóstico* y *recomendación*. La plataforma debe describir qué se sabe, qué se estima, qué falta y cómo ello afecta cada alternativa. **No se atribuyen causas agrícolas solo a una curva satelital.**

## 2. Entradas y procedencia

1. **Ubicación** (punto o polígono; resolución, fecha y fuente).
2. **Historial agrícola** (cultivos, variedades, temporadas, fuente de declaración).
3. **Suelo** (textura, drenaje, pH, fertilidad conocida, fuente/fecha).
4. **Agua** (sistema de riego, disponibilidad aproximada y fiabilidad).
5. **Clima** (serie NASA POWER con unidades, fechas y metadatos).
6. **Catálogo de cultivos** (duración, ventanas, necesidades hídricas, requisitos de suelo, fuente regional).
7. **Preferencias** (conservación de agua, diversificación, manejo del suelo, exposición climática).

Categorías de dato: `medido`, `declarado`, `estimado`, `desconocido`. Un usuario puede declarar un cultivo durante varios años; esto **no equivale a haberlo identificado automáticamente desde el espacio**.

## 3. Diagnóstico cuantificable mínimo (P0)

Medir únicamente aquello que soportan los datos disponibles:

- **Número de campañas reportadas:** cantidad de registros conocidos en el horizonte de análisis.
- **Repetición consecutiva:** máxima cantidad de campañas consecutivas con una misma especie *según historial declarado*.
- **Diversidad de familias:** número de familias botánicas distintas en el horizonte comparado (si están identificadas).
- **Intervalos entre campañas:** número de días sin un cultivo activo, si existen fechas completas. **No** equivale a suelo desnudo cuando se desconoce la cobertura residual.
- **Variabilidad climática:** anomalías o cuantiles de variables históricas definidas con una línea de base y regla explícitas; comparar mismas estaciones del año.
- **Completitud de información:** campos críticos con estado conocido/desconocido; no asignar un porcentaje de «confianza científica» arbitrario.

**No inferir** que una racha larga de monocultivo demuestra degradación; comunica *posibles riesgos a revisar*.

## 4. Análisis satelital de vegetación (P1)

### NDVI

El índice de vegetación de diferencia normalizada se define como:

```text
NDVI = (NIR - Red) / (NIR + Red)
```

`NIR` = reflectancia de infrarrojo cercano; `Red` = reflectancia roja. Antes de calcularlo, mapear correctamente las bandas del **producto y versión reales**; no mezclar reflectancias sin corregir ni colecciones incompatibles.

**Reglas de interpretación:**

1. Descartar observaciones afectadas por nubes, sombras, anomalías y valores inválidos.
2. Comparar ventanas fenológicas equivalentes, por ejemplo fase vegetativa similar de diferentes campañas, si se conocen las fechas.
3. Documentar tamaño de parcela, resolución (HLS 30 m), número de píxeles y proporción de observaciones válidas.
4. Informar la fecha/temporada de cada muestra, el método de agregación y rangos.
5. Mostrar tendencia descriptiva y posibles explicaciones alternativas: cosecha, cambio de cultivo, sequía, suelo desnudo, manejo, plagas, nubosidad o errores de clasificación.
6. **Nunca** declarar fertilidad perdida, enfermedad, años de monocultivo ni pérdidas productivas solo por NDVI.

Para polígonos pequeños con pocos píxeles útiles, el resultado puede ser **no concluyente**. Véase [NASA HLS](https://hls.gsfc.nasa.gov/).

### Cobertura agrícola

La clase *crops* de [Dynamic World](https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_DYNAMICWORLD_V1) representa una **predicción de cobertura**, no certeza de uso ni límites catastrales. Si se calcula superficie estimada, publicar el umbral, el período, la resolución, el área de análisis y la incertidumbre; no llamarla «área agrícola oficial».

## 5. Reglas de rotación

### Restricciones esenciales

- **Calendario:** no superponer actividades incompatibles en la misma superficie; considerar días de ciclo y ventanas de siembra.
- **Clima:** verificar requisitos térmicos y otros límites solo cuando haya referencias aptas para la especie y variedad.
- **Agua:** distinguir demanda del cultivo y recursos realmente disponibles.
- **Suelo:** no tratar textura/pH estimados como una analítica medida de la parcela.
- **Manejo:** respetar exclusiones, equipos y preferencias expresas.

Una estrategia puede quedar en uno de tres estados:

| Estado | Regla |
|---|---|
| **Viable bajo los supuestos** | Ninguna restricción esencial verificada se incumple y hay datos suficientes para evaluarlas |
| **Incompatible** | Incumple al menos una restricción esencial documentada |
| **Evaluación incompleta** | Faltan datos críticos para determinar la viabilidad |

No llamar «óptima» a una alternativa que solamente parece superior bajo un criterio simplificado.

## 6. Indicadores de suelo

- **Diversidad botánica**: familias/especies registradas y secuencia.
- **Cobertura potencial**: duración de períodos con y sin cultivo, solo como proxy si no existen registros de residuos o cobertura.
- **Leguminosas**: señalar potencial de fijación biológica de nitrógeno sin cuantificar aporte real al suelo.
- **Continuidad**: detectar repetición de especie/familia; plagas específicas solo bajo una regla regional respaldada.

No declarar mediciones de carbono orgánico, nitrógeno fijado, erosión o «salud del suelo» a partir de estas variables.

## 7. Agua — método FAO-56

Con datos suficientes y `Kc` pertinente por etapa:

```text
ETc = Kc × ETo
```

- `ETo`: evapotranspiración de referencia (mm/día).
- `Kc`: coeficiente del cultivo y etapa (adimensional).
- `ETc`: evapotranspiración estimada del cultivo en condiciones de referencia (mm/día).

**Fuente:** [FAO-56, capítulo 5](https://www.fao.org/4/x0490e/x0490e0a.htm). Si se calcula `ETo`, documentar la metodología FAO Penman–Monteith, parámetros meteorológicos, supuestos de radiación/viento/humedad, y manejo de faltantes.

No afirmar `agua ahorrada = ETc(A)-ETc(B)` como ahorro efectivo de riego. El riego depende de precipitación efectiva, suelo, eficiencia, prácticas y otras componentes del balance. Si faltan datos, preferir comparación cualitativa o indicador parcial, **no** una cifra de ahorro.

## 8. Comparación multicriterio

1. Evaluar restricciones esenciales **antes** de comparar ventajas.
2. Mostrar cada dimensión por separado: clima, agua, diversidad, suelo y exposición a escenarios.
3. Si se usan escalas normalizadas, explicar rango, orientación, fuente y transformación.
4. Las prioridades del usuario modifican **pesos de decisión**, nunca observaciones científicas originales.
5. Realizar una prueba de sensibilidad al cambiar pesos; no ocultar compromisos.
6. No inventar probabilidades ni una puntuación única con apariencia de validación si no está justificada.

## 9. Ejemplo conceptual

| Rotación | Observación válida | Conclusión que **no** procede |
|---|---|---|
| Maíz → maíz → maíz | Tres campañas consecutivas de maíz **declaradas** | «El suelo perdió 30 % de fertilidad» |
| Maíz → leguminosa → maíz | Mayor diversidad de familias **si la especie lo confirma** | «Se añadieron X kg/ha de N» |
| Maíz → otra especie → leguminosa | Posible diversificación; requiere validar calendarios | «La producción subirá 20 %» |

## 10. Salidas obligatorias del motor

Por estrategia: identificador; horizonte; fuente y fecha de datos; comprobaciones y faltantes; indicadores; estado de viabilidad; razones a favor/en contra; advertencias; pasos de validación local.

## 11. Referencias técnicas

- [NASA POWER Daily API](https://power.larc.nasa.gov/docs/services/api/temporal/daily/)
- [NASA HLS](https://hls.gsfc.nasa.gov/)
- [Dynamic World dataset](https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_DYNAMICWORLD_V1)
- [FAO-56](https://www.fao.org/4/X0490E/X0490E00.htm)
