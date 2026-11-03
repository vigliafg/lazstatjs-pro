import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Procedimentos da vaga 9: amostra, aprendizagem, texto, escolha, Bayes, meta e espacial. */
export const w9Topics: HelpTopic[] = [
  procedureTopic({
    id: 'survey',
    title: 'Amostra complexa',
    summary: 'Médias, totais, proporções e regressão baseados no desenho com pesos, estratos e conglomerados.',
    goal: 'Estimar uma quantidade populacional a partir de uma amostra não aleatória simples, usando os pesos e o desenho.',
    steps: [
      'Escolha a variável e o estimador: média, total, proporção ou regressão ponderada.',
      'Na secção avançada indique as colunas de peso, estrato e conglomerado quando o desenho as tiver.',
      'Execute e leia a estimativa, o erro padrão, o intervalo de confiança e o efeito do desenho.',
    ],
    expected: 'Uma tabela do desenho, as estimativas com intervalos baseados no desenho e, na regressão, os coeficientes ponderados.',
    whenToUse: [
      'Quando as probabilidades de inclusão não são iguais ou a amostra foi recolhida por estratos e conglomerados.',
      'Quando uma média bruta estaria enviesada por grupos sobre- ou sub-representados.',
    ],
    reading: [
      'Um efeito do desenho acima de 1 indica que o desenho é menos eficiente do que uma amostra aleatória simples de igual tamanho ponderado.',
      'A estratificação costuma reduzir a variância; os conglomerados aumentam-na porque unidades próximas se parecem.',
    ],
    pitfalls: [
      'Tratar os pesos de amostragem como pesos de frequência: a estimativa muda e o erro padrão fica errado.',
      'Ignorar a coluna de conglomerados e supor que cada linha é independente.',
    ],
    charts: ['Estimativa e intervalo de confiança.', 'Forest plot dos coeficientes da regressão ponderada.'],
    seeAlso: ['descriptive', 'regression'],
  }),
  procedureTopic({
    id: 'ml',
    title: 'Aprendizagem automática',
    summary: 'Floresta aleatória, gradient boosting e rede neuronal de uma camada oculta para um resultado numérico.',
    goal: 'Prever um resultado numérico a partir de vários preditores sem impor uma forma linear ou paramétrica.',
    steps: [
      'Selecione o resultado numérico e pelo menos um preditor numérico.',
      'Escolha floresta aleatória, gradient boosting ou rede neuronal.',
      'Ajuste árvores, tamanho mínimo do nó, encolhimento ou unidades ocultas e mantenha uma semente fixa.',
    ],
    expected: 'Medidas de ajuste, importância das variáveis para os modelos de árvores, previsões e gráficos de resíduos.',
    whenToUse: [
      'Quando a relação é não linear ou contém interações que uma regressão não captaria.',
      'Quando o objetivo é prever e não são necessários coeficientes interpretáveis.',
    ],
    reading: [
      'Compare o R² interno com o R² out-of-bag: uma diferença grande sugere sobreajuste.',
      'A importância mede quanto cada preditor reduz o erro nas árvores; não é um efeito causal.',
    ],
    pitfalls: [
      'Escolher o modelo com os mesmos dados usados para anunciar o seu desempenho.',
      'Usar muito poucos dados: árvores e redes memorizam rapidamente o ruído.',
    ],
    charts: ['Observado e previsto.', 'Resíduos e previsões.', 'Importância das variáveis.'],
    seeAlso: ['regression', 'partition'],
  }),
  procedureTopic({
    id: 'text',
    title: 'Mineração de texto',
    summary: 'Frequências dos termos, TF-IDF, similaridade entre documentos e modelo de tópicos não negativo.',
    goal: 'Descrever um corpus de textos curtos e encontrar os termos e tópicos que distinguem os documentos.',
    steps: [
      'Selecione a coluna de texto e, se necessário, uma coluna de grupo.',
      'Escolha frequências, TF-IDF, similaridade entre documentos ou tópicos.',
      'Ajuste o tamanho do vocabulário, a frequência mínima nos documentos e o número de tópicos.',
    ],
    expected: 'Uma tabela de termos, uma vista documento-termo, uma matriz de similaridade ou uma tabela de tópicos com os termos principais.',
    whenToUse: [
      'Quando os dados contêm respostas abertas, comentários, títulos ou documentos curtos.',
      'Quando é preciso um mapa exploratório do vocabulário antes de ler os textos um a um.',
    ],
    reading: [
      'O TF-IDF reduz o peso dos termos presentes em quase todos os documentos e faz sobressair as palavras distintivas.',
      'Tópicos e similaridades são relativos ao corpus: não valem automaticamente para textos filtrados de outra forma.',
    ],
    pitfalls: [
      'Esquecer que as palavras vazias dependem da língua e das escolhas de limpeza.',
      'Ler o número de tópicos como uma verdade descoberta em vez de uma escolha de modelo.',
    ],
    charts: ['Termos mais frequentes.', 'Prevalência dos tópicos.', 'Mapa documento-tópico ou similaridade.'],
    seeAlso: ['descriptive', 'cluster'],
  }),
  procedureTopic({
    id: 'choice',
    title: 'Escolha / MaxDiff',
    summary: 'Logit condicional para conjuntos de escolha e pontuações best-worst para experiências MaxDiff.',
    goal: 'Explicar que atributos guiam a escolha entre alternativas ou ordenar itens a partir de tarefas best-worst.',
    steps: [
      'Para uma experiência de escolha selecione conjunto, alternativa, indicador de escolha e atributos que variam.',
      'Para MaxDiff selecione as colunas bloco, item, melhor e pior.',
      'Execute e leia os coeficientes, as quotas previstas ou a classificação MaxDiff.',
    ],
    expected: 'Uma tabela de coeficientes com erros padrão, quotas observadas e previstas, ou uma tabela de pontuações MaxDiff.',
    whenToUse: [
      'Quando o inquirido escolhe uma alternativa de um conjunto e os atributos variam entre alternativas.',
      'Quando uma tarefa best-worst ordena muitos itens sem pedir uma classificação completa.',
    ],
    reading: [
      'Um coeficiente positivo aumenta a probabilidade de escolher a alternativa com esse atributo.',
      'O logit condicional usa apenas a variação dentro do conjunto: os atributos constantes cancelam-se.',
    ],
    pitfalls: [
      'Incluir atributos que não variam dentro dos conjuntos: não são identificáveis.',
      'Deixar conjuntos sem alternativa escolhida ou com mais de uma escolha.',
    ],
    charts: ['Forest plot dos coeficientes.', 'Quotas observadas e previstas.', 'Pontuações MaxDiff e intervalos.'],
    seeAlso: ['conjoint', 'logistic'],
  }),
  procedureTopic({
    id: 'bayes',
    title: 'Análise bayesiana',
    summary: 'Resumos a posteriori e diagnóstico MCMC para modelos conjugados e regressão gaussiana.',
    goal: 'Combinar a verosimilhança com uma distribuição a priori e descrever o parâmetro pela sua distribuição a posteriori.',
    steps: [
      'Escolha o modelo: média normal, proporção binomial, taxa de Poisson ou regressão linear.',
      'Selecione o resultado e, na regressão, os preditores.',
      'Ajuste a prior, as iterações, o burn-in e o número de cadeias.',
    ],
    expected: 'Uma tabela a posteriori com média, mediana, intervalo central, HDI, Rhat e ESS, mais histograma e gráfico de intervalos.',
    whenToUse: [
      'Quando informação prévia ou poucos dados tornam mais natural um resumo a posteriori.',
      'Quando é precisa a incerteza completa do parâmetro, não apenas uma estimativa pontual.',
    ],
    reading: [
      'O HDI a 95% é o intervalo mais curto que contém 95% da massa a posteriori.',
      'Rhat perto de 1 e ESS alto indicam cadeias misturadas; acima de 1,05 são precisas mais iterações.',
    ],
    pitfalls: [
      'Usar uma prior vaga com muito poucas observações e ler o resultado como objetivo.',
      'Reportar estimativas de cadeias que não convergiram.',
    ],
    charts: ['Histograma a posteriori.', 'Intervalos a posteriori com HDI.', 'Posteriori conjuntas de dois parâmetros.'],
    seeAlso: ['regression', 'samplesize'],
  }),
  procedureTopic({
    id: 'meta',
    title: 'Meta-análise',
    summary: 'Pooling de efeitos fixos e aleatórios com heterogeneidade, forest e funnel plots.',
    goal: 'Combinar os efeitos de vários estudos e quantificar quanto discordam.',
    steps: [
      'Selecione a coluna do efeito e a do seu erro padrão; opcionalmente a etiqueta do estudo.',
      'Escolha DerSimonian–Laird, REML ou efeitos fixos para a variância entre estudos.',
      'Execute e leia o efeito pooled, Q, I², τ², o intervalo de previsão e o teste de Egger.',
    ],
    expected: 'Uma tabela pooled, uma tabela de heterogeneidade, a tabela dos estudos, um forest plot e um funnel plot.',
    whenToUse: [
      'Quando vários estudos estimam o mesmo efeito e é preciso um resumo com a sua incerteza.',
      'Quando a pergunta é sobre a consistência da evidência, não apenas sobre a média.',
    ],
    reading: [
      'I² é a parte da variabilidade total devida à heterogeneidade; acima de 50% costuma ser considerada substancial.',
      'O intervalo de previsão descreve onde cairia o efeito de um novo estudo, não a precisão da média.',
    ],
    pitfalls: [
      'Agrupar efeitos medidos em escalas diferentes sem os converter primeiro.',
      'Ler o teste de Egger como prova de viés de publicação: é evidência de assimetria, não um veredicto.',
    ],
    charts: ['Forest plot dos estudos e do efeito pooled.', 'Funnel plot.', 'Peso dos estudos.'],
    seeAlso: ['regression', 'samplesize'],
  }),
  procedureTopic({
    id: 'spatial',
    title: 'Estatística espacial',
    summary: 'Testes de Moran e Geary, indicadores locais e modelo de desfasamento espacial sobre coordenadas.',
    goal: 'Verificar se unidades próximas se parecem mais do que numa disposição aleatória e modelar a dependência espacial.',
    steps: [
      'Selecione a variável numérica e as duas colunas de coordenadas.',
      'Escolha Moran I, Geary C, indicadores locais ou o modelo de desfasamento espacial.',
      'Ajuste os vizinhos mais próximos e as permutações; para o modelo SAR acrescente os preditores.',
    ],
    expected: 'Uma tabela de autocorrelação global, um mapa, indicadores locais e, para SAR, o coeficiente de desfasamento e a regressão.',
    whenToUse: [
      'Quando as observações são georreferenciadas e a proximidade pode criar dependência.',
      'Quando é preciso localizar conglomerados ou valores atípicos locais antes de modelar.',
    ],
    reading: [
      'Um Moran I acima do valor esperado indica autocorrelação positiva; abaixo, negativa.',
      'Os p por permutação não supõem normalidade mas dependem do número de permutações.',
    ],
    pitfalls: [
      'Tratar a matriz de pesos como dada: outro k ou limite de distância muda os resultados.',
      'Ler a autocorrelação espacial como efeito causal dos vizinhos.',
    ],
    charts: ['Mapa dos valores ou conglomerados LISA.', 'Indicadores locais.', 'Coeficientes SAR.'],
    seeAlso: ['correlation', 'regression'],
  }),
];
