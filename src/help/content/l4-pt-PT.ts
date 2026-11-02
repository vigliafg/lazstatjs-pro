import type { HelpTopic } from './types';

/**
 * Páginas das procedimentos L4 (Milestone F) em português europeu.
 *
 * Mantêm a mesma estrutura de dois níveis das restantes páginas: um tutorial
 * com um exemplo e uma leitura avançada em linguagem simples.
 */
export const l4Topics: HelpTopic[] = [
  {
    id: 'partition',
    area: 'procedures',
    title: 'Partição (árvore de regressão)',
    summary: 'Dividir os dados em folhas homogéneas com uma árvore de regressão.',
    tutorial: {
      goal: 'Explicar um resultado numérico com um conjunto curto de regras se-então.',
      steps: [
        'Escolha a resposta numérica e um ou mais preditores numéricos.',
        'Defina a profundidade máxima e o número mínimo de casos por divisão.',
        'Execute e leia a árvore, a lista de divisões e o relatório das folhas.',
      ],
      expected: 'Um diagrama de árvore, regras de divisão, médias das folhas e importância das variáveis.',
    },
    advanced: {
      assumptions: ['A resposta é numérica; os preditores são numéricos e completos.'],
      whenToUse: ['Explicação exploratória, segmentação e efeitos não lineares.'],
      whenNotToUse: ['Inferência formal ou afirmações causais; use antes um modelo de regressão.'],
      reading: [
        'Cada nó interno é um limiar; a média da folha é a previsão.',
        'A importância das variáveis soma a redução de erro atribuída a cada preditor.',
      ],
      pitfalls: [
        'As árvores profundas ajustam-se em excesso aos dados: valide numa amostra separada antes de confiar nas regras.',
        'Os limiares dependem dos dados e podem mudar com uma amostra diferente.',
      ],
      charts: ['Diagrama de árvore', 'Observados vs. previstos', 'Importância das variáveis'],
      glossary: [
        { term: 'Folha', definition: 'Um grupo final cuja média é a previsão.' },
        { term: 'SSE', definition: 'Soma dos quadrados das diferenças entre valores observados e previstos.' },
      ],
    },
    seeAlso: ['regression', 'cluster'],
  },
  {
    id: 'quality',
    area: 'procedures',
    title: 'Qualidade (SPC)',
    summary: 'Cartas de controlo, capacidade, Pareto e variabilidade numa só plataforma.',
    tutorial: {
      goal: 'Verificar se um processo é estável e capaz.',
      steps: [
        'Escolha o modo: carta de controlo, capacidade, Pareto, variabilidade, intervalo de tolerância ou CUSUM.',
        'Selecione a variável numérica (ou a categoria, para o Pareto).',
        'Defina os limites de especificação, a dimensão do subgrupo e a proporção da população do intervalo de tolerância, quando necessário.',
        'Execute e leia a carta, os índices e o relatório de leitura.',
      ],
      expected: 'Uma carta de controlo com limites, índices de capacidade ou um gráfico de Pareto, além das tabelas.',
    },
    advanced: {
      assumptions: ['As observações estão na sua ordem temporal real; os subgrupos têm significado.'],
      whenToUse: ['Monitorizar um processo, comparar a variabilidade entre grupos, priorizar defeitos.'],
      whenNotToUse: ['Julgar a capacidade antes da estabilidade; um índice de capacidade num processo instável é enganador.'],
      reading: [
        'Os pontos fora dos limites de controlo são sinais, não prova de uma mudança.',
        'O Cp é a margem potencial; o Cpk penaliza também uma média afastada do centro das especificações.',
        'A linha acumulada do Pareto mostra quais as categorias a atacar primeiro.',
        'O intervalo de tolerância cobre uma proporção da população, não a média; a CUSUM acumula pequenos deslocamentos persistentes.',
      ],
      pitfalls: [
        'Os limites de controlo não são limites de especificação.',
        'A capacidade assume normalidade e um processo estável.',
      ],
      charts: ['Carta de controlo', 'Histograma de capacidade', 'Gráfico de Pareto', 'Diagrama de caixa da variabilidade', 'Intervalo de tolerância'],
      glossary: [
        { term: 'UCL/LCL', definition: 'Limites de controlo superior e inferior a ±3 sigma do centro.' },
        { term: 'Cpk', definition: 'Índice de capacidade que tem em conta a distância entre a média e os limites de especificação.' },
      ],
    },
    seeAlso: ['descriptive', 'distfit'],
  },
  {
    id: 'cluster',
    area: 'procedures',
    title: 'Análise de clusters',
    summary: 'Agrupamento hierárquico com dendrograma e perfis de clusters.',
    tutorial: {
      goal: 'Encontrar grupos de observações semelhantes em várias variáveis numéricas.',
      steps: [
        'Selecione pelo menos duas variáveis numéricas.',
        'Escolha a ligação e o número de clusters.',
        'Execute e leia o dendrograma, as médias dos clusters e os perfis.',
      ],
      expected: 'Um dendrograma, dimensões dos clusters, médias dos clusters e perfis estandardizados.',
    },
    advanced: {
      assumptions: ['As variáveis estão em escalas comparáveis, ou a estandardização está ativa.'],
      whenToUse: ['Segmentação, tipologias exploratórias, descoberta de grupos naturais.'],
      whenNotToUse: ['Testar se os grupos existem; o clustering não tem valor-p para isso.'],
      reading: [
        'A altura de uma fusão é a distância entre os grupos que se unem.',
        'Os perfis estandardizados mostram quais variáveis caracterizam cada cluster.',
      ],
      pitfalls: [
        'Ligações ou cortes diferentes produzem clusters diferentes.',
        'Clusters muito pequenos podem ser valores atípicos e não grupos reais.',
      ],
      charts: ['Dendrograma', 'Perfis dos clusters', 'Dimensão dos clusters'],
      glossary: [
        { term: 'Ligação', definition: 'A regra que mede a distância entre dois clusters.' },
        { term: 'Dendrograma', definition: 'Uma árvore que mostra a ordem e a altura das fusões.' },
      ],
    },
    seeAlso: ['multivariate', 'partition'],
  },
  {
    id: 'discriminant',
    area: 'procedures',
    title: 'Discriminante / MANOVA',
    summary: 'Separar grupos conhecidos e testar a diferença multivariada das médias.',
    tutorial: {
      goal: 'Verificar se os grupos diferem em várias variáveis numéricas em conjunto.',
      steps: [
        'Selecione a coluna de agrupamento e pelo menos um preditor numérico.',
        'Execute e leia o lambda de Wilks, os testes univariados e o gráfico canónico.',
        'Verifique a matriz de classificação para ver quão bem os grupos se classificam.',
      ],
      expected: 'Tabela MANOVA, coeficientes discriminantes, dispersão canónica e gráfico de perfis.',
    },
    advanced: {
      assumptions: ['Observações independentes, covariâncias semelhantes entre grupos, preditores contínuos.'],
      whenToUse: ['Grupos conhecidos, regras de classificação, comparação multivariada de grupos.'],
      whenNotToUse: ['Descoberta de grupos desconhecidos (use o clustering) ou mais variáveis do que casos.'],
      reading: [
        'Um lambda de Wilks pequeno e um p pequeno indicam separação entre grupos.',
        'Os eixos canónicos são as direções que melhor separam os grupos.',
        'A exatidão de treino é otimista: valide numa amostra separada.',
      ],
      pitfalls: [
        'Grupos desequilibrados podem dominar a exatidão.',
        'Preditores colineares tornam a matriz de covariância singular.',
      ],
      charts: ['Dispersão canónica', 'Perfis dos grupos', 'Mapa de calor dos coeficientes'],
      glossary: [
        { term: 'Lambda de Wilks', definition: 'Uma estatística de teste multivariada próxima de zero quando os grupos diferem.' },
        { term: 'Função canónica', definition: 'Uma combinação linear de variáveis que maximiza a separação entre grupos.' },
      ],
    },
    seeAlso: ['multivariate', 'anova'],
  },
  {
    id: 'doe',
    area: 'procedures',
    title: 'Superfície de resposta (DOE)',
    summary: 'Superfície quadrática e curvas de nível para dois fatores contínuos.',
    tutorial: {
      goal: 'Encontrar a combinação de dois fatores que otimiza uma resposta.',
      steps: [
        'Selecione a resposta numérica e dois fatores numéricos.',
        'Escolha um modelo linear ou quadrático.',
        'Execute e leia a superfície, as curvas de nível e o ponto estacionário.',
      ],
      expected: 'Uma superfície projetada, curvas de nível, coeficientes do modelo e um ponto estacionário.',
    },
    advanced: {
      assumptions: ['A resposta é contínua; os fatores são numéricos; os resíduos são independentes.'],
      whenToUse: ['Otimização de processos, curvatura e interação entre dois fatores.'],
      whenNotToUse: ['Afirmações causais sem um delineamento experimental, réplicas e aleatorização.'],
      reading: [
        'As curvas de nível ligam combinações de fatores com a mesma resposta prevista.',
        'Um ponto de sela não é um ótimo: sobe numa direção e desce na outra.',
      ],
      pitfalls: [
        'A superfície só é válida dentro do intervalo observado dos fatores.',
        'Um ajustamento quadrático não substitui um ensaio experimental.',
      ],
      charts: ['Superfície de resposta', 'Mapa de curvas de nível', 'Coeficientes do modelo'],
      glossary: [
        { term: 'Ponto estacionário', definition: 'Onde o gradiente da superfície é zero.' },
        { term: 'Curva de nível', definition: 'Uma linha de resposta prevista constante.' },
      ],
    },
    seeAlso: ['factorial', 'regression'],
  },
  {
    id: 'proportions',
    area: 'procedures',
    title: 'Proporções e taxas',
    summary: 'Testes de uma e duas amostras para proporções e taxas de Poisson.',
    tutorial: {
      goal: 'Decidir se uma proporção ou uma taxa de eventos difere de um alvo ou entre dois grupos.',
      dataset: 'two_groups_binary.csv',
      steps: [
        'Escolha uma ou duas proporções, ou uma ou duas taxas de Poisson.',
        'Selecione o resultado binário (ou a coluna de contagem) e a coluna de grupo para os modos de duas amostras.',
        'Escolha o nível de sucesso, o valor nulo e a exposição por linha, quando necessário.',
        'Execute a análise e leia o teste exato, o intervalo e a dimensão do efeito.',
      ],
      expected: 'Uma tabela com sucessos, ensaios, estimativa, p exato e intervalo, além da diferença ou do rácio de taxas para dois grupos.',
    },
    advanced: {
      assumptions: [
        'As observações são independentes dentro e entre os grupos.',
        'As contagens de Poisson são eventos inteiros com exposição conhecida e variância igual à média.',
      ],
      whenToUse: ['Comparar taxas de conversão, defeitos, incidência ou contagens por unidade de exposição.'],
      whenNotToUse: ['Medidas repetidas ou dados agrupados: a independência é violada.'],
      reading: [
        'O p exato é a referência com contagens pequenas; o p assintótico é uma aproximação normal.',
        'O intervalo de Wilson é mais estável do que o de Wald; Clopper–Pearson garante a cobertura nominal.',
        'O risco relativo e o odds ratio não substituem a diferença absoluta.',
      ],
      pitfalls: [
        'Um odds ratio elevado pode esconder uma diferença absoluta mínima quando os eventos são raros.',
        'A exposição tem de ser declarada: a mesma contagem sobre exposições diferentes dá taxas diferentes.',
      ],
      charts: ['Gráfico de intervalo'],
      glossary: [
        { term: 'p exato', definition: 'Probabilidade de todos os resultados pelo menos tão improváveis como o observado sob a hipótese nula.' },
        { term: 'Rácio de taxas', definition: 'Rácio entre duas taxas de eventos; 1 significa taxas iguais.' },
      ],
    },
    seeAlso: ['chisquare', 'ttest'],
  },
  {
    id: 'variances',
    area: 'procedures',
    title: 'Variâncias',
    summary: 'Uma variância, teste F e Bartlett/Levene para a igualdade de dispersões.',
    tutorial: {
      goal: 'Verificar se uma variância difere de um alvo ou entre grupos.',
      dataset: 'plantgrowth.csv',
      steps: [
        'Escolha uma variância ou duas ou mais variâncias.',
        'Selecione a variável numérica e, para dois ou mais grupos, a coluna de grupo.',
        'Introduza a variância nula para o teste de uma amostra.',
        'Execute e compare F, Bartlett e Levene antes de escolher um teste para as médias.',
      ],
      expected: 'Uma tabela de variâncias com intervalo exato e valores p de F/Bartlett/Levene quando há grupos.',
    },
    advanced: {
      assumptions: [
        'As observações são independentes e, para o χ² e os intervalos F, normais.',
        'Levene sobre medianas é mais robusto mas exige grupos independentes.',
      ],
      whenToUse: ['Verificar homocedasticidade antes de um teste t ou ANOVA, ou comparar a dispersão de um processo.'],
      whenNotToUse: ['Com grupos muito pequenos os testes têm pouca potência; prefira procedimentos de Welch.'],
      reading: [
        'O teste F abrange dois grupos; com mais grupos use Bartlett ou Levene.',
        'Bartlett é potente sob normalidade mas distorcido por valores atípicos e caudas pesadas.',
        'Levene sobre medianas reduz a influência dos extremos e é a opção segura por omissão.',
      ],
      pitfalls: [
        'Um teste não significativo não prova igualdade de variâncias: veja o intervalo e as caixas.',
        'A variância está na escala quadrática: apresente o desvio-padrão para interpretar.',
      ],
      charts: ['Diagrama de caixa', 'Gráfico de intervalo'],
      glossary: [
        { term: 'Homocedasticidade', definition: 'Igualdade de variâncias entre grupos, pressuposto do t agrupado e da ANOVA.' },
        { term: 'Teste de Levene', definition: 'ANOVA sobre desvios absolutos em relação a um centro de grupo; a versão da mediana é Brown–Forsythe.' },
      ],
    },
    seeAlso: ['ttest', 'anova'],
  },
];
