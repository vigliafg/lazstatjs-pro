import type { HelpTopic } from './types';

/** Procedimientos de la oleada 2: GLM, cuantílica, no lineal y multinomial. */
export const w2Topics: HelpTopic[] = [
  {
    id: 'glm',
    area: 'procedures',
    title: 'Modelo lineal generalizado (GLM)',
    summary: 'Familias gaussiana, binomial, Poisson y Gamma con elección del enlace.',
    tutorial: {
      goal: 'Estimar cómo cambia una puntuación con la edad cuando el resultado no es una media continua simple.',
      dataset: 'score-groups.csv',
      steps: [
        'Variable dependiente = Score, independientes = Age.',
        'Elige la familia: gaussiana para una puntuación continua, binomial para 0/1, Poisson para recuentos, Gamma para importes positivos y asimétricos.',
        'Elige un enlace coherente con la familia: identidad, log, logit, probit o inverso.',
        'Ejecuta y lee los coeficientes en la escala del enlace junto con la desvianza y el AIC.',
      ],
      expected: 'Tabla de coeficientes en la escala del enlace, bondad del modelo (desvianza, AIC), residuos y, con un solo predictor, el perfil de la media estimada.',
    },
    advanced: {
      assumptions: [
        'Observaciones independientes y una respuesta cuya varianza sigue la familia elegida.',
        'El enlace une el valor esperado con un predictor lineal: la parte lineal debe ser correcta.',
        'Binomial exige respuesta 0/1, Poisson recuentos no negativos, Gamma valores estrictamente positivos.',
      ],
      whenToUse: [
        'Resultado continuo pero asimétrico o heterocedástico, típicamente Gamma con enlace log.',
        'Resultado binario cuando necesitas un enlace probit o una familia fuera del menú logístico clásico.',
        'Recuentos cuando quieres comparar el enlace log de Poisson con la diagnóstica de desvianza.',
      ],
      whenNotToUse: [
        'Resultado binario que encaja en el procedimiento logístico dedicado, con odds ratios y análisis del punto de corte.',
        'Recuentos con sobredispersión: el binomial negativo de la regresión para recuentos suele ser mejor.',
        'Medidas repetidas o agrupadas: usa modelos mixtos o GEE.',
      ],
      reading: [
        'Los coeficientes viven en la escala del enlace: con enlace log exp(β) es una razón multiplicativa, con enlace logit es un odds ratio.',
        'Una desvianza residual muy superior a sus grados de libertad indica sobredispersión, sobre todo en Poisson y binomial.',
        'El AIC compara modelos con la misma respuesta y familia; no es una medida absoluta de ajuste.',
      ],
      pitfalls: [
        'Leer un coeficiente con enlace log como un cambio aditivo del resultado.',
        'Mantener la familia gaussiana con una respuesta 0/1 o de recuento solo porque el modelo se ejecuta.',
        'Elegir el enlace probit y después interpretar los coeficientes como odds ratios.',
      ],
      charts: [
        'Valores observados y estimados: puntos cerca de la diagonal indican buena calibración.',
        'Residuos frente a valores estimados: un embudo o una curva revelan familia o enlace equivocados.',
        'Perfil de la media estimada: con un solo predictor, la curva ajustada en el rango observado.',
      ],
      glossary: [
        { term: 'Enlace', definition: 'La función que conecta el valor esperado con el predictor lineal.' },
        { term: 'Desvianza', definition: 'Medida de bondad del modelo: más baja es mejor y es comparable entre modelos anidados.' },
        { term: 'Sobredispersión', definition: 'Varianza mayor que la que supone la familia, que infla los errores estándar.' },
      ],
    },
    seeAlso: ['regression', 'logistic', 'countreg'],
  },
  {
    id: 'quantile',
    area: 'procedures',
    title: 'Regresión cuantílica',
    summary: 'Modela un cuantil condicional (τ) en lugar de la media, robusta a los valores extremos.',
    tutorial: {
      goal: 'Ver si la edad desplaza la puntuación mediana, no solo la media.',
      dataset: 'score-groups.csv',
      steps: [
        'Variable dependiente = Score, independientes = Age.',
        'Fija τ: 0,5 es la mediana; 0,1 y 0,9 describen las colas inferior y superior.',
        'Ejecuta y lee el coeficiente de cada predictor en ese cuantil.',
        'Repite con otro τ y compara las dos rectas ajustadas.',
      ],
      expected: 'Coeficientes, errores estándar e IC para el cuantil elegido; con un solo predictor, la recta del cuantil y el gráfico de residuos.',
    },
    advanced: {
      assumptions: [
        'Observaciones independientes; en el τ elegido el cuantil condicional es lineal en los predictores.',
        'No se exige normalidad de los residuos ni varianza constante.',
      ],
      whenToUse: [
        'Resultados asimétricos, valores extremos o interés en las colas (rentas, latencias, puntuaciones).',
        'Cuando el efecto de un predictor puede cambiar a lo largo de la distribución.',
      ],
      whenNotToUse: [
        'Cuando necesitas un único efecto medio y el objetivo es la media.',
        'Con muestras muy pequeñas: cada cuantil de cola usa pocas observaciones efectivas.',
      ],
      reading: [
        'El coeficiente es el cambio del cuantil τ por una unidad más del predictor.',
        'Pendientes distintas entre los τ indican que el predictor actúa de forma diferente en el centro y en las colas.',
        'Los errores estándar proceden de la teoría de cuantiles (tipo sándwich); con pocos casos los intervalos son amplios.',
      ],
      pitfalls: [
        'Leer un coeficiente mediano como efecto medio: la media puede estar en otro lugar.',
        'Rectas de cuantiles que se cruzan (τ1 < τ2 pero la recta de τ1 queda por encima) sugieren un modelo mal especificado.',
      ],
      charts: [
        'Recta del cuantil: observaciones con la recta del τ ajustado; la pendiente es el efecto sobre el cuantil.',
        'Residuos frente a cuantiles estimados: una estructura indica que el modelo cuantílico lineal es erróneo.',
      ],
      glossary: [
        { term: 'Cuantil τ', definition: 'El valor por debajo del cual cae una proporción τ de la distribución condicional.' },
        { term: 'Regresión mediana', definition: 'Regresión cuantílica con τ = 0,5, robusta a las observaciones extremas.' },
      ],
    },
    seeAlso: ['regression', 'nonparamrm', 'lmm'],
  },
  {
    id: 'nonlinear',
    area: 'procedures',
    title: 'Regresión no lineal',
    summary: 'Curvas exponencial, logística, Gompertz, potencia y Michaelis–Menten por mínimos cuadrados.',
    tutorial: {
      goal: 'Ajustar una curva que sube rápido y luego se aplana, y leer sus parámetros.',
      dataset: 'score-groups.csv',
      steps: [
        'Variable dependiente = Score, predictor = Time.',
        'Elige la forma: exponencial, logística, Gompertz, potencia o Michaelis–Menten.',
        'Ejecuta y comprueba que el ajuste converja; después lee los parámetros con sus IC.',
        'Mira la curva y los residuos; prueba otra forma si el patrón es sistemático.',
      ],
      expected: 'Tabla de parámetros con SE, t, p e IC, R², RMSE, curva ajustada y gráfico de residuos.',
    },
    advanced: {
      assumptions: [
        'La forma funcional elegida es correcta; los residuos son independientes y aproximadamente homocedásticos.',
        'El rango del predictor cubre la parte de la curva que quieres describir.',
        'Suficientes valores distintos del predictor para identificar todos los parámetros.',
      ],
      whenToUse: [
        'Formas de crecimiento, decaimiento, saturación y dosis–respuesta que una recta no describe.',
        'Cuando los parámetros tienen significado: asíntota, tasa, semisaturación.',
      ],
      whenNotToUse: [
        'Cuando una transformación vuelve la relación lineal e interpretable, como log–log para una ley de potencia.',
        'Con pocos puntos o un rango estrecho del predictor: los parámetros están débilmente identificados.',
      ],
      reading: [
        'Exponencial y = a·exp(b·x): b > 0 es crecimiento, b < 0 es decaimiento.',
        'Logística L/(1+exp(−k(x−x0))): L es la asíntota superior, k la pendiente, x0 el punto de inflexión.',
        'Gompertz a·exp(−b·exp(−c·x)): crecimiento asimétrico que se acerca más despacio a la asíntota.',
        'Potencia a·x^b: b es el exponente; Michaelis–Menten vmax·x/(km+x): km es el valor de semisaturación.',
      ],
      pitfalls: [
        'Comparar R² entre curvas distintas sin revisar el patrón de los residuos.',
        'Fiarse de un ajuste convergente con intervalos de parámetros amplios o inverosímiles.',
        'Extrapolar fuera del rango observado del predictor, sobre todo en el crecimiento exponencial.',
      ],
      charts: [
        'Curva estimada: observaciones con la curva ajustada superpuesta.',
        'Residuos frente a valores estimados: arcos sistemáticos indican que la curva elegida es errónea.',
      ],
      glossary: [
        { term: 'Asíntota', definition: 'El valor al que tiende la curva cuando el predictor crece.' },
        { term: 'Semisaturación', definition: 'El valor del predictor en el que la respuesta alcanza la mitad de su máximo (km).' },
      ],
    },
    seeAlso: ['regression', 'glm', 'countreg'],
  },
  {
    id: 'multinomial',
    area: 'procedures',
    title: 'Regresión logística multinomial',
    summary: 'Resultado nominal con tres o más clases, cada una frente a una clase de referencia.',
    tutorial: {
      goal: 'Estimar cómo los predictores cambian la probabilidad de pertenecer a cada clase de un resultado nominal.',
      steps: [
        'Resultado = la columna categórica con al menos tres clases, por ejemplo bajo/medio/alto.',
        'Selecciona los predictores numéricos.',
        'Ejecuta y lee un bloque de coeficientes por clase frente a la clase de referencia.',
        'Comprueba la exactitud global y la de cada clase antes de fiarte de la clasificación.',
      ],
      expected: 'Coeficientes y razones de riesgo relativo con IC para cada clase frente a la referencia, exactitud global y tabla de clasificación.',
    },
    advanced: {
      assumptions: [
        'Observaciones independientes; el log-odds de cada clase frente a la referencia es lineal en los predictores.',
        'Independencia de alternativas irrelevantes: añadir o quitar una clase no debe cambiar las demás.',
        'Cada clase tiene suficientes observaciones para el número de parámetros.',
      ],
      whenToUse: [
        'Resultado nominal con más de dos categorías no ordenadas, como medio de transporte o elección de producto.',
        'Cuando quieres efectos específicos por clase en lugar de un único contraste binario.',
      ],
      whenNotToUse: [
        'Clases ordenadas: la logística ordinal es más parsimoniosa.',
        'Resultado binario: usa la regresión logística.',
        'Clases muy raras: las estimaciones son inestables.',
      ],
      reading: [
        'Cada clase se compara con la de referencia: exp(β) es una razón de riesgo relativo, no una probabilidad.',
        'Una razón superior a 1 significa que el predictor aumenta las odds de esa clase frente a la referencia.',
        'La exactitud global puede ser alta solo porque una clase domina: lee también la exactitud por clase.',
      ],
      pitfalls: [
        'Interpretar las razones de riesgo relativo como probabilidades o como razones de riesgo.',
        'Cambiar la clase de referencia y esperar los mismos números: la comparación cambia.',
        'Usar la multinomial cuando las clases son ordenadas.',
      ],
      charts: [
        'Distribución de las clases predichas: cada barra cuenta cuántas observaciones asigna el modelo a esa clase.',
        'Exactitud por clase: porcentaje clasificado correctamente en cada clase, con la exactitud global como línea de referencia.',
      ],
      glossary: [
        { term: 'Clase de referencia', definition: 'La clase con la que se comparan todas las demás.' },
        { term: 'Razón de riesgo relativo', definition: 'El cambio multiplicativo de las odds de una clase frente a la referencia por una unidad más del predictor.' },
        { term: 'Softmax', definition: 'La función que convierte las puntuaciones de las clases en probabilidades que suman uno.' },
      ],
    },
    seeAlso: ['logistic', 'multivariate', 'ordinal'],
  },
];
