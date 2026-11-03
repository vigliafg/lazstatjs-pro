import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Procedimientos de la ola 9: encuesta, aprendizaje, texto, elección, Bayes, meta y espacial. */
export const w9Topics: HelpTopic[] = [
  procedureTopic({
    id: 'survey',
    title: 'Muestra compleja',
    summary: 'Medias, totales, proporciones y regresión basados en el diseño con pesos, estratos y conglomerados.',
    goal: 'Estimar una cantidad poblacional a partir de una muestra no aleatoria simple, usando sus pesos y su diseño.',
    steps: [
      'Elige la variable y el estimador: media, total, proporción o regresión ponderada.',
      'En la sección avanzada indica las columnas de peso, estrato y conglomerado cuando el diseño las tenga.',
      'Ejecuta y lee la estimación, su error estándar, el intervalo de confianza y el efecto del diseño.',
    ],
    expected: 'Una tabla del diseño, las estimaciones con intervalos basados en el diseño y, para la regresión, los coeficientes ponderados.',
    whenToUse: [
      'Cuando las probabilidades de inclusión no son iguales o la muestra se recogió por estratos y conglomerados.',
      'Cuando una media bruta estaría sesgada por grupos sobre- o subrepresentados.',
    ],
    reading: [
      'Un efecto del diseño mayor que 1 indica que el diseño es menos eficiente que una muestra aleatoria simple del mismo tamaño ponderado.',
      'La estratificación suele reducir la varianza; los conglomerados la aumentan porque las unidades cercanas se parecen.',
    ],
    pitfalls: [
      'Tratar los pesos de muestreo como pesos de frecuencia: la estimación cambia y el error estándar es incorrecto.',
      'Ignorar la columna de conglomerados y suponer que cada fila es independiente.',
    ],
    charts: ['Estimación e intervalo de confianza.', 'Forest plot de los coeficientes de regresión ponderada.'],
    seeAlso: ['descriptive', 'regression'],
  }),
  procedureTopic({
    id: 'ml',
    title: 'Aprendizaje automático',
    summary: 'Bosque aleatorio, gradient boosting y red neuronal de una capa oculta para regresión y clasificación.',
    goal: 'Predecir un resultado numérico o una clase a partir de varios predictores sin imponer una forma lineal o paramétrica.',
    steps: [
      'Selecciona el resultado y si la tarea es regresión o clasificación.',
      'Elige bosque aleatorio, gradient boosting o red neuronal.',
      'Ajusta árboles, tamaño mínimo de nodo, contracción o unidades ocultas y mantén una semilla fija.',
    ],
    expected: 'Medidas de ajuste, importancia de variables para los modelos de árboles, predicciones y gráficos de residuos.',
    whenToUse: [
      'Cuando la relación es no lineal o contiene interacciones que una regresión no captaría.',
      'Cuando el objetivo es predecir y no se necesitan coeficientes interpretables.',
    ],
    reading: [
      'Compara el R² interno con el R² out-of-bag: una brecha grande indica sobreajuste.',
      'La importancia mide cuánto reduce cada predictor el error dentro de los árboles; no es un efecto causal.',
    ],
    pitfalls: [
      'Elegir el modelo con los mismos datos usados para anunciar su rendimiento.',
      'Usar muy pocos datos: árboles y redes memorizan pronto el ruido.',
    ],
    charts: ['Observado y predicho.', 'Residuos y predicciones.', 'Importancia de las variables.'],
    seeAlso: ['regression', 'partition'],
  }),
  procedureTopic({
    id: 'text',
    title: 'Minería de texto',
    summary: 'Frecuencias de términos, TF-IDF, similitud entre documentos y modelo de temas LDA.',
    goal: 'Describir un corpus de textos cortos y encontrar los términos y temas que distinguen los documentos.',
    steps: [
      'Selecciona la columna de texto y, si hace falta, una columna de grupo.',
      'Elige frecuencias, TF-IDF, similitud entre documentos o temas.',
      'Ajusta el tamaño del vocabulario, la frecuencia mínima en documentos y el número de temas.',
    ],
    expected: 'Una tabla de términos, una vista documento-término, una matriz de similitud o una tabla de temas con sus términos principales.',
    whenToUse: [
      'Cuando los datos contienen respuestas abiertas, comentarios, títulos o documentos cortos.',
      'Cuando hace falta un mapa exploratorio del vocabulario antes de leer los textos uno a uno.',
    ],
    reading: [
      'El TF-IDF reduce el peso de los términos presentes casi en todas partes y hace emerger las palabras distintivas.',
      'Temas y similitudes son relativos al corpus: no valen automáticamente para textos filtrados de otra forma.',
    ],
    pitfalls: [
      'Olvidar que las palabras vacías dependen del idioma y de las decisiones de limpieza.',
      'Leer el número de temas como una verdad descubierta en vez de una elección de modelo.',
    ],
    charts: ['Términos más frecuentes.', 'Prevalencia de los temas.', 'Mapa documento-tema o similitud.'],
    seeAlso: ['descriptive', 'cluster'],
  }),
  procedureTopic({
    id: 'choice',
    title: 'Elección / MaxDiff',
    summary: 'Logit condicional para conjuntos de elección y puntuaciones best-worst para experimentos MaxDiff.',
    goal: 'Explicar qué atributos guían la elección entre alternativas u ordenar elementos a partir de tareas best-worst.',
    steps: [
      'Para un experimento de elección selecciona conjunto, alternativa, indicador de elección y atributos que varían.',
      'Para MaxDiff selecciona las columnas bloque, elemento, mejor y peor.',
      'Ejecuta y lee los coeficientes, las cuotas previstas o la clasificación MaxDiff.',
    ],
    expected: 'Una tabla de coeficientes con errores estándar, cuotas observadas y previstas, o una tabla de puntuaciones MaxDiff.',
    whenToUse: [
      'Cuando el encuestado elige una alternativa de un conjunto y los atributos varían entre alternativas.',
      'Cuando una tarea best-worst ordena muchos elementos sin pedir una clasificación completa.',
    ],
    reading: [
      'Un coeficiente positivo aumenta la probabilidad de elegir la alternativa con ese atributo.',
      'El logit condicional usa solo la variación dentro del conjunto: los atributos constantes se cancelan.',
    ],
    pitfalls: [
      'Incluir atributos que no varían dentro de los conjuntos: no son identificables.',
      'Dejar conjuntos sin alternativa elegida o con más de una elección.',
    ],
    charts: ['Forest plot de los coeficientes.', 'Cuotas observadas y previstas.', 'Puntuaciones MaxDiff e intervalos.'],
    seeAlso: ['conjoint', 'logistic'],
  }),
  procedureTopic({
    id: 'bayes',
    title: 'Análisis bayesiano',
    summary: 'Resúmenes a posteriori y diagnóstico MCMC para modelos conjugados y regresión gaussiana.',
    goal: 'Combinar la verosimilitud con una distribución a priori y describir el parámetro con su distribución a posteriori.',
    steps: [
      'Elige el modelo: media normal, proporción binomial, tasa de Poisson, regresión lineal o modelo jerárquico normal.',
      'Selecciona el resultado y, para la regresión, los predictores.',
      'Ajusta la prior, las iteraciones, el burn-in y el número de cadenas.',
    ],
    expected: 'Una tabla a posteriori con media, mediana, intervalo central, HDI, Rhat y ESS, más histograma y gráfico de intervalos.',
    whenToUse: [
      'Cuando información previa o pocos datos hacen más natural un resumen a posteriori.',
      'Cuando se necesita la incertidumbre completa del parámetro, no solo una estimación puntual.',
    ],
    reading: [
      'El HDI al 95% es el intervalo más corto que contiene el 95% de la masa a posteriori.',
      'Rhat cerca de 1 y ESS alto indican cadenas mezcladas; por encima de 1,05 hacen falta más iteraciones.',
    ],
    pitfalls: [
      'Usar una prior vaga con muy pocas observaciones y leer el resultado como objetivo.',
      'Reportar estimaciones de cadenas que no convergieron.',
    ],
    charts: ['Histograma a posteriori.', 'Intervalos a posteriori con HDI.', 'Posteriori conjuntas de dos parámetros.'],
    seeAlso: ['regression', 'samplesize'],
  }),
  procedureTopic({
    id: 'meta',
    title: 'Meta-análisis',
    summary: 'Pooling de efectos fijos y aleatorios con heterogeneidad, forest y funnel plots.',
    goal: 'Combinar los efectos de varios estudios y cuantificar cuánto discrepan.',
    steps: [
      'Selecciona la columna del efecto y la de su error estándar; opcionalmente la etiqueta del estudio.',
      'Elige DerSimonian–Laird, REML o efectos fijos para la varianza entre estudios.',
      'Ejecuta y lee el efecto pooled, Q, I², τ², el intervalo de predicción y la prueba de Egger.',
    ],
    expected: 'Una tabla pooled, una tabla de heterogeneidad, la tabla de estudios, un forest plot y un funnel plot.',
    whenToUse: [
      'Cuando varios estudios estiman el mismo efecto y hace falta un resumen con su incertidumbre.',
      'Cuando la pregunta es sobre la consistencia de la evidencia, no solo sobre la media.',
    ],
    reading: [
      'I² es la parte de variabilidad total debida a la heterogeneidad; por encima del 50% suele considerarse sustancial.',
      'El intervalo de predicción describe dónde caería el efecto de un nuevo estudio, no la precisión de la media.',
    ],
    pitfalls: [
      'Agrupar efectos medidos en escalas distintas sin convertirlos antes.',
      'Leer la prueba de Egger como prueba de sesgo de publicación: es evidencia de asimetría, no un veredicto.',
    ],
    charts: ['Forest plot de estudios y efecto pooled.', 'Funnel plot.', 'Peso de los estudios.'],
    seeAlso: ['regression', 'samplesize'],
  }),
  procedureTopic({
    id: 'spatial',
    title: 'Estadística espacial',
    summary: 'Pruebas de Moran y Geary, indicadores locales y modelo de retardo espacial sobre coordenadas.',
    goal: 'Comprobar si unidades cercanas se parecen más que con una disposición aleatoria y modelar la dependencia espacial.',
    steps: [
      'Selecciona la variable numérica y las dos columnas de coordenadas.',
      'Elige Moran I, Geary C, indicadores locales o modelo de retardo espacial.',
      'Ajusta los vecinos más cercanos y las permutaciones; para el modelo SAR añade los predictores.',
    ],
    expected: 'Una tabla de autocorrelación global, un mapa, indicadores locales y, para SAR, el coeficiente de retardo y la regresión.',
    whenToUse: [
      'Cuando las observaciones están georreferenciadas y la proximidad puede crear dependencia.',
      'Cuando hace falta localizar conglomerados o valores atípicos locales antes de modelar.',
    ],
    reading: [
      'Un Moran I por encima de su valor esperado indica autocorrelación positiva; por debajo, negativa.',
      'Los p por permutación no suponen normalidad pero dependen del número de permutaciones.',
    ],
    pitfalls: [
      'Tratar la matriz de pesos como dada: otro k o umbral de distancia cambia los resultados.',
      'Leer la autocorrelación espacial como un efecto causal de los vecinos.',
    ],
    charts: ['Mapa de valores o conglomerados LISA.', 'Indicadores locales.', 'Coeficientes SAR.'],
    seeAlso: ['correlation', 'regression'],
  }),
];
