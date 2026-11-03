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
      ],
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
];
