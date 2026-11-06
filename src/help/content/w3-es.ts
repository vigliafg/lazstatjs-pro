import type { HelpTopic } from './types';

/** Ola 3: modelos lineales generalizados mixtos. */
export const w3Topics: HelpTopic[] = [
  {
    id: 'glmm',
    area: 'procedures',
    title: 'Modelo lineal generalizado mixto (GLMM)',
    summary:
      'Interceptos y pendientes aleatorios para desenlaces binarios, de recuento y continuos con familia no gaussiana.',
    tutorial: {
      goal: 'Estimar el efecto de un tratamiento sobre un desenlace binario o de recuento cuando las observaciones están agrupadas (visitas repetidas, centros, camadas) y la agrupación no puede ignorarse.',
      steps: [
        'Variable dependiente: el desenlace en su escala natural, por ejemplo una respuesta 0/1 o un recuento por visita.',
        'Familia y enlace: binomial con logit para 0/1, Poisson con log para recuentos, gaussiana con identidad para un desenlace aproximadamente normal.',
        'Efectos fijos: los predictores cuyo efecto poblacional interesa, como tratamiento, tiempo y su interacción.',
        'Columna de agrupación: el identificador del clúster (sujeto, centro, lote). Cada fila debe llevar el nivel al que pertenece.',
        'Efectos aleatorios: empieza con un intercepto aleatorio para la columna de agrupación y añade una pendiente aleatoria para el tiempo solo si el diseño tiene suficientes clústeres y observaciones repetidas.',
        'Ejecuta el modelo y lee los coeficientes fijos en la escala del enlace, las componentes de varianza, el ICC y los modos condicionados (BLUP) por clúster.',
      ],
      expected:
        'Tabla de efectos fijos con errores estándar, valores z e intervalos de confianza en la escala del enlace; componentes de varianza de los efectos aleatorios (varianza del intercepto, varianza de la pendiente, correlación intercepto-pendiente); parámetro de dispersión o residual cuando la familia lo requiere; ICC; BLUP para cada nivel de la columna de agrupación; criterios de información (AIC, BIC) para comparar modelos.',
    },
    advanced: {
      assumptions: [
        'Independencia condicional: dado su efecto aleatorio, cada observación sigue la familia elegida y es independiente de las demás.',
        'Los efectos aleatorios se distribuyen normalmente con media cero y una matriz de covarianzas constante entre clústeres.',
        'Los clústeres son independientes entre sí e intercambiables: ninguna variable de nivel de clúster falta en la parte fija.',
        'El predictor lineal está bien especificado en la escala del enlace: enlace correcto, forma funcional correcta y ninguna interacción importante omitida.',
        'Clústeres suficientes para estimar una varianza: 20–30 niveles son un mínimo práctico para un intercepto aleatorio, y bastantes más para una pendiente aleatoria.',
      ],
      whenToUse: [
        'Desenlaces binarios, de recuento o asimétricos medidos repetidamente en los mismos sujetos, donde un modelo marginal ocultaría la correlación intra-sujeto.',
        'Diseños multicéntricos o agrupados en los que el efecto del clúster es una molestia que modelar y no un conjunto de contrastes fijos.',
        'Recuentos con sobredispersión explicada por la agrupación y no por un término de dispersión adicional.',
        'Cuando se necesitan predicciones específicas por clúster, es decir el BLUP de cada sujeto o centro, junto a los efectos medios poblacionales.',
      ],
      whenNotToUse: [
        'Desenlaces continuos aproximadamente normales con datos agrupados: un modelo lineal mixto es más simple y no necesita aproximaciones.',
        'Un único desenlace binario o de recuento por sujeto sin agrupación: basta la regresión logística o la regresión para recuentos ordinarias.',
        'Muy pocos clústeres (menos de unos diez): las componentes de varianza se estiman mal y los errores estándar de los efectos fijos no son fiables; valora efectos fijos para el clúster o un enfoque marginal con correcciones para muestras pequeñas.',
        'Cuando solo se necesitan efectos medios poblacionales y se acepta modelar la correlación directamente: GEE es más robusto frente a efectos aleatorios mal especificados.',
      ],
      reading: [
        'Los coeficientes fijos son efectos condicionados, específicos del clúster: con enlace logit, exp(β) es una odds ratio para un sujeto con su efecto aleatorio fijo, y en valor absoluto es mayor que la odds ratio marginal de una logística simple.',
        'Con enlace log, exp(β) es una razón de tasas; con enlace identidad el coeficiente es un cambio aditivo de la media.',
        'La varianza del intercepto σ²ᵤ mide cuánto varía el nivel basal entre clústeres; la varianza de la pendiente mide cuánto varía el efecto de un predictor, y la correlación intercepto-pendiente indica si los clústeres que empiezan más alto también cambian más deprisa.',
        'El ICC es la proporción de varianza en la escala latente atribuible al clúster: σ²ᵤ / (σ²ᵤ + π²/3) para logit, σ²ᵤ / (σ²ᵤ + 1) para log y σ²ᵤ / (σ²ᵤ + σ²) para el modelo gaussiano con identidad. Describe el agrupamiento, no la varianza explicada.',
        'El BLUP es la desviación estimada de un clúster respecto a la recta poblacional, contraída hacia cero en proporción a la poca información que aporta ese clúster: es una predicción, no un parámetro contrastado.',
      'Los componentes de varianza llevan error estándar e IC de Wald en escala log, y las pruebas de efectos fijos dan el Wald por término.'],
      pitfalls: [
        'Leer una odds ratio condicionada como si fuera la marginal que reporta la regresión logística, o al contrario, y compararlas numéricamente.',
        'Ajustar una pendiente aleatoria con muy pocos clústeres: la varianza colapsa a cero o el modelo no converge, y los errores estándar pierden sentido.',
        'Tratar los BLUP como datos en un análisis de segunda etapa; son estimaciones contraídas y llevan consigo su propia incertidumbre.',
        'Olvidar que la aproximación de Laplace sigue siendo una aproximación: con datos binarios y pocas observaciones por clúster las componentes de varianza pueden quedar sesgadas a la baja; reajusta con cuadratura de Gauss-Hermite adaptativa o comprueba la sensibilidad.',
        'Contrastar una componente de varianza contra cero con una prueba de razón de verosimilitud ordinaria; la hipótesis nula está en el borde del espacio de parámetros y el p-valor es conservador.',
      ],
      charts: [
        'Observados frente a predichos: puntos coloreados por clúster con la diagonal como referencia, para ver dónde calibra el modelo y qué clústeres se separan.',
        'Gráfico caterpillar de los efectos aleatorios: BLUP ordenados por tamaño con barras de confianza aproximadas, para detectar clústeres atípicos y cuánta contracción hay.',
        'Residuos frente a predichos: residuos de Pearson o cuantiles aleatorizados frente al predictor lineal, para revelar un enlace equivocado, curvatura restante o heterocedasticidad.',
      ],
      glossary: [
        {
          term: 'Intercepto aleatorio',
          definition:
            'Desplazamiento del nivel basal específico de cada clúster en la escala del enlace, extraído de una normal cuya varianza se estima.',
        },
        {
          term: 'Pendiente aleatoria',
          definition:
            'Desviación específica del clúster en el efecto de un predictor, con varianza propia y correlación con el intercepto.',
        },
        {
          term: 'Componente de varianza',
          definition:
            'Varianza o covarianza estimada de los efectos aleatorios, que describe la variabilidad entre clústeres.',
        },
        {
          term: 'ICC',
          definition:
            'Correlación intraclase: proporción de la varianza en la escala latente que se sitúa entre clústeres.',
        },
        {
          term: 'BLUP',
          definition:
            'Mejor predictor lineal insesgado: estimación condicionada y contraída del efecto de un clúster.',
        },
        {
          term: 'Aproximación de Laplace',
          definition:
            'Desarrollo de Taylor de segundo orden alrededor del modo condicionado de los efectos aleatorios, usado para integrar la verosimilitud.',
        },
        {
          term: 'Modelo condicionado',
          definition:
            'Modelo cuyos coeficientes describen un solo clúster, frente al modelo marginal promediado sobre la población.',
        },
      ],
    },
    seeAlso: ['lmm', 'logistic', 'countreg', 'glm'],
  },
  {
    id: 'pls',
    area: 'procedures',
    title: 'Mínimos cuadrados parciales (PLS)',
    summary:
      'Componentes latentes que maximizan la covarianza con el desenlace, pensadas para muchos predictores correlacionados.',
    tutorial: {
      goal: 'Predecir un desenlace continuo a partir de muchos predictores muy correlacionados, donde la regresión OLS da coeficientes inestables o difíciles de leer.',
      steps: [
        'Variable dependiente: el desenlace continuo que se quiere predecir.',
        'Predictores: las medidas correlacionadas, como bandas espectrales, canales de sensores o ítems de un cuestionario.',
        'Componentes: empieza con dos o tres y aumenta mientras mejore el Q² en validación cruzada.',
        'Particiones de validación cruzada: cinco es una elección habitual; cero desactiva el Q².',
        'Ejecuta el modelo y lee los coeficientes, la varianza explicada por componente, R² y Q² acumulados y las puntuaciones VIP.',
      ],
      expected:
        'Una tabla de coeficientes en la escala original, una tabla de componentes con R², R² acumulado y Q², una tabla VIP con el umbral en uno y gráficos de observado frente a predicho y del ajuste por componente.',
    },
    advanced: {
      whenToUse: [
        'Muchos predictores con colinealidad fuerte, como en espectroscopia, quimiometría, ómica o datos de sensores.',
        'El objetivo es la predicción y los coeficientes individuales no son objeto de inferencia.',
        'El número de predictores es cercano o superior al número de observaciones.',
        'Quieres pocas direcciones latentes interpretables en lugar de un modelo de caja negra.',
      ],
      whenNotToUse: [
        'Necesitas valores p o un efecto causal para cada predictor: usa una regresión con un diseño claro.',
        'Hay pocos predictores y poco correlacionados: la regresión OLS es más simple y legible.',
        'La relación es muy no lineal: splines o modelos de árbol pueden ajustar mejor.',
        'No puedes validar de forma cruzada porque la muestra es diminuta o las observaciones están agrupadas.',
      ],
      reading: [
        'Un coeficiente es el cambio del desenlace por unidad de ese predictor cuando los demás se mantienen en sus valores observados a través de las componentes; no es un efecto parcial en el sentido de la regresión.',
        'R² es la proporción de varianza del desenlace explicada en la muestra; Q² es la misma cantidad en validación cruzada y la medida honesta del valor predictivo.',
        'Un VIP superior a uno indica predictores que contribuyen más que la media; es un criterio de selección, no una prueba de significación.',
        'Elige el menor número de componentes tras el cual Q² deja de mejorar; después se ajusta sobre todo ruido.',
      ],
      pitfalls: [
        'Elegir las componentes solo por R², que siempre crece y oculta el sobreajuste.',
        'Leer un coeficiente PLS como una pendiente parcial OLS o un efecto causal.',
        'Olvidar centrar los predictores, de modo que la primera componente captura sobre todo la media.',
        'Usar particiones que filtran información entre entrenamiento y prueba en datos agrupados.',
        'Presentar el VIP como un valor p o como prueba de importancia.',
      ],
      charts: [
        'Observado frente a predicho, con la diagonal como referencia y los puntos coloreados por el residuo.',
        'R² y Q² por número de componentes, para elegir el modelo útil más pequeño.',
        'Puntuaciones VIP por predictor, con la línea en uno.',
      ],
    },
    seeAlso: ['regression', 'glm', 'mars'],
  },
  {
    id: 'mars',
    area: 'procedures',
    title: 'GAM / MARS (splines adaptativas)',
    summary:
      'Funciones hinge lineales a trozos elegidas automáticamente, con interacciones opcionales y poda por GCV.',
    tutorial: {
      goal: 'Ajustar una relación no lineal flexible entre un desenlace continuo y uno o más predictores sin fijar de antemano la forma funcional.',
      steps: [
        'Variable dependiente: el desenlace continuo.',
        'Predictores: las variables continuas cuyo efecto puede curvarse o cambiar de dirección.',
        'Grado máximo: uno para efectos aditivos, dos para permitir el producto de dos funciones hinge.',
        'Términos máximos: un presupuesto para las funciones base; empieza alrededor de veinte y deja que la poda reduzca el modelo.',
        'Penalización y poda: mantén la penalización por defecto en dos y activa la poda GCV salvo que necesites el modelo forward completo.',
        'Ejecuta el modelo y lee los términos seleccionados, los nudos, GCV, R² y la importancia de los predictores.',
      ],
      expected:
        'Una tabla de términos hinge con nudos y coeficientes, una tabla de ajuste con RSS, GCV, R² y R² ajustado, una tabla de importancia y gráficos de observado frente a predicho y del efecto parcial del predictor principal.',
    },
    advanced: {
      whenToUse: [
        'La forma del efecto es desconocida o cambia de dirección a lo largo del rango del predictor.',
        'Quieres una alternativa automática a elegir el grado de un polinomio.',
        'Necesitas explorar muchos predictores para efectos no lineales e interacciones.',
        'La predicción importa más que un único coeficiente interpretable.',
      ],
      whenNotToUse: [
        'Necesitas un coeficiente por predictor con interpretación causal clara.',
        'Debes extrapolar mucho más allá del rango observado: las funciones hinge son locales.',
        'La muestra es muy pequeña o todos los predictores son categóricos.',
        'Un modelo lineal o polinómico simple ya ajusta y es más fácil de comunicar.',
      ],
      reading: [
        'Cada término hinge es un cambio de pendiente en un nudo: un coeficiente positivo aumenta la pendiente después del nudo, uno negativo la reduce.',
        'La GCV equilibra la suma de cuadrados residuales con el número de términos; más baja es mejor y guía la poda.',
        'Los términos seleccionados son las piezas que sobreviven a la poda; un predictor sin término no tiene contribución no lineal detectable.',
        'El gráfico del efecto parcial mantiene los demás predictores en sus valores observados y muestra la forma atribuida a un predictor.',
      ],
      pitfalls: [
        'Construir un modelo forward enorme y olvidar la poda, de modo que el ajuste sigue el ruido.',
        'Extrapolar más allá de los nudos observados, donde la forma a trozos es arbitraria.',
        'Leer un coeficiente hinge como la pendiente global en lugar de un cambio local.',
        'Ignorar interacciones cuando el gráfico de residuos todavía muestra estructura.',
        'Comparar GCV entre modelos ajustados con distinto número de filas completas.',
      ],
      charts: [
        'Observado frente a predicho con la diagonal, para comprobar la calibración.',
        'Perfil del efecto parcial del primer predictor, con los demás en sus valores observados.',
        'Importancia de los predictores, medida por la pérdida de ajuste al quitarlos.',
      ],
    },
    seeAlso: ['regression', 'nonlinear', 'pls'],
  },
  {
    id: 'iv',
    area: 'procedures',
    title: 'Variables instrumentales (2SLS)',
    summary:
      'Un efecto consistente para un regresor endógeno, usando instrumentos que lo afectan pero no actúan directamente sobre el desenlace.',
    tutorial: {
      goal: 'Estimar el efecto de un predictor correlacionado con el error por variables omitidas, error de medida o simultaneidad.',
      steps: [
        'Desenlace: la variable dependiente continua.',
        'Predictores endógenos: los regresores cuyo efecto quieres pero que no son exógenos.',
        'Instrumentos: variables que predicen los regresores endógenos y actúan sobre el desenlace solo a través de ellos.',
        'Predictores exógenos: controles que ya son instrumentos válidos de sí mismos.',
        'Errores robustos: activa HC1 cuando la varianza de los residuos no es constante.',
        'Ejecuta el modelo y lee los coeficientes estructurales, la F parcial de primera etapa, la prueba de Sargan y la de Wu–Hausman.',
      ],
      expected:
        'Una ecuación estructural con coeficientes, errores estándar, valores t e intervalos, una tabla de primera etapa con los instrumentos excluidos y su F parcial, una tabla de diagnóstico con Sargan y Wu–Hausman y gráficos de observado frente a predicho y OLS frente a 2SLS.',
    },
    advanced: {
      whenToUse: [
        'Variables omitidas no observadas pero correlacionadas con un regresor.',
        'Error de medida en un regresor clave, cuando hay una segunda medida o un instrumento.',
        'Simultaneidad, como en oferta y demanda o precio y cantidad.',
        'Experimentos naturales, diseños de incentivo aleatorizado e instrumentos de política.',
      ],
      whenNotToUse: [
        'Los instrumentos son débiles: una F de primera etapa por debajo de diez hace que 2SLS sea sesgado y sus errores estándar poco fiables.',
        'La restricción de exclusión no es creíble: la validez de un instrumento no se puede probar solo con los datos.',
        'Necesitas el efecto medio de la población y los efectos son heterogéneos.',
        'No existe un instrumento creíble: una estimación IV con un mal instrumento es peor que una OLS honesta con una advertencia.',
      ],
      reading: [
        'El coeficiente 2SLS es el efecto de un cambio unitario del regresor endógeno para la parte de la variación impulsada por los instrumentos.',
        'La F parcial de primera etapa comprueba si los instrumentos excluidos añaden poder explicativo; valores por debajo de diez indican instrumentos débiles.',
        'Sargan prueba las restricciones de sobreidentificación cuando hay más instrumentos que regresores endógenos; un p alto es compatible con la validez, pero no es una prueba.',
        'Wu–Hausman compara OLS y 2SLS; un p bajo sugiere que el regresor es endógeno y que hace falta 2SLS.',
      ],
      pitfalls: [
        'Usar un instrumento débil, que sesga 2SLS hacia OLS e infla los errores estándar.',
        'Incluir el desenlace o una variable posterior al tratamiento entre los instrumentos.',
        'Tratar un Sargan no significativo como prueba de validez.',
        'Olvidar que la exclusión es un supuesto, no una prueba.',
        'Comparar OLS y 2SLS sin reportar la primera etapa y el diagnóstico.',
      ],
      charts: [
        'Observado frente a predicho de la ecuación estructural.',
        'Coeficientes OLS y 2SLS del regresor endógeno lado a lado, con intervalos.',
        'Residuos frente a predichos, para comprobar estructura remanente.',
      ],
    },
    seeAlso: ['regression', 'panel', 'selection'],
  },
  {
    id: 'panel',
    area: 'procedures',
    title: 'Modelo de panel (efectos fijos y aleatorios)',
    summary:
      'Efectos fijos within y efectos aleatorios GLS para observaciones repetidas de las mismas unidades.',
    tutorial: {
      goal: 'Estimar el efecto de predictores que varían en el tiempo controlando por diferencias estables no observadas entre unidades.',
      steps: [
        'Desenlace: la variable dependiente continua medida repetidamente.',
        'Predictores: los regresores que varían en el tiempo.',
        'Entidad: la columna que identifica la unidad (persona, empresa, país).',
        'Tiempo: la columna que ordena las observaciones repetidas dentro de cada entidad.',
        'Modelo: efectos fijos, efectos aleatorios o ambos para compararlos con la prueba de Hausman.',
        'Ejecuta el modelo y lee los coeficientes within, las componentes de varianza, la prueba de Hausman y los efectos por entidad.',
      ],
      expected:
        'Una tabla de efectos fijos con coeficientes within y errores agrupados, una de efectos aleatorios con coeficientes GLS, componentes de varianza para entidad y error, la prueba de Hausman y gráficos de observado frente a predicho y de los efectos por entidad.',
    },
    advanced: {
      whenToUse: [
        'Datos longitudinales con observaciones repetidas de las mismas unidades.',
        'Quieres eliminar todo el confundimiento estable entre entidades, observado o no.',
        'Datos de panel agregados, como países o empresas a lo largo de los años.',
        'Necesitas comparar la variación within y between.',
      ],
      whenNotToUse: [
        'El predictor de interés es invariante en el tiempo: los efectos fijos lo absorben por completo.',
        'La prueba de Hausman rechaza los efectos aleatorios: la estimación RE es inconsistente.',
        'Hay muy pocas entidades, así que las componentes de varianza y los errores agrupados no son fiables.',
        'El modelo es dinámico e incluye la dependiente retardada: el estimador within está sesgado.',
      ],
      reading: [
        'Un coeficiente de efectos fijos es el cambio medio dentro de una entidad cuando cambia su predictor; identifica el efecto solo con la variación within.',
        'Un coeficiente de efectos aleatorios es una combinación ponderada por precisión de la variación within y between, más eficiente cuando se cumple el supuesto.',
        'Hausman compara ambos: un p bajo indica diferencias sistemáticas y favorece los efectos fijos.',
        'La componente de entidad mide la persistencia de la variabilidad entre unidades; la idiosincrásica es el ruido within restante.',
      ],
      pitfalls: [
        'Interpretar un coeficiente de efectos fijos como una comparación entre entidades.',
        'Incluir un predictor invariante en el tiempo en un modelo de efectos fijos.',
        'Usar efectos aleatorios cuando Hausman los rechaza.',
        'Ignorar la correlación serial y reportar errores no agrupados.',
        'Tratar un panel corto como si tuviera muchas entidades.',
      ],
      charts: [
        'Observado frente a predicho para comprobar la calibración del panel.',
        'Gráfico caterpillar de los efectos por entidad, ordenados.',
        'Coeficientes de efectos fijos y aleatorios con intervalos.',
      ],
    },
    seeAlso: ['regression', 'lmm', 'iv'],
  },
  {
    id: 'selection',
    area: 'procedures',
    title: 'Tobit y selección de Heckman',
    summary:
      'Regresión censurada para desenlaces limitados y corrección en dos etapas para la selección de la muestra.',
    tutorial: {
      goal: 'Estimar el efecto de los predictores cuando el desenlace solo se observa por encima o por debajo de un umbral, o solo en un subgrupo seleccionado.',
      steps: [
        'Modelo: Tobit para un desenlace censurado, Heckman para una muestra seleccionada.',
        'Desenlace: la variable censurada para Tobit o el desenlace observado para Heckman.',
        'Predictores: los regresores de la ecuación del desenlace.',
        'Límites de censura: el umbral inferior y, opcionalmente, el superior para Tobit.',
        'Indicador de selección y predictores de selección: la variable 0/1 de inclusión y las variables que explican la inclusión; incluye al menos una variable que no esté en la ecuación del desenlace.',
        'Ejecuta el modelo y lee coeficientes, sigma, rho y el coeficiente del ratio de Mills inverso.',
      ],
      expected:
        'Para Tobit, coeficientes en la escala latente con errores estándar, sigma, log-verosimilitud y AIC. Para Heckman, ecuación del desenlace, ecuación de selección, sigma, rho, lambda, ratio de Mills inverso y prueba de Wald de la corrección. Los gráficos muestran observado frente a predicho y el patrón de censura o selección.',
    },
    advanced: {
      whenToUse: [
        'Salarios observados solo para quienes trabajan, con la no participación como mecanismo de selección.',
        'Gastos u horas con un límite inferior significativo y censura real.',
        'Límites de detección en medidas de laboratorio.',
        'Selección por factores no observables que el emparejamiento por covariables no puede tratar.',
      ],
      whenNotToUse: [
        'Los ceros son desenlaces verdaderos y no valores censurados: un modelo de dos partes o hurdle es más adecuado.',
        'Se cree que la selección depende solo de covariables observadas: el emparejamiento por propensión es más transparente.',
        'No hay restricción de exclusión: Heckman se identifica solo por la no linealidad del ratio de Mills y es frágil.',
        'Los errores son muy no normales o heterocedásticos: Tobit y Heckman son inconsistentes.',
      ],
      reading: [
        'Los coeficientes Tobit son efectos sobre el desenlace latente no censurado, no sobre la media observada; el efecto sobre la media observada se reduce con la probabilidad de no estar censurado.',
        'Sigma es la desviación estándar del error latente; un sigma grande indica censura sustancial.',
        'En Heckman, rho es la correlación entre los errores de selección y desenlace; un rho distinto de cero indica que la selección importa.',
        'Lambda es el coeficiente del ratio de Mills inverso en la ecuación del desenlace; es el término de corrección, no un efecto causal.',
        'La ecuación de selección debería contener un instrumento que prediga la inclusión pero pueda excluirse del desenlace; sin él, la identificación depende solo de la forma funcional.',
      ],
      pitfalls: [
        'Leer los coeficientes Tobit como efectos sobre el desenlace observado.',
        'Usar Heckman sin restricción de exclusión y tratar el resultado como robusto.',
        'Usar OLS en la muestra seleccionada ignorando el sesgo de selección.',
        'Confundir censura con truncamiento: en la censura las unidades quedan en la muestra con el valor límite, en el truncamiento faltan.',
        'Creer que Heckman en dos etapas es máxima verosimilitud: es consistente pero menos eficiente y los errores necesitan la corrección.',
      ],
      charts: [
        'Observado frente a predicho en la escala observada.',
        'Tobit: media latente frente al desenlace observado, con la línea de censura.',
        'Heckman: distribución del ratio de Mills inverso y probabilidad de selección por desenlace.',
      ],
    },
    seeAlso: ['regression', 'iv', 'propensity'],
  },
  {
    id: 'mediation',
    area: 'procedures',
    title: 'Análisis de mediación',
    summary:
      'Efectos indirectos, directos y totales de un predictor a través de un mediador, con intervalos de Sobel y bootstrap.',
    tutorial: {
      goal: 'Cuantificar qué parte del efecto de un predictor sobre el desenlace pasa por una variable intermedia.',
      steps: [
        'Desenlace: la respuesta final continua.',
        'Predictor: la exposición o variable independiente.',
        'Mediador: la variable intermedia que se supone en la ruta.',
        'Covariables: confundidores opcionales de las relaciones predictor–mediador, predictor–desenlace y mediador–desenlace.',
        'Repeticiones bootstrap: 1000 es un comienzo razonable; cero deja solo los intervalos de Sobel y delta.',
        'Ejecuta el modelo y lee las rutas a, b y c′, los efectos indirecto y total, la proporción mediada y el intervalo bootstrap.',
      ],
      expected:
        'Una tabla de rutas con a, b y c′, una tabla de efectos total, directo e indirecto con errores e intervalos, la proporción mediada y un gráfico de los tamaños de efecto y de la distribución bootstrap del efecto indirecto.',
    },
    advanced: {
      whenToUse: [
        'Preguntas de mecanismo: no solo si X afecta a Y, sino por qué ruta.',
        'Evaluación de procesos y rutas clínicas o psicológicas.',
        'Hay un orden temporal creíble y se midieron los principales confundidores.',
        'El efecto indirecto es la cantidad de interés.',
      ],
      whenNotToUse: [
        'Los datos son transversales y el orden temporal solo se supone: háblalo como asociación, no como mediación.',
        'Hay un confundidor mediador–desenlace no medido y afectado por la exposición.',
        'Predictor y mediador interactúan: hace falta un modelo de mediación moderada.',
        'El efecto total es cercano a cero, lo que hace inestable la proporción mediada.',
      ],
      reading: [
        'El efecto indirecto es a × b; el total es c′ + a × b; el directo es c′.',
        'La proporción mediada es el efecto indirecto dividido por el total; es inestable cuando el total es pequeño y puede salir de 0–1.',
        'El error estándar de Sobel usa el método delta y es conservador; el intervalo bootstrap percentil suele preferirse.',
        'Un intervalo bootstrap que excluye cero es evidencia de efecto indirecto; no es una probabilidad posterior bayesiana.',
      ],
      pitfalls: [
        'Llamar mediación a una asociación transversal sin orden temporal creíble.',
        'Ignorar el confundimiento de la relación mediador–desenlace.',
        'Reportar la proporción mediada cuando el efecto total es cercano a cero.',
        'Usar la prueba de Sobel como única inferencia cuando el efecto indirecto es asimétrico.',
        'Olvidar fijar la semilla del bootstrap, de modo que el intervalo cambia en cada ejecución.',
      ],
      charts: [
        'Tamaños de los efectos directo, indirecto y total con intervalos.',
        'Distribución bootstrap del efecto indirecto, con el intervalo percentil y el cero marcado.',
        'Coeficientes de las rutas a, b y c′ para leer el mecanismo de un vistazo.',
      ],
    },
    seeAlso: ['regression', 'propensity'],
  },
  {
    id: 'propensity',
    area: 'procedures',
    title: 'Puntuación de propensión',
    summary:
      'Emparejamiento y ponderación por probabilidad inversa para efectos del tratamiento en datos observacionales.',
    tutorial: {
      goal: 'Comparar un grupo tratado y uno no tratado cuando el tratamiento no fue aleatorio pero se midieron los confundidores relevantes.',
      steps: [
        'Tratamiento: el indicador 0/1 de recibir el tratamiento.',
        'Desenlace: la respuesta continua.',
        'Covariables: las variables previas al tratamiento que predicen tanto el tratamiento como el desenlace.',
        'Método: emparejamiento del vecino más cercano o ponderación por probabilidad inversa.',
        'Caliper y razón: para el emparejamiento, la distancia máxima en desviaciones estándar del puntaje logit y el número de controles por unidad tratada.',
        'Ejecuta el modelo y lee el modelo de propensión, la tabla de balance antes y después, el ATT y el número de observaciones emparejadas o efectivas.',
      ],
      expected:
        'Una tabla del modelo de propensión, una tabla de balance con diferencias de medias estandarizadas antes y después, el ATT con error estándar e intervalo, el número de unidades emparejadas o el tamaño efectivo y gráficos de solapamiento y mejora del balance.',
    },
    advanced: {
      whenToUse: [
        'Estudios observacionales donde la asignación depende de confundidores medidos.',
        'Evaluación de programas e investigación de eficacia comparativa.',
        'Quieres hacer comparables los grupos tratado y no tratado antes de estimar el efecto.',
        'El estimando de interés es el efecto sobre los tratados (ATT).',
      ],
      whenNotToUse: [
        'El confundimiento no medido es plausible: el emparejamiento no lo elimina.',
        'Los grupos apenas se solapan, así que muchas unidades tratadas no tienen controles comparables.',
        'Hay un instrumento creíble: las variables instrumentales buscan otro efecto, a menudo más creíble.',
        'El tratamiento varía en el tiempo o las covariables se miden después del tratamiento.',
      ],
      reading: [
        'El ATT es el efecto medio para las unidades tratadas, no para toda la población; el ATE requiere ponderar toda la muestra.',
        'Una diferencia de medias estandarizada inferior a 0,1 tras el ajuste es la regla práctica para un buen balance.',
        'El caliper descarta unidades tratadas sin un control cercano; un caliper menor mejora el balance pero cambia el estimando y reduce la muestra.',
        'La ponderación por probabilidad inversa da peso 1/e a los tratados y 1/(1−e) a los controles; pesos muy grandes indican poco solapamiento.',
      ],
      pitfalls: [
        'Juzgar el balance con pruebas de significación en lugar de diferencias estandarizadas.',
        'Ignorar el soporte común y extrapolar a unidades tratadas sin controles comparables.',
        'Incluir variables posteriores al tratamiento o el desenlace en el modelo de propensión.',
        'Reportar el ATT como si fuera el efecto medio para todos.',
        'Usar emparejamiento sin comprobar el balance de la muestra emparejada.',
      ],
      charts: [
        'Solapamiento de las puntuaciones de propensión entre tratados y controles.',
        'Love plot de las diferencias de medias estandarizadas antes y después del ajuste.',
        'ATT con intervalo de confianza y número de observaciones emparejadas o efectivas.',
      ],
    },
    seeAlso: ['logistic', 'iv', 'regression'],
  },
];
