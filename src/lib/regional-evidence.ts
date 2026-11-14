// Bibliographic context is separate from validated, executable regional rules.
export const viruEvidence = {
  regionProfileId: "pe-viru-demo", reviewedAt: "2026-11-14", status: "documentary-only",
  localValidation: false,
  entries: [
    {
      id: "inia-619-2012", cropId: "maize", title: "INIA 619 · Megahíbrido", institution: "INIA", edition: "Septiembre de 2012", pages: "PDF 1–2",
      url: "https://repositorio.inia.gob.pe/server/api/core/bitstreams/a4269a08-2041-4fbe-b053-f1346c1fef36/content",
      facts: "Periodo vegetativo: 140–150 días en verano y 160–170 en invierno. Siembra durante el año, preferentemente en verano. Manejo de riego diferenciado en suelos francos y franco arenosos; fertilización según análisis de suelo.",
      limit: "Referencia para costa y selva peruana, sin fechas mensuales universales ni demanda de agua cuantificada para Virú. Las campañas del formulario no identifican variedad: no se les atribuye automáticamente INIA 619.",
    },
    {
      id: "inia-404-2009", cropId: "bean", title: "INIA 404 · CIFAC 90105", institution: "INIA", edition: "Diciembre de 2009 (colofón del PDF)", pages: "PDF 1–2",
      url: "https://repositorio.inia.gob.pe/bitstreams/edfce649-824e-40a8-84d2-965acdd73e9e/download",
      facts: "Frijol común: 98 días a madurez fisiológica y 135 a madurez de cosecha. Ventana bibliográfica marzo–julio. Describe suelo franco limoso o ligeramente arenoso y riegos ligeros; no aporta lámina total.",
      limit: "Adaptación descrita también para costa norte; no se verificó ensayo de esta variedad en Virú. La demo usa 135 días como supuesto de cosecha inspirado en esta ficha, sin validar la secuencia ni su ventana. 98 días no significa terreno liberado.",
    },
    {
      id: "midagri-mad-2021", cropId: "maize", title: "Observatorio de maíz amarillo duro · 01-2021", institution: "MIDAGRI", edition: "Febrero de 2021", pages: "Impresas 6 y 15 / PDF 8 y 17",
      url: "https://cdn.www.gob.pe/uploads/document/file/1675562/Observatorio%20de%20las%20siembras%20y%20perspectivas%20de%20la%20producci%C3%B3n%20de%20mad.pdf",
      facts: "Describe siembras mensuales históricas departamentales y un rezago estadístico siembra–cosecha de cinco meses para La Libertad, estimado por correlaciones.",
      limit: "Una estadística departamental de 2021 no es un calendario vigente ni un ciclo varietal de exactamente 150 días; no acredita agua o aptitud de la parcela.",
    },
    {
      id: "fao-water-1991", cropId: null, title: "Water harvesting · tabla 2", institution: "FAO", edition: "1991", pages: "Capítulo 2, §2.1.2",
      url: "https://www.fao.org/4/U3160E/u3160e04.htm",
      facts: "Necesidades hídricas aproximadas generales por ciclo: maíz 500–800 mm, frijol 300–500 mm y sorgo/mijo 450–650 mm.",
      limit: "No son necesidades locales de estas variedades ni riego aplicado. No se usan como umbral de viabilidad, ahorro ni se resta lluvia NASA a estas cifras. Faltan ETo, Kc por etapa, suelo y balance local.",
    },
  ],
  gaps: [
    "No se verificaron variedad, ventana ni ensayo de sorgo aplicables a Virú; C sigue siendo exploratoria.",
    "No se validó la rotación completa maíz–frijol–sorgo ni un beneficio sobre plagas, fertilidad, rendimiento o consumo de agua.",
    "Faltan variedad realmente sembrada, análisis de suelo, salinidad, drenaje, suministro de agua por periodo y revisión agronómica local.",
  ],
};

export function regionalEvidenceFor(profileId: string | undefined) {
  return profileId === viruEvidence.regionProfileId ? viruEvidence : null;
}
