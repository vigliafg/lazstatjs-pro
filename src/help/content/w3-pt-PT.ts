import type { HelpTopic } from './types';

/** Onda 3: modelos lineares generalizados mistos. */
export const w3Topics: HelpTopic[] = [
  {
    id: 'glmm',
    area: 'procedures',
    title: 'Modelo linear generalizado misto (GLMM)',
    summary:
      'Interceptos e declives aleatórios para desfechos binários, de contagem e contínuos com família não gaussiana.',
    tutorial: {
      goal: 'Estimar o efeito de um tratamento num desfecho binário ou de contagem quando as observações estão agrupadas (visitas repetidas, centros, ninhadas) e o agrupamento não pode ser ignorado.',
      steps: [
        'Variável dependente: o desfecho na sua escala natural, por exemplo uma resposta 0/1 ou uma contagem por visita.',
        'Família e ligação: binomial com logit para 0/1, Poisson com log para contagens, gaussiana com identidade para um desfecho aproximadamente normal.',
        'Efeitos fixos: os preditores cujo efeito populacional interessa, como tratamento, tempo e a respetiva interação.',
        'Coluna de agrupamento: o identificador do cluster (sujeito, centro, lote). Cada linha tem de indicar o nível a que pertence.',
        'Efeitos aleatórios: comece com um intercepto aleatório para a coluna de agrupamento e acrescente um declive aleatório para o tempo só se o desenho tiver clusters suficientes e observações repetidas.',
        'Execute o modelo e leia os coeficientes fixos na escala da ligação, as componentes de variância, o ICC e os modos condicionados (BLUP) por cluster.',
      ],
      expected:
        'Tabela de efeitos fixos com erros padrão, valores z e intervalos de confiança na escala da ligação; componentes de variância dos efeitos aleatórios (variância do intercepto, variância do declive, correlação intercepto-declive); parâmetro de dispersão ou resíduo quando a família o exige; ICC; BLUP para cada nível da coluna de agrupamento; critérios de informação (AIC, BIC) para comparar modelos.',
    },
    advanced: {
      assumptions: [
        'Independência condicional: dado o seu efeito aleatório, cada observação segue a família escolhida e é independente das restantes.',
        'Os efeitos aleatórios distribuem-se normalmente com média zero e uma matriz de covariância constante entre clusters.',
        'Os clusters são independentes entre si e permutáveis: nenhuma variável de nível de cluster fica de fora da parte fixa.',
        'O preditor linear está corretamente especificado na escala da ligação: ligação certa, forma funcional certa e nenhuma interação importante omitida.',
        'Clusters suficientes para estimar uma variância: 20 a 30 níveis são um mínimo prático para um intercepto aleatório, e bastantes mais para um declive aleatório.',
      ],
      whenToUse: [
        'Desfechos binários, de contagem ou assimétricos medidos repetidamente nos mesmos sujeitos, onde um modelo marginal esconderia a correlação intra-sujeito.',
        'Desenhos multicêntricos ou agrupados em que o efeito do cluster é um incómodo a modelar e não um conjunto de contrastes fixos.',
        'Contagens com sobredispersão explicada pelo agrupamento e não por um termo de dispersão adicional.',
        'Quando são necessárias previsões específicas por cluster, isto é o BLUP de cada sujeito ou centro, a par dos efeitos médios populacionais.',
      ],
      whenNotToUse: [
        'Desfechos contínuos aproximadamente normais com dados agrupados: um modelo linear misto é mais simples e não precisa de aproximações.',
        'Um único desfecho binário ou de contagem por sujeito sem agrupamento: basta a regressão logística ou a regressão para contagens ordinária.',
        'Muito poucos clusters (menos de cerca de dez): as componentes de variância são mal estimadas e os erros padrão dos efeitos fixos não são fiáveis; considere efeitos fixos para o cluster ou uma abordagem marginal com correções para amostras pequenas.',
        'Quando só interessam efeitos médios populacionais e se aceita modelar a correlação diretamente: o GEE é mais robusto perante efeitos aleatórios mal especificados.',
      ],
      reading: [
        'Os coeficientes fixos são efeitos condicionados, específicos do cluster: com ligação logit, exp(β) é um odds ratio para um sujeito com o efeito aleatório fixado, e em valor absoluto é maior do que o odds ratio marginal de uma logística simples.',
        'Com ligação log, exp(β) é uma razão de taxas; com ligação identidade o coeficiente é uma alteração aditiva da média.',
        'A variância do intercepto σ²ᵤ mede quanto varia o nível de base entre clusters; a variância do declive mede quanto varia o efeito de um preditor, e a correlação intercepto-declive indica se os clusters que começam mais alto também mudam mais depressa.',
        'O ICC é a fração de variância na escala latente atribuível ao cluster: σ²ᵤ / (σ²ᵤ + π²/3) para logit, σ²ᵤ / (σ²ᵤ + 1) para log e σ²ᵤ / (σ²ᵤ + σ²) para o modelo gaussiano com identidade. Descreve o agrupamento, não a variância explicada.',
        'O BLUP é o desvio estimado de um cluster em relação à reta populacional, encolhido para zero em proporção à pouca informação que esse cluster transporta: é uma previsão, não um parâmetro testado.',
      ],
      pitfalls: [
        'Ler um odds ratio condicionado como se fosse o marginal reportado pela regressão logística, ou o contrário, e compará-los numericamente.',
        'Ajustar um declive aleatório com muito poucos clusters: a variância colapsa em zero ou o modelo não converge, e os erros padrão deixam de fazer sentido.',
        'Tratar os BLUP como dados numa análise de segunda etapa; são estimativas encolhidas e trazem consigo a própria incerteza.',
        'Esquecer que a aproximação de Laplace continua a ser uma aproximação: com dados binários e poucas observações por cluster as componentes de variância podem ficar enviesadas para baixo; reajuste com quadratura de Gauss-Hermite adaptativa ou verifique a sensibilidade.',
        'Testar uma componente de variância contra zero com um teste da razão de verosimilhança comum; a hipótese nula está na fronteira do espaço de parâmetros e o valor-p é conservador.',
      ],
      charts: [
        'Observados versus previstos: pontos coloridos por cluster com a diagonal como referência, para ver onde o modelo está calibrado e que clusters se afastam.',
        'Gráfico caterpillar dos efeitos aleatórios: BLUP ordenados por tamanho com barras de confiança aproximadas, para identificar clusters atípicos e a dimensão do encolhimento.',
        'Resíduos versus previstos: resíduos de Pearson ou quantis aleatorizados contra o preditor linear, para revelar uma ligação errada, curvatura remanescente ou heterocedasticidade.',
      ],
      glossary: [
        {
          term: 'Intercepto aleatório',
          definition:
            'Deslocamento do nível de base específico de cada cluster na escala da ligação, extraído de uma normal cuja variância é estimada.',
        },
        {
          term: 'Declive aleatório',
          definition:
            'Desvio específico do cluster no efeito de um preditor, com variância própria e correlação com o intercepto.',
        },
        {
          term: 'Componente de variância',
          definition:
            'Variância ou covariância estimada dos efeitos aleatórios, que descreve a variabilidade entre clusters.',
        },
        {
          term: 'ICC',
          definition:
            'Correlação intraclasse: proporção da variância na escala latente que fica entre clusters.',
        },
        {
          term: 'BLUP',
          definition:
            'Melhor preditor linear não enviesado: estimativa condicionada e encolhida do efeito de um cluster.',
        },
        {
          term: 'Aproximação de Laplace',
          definition:
            'Desenvolvimento de Taylor de segunda ordem em torno do modo condicionado dos efeitos aleatórios, usado para integrar a verosimilhança.',
        },
        {
          term: 'Modelo condicionado',
          definition:
            'Modelo cujos coeficientes descrevem um único cluster, por oposição ao modelo marginal médio na população.',
        },
      ],
    },
    seeAlso: ['lmm', 'logistic', 'countreg', 'glm'],
  },
];
