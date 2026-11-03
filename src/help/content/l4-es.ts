import type { HelpTopic } from "./types";

/**
 * Páginas de los procedimientos L4 (versión española).
 *
 * Mantienen la misma estructura de dos niveles que las páginas anteriores:
 * un tutorial con un ejemplo y una lectura avanzada en lenguaje llano.
 */
export const l4Topics: HelpTopic[] = [
  {
    id: "partition",
    area: "procedures",
    title: "Partición (árbol de regresión)",
    summary: "Divide los datos en hojas homogéneas con un árbol de regresión.",
    tutorial: {
      goal: "Explicar un resultado numérico con un conjunto breve de reglas si-entonces.",
      steps: [
        "Elige la respuesta numérica y uno o más predictores numéricos.",
        "Fija la profundidad máxima y el número mínimo de casos por división.",
        "Ejecútalo y lee el árbol, la lista de divisiones y el informe de las hojas.",
      ],
      expected:
        "Un diagrama de árbol, reglas de división, medias de las hojas e importancia de las variables.",
    },
    advanced: {
      assumptions: [
        "La respuesta es numérica; los predictores son numéricos y están completos.",
      ],
      whenToUse: [
        "Explicación exploratoria, segmentación y efectos no lineales.",
      ],
      whenNotToUse: [
        "Inferencia formal o afirmaciones causales; en su lugar, usa un modelo de regresión.",
      ],
      reading: [
        "Cada nodo interno es un umbral; la media de la hoja es la predicción.",
        "La importancia de las variables suma la reducción de error atribuida a cada predictor.",
      ],
      pitfalls: [
        "Los árboles profundos se sobreajustan: valida en una muestra separada antes de fiarte de las reglas.",
        "Los umbrales dependen de los datos y pueden cambiar con una muestra distinta.",
      ],
      charts: [
        "Diagrama de árbol",
        "Observados vs. previstos",
        "Importancia de las variables",
      ],
      glossary: [
        {
          term: "Hoja",
          definition: "Un grupo final cuya media es la predicción.",
        },
        {
          term: "SSE",
          definition:
            "Suma de las diferencias al cuadrado entre los valores observados y los previstos.",
        },
      ],
    },
    seeAlso: ["regression", "cluster"],
  },
  {
    id: "quality",
    area: "procedures",
    title: "Calidad (SPC)",
    summary:
      "Gráficos de control, capacidad, Pareto, sistemas de medida, muestreo de aceptación y control multivariante.",
    tutorial: {
      goal: "Comprobar si un proceso es estable, capaz y se mide de forma fiable.",
      steps: [
        "Elige el modo: gráfico de control, capacidad, Pareto, variabilidad, intervalo de tolerancia, CUSUM, Gage R&R, muestreo de aceptación o carta T².",
        "Selecciona la variable numérica (o la categoría para Pareto).",
        "Para Gage R&R elige las columnas pieza y operador; para el muestreo fija n, c y el tamaño del lote; para T² selecciona al menos dos variables medidas juntas.",
        "Fija los límites de especificación, el tamaño del subgrupo y la proporción de población del intervalo de tolerancia cuando sea necesario.",
        "Ejecútalo y lee el gráfico, los índices y el informe de lectura.",
      ],
      expected:
        "Un gráfico de control con límites, índices de capacidad, una tabla Gage R&R, una curva OC o una carta T², además de las tablas.",
    },
    advanced: {
      assumptions: [
        "Las observaciones están en su orden temporal real; los subgrupos tienen sentido.",
      ],
      whenToUse: [
        "Monitorizar un proceso, comparar la variabilidad entre grupos, priorizar defectos.",
      ],
      whenNotToUse: [
        "Juzgar la capacidad antes de la estabilidad; un índice de capacidad sobre un proceso inestable induce a error.",
      ],
      reading: [
        "Los puntos fuera de los límites de control son señales, no pruebas de un cambio.",
        "Cp es el margen potencial; Cpk penaliza además una media alejada del centro de las especificaciones.",
        "La línea acumulada del Pareto muestra qué categorías abordar primero.",
        "El intervalo de tolerancia cubre una proporción de la población, no la media; la CUSUM acumula pequeños desplazamientos persistentes.",
        "Un Gage R&R por debajo del 10 % es aceptable, entre el 10 % y el 30 % es marginal y por encima del 30 % las decisiones sobre piezas son arriesgadas.",
        "En la curva OC, el AQL es la calidad aceptada el 95 % de las veces y el LTPD la aceptada solo el 10 %.",
        "Un punto T² fuera del límite indica una combinación inusual de las variables, no cuál se movió.",
      ],
      pitfalls: [
        "Los límites de control no son límites de especificación.",
        "La capacidad supone normalidad y un proceso estable.",
        "Un estudio Gage R&R exige un diseño cruzado equilibrado: cada pieza medida por cada operador.",
        "La carta T² supone observaciones independientes y aproximadamente normales.",
      ],
      charts: [
        "Gráfico de control",
        "Histograma de capacidad",
        "Gráfico de Pareto",
        "Diagrama de caja de variabilidad",
        "Intervalo de tolerancia",
        "Componentes de varianza Gage R&R",
        "Curvas OC y AOQ",
        "Carta T² de Hotelling",
      ],
      glossary: [
        {
          term: "UCL/LCL",
          definition:
            "Límites de control superior e inferior a ±3 sigma del centro.",
        },
        {
          term: "Cpk",
          definition:
            "Índice de capacidad que tiene en cuenta la distancia entre la media y los límites de especificación.",
        },
        {
          term: "Gage R&R",
          definition:
            "Parte de la variabilidad total debida al sistema de medida: repetibilidad más reproducibilidad.",
        },
        {
          term: "AQL",
          definition:
            "Nivel de calidad aceptable: defectuosos entrantes aceptados con probabilidad del 95 %.",
        },
      ],
    },
    seeAlso: ["descriptive", "distfit"],
  },
  {
    id: "cluster",
    area: "procedures",
    title: "Análisis de clústeres",
    summary: "Agrupación jerárquica con dendrograma y perfiles de clústeres.",
    tutorial: {
      goal: "Encontrar grupos de observaciones similares en varias variables numéricas.",
      steps: [
        "Selecciona al menos dos variables numéricas.",
        "Elige el enlace y el número de clústeres.",
        "Ejecútalo y lee el dendrograma, las medias de los clústeres y los perfiles.",
      ],
      expected:
        "Un dendrograma, tamaños de los clústeres, medias y perfiles estandarizados.",
    },
    advanced: {
      assumptions: [
        "Las variables están en escalas comparables o la estandarización está activada.",
      ],
      whenToUse: [
        "Segmentación, tipologías exploratorias, búsqueda de grupos naturales.",
      ],
      whenNotToUse: [
        "Comprobar si existen grupos; el clustering no tiene un valor p para eso.",
      ],
      reading: [
        "La altura de una fusión es la distancia entre los grupos que se unen.",
        "Los perfiles estandarizados muestran qué variables caracterizan cada clúster.",
      ],
      pitfalls: [
        "Enlaces o cortes distintos producen clústeres distintos.",
        "Los clústeres muy pequeños pueden ser valores atípicos en lugar de grupos reales.",
      ],
      charts: [
        "Dendrograma",
        "Perfiles de los clústeres",
        "Tamaño de los clústeres",
      ],
      glossary: [
        {
          term: "Enlace",
          definition: "La regla que mide la distancia entre dos clústeres.",
        },
        {
          term: "Dendrograma",
          definition:
            "Un árbol que muestra el orden y la altura de las fusiones.",
        },
      ],
    },
    seeAlso: ["multivariate", "partition"],
  },
  {
    id: "discriminant",
    area: "procedures",
    title: "Discriminante / MANOVA",
    summary:
      "Separa grupos conocidos y contrasta su diferencia multivariante de medias.",
    tutorial: {
      goal: "Comprobar si los grupos difieren en varias variables numéricas a la vez.",
      steps: [
        "Selecciona la columna de agrupación y al menos un predictor numérico.",
        "Ejecútalo y lee la lambda de Wilks, las pruebas univariantes y el gráfico canónico.",
        "Revisa la matriz de confusión para ver qué tan bien clasifican los grupos.",
      ],
      expected:
        "Tabla MANOVA, coeficientes discriminantes, dispersión canónica y gráfico de perfiles.",
    },
    advanced: {
      assumptions: [
        "Observaciones independientes, covarianzas de grupo similares y predictores continuos.",
      ],
      whenToUse: [
        "Grupos conocidos, reglas de clasificación, comparación multivariante de grupos.",
      ],
      whenNotToUse: [
        "Descubrimiento de grupos desconocidos (usa clustering) o más variables que casos.",
      ],
      reading: [
        "Una lambda de Wilks pequeña y un p pequeño indican separación entre grupos.",
        "Los ejes canónicos son las direcciones que mejor separan los grupos.",
        "La exactitud de entrenamiento es optimista: valida en una muestra separada.",
      ],
      pitfalls: [
        "Los grupos desequilibrados pueden dominar la exactitud.",
        "Los predictores colineales hacen singular la matriz de covarianza.",
      ],
      charts: [
        "Dispersión canónica",
        "Perfiles de grupo",
        "Mapa de calor de coeficientes",
      ],
      glossary: [
        {
          term: "Lambda de Wilks",
          definition:
            "Un estadístico de prueba multivariante cercano a cero cuando los grupos difieren.",
        },
        {
          term: "Función canónica",
          definition:
            "Una combinación lineal de variables que maximiza la separación entre grupos.",
        },
      ],
    },
    seeAlso: ["multivariate", "anova"],
  },
  {
    id: "doe",
    area: "procedures",
    title: "Superficie de respuesta y diseños DOE",
    summary:
      "Superficie cuadrática para dos factores y generador de diseños factoriales y de superficie de respuesta.",
    tutorial: {
      goal: "Encontrar la combinación de dos factores que optimiza una respuesta, o planificar los ensayos que hay que recoger.",
      steps: [
        "Elige el modo: superficie de respuesta para analizar datos existentes o generador de diseños para crear una matriz de ensayos.",
        "Para la superficie selecciona la respuesta y dos factores numéricos y elige un modelo lineal o cuadrático.",
        "Para el generador elige el tipo de diseño, el número de factores y los puntos centrales.",
        "Ejecútalo y lee la superficie y el punto estacionario, o la matriz y el mapa del diseño.",
      ],
      expected:
        "Una superficie proyectada con su punto estacionario, o una matriz con ensayos, puntos axiales, puntos centrales y alias.",
    },
    advanced: {
      assumptions: [
        "La respuesta es continua; los factores son numéricos; los residuos son independientes.",
      ],
      whenToUse: [
        "Optimización de procesos, curvatura e interacción entre dos factores.",
      ],
      whenNotToUse: [
        "Afirmaciones causales sin un diseño experimental, réplicas ni aleatorización.",
      ],
      reading: [
        "Las curvas de nivel unen combinaciones de factores con la misma respuesta prevista.",
        "Un punto de silla no es un óptimo: sube en una dirección y baja en la otra.",
        "Un factorial completo enumera todos los vértices; una fracción mitad cambia algunos efectos por menos ensayos.",
        "En un diseño compuesto central los puntos axiales estiman la curvatura y los centrales el error puro.",
      ],
      pitfalls: [
        "La superficie solo es válida dentro del intervalo observado de los factores.",
        "Un ajuste cuadrático no sustituye un experimento diseñado.",
        "Los ensayos generados deben aleatorizarse y protegerse de factores de molestia.",
      ],
      charts: [
        "Superficie de respuesta",
        "Mapa de curvas de nivel",
        "Coeficientes del modelo",
        "Mapa del diseño",
      ],
      glossary: [
        {
          term: "Punto estacionario",
          definition: "Donde el gradiente de la superficie es cero.",
        },
        {
          term: "Curva de nivel",
          definition: "Una línea de respuesta prevista constante.",
        },
        {
          term: "CCD",
          definition: "Diseño compuesto central: vértices factoriales, puntos axiales y puntos centrales.",
        },
        {
          term: "Resolución",
          definition: "Grado de confusión de los efectos principales con interacciones en una fracción.",
        },
      ],
    },
    seeAlso: ["factorial", "regression"],
  },
  {
    id: "proportions",
    area: "procedures",
    title: "Proporciones y tasas",
    summary: "Pruebas de una y dos muestras para proporciones y tasas de Poisson.",
    tutorial: {
      goal: "Decidir si una proporción o una tasa de eventos difiere de un objetivo o entre dos grupos.",
      dataset: "two_groups_binary.csv",
      steps: [
        "Elige una o dos proporciones, o una o dos tasas de Poisson.",
        "Selecciona el resultado binario (o la columna de recuento) y la columna de grupo para los modos de dos muestras.",
        "Elige el nivel de éxito, el valor nulo y la exposición por fila cuando sea necesario.",
        "Ejecuta el análisis y lee la prueba exacta, el intervalo y el tamaño del efecto.",
      ],
      expected: "Una tabla con éxitos, ensayos, estimación, p exacto e intervalo, más la diferencia o el cociente de tasas para dos grupos.",
    },
    advanced: {
      assumptions: [
        "Las observaciones son independientes dentro y entre los grupos.",
        "Los recuentos de Poisson son eventos enteros con exposición conocida y varianza igual a la media.",
      ],
      whenToUse: [
        "Comparar tasas de conversión, defectos, incidencia o recuentos por unidad de exposición.",
      ],
      whenNotToUse: [
        "Medidas repetidas o datos agrupados: se viola la independencia.",
      ],
      reading: [
        "El p exacto es la referencia con recuentos pequeños; el p asintótico es una aproximación normal.",
        "El intervalo de Wilson es más estable que el de Wald; Clopper–Pearson garantiza la cobertura nominal.",
        "El riesgo relativo y la odds ratio no sustituyen a la diferencia absoluta.",
      ],
      pitfalls: [
        "Una odds ratio grande puede ocultar una diferencia absoluta mínima cuando los eventos son raros.",
        "La exposición debe declararse: el mismo recuento sobre exposiciones distintas da tasas distintas.",
      ],
      charts: ["Gráfico de intervalo"],
      glossary: [
        { term: "p exacto", definition: "Probabilidad de todos los resultados al menos tan improbables como el observado bajo la hipótesis nula." },
        { term: "Cociente de tasas", definition: "Cociente entre dos tasas de eventos; 1 significa tasas iguales." },
      ],
    },
    seeAlso: ["chisquare", "ttest"],
  },
  {
    id: "variances",
    area: "procedures",
    title: "Varianzas",
    summary: "Una varianza, la prueba F y Bartlett/Levene para la igualdad de dispersiones.",
    tutorial: {
      goal: "Comprobar si una varianza difiere de un objetivo o entre grupos.",
      dataset: "plantgrowth.csv",
      steps: [
        "Elige una varianza o dos o más varianzas.",
        "Selecciona la variable numérica y, para dos o más grupos, la columna de grupo.",
        "Introduce la varianza nula para la prueba de una muestra.",
        "Ejecuta y compara F, Bartlett y Levene antes de elegir una prueba para las medias.",
      ],
      expected: "Una tabla de varianza con intervalo exacto y los valores p de F/Bartlett/Levene cuando hay grupos.",
    },
    advanced: {
      assumptions: [
        "Las observaciones son independientes y, para el χ² y los intervalos F, normales.",
        "Levene sobre medianas es más robusto pero exige grupos independientes.",
      ],
      whenToUse: ["Comprobar homocedasticidad antes de una prueba t o un ANOVA, o comparar la dispersión de un proceso."],
      whenNotToUse: ["Con grupos muy pequeños las pruebas tienen poca potencia; prefiere procedimientos de Welch."],
      reading: [
        "La prueba F abarca dos grupos; con más grupos usa Bartlett o Levene.",
        "Bartlett es potente bajo normalidad pero se distorsiona con valores atípicos y colas pesadas.",
        "Levene sobre medianas reduce la influencia de los extremos y es la opción segura por defecto.",
      ],
      pitfalls: [
        "Una prueba no significativa no demuestra igualdad de varianzas: mira el intervalo y las cajas.",
        "La varianza está en escala cuadrática: presenta la desviación estándar para interpretar.",
      ],
      charts: ["Diagrama de caja", "Gráfico de intervalo"],
      glossary: [
        { term: "Homocedasticidad", definition: "Igualdad de varianzas entre grupos, supuesto de la t agrupada y del ANOVA." },
        { term: "Prueba de Levene", definition: "ANOVA sobre desviaciones absolutas respecto a un centro de grupo; la versión de la mediana es Brown–Forsythe." },
      ],
    },
    seeAlso: ["ttest", "anova"],
  },
];
