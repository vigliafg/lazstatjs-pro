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
        'Escolha o modo: carta de controlo, capacidade, Pareto ou variabilidade.',
        'Selecione a variável numérica (ou a categoria, para o Pareto).',
        'Defina os limites de especificação e a dimensão do subgrupo, quando necessário.',
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
      ],
      pitfalls: [
        'Os limites de controlo não são limites de especificação.',
        'A capacidade assume normalidade e um processo estável.',
      ],
      charts: ['Carta de controlo', 'Histograma de capacidade', 'Gráfico de Pareto', 'Diagrama de caixa da variabilidade'],
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
];
