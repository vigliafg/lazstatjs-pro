import type { HelpTopic } from '../types';

/** Procedure chapters: description, comparison of means and regression models. */
export const coreTopics: HelpTopic[] = [
  {
    id: 'descriptive',
    area: 'procedures',
    title: 'Estadística descriptiva',
    summary: 'Media, dispersión, cuantiles, valores ausentes y comprobaciones de normalidad para cada variable.',
    tutorial: {
      goal: 'Resumir las variables numéricas de un estudio antes de elegir una prueba.',
      dataset: 'score-groups.csv',
      steps: [
        'Abre Descriptivo desde la familia Descriptivo.',
        'Selecciona las variables numéricas (Score, Age) y mantén el nivel de confianza en el 95 %.',
        'Pulsa Ejecutar análisis y lee la fila de cada variable.',
        'Comprueba la columna de ausentes y la prueba de normalidad antes de comparar grupos.',
      ],
      expected: 'Una fila por variable con N, media, desviación estándar, mediana, cuartiles, mínimo y máximo, además del resultado de normalidad.',
    },
    advanced: {
      assumptions: ['La media y la desviación estándar requieren una variable cuantitativa.'],
      whenToUse: [
        'Siempre, como primer paso: muestra la forma de los datos y los valores raros.',
        'Para decidir entre pruebas paramétricas y no paramétricas.',
      ],
      whenNotToUse: ['Con variables categóricas: usa frecuencias, no la media.'],
      reading: [
        'Una media muy alejada de la mediana sugiere asimetría o valores extremos.',
        'Las pruebas de normalidad son orientativas: con N grande son demasiado sensibles y con N pequeño tienen poca potencia.',
      ],
      pitfalls: [
        'Nunca presentes la desviación estándar como error estándar: son cantidades distintas.',
        'Un solo valor atípico puede dominar la media y la desviación estándar.',
      ],
      glossary: [
        { term: 'Desviación estándar', definition: 'Dispersión media de los valores alrededor de la media, en la misma unidad que los datos.' },
        { term: 'Cuantil', definition: 'El valor por debajo del cual cae un porcentaje dado de observaciones.' },
      ],
    },
    seeAlso: ['distfit', 'ttest'],
  },
  {
    id: 'distfit',
    area: 'procedures',
    title: 'Ajuste de distribuciones',
    summary: 'Comparar la distribución observada con familias teóricas y elegir la mejor.',
    tutorial: {
      goal: 'Averiguar qué distribución teórica describe mejor una variable.',
      dataset: 'score-groups.csv',
      steps: [
        'Abre el procedimiento y selecciona la variable numérica.',
        'Marca las distribuciones que quieras comparar (normal, lognormal, gamma, Weibull…).',
        'Ejecútalo y lee la tabla de bondad de ajuste.',
        'Vuelve a ejecutarlo solo con la mejor distribución para obtener el gráfico comparativo.',
      ],
      expected: 'Se resalta la distribución con el mejor criterio; el gráfico superpone la densidad teórica y el histograma observado.',
    },
    advanced: {
      assumptions: ['Las observaciones deben ser independientes.'],
      whenToUse: ['Para elegir una familia antes de modelar tiempos, recuentos o importes.'],
      whenNotToUse: ['Con menos de unas pocas docenas de casos, las familias son difíciles de distinguir.'],
      reading: [
        'Un AIC/BIC más bajo indica un mejor ajuste.',
        'Un valor p de bondad de ajuste no demuestra la normalidad: solo mide la evidencia en contra.',
      ],
      pitfalls: ['Elegir la distribución a partir de los datos y luego probarla con los mismos datos sobreestima el ajuste.'],
      glossary: [
        { term: 'AIC', definition: 'Un criterio que premia el ajuste y penaliza el número de parámetros.' },
        { term: 'Lognormal', definition: 'Una distribución cuyo logaritmo es normal; típica de importes y tiempos.' },
      ],
    },
    seeAlso: ['descriptive', 'parametric'],
  },
  {
    id: 'ttest',
    area: 'procedures',
    title: 'Prueba t',
    summary: 'Comparar dos medias o dos mediciones emparejadas, con una alternativa no paramétrica.',
    tutorial: {
      goal: 'Comprobar si la puntuación media difiere entre dos grupos independientes.',
      dataset: 'score-groups.csv',
      steps: [
        'Abre Prueba t y fija Tipo de prueba = Muestras independientes.',
        'Variable 1 = Score, Variable 2 = Group.',
        'Mantén Varianzas en Welch salvo que sepas que son iguales.',
        'Ejecútalo y lee la diferencia, el intervalo de confianza y el valor p.',
      ],
      expected: 'Dos filas descriptivas, la prueba t con los grados de libertad, la diferencia con su CI y el informe de lectura.',
    },
    advanced: {
      assumptions: [
        'Observaciones independientes; en la prueba emparejada, un vínculo entre las dos medidas del mismo sujeto.',
        'Con N pequeño, normalidad o al menos ausencia de asimetría fuerte.',
      ],
      whenToUse: ['Dos grupos o dos momentos temporales, con un resultado numérico.'],
      whenNotToUse: ['Más de dos grupos (usa ANOVA) o un resultado categórico.'],
      reading: [
        'El valor p responde a «qué compatible es esto con la ausencia de diferencia», no a la probabilidad de que la hipótesis nula sea cierta.',
        'El intervalo de confianza también muestra qué tamaño podría tener la diferencia: valora la relevancia práctica.',
      ],
      pitfalls: [
        'Comparar muchas parejas sin corrección infla los falsos positivos.',
        'Un resultado no significativo no demuestra igualdad: mira el intervalo.',
      ],
      glossary: [
        { term: 'Welch', definition: 'La variante de la prueba t que no supone varianzas iguales.' },
        { term: 'd de Cohen', definition: 'Tamaño del efecto expresado en unidades de desviación estándar.' },
      ],
    },
    seeAlso: ['anova', 'nonparamrm', 'tost'],
  },
  {
    id: 'anova',
    area: 'procedures',
    title: 'ANOVA de un factor',
    summary: 'Comparar las medias de dos o más grupos con pruebas post-hoc y Kruskal-Wallis.',
    tutorial: {
      goal: 'Saber si la puntuación media cambia entre tres grupos de tratamiento.',
      dataset: 'score-groups.csv',
      steps: [
        'Abre ANOVA, fija Variable dependiente = Score y Variable de grupo = Group.',
        'Mantén Post-hoc = Holm y activa la alternativa no paramétrica.',
        'Ejecútalo y revisa la tabla principal, después las comparaciones post-hoc.',
      ],
      expected: 'Tabla ANOVA con F, grados de libertad y p; diferencias post-hoc con CI; Kruskal-Wallis como comprobación.',
    },
    advanced: {
      assumptions: ['Independencia, residuos normales y varianzas similares entre grupos.'],
      whenToUse: ['Un factor entre sujetos con tres o más niveles.'],
      whenNotToUse: ['Medidas repetidas (usa el ANOVA de medidas repetidas) o dos grupos (la prueba t es equivalente).'],
      reading: [
        'Un p significativo dice que al menos una media difiere: el post-hoc dice cuál.',
        'Un Levene significativo sugiere varianzas distintas: prefiere Welch o Kruskal-Wallis.',
      ],
      pitfalls: [
        'Elige la prueba post-hoc antes de mirar los datos, no después.',
        'Volver a ejecutar ANOVA en subgrupos elegidos a posteriori infla los falsos positivos.',
      ],
      glossary: [
        { term: 'Post-hoc', definition: 'Comparaciones por pares que se ejecutan tras una prueba global significativa.' },
        { term: 'Holm', definition: 'Una corrección de los valores p que controla el error por familia sin ser demasiado conservadora.' },
      ],
    },
    seeAlso: ['factorial', 'ancova', 'nonparamrm'],
  },
  {
    id: 'factorial',
    area: 'procedures',
    title: 'ANOVA factorial',
    summary: 'Dos factores entre sujetos, efectos principales y su interacción.',
    tutorial: {
      goal: 'Comprobar si el efecto de un tratamiento depende del sexo de los participantes.',
      dataset: 'score-groups.csv',
      steps: [
        'Selecciona la variable dependiente y los dos factores (Factor A, Factor B).',
        'Activa «Incluir la interacción A × B».',
        'Ejecútalo y lee la tabla de efectos: A, B y A × B.',
        'Si la interacción es significativa, comenta las medias de las celdas en lugar de solo los efectos principales.',
      ],
      expected: 'Una fila por efecto con F, grados de libertad, p y tamaño del efecto, además de las medias de las celdas.',
    },
    advanced: {
      assumptions: ['Independencia, residuos normales y varianzas similares en las celdas.'],
      whenToUse: ['Dos factores categóricos entre sujetos con suficientes casos por celda.'],
      whenNotToUse: ['Las celdas con muy pocos casos hacen inestable la interacción.'],
      reading: [
        'Un efecto principal significativo en presencia de una interacción significativa debe leerse con cuidado.',
        'Las medias de las celdas muestran la dirección de la interacción.',
      ],
      pitfalls: ['En diseños desequilibrados el orden de los términos cambia los resultados: comprueba el tipo de sumas de cuadrados.'],
      glossary: [
        { term: 'Interacción', definition: 'Cuando el efecto de un factor cambia entre los niveles del otro.' },
        { term: 'Efecto principal', definition: 'El efecto promedio de un factor ignorando el otro.' },
      ],
    },
    seeAlso: ['anova', 'mixedanova'],
  },
  {
    id: 'ancova',
    area: 'procedures',
    title: 'ANCOVA',
    summary: 'Comparar grupos ajustando por covariables continuas, con medias ajustadas.',
    tutorial: {
      goal: 'Comparar grupos teniendo en cuenta la edad de los participantes.',
      dataset: 'score-groups.csv',
      steps: [
        'Elige la variable dependiente, el factor de grupo y al menos una covariable.',
        'Ejecútalo y revisa la prueba de homogeneidad de pendientes.',
        'Lee las medias ajustadas con intervalos de confianza y las comparaciones de Holm.',
      ],
      expected: 'Efecto del grupo ajustado por las covariables, medias ajustadas y diagnósticos de pendientes.',
    },
    advanced: {
      assumptions: [
        'Una relación lineal entre la covariable y el resultado dentro de cada grupo.',
        'Pendientes homogéneas: si la prueba es significativa, el ANCOVA clásico no es adecuado.',
      ],
      whenToUse: ['Grupos desequilibrados en una variable continua que influye en el resultado.'],
      whenNotToUse: ['Una covariable medida después del tratamiento: corres el riesgo de ajustar y eliminar el efecto.'],
      reading: ['Presenta las medias ajustadas, no las brutas.'],
      pitfalls: ['Una covariable correlacionada con el grupo hace frágil la interpretación.'],
      glossary: [
        { term: 'Medias ajustadas', definition: 'Medias estimadas como si todos los grupos tuvieran el mismo valor medio de la covariable.' },
        { term: 'Pendientes homogéneas', definition: 'La relación covariable-resultado tiene la misma pendiente en todos los grupos.' },
      ],
    },
    seeAlso: ['anova', 'regression'],
  },
  {
    id: 'repeatedanova',
    area: 'procedures',
    title: 'ANOVA de medidas repetidas',
    summary: 'Comparar condiciones medidas en los mismos sujetos, con correcciones de esfericidad.',
    tutorial: {
      goal: 'Comparar tres mediciones tomadas en los mismos participantes.',
      dataset: 'score-groups.csv',
      steps: [
        'Organiza los datos en formato ancho: una fila por sujeto y una columna por condición.',
        'Selecciona las columnas de condición (al menos tres).',
        'Ejecútalo y revisa Mauchly y las correcciones de Greenhouse–Geisser o Huynh–Feldt.',
        'Si la prueba global es significativa, lee las comparaciones por pares corregidas.',
      ],
      expected: 'Tabla intrasujeto con F, esfericidad y p corregidos, además de las comparaciones post-hoc.',
    },
    advanced: {
      assumptions: ['Esfericidad: las diferencias entre condiciones tienen la misma variabilidad.'],
      whenToUse: ['Las mismas unidades medidas en tres o más ocasiones.'],
      whenNotToUse: ['Muchos datos ausentes: es mejor un modelo mixto.'],
      reading: [
        'Si Mauchly es significativo, usa los grados de libertad corregidos.',
        'La corrección cambia los grados de libertad, no las medias.',
      ],
      pitfalls: ['Un orden de columnas equivocado compara las condiciones equivocadas.'],
      glossary: [
        { term: 'Esfericidad', definition: 'El supuesto de que las varianzas de las diferencias entre condiciones son iguales.' },
        { term: 'Greenhouse–Geisser', definition: 'Una corrección conservadora de los grados de libertad cuando se incumple la esfericidad.' },
      ],
    },
    seeAlso: ['mixedanova', 'nonparamrm'],
  },
  {
    id: 'mixedanova',
    area: 'procedures',
    title: 'ANOVA mixto',
    summary: 'Un factor entre sujetos y condiciones intrasujeto, con su interacción.',
    tutorial: {
      goal: 'Comparar la trayectoria de dos grupos a lo largo de tres momentos.',
      dataset: 'score-groups.csv',
      steps: [
        'Prepara el formato ancho: una fila por sujeto y una columna por momento.',
        'Define el grupo entre sujetos y las columnas de condición intrasujeto.',
        'Ejecútalo y lee los efectos de tiempo, grupo y tiempo × grupo.',
      ],
      expected: 'Tres filas de efectos con valores p corregidos y medias por grupo y tiempo.',
    },
    advanced: {
      assumptions: ['Esfericidad intrasujeto, residuos normales e independencia entre sujetos.'],
      whenToUse: ['Diseño longitudinal con un grupo de comparación.'],
      whenNotToUse: ['Grupos muy pequeños o datos ausentes estructurales.'],
      reading: ['Una interacción significativa significa que los grupos cambian de forma distinta con el tiempo.'],
      pitfalls: ['Mezclar formatos ancho y largo produce columnas equivocadas y resultados sin sentido.'],
      glossary: [
        { term: 'Entre sujetos', definition: 'Un factor cuyos niveles se asignan a unidades distintas.' },
        { term: 'Intrasujeto', definition: 'Un factor medido repetidamente en la misma unidad.' },
      ],
    },
    seeAlso: ['repeatedanova', 'lmm'],
  },
  {
    id: 'nonparamrm',
    area: 'procedures',
    title: 'Pruebas no paramétricas para medidas repetidas',
    summary: 'Friedman, McNemar, Cochran Q y Jonckheere–Terpstra.',
    tutorial: {
      goal: 'Comparar tres condiciones sin suponer normalidad.',
      dataset: 'score-groups.csv',
      steps: [
        'Elige la prueba para tu diseño: Friedman para condiciones ordenadas y McNemar para dos medidas binarias emparejadas.',
        'Selecciona las columnas o variables que necesita.',
        'Ejecútalo y lee el estadístico con su valor p y, para Friedman, el post-hoc de Nemenyi.',
      ],
      expected: 'Estadístico, grados de libertad y p; para Friedman, las comparaciones por pares con diferencias de rangos.',
    },
    advanced: {
      assumptions: ['Observaciones emparejadas; Cochran Q necesita un resultado binario.'],
      whenToUse: ['Muestras pequeñas, resultados ordinales o distribuciones muy asimétricas.'],
      whenNotToUse: ['Muestras grandes continuas con distribución regular: las pruebas paramétricas tienen más potencia.'],
      reading: ['Un p significativo significa que al menos una condición difiere; el post-hoc dice cuál.'],
      pitfalls: ['Los rangos pierden información de magnitud: presenta también las medianas.'],
      glossary: [
        { term: 'Friedman', definition: 'La alternativa no paramétrica al ANOVA de medidas repetidas.' },
        { term: 'McNemar', definition: 'Una prueba para dos medidas binarias emparejadas.' },
      ],
    },
    seeAlso: ['repeatedanova', 'ttest'],
  },
  {
    id: 'tost',
    area: 'procedures',
    title: 'Equivalencia (TOST)',
    summary: 'Demostrar que dos tratamientos son equivalentes dentro de un margen fijado de antemano.',
    tutorial: {
      goal: 'Demostrar que un medicamento genérico es equivalente al de referencia dentro de ±0.5.',
      dataset: 'score-groups.csv',
      steps: [
        'Elige el diseño (dos grupos o medidas emparejadas).',
        'Fija el margen de equivalencia (p. ej. 0.5) antes de mirar los datos.',
        'Ejecútalo y lee las dos pruebas unilaterales y el intervalo de confianza.',
      ],
      expected: 'Dos valores p unilaterales y una conclusión de equivalencia solo cuando todo el intervalo queda dentro del margen.',
    },
    advanced: {
      assumptions: ['Los mismos que la prueba t correspondiente; el margen debe justificarse clínicamente.'],
      whenToUse: ['Bioequivalencia, no inferioridad y comparación de dos versiones de un instrumento.'],
      whenNotToUse: ['Para «demostrar» la ausencia de una diferencia sin un margen preespecificado.'],
      reading: ['La equivalencia exige que todo el intervalo quede dentro de ±margen.'],
      pitfalls: ['Elegir el margen después de ver los datos invalida el procedimiento.'],
      glossary: [
        { term: 'TOST', definition: 'Dos pruebas unilaterales que, juntas, evalúan la equivalencia.' },
        { term: 'Margen', definition: 'La diferencia máxima considerada clínicamente aceptable.' },
      ],
    },
    seeAlso: ['ttest', 'samplesize'],
  },
  {
    id: 'correlation',
    area: 'procedures',
    title: 'Correlación',
    summary: 'Pearson, Spearman y Kendall con intervalos de confianza y una matriz.',
    tutorial: {
      goal: 'Medir la asociación entre dos variables continuas.',
      dataset: 'score-groups.csv',
      steps: [
        'Selecciona dos o más variables.',
        'Elige el método principal: Pearson para relaciones lineales, Spearman con valores atípicos o rangos.',
        'Ejecútalo y lee el coeficiente, el CI y el valor p; la matriz muestra todas las parejas.',
      ],
      expected: 'Coeficiente con intervalo de confianza, valor p y una matriz de correlaciones con unos en la diagonal.',
    },
    advanced: {
      assumptions: ['Pearson: relación lineal y sin valores atípicos dominantes. Spearman: solo relación monótona.'],
      whenToUse: ['Explorar asociaciones antes de un modelo o comprobar la colinealidad.'],
      whenNotToUse: ['Para inferencia causal: la correlación no identifica la dirección.'],
      reading: [
        'El signo da la dirección y el valor absoluto la fuerza.',
        'Con muchas variables hay demasiados valores p sin corregir: interpreta con cautela.',
      ],
      pitfalls: ['Una correlación fuerte puede desaparecer o invertirse dentro de subgrupos (paradoja de Simpson).'],
      glossary: [
        { term: 'r de Pearson', definition: 'Una medida de asociación lineal entre dos variables cuantitativas.' },
        { term: 'ρ de Spearman', definition: 'Una correlación de rangos, robusta frente a valores atípicos.' },
      ],
    },
    seeAlso: ['regression', 'multivariate'],
  },
  {
    id: 'regression',
    area: 'procedures',
    title: 'Regresión lineal',
    summary: 'Mínimos cuadrados con diagnósticos, errores estándar robustos y Theil-Sen.',
    tutorial: {
      goal: 'Estimar cuánto cambia la puntuación al aumentar la edad.',
      dataset: 'score-groups.csv',
      steps: [
        'Variable dependiente = Score, independientes = Age.',
        'Mantén OLS y, en Avanzado, activa los errores estándar robustos si sospechas heterocedasticidad.',
        'Ejecútalo y lee el coeficiente, el error estándar, el CI y la R².',
        'Revisa los gráficos de diagnóstico de los residuos.',
      ],
      expected: 'Tabla de coeficientes con CI, estadísticos de bondad de ajuste y diagnósticos de los residuos.',
    },
    advanced: {
      assumptions: [
        'Linealidad, errores independientes, homocedasticidad y residuos normales (para las pruebas).',
        'Sin colinealidad extrema entre los predictores.',
      ],
      whenToUse: ['Resultado continuo y una relación aproximadamente lineal.'],
      whenNotToUse: ['Resultado binario (logística), recuentos (Poisson/NB) o tiempos censurados (supervivencia).'],
      reading: [
        'Un coeficiente es el cambio esperado en el resultado por una unidad más del predictor, todo lo demás constante.',
        'La R² describe la variabilidad explicada, no la calidad causal del modelo.',
      ],
      pitfalls: [
        'Extrapolar fuera del rango observado de los predictores.',
        'Leer un coeficiente en un modelo con interacción como un efecto promedio.',
      ],
      glossary: [
        { term: 'HC3', definition: 'Un estimador robusto del error estándar válido con heterocedasticidad.' },
        { term: 'Theil-Sen', definition: 'Una recta robusta basada en la mediana de las pendientes por pares.' },
      ],
    },
    seeAlso: ['correlation', 'logistic', 'ancova'],
  },
  {
    id: 'logistic',
    area: 'procedures',
    title: 'Regresión logística',
    summary: 'Resultado binario con odds ratios, análisis del punto de corte y una opción de Firth.',
    tutorial: {
      goal: 'Estimar el efecto de la edad sobre la probabilidad de un evento.',
      dataset: 'score-groups.csv',
      steps: [
        'Elige Resultado (0/1) y los predictores.',
        'Ejecútalo y lee los odds ratios con intervalos de confianza.',
        'Mira la tabla de clasificación y el punto de corte sugerido.',
        'Activa Firth con pocos eventos o separación.',
      ],
      expected: 'Coeficientes, odds ratios con CI, medidas de discriminación y una tabla de clasificación.',
    },
    advanced: {
      assumptions: ['Observaciones independientes; logit lineal en los predictores.'],
      whenToUse: ['Resultado dicotómico (sí/no, vivo/muerto, éxito/fracaso).'],
      whenNotToUse: ['Resultado ordenado con más de dos categorías (usa la logística ordinal).'],
      reading: [
        'Odds ratio 1 = sin asociación; 2 = odds duplicadas, no probabilidad duplicada.',
        'Con eventos raros, el odds ratio se aproxima al riesgo relativo.',
      ],
      pitfalls: [
        'Pocos eventos por parámetro hacen inestables las estimaciones.',
        'El punto de corte que maximiza la exactitud no es necesariamente el clínicamente útil.',
      ],
      glossary: [
        { term: 'Odds', definition: 'La razón entre la probabilidad de que ocurra un evento y la de que no ocurra.' },
        { term: 'Firth', definition: 'Una corrección penalizada que reduce el sesgo con eventos raros.' },
      ],
    },
    seeAlso: ['regression', 'ordinal', 'chisquare'],
  },
  {
    id: 'countreg',
    area: 'procedures',
    title: 'Regresión de recuento',
    summary: 'Modelos de Poisson y binomial negativa para resultados de recuento.',
    tutorial: {
      goal: 'Modelar el número de eventos en función de un predictor.',
      dataset: 'score-groups.csv',
      steps: [
        'Elige el resultado de recuento y los predictores.',
        'Empieza con Poisson; si la dispersión estimada es muy superior a 1, cambia a binomial negativa.',
        'Ejecútalo y lee las razones de tasas con CI.',
      ],
      expected: 'Coeficientes, razones de tasas, una prueba de sobredispersión y bondad de ajuste.',
    },
    advanced: {
      assumptions: ['Recuentos no negativos; en Poisson, media igual a varianza.'],
      whenToUse: ['Número de eventos, llamadas o defectos por unidad.'],
      whenNotToUse: ['Recuentos con muchos ceros estructurales: plantéate modelos inflados en cero.'],
      reading: ['Una razón de tasas de 1.2 significa un aumento esperado del 20 % en el número de eventos.'],
      pitfalls: ['La regresión lineal sobre recuentos pequeños produce predicciones negativas.'],
      glossary: [
        { term: 'Sobredispersión', definition: 'Varianza mayor que la media, típica de los datos de recuento reales.' },
        { term: 'NB2', definition: 'Binomial negativa con varianza cuadrática en la media.' },
      ],
    },
    seeAlso: ['logistic', 'regression'],
  },
  {
    id: 'ordinal',
    area: 'procedures',
    title: 'Regresión logística ordinal',
    summary: 'Modelo logit acumulado para resultados ordenados.',
    tutorial: {
      goal: 'Estudiar cómo un predictor desplaza la satisfacción entre niveles ordenados.',
      dataset: 'score-groups.csv',
      steps: [
        'Elige el resultado ordinal (al menos tres categorías ordenadas).',
        'Selecciona los predictores y comprueba el orden de los niveles en la columna.',
        'Ejecútalo y lee los odds ratios acumulados con CI.',
      ],
      expected: 'Coeficientes con odds ratios acumulados y una prueba del supuesto de odds proporcionales.',
    },
    advanced: {
      assumptions: ['Odds proporcionales: el efecto del predictor es el mismo en todos los puntos de corte.'],
      whenToUse: ['Escalas Likert, gravedad en clases ordenadas.'],
      whenNotToUse: ['Categorías sin orden: usa multinomial o chi-cuadrado.'],
      reading: ['El odds ratio acumulado describe la probabilidad de estar en una categoría superior o por encima.'],
      pitfalls: ['Si falla la proporcionalidad necesitas modelos distintos, no una lectura simple de los OR.'],
      glossary: [
        { term: 'Logit acumulado', definition: 'Un modelo que compara cada categoría con todas las superiores.' },
        { term: 'Proporcionalidad', definition: 'El supuesto de que los efectos de los predictores no cambian entre puntos de corte.' },
      ],
    },
    seeAlso: ['logistic', 'contingency'],
  },
  {
    id: 'lmm',
    area: 'procedures',
    title: 'Modelo lineal mixto (LMM)',
    summary: 'Intercepto aleatorio para medidas repetidas o sujetos agrupados.',
    tutorial: {
      goal: 'Analizar medidas repetidas teniendo en cuenta la correlación intrasujeto.',
      dataset: 'score-groups.csv',
      steps: [
        'Elige el resultado, los predictores fijos y la columna de sujeto o clúster.',
        'Ejecútalo y lee los coeficientes fijos con CI.',
        'Compara la varianza residual con la varianza del intercepto aleatorio.',
      ],
      expected: 'Efectos fijos con errores estándar, estimación de la varianza aleatoria y criterios de ajuste.',
    },
    advanced: {
      assumptions: ['Residuos aproximadamente normales; estructura de covarianza correcta.'],
      whenToUse: ['Datos longitudinales, clústeres, medidas repetidas con datos ausentes.'],
      whenNotToUse: ['Pocos clústeres: las estimaciones de varianza son inestables.'],
      reading: ['Los coeficientes fijos se leen como en una regresión, pero los errores tienen en cuenta la agrupación.'],
      pitfalls: ['Tratar las medidas repetidas como independientes subestima los errores estándar.'],
      glossary: [
        { term: 'Efecto fijo', definition: 'Un efecto promedio válido para la población.' },
        { term: 'Efecto aleatorio', definition: 'Variación entre unidades (sujetos o clústeres).' },
      ],
    },
    seeAlso: ['gee', 'repeatedanova'],
  },
];
