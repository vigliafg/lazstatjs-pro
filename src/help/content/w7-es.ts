import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Procedimientos de la ola 7: VAR/VECM, GARCH y modelos de espacio de estados. */
export const w7Topics: HelpTopic[] = [
  procedureTopic({
    id: 'var',
    title: 'VAR / VECM',
    summary: 'Modelar varias series temporales conjuntamente, probar la causalidad de Granger y estimar la corrección del error.',
    goal: 'Describir cómo cada serie depende de su propio pasado y del de las demás, separando relaciones de largo plazo y dinámica de corto plazo.',
    steps: [
      'Seleccionar al menos dos series numéricas en orden temporal.',
      'Dejar los rezagos en 0 para la selección automática por AIC o introducir un orden fijo.',
      'Elegir VAR para series estacionarias o VECM para series I(1) cointegradas.',
      'Leer coeficientes, pruebas de Granger, respuestas impulsivas y descomposición de la varianza.',
    ],
    expected:
      'Resumen del VAR con estabilidad, tabla de coeficientes, pruebas de Granger, respuestas impulsivas y descomposición de la varianza; el VECM añade el vector de cointegración y las velocidades de ajuste.',
    whenToUse: [
      'Cuando varias series evolucionan juntas y se quiere modelar su dinámica conjunta.',
      'Cuando se quiere probar si el pasado de una serie mejora la previsión de otra.',
      'Cuando se sospecha una relación estable de largo plazo entre series no estacionarias.',
    ],
    assumptions: [
      'Las series son estacionarias o se diferenciaron hasta la estacionariedad; el VECM exige series I(1) con cointegración.',
      'Los residuos no presentan autocorrelación tras el orden de rezagos elegido.',
      'Hay suficientes observaciones para el número de parámetros.',
    ],
    whenNotToUse: [
      'Con series muy cortas: el número de parámetros crece rápidamente.',
      'Cuando solo interesa un resultado: un ARIMA o una regresión univariada es más simple.',
      'Cuando dominan cambios estructurales no modelados.',
    ],
    reading: [
      'Un VAR estable tiene todas las raíces características fuera del círculo unitario.',
      'Una prueba de Granger significativa indica capacidad de previsión, no causalidad estructural.',
      'Las respuestas impulsivas dependen del orden de Cholesky.',
      'En un VECM, un α negativo y significativo indica corrección de la desviación de la relación de largo plazo.',
    ],
    pitfalls: [
      'Estimar un VAR sobre niveles con tendencia sin comprobar la estacionariedad.',
      'Leer la causalidad de Granger como causalidad estructural.',
      'Interpretar respuestas impulsivas sin declarar el orden de identificación.',
      'Usar Engle–Granger cuando puede haber más de una relación de cointegración.',
    ],
    charts: ['Respuestas impulsivas por shock y respuesta.', 'Cuotas de la varianza del error en el horizonte final.'],
    glossary: [
      { term: 'VAR', definition: 'Sistema de autorregresiones, una ecuación por serie, con los rezagos de todas las series.' },
      { term: 'Cointegración', definition: 'Combinación lineal estacionaria de series no estacionarias.' },
      { term: 'Respuesta impulsiva', definition: 'Cambio de las series tras un shock de una desviación estándar.' },
    ],
    seeAlso: ['timeseries', 'statespace'],
  }),
  procedureTopic({
    id: 'garch',
    title: 'GARCH',
    summary: 'Estimar la volatilidad condicional que se agrupa en el tiempo con un modelo GARCH(1,1).',
    goal: 'Separar el nivel de una serie de su volatilidad variable en el tiempo y prever la escala de las oscilaciones futuras.',
    steps: [
      'Seleccionar la serie de rendimientos o cambios en orden temporal.',
      'Fijar el horizonte de previsión.',
      'Estimar el modelo y leer persistencia, varianza de largo plazo y vida media.',
      'Comprobar la prueba de Ljung–Box sobre los residuos estandarizados.',
    ],
    expected:
      'Resumen del modelo, coeficientes con errores estándar, diagnóstico de residuos y previsiones de la varianza condicional.',
    whenToUse: [
      'Cuando el tamaño de las oscilaciones cambia con el tiempo y se agrupa en periodos tranquilos y turbulentos.',
      'Cuando se necesita una previsión de volatilidad o una escala variable para medidas de riesgo.',
      'Cuando los residuos de un modelo de media muestran autocorrelación en sus cuadrados.',
    ],
    assumptions: [
      'La varianza condicional sigue la recursión GARCH con ω, α, β positivos y α + β < 1.',
      'Las innovaciones estandarizadas están aproximadamente incorreladas; la normalidad es cómoda pero no necesaria.',
      'La media es constante o ya se ha eliminado.',
    ],
    whenNotToUse: [
      'Cuando la volatilidad reacciona de forma distinta a shocks positivos y negativos: usar un modelo asimétrico.',
      'Cuando la serie tiene tendencia o estacionalidad determinista en la media.',
      'Con menos de unas treinta observaciones.',
    ],
    reading: [
      'α mide la reacción a la última innovación; β la memoria de la volatilidad pasada.',
      'Una persistencia cercana a 1 indica shocks duraderos; la vida media es el número de periodos para reducirlos a la mitad.',
      'La varianza de largo plazo es ω/(1 − α − β) cuando α + β < 1.',
      'La DS condicional es la escala esperada de las oscilaciones, no un intervalo de confianza para la media.',
    ],
    pitfalls: [
      'Confundir previsiones de varianza con previsiones de precio.',
      'Ignorar la autocorrelación residual en los cuadrados.',
      'Reportar la vida media cuando α + β ≥ 1, donde no está definida.',
      'Tratar el modelo como descripción completa de colas y asimetrías.',
    ],
    charts: ['Serie con la desviación estándar condicional.', 'Autocorrelación de los residuos estandarizados.'],
    glossary: [
      { term: 'Efecto ARCH', definition: 'Dependencia de la varianza actual de las innovaciones cuadradas recientes.' },
      { term: 'Persistencia', definition: 'α + β en GARCH(1,1): velocidad de disipación de los shocks de volatilidad.' },
    ],
    seeAlso: ['timeseries', 'var'],
  }),
  procedureTopic({
    id: 'statespace',
    title: 'Espacio de estados y Markov switching',
    summary: 'Estimar un nivel o tendencia latente con el filtro de Kalman, o dos regímenes con un AR(1) de Markov switching.',
    goal: 'Separar señal y ruido y describir series que alternan entre regímenes distintos.',
    steps: [
      'Elegir el modelo local de nivel/tendencia o el Markov switching de dos regímenes.',
      'Seleccionar la serie y el horizonte de previsión.',
      'En el modelo local, decidir si incluir la tendencia estocástica.',
      'Leer los estados suavizados y la previsión, o las probabilidades de régimen y la matriz de transición.',
    ],
    expected:
      'Modelo local: varianzas, estados filtrados y suavizados, previsiones con intervalos. Markov switching: medias y varianzas de régimen, matriz de transición, probabilidades suavizadas y previsiones.',
    whenToUse: [
      'Cuando la serie observada es una medida ruidosa de una cantidad latente más suave.',
      'Cuando la serie parece alternar fases tranquilas y turbulentas, o bajas y altas.',
      'Cuando se necesita una interpolación fundamentada de historia ruidosa o faltante.',
    ],
    assumptions: [
      'El modelo local es lineal y gaussiano con innovaciones independientes.',
      'El modelo de Markov tiene dos regímenes, probabilidades de transición constantes y una media AR(1) en cada régimen.',
      'El número de regímenes es conocido y las etiquetas se identifican con los valores iniciales.',
    ],
    whenNotToUse: [
      'Cuando los cambios de régimen dependen de covariables observadas: un modelo de umbral es más claro.',
      'Con series muy cortas las varianzas y etiquetas son inestables.',
      'Cuando una simple regresión de tendencia responde a la pregunta.',
    ],
    reading: [
      'El estado filtrado usa solo el pasado; el suavizado usa toda la serie.',
      'En el modelo local una varianza de observación grande indica mucho ruido de medida.',
      'En el modelo de Markov la duración esperada de un régimen es 1/(1 − p).',
      'La previsión media promedia los regímenes con sus probabilidades de transición.',
    ],
    pitfalls: [
      'Leer el estado filtrado como si usara observaciones futuras.',
      'Imponer una tendencia estocástica cuando el modelo de solo nivel tiene mejor AIC/BIC.',
      'Interpretar las etiquetas de régimen sin comprobar su sentido sustantivo.',
      'Ignorar la incertidumbre de la clasificación de regímenes.',
    ],
    charts: ['Serie observada, nivel suavizado y previsión.', 'Probabilidad suavizada del segundo régimen.'],
    glossary: [
      { term: 'Filtro de Kalman', definition: 'Actualización recursiva de un estado latente a partir de observaciones ruidosas.' },
      { term: 'Suavizador', definition: 'Estimación del estado latente que usa toda la serie, pasado y futuro.' },
      { term: 'Markov switching', definition: 'Modelo en el que los parámetros cambian según una cadena de Markov oculta.' },
    ],
    seeAlso: ['timeseries', 'var'],
  }),
];
