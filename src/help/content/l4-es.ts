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
      "Gráficos de control, capacidad, Pareto y variabilidad en una sola plataforma.",
    tutorial: {
      goal: "Comprobar si un proceso es estable y capaz.",
      steps: [
        "Elige el modo: gráfico de control, capacidad, Pareto o variabilidad.",
        "Selecciona la variable numérica (o la categoría para Pareto).",
        "Fija los límites de especificación y el tamaño del subgrupo cuando sea necesario.",
        "Ejecútalo y lee el gráfico, los índices y el informe de lectura.",
      ],
      expected:
        "Un gráfico de control con límites, índices de capacidad o un gráfico de Pareto, además de las tablas.",
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
      ],
      pitfalls: [
        "Los límites de control no son límites de especificación.",
        "La capacidad supone normalidad y un proceso estable.",
      ],
      charts: [
        "Gráfico de control",
        "Histograma de capacidad",
        "Gráfico de Pareto",
        "Diagrama de caja de variabilidad",
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
    title: "Superficie de respuesta (DOE)",
    summary:
      "Superficie cuadrática y mapa de curvas de nivel para dos factores continuos.",
    tutorial: {
      goal: "Encontrar la combinación de dos factores que optimiza una respuesta.",
      steps: [
        "Selecciona la respuesta numérica y dos factores numéricos.",
        "Elige un modelo lineal o cuadrático.",
        "Ejecútalo y lee la superficie, las curvas de nivel y el punto estacionario.",
      ],
      expected:
        "Una superficie proyectada, curvas de nivel, coeficientes del modelo y un punto estacionario.",
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
      ],
      pitfalls: [
        "La superficie solo es válida dentro del intervalo observado de los factores.",
        "Un ajuste cuadrático no sustituye un experimento diseñado.",
      ],
      charts: [
        "Superficie de respuesta",
        "Mapa de curvas de nivel",
        "Coeficientes del modelo",
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
      ],
    },
    seeAlso: ["factorial", "regression"],
  },
];
