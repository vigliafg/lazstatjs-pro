import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Procedimentos da onda 7: VAR/VECM, GARCH e modelos de espaço de estados. */
export const w7Topics: HelpTopic[] = [
  procedureTopic({
    id: 'var',
    title: 'VAR / VECM',
    summary: 'Modelar várias séries temporais em conjunto, testar a causalidade de Granger e estimar a correção do erro.',
    goal: 'Descrever como cada série depende do próprio passado e do passado das outras, separando relações de longo prazo e dinâmica de curto prazo.',
    steps: [
      'Selecionar pelo menos duas séries numéricas por ordem temporal.',
      'Deixar os desfasamentos em 0 para a seleção automática por AIC ou introduzir uma ordem fixa.',
      'Escolher VAR para séries estacionárias ou VECM para séries I(1) cointegradas.',
      'Ler coeficientes, testes de Granger, respostas impulsivas e decomposição da variância.',
    ],
    expected:
      'Resumo do VAR com estabilidade, tabela de coeficientes, testes de Granger, respostas impulsivas e decomposição da variância; o VECM acrescenta o vetor de cointegração e as velocidades de ajuste.',
    whenToUse: [
      'Quando várias séries evoluem em conjunto e se quer modelar a dinâmica conjunta.',
      'Quando se quer testar se o passado de uma série melhora a previsão de outra.',
      'Quando se suspeita de uma relação estável de longo prazo entre séries não estacionárias.',
    ],
    assumptions: [
      'As séries são estacionárias ou diferenciadas até à estacionaridade; o VECM exige séries I(1) com cointegração.',
      'Os resíduos não têm autocorrelação após a ordem escolhida.',
      'Há observações suficientes para o número de parâmetros.',
    ],
    whenNotToUse: [
      'Com séries muito curtas: o número de parâmetros cresce rapidamente.',
      'Quando só interessa um resultado: um ARIMA ou uma regressão univariada é mais simples.',
      'Quando dominam mudanças estruturais não modeladas.',
    ],
    reading: [
      'Um VAR estável tem todas as raízes características fora do círculo unitário.',
      'Um teste de Granger significativo indica poder de previsão, não causalidade estrutural.',
      'As respostas impulsivas dependem da ordem de Cholesky.',
      'Num VECM, um α negativo e significativo indica correção do desvio à relação de longo prazo.',
    ],
    pitfalls: [
      'Estimar um VAR sobre níveis com tendência sem verificar a estacionaridade.',
      'Ler a causalidade de Granger como causalidade estrutural.',
      'Interpretar respostas impulsivas sem declarar a ordem de identificação.',
      'Usar Engle–Granger quando pode haver mais de uma relação de cointegração.',
    ],
    charts: ['Respostas impulsivas por choque e resposta.', 'Quotas da variância do erro no horizonte final.'],
    glossary: [
      { term: 'VAR', definition: 'Sistema de autorregressões, uma equação por série, com os desfasamentos de todas as séries.' },
      { term: 'Cointegração', definition: 'Combinação linear estacionária de séries não estacionárias.' },
      { term: 'Resposta impulsiva', definition: 'Variação das séries após um choque de um desvio-padrão.' },
    ],
    seeAlso: ['timeseries', 'statespace'],
  }),
  procedureTopic({
    id: 'garch',
    title: 'GARCH',
    summary: 'Estimar a volatilidade condicional que se agrupa no tempo com um modelo GARCH(1,1).',
    goal: 'Separar o nível de uma série da sua volatilidade variável no tempo e prever a escala das flutuações futuras.',
    steps: [
      'Selecionar a série de rendibilidades ou variações por ordem temporal.',
      'Definir o horizonte de previsão.',
      'Estimar o modelo e ler persistência, variância de longo prazo e meia-vida.',
      'Verificar o teste de Ljung–Box nos resíduos padronizados.',
    ],
    expected:
      'Resumo do modelo, coeficientes com erros padrão, diagnóstico dos resíduos e previsões da variância condicional.',
    whenToUse: [
      'Quando a amplitude das flutuações muda no tempo e se agrupa em períodos calmos e turbulentos.',
      'Quando é necessária uma previsão de volatilidade ou uma escala variável para medidas de risco.',
      'Quando os resíduos de um modelo de média mostram autocorrelação nos quadrados.',
    ],
    assumptions: [
      'A variância condicional segue a recursão GARCH com ω, α, β positivos e α + β < 1.',
      'As inovações padronizadas são aproximadamente não correlacionadas; a normalidade é cómoda mas não necessária.',
      'A média é constante ou já foi removida.',
    ],
    whenNotToUse: [
      'Quando a volatilidade reage de forma diferente a choques positivos e negativos: usar um modelo assimétrico.',
      'Quando a série tem tendência ou sazonalidade determinística na média.',
      'Com menos de cerca de trinta observações.',
    ],
    reading: [
      'α mede a reação à última inovação; β a memória da volatilidade passada.',
      'Uma persistência próxima de 1 indica choques duradouros; a meia-vida é o número de períodos para os reduzir a metade.',
      'A variância de longo prazo é ω/(1 − α − β) quando α + β < 1.',
      'O desvio-padrão condicional é a escala esperada das flutuações, não um intervalo de confiança para a média.',
    ],
    pitfalls: [
      'Confundir previsões de variância com previsões de preço.',
      'Ignorar a autocorrelação residual nos quadrados.',
      'Reportar a meia-vida quando α + β ≥ 1, onde não está definida.',
      'Tratar o modelo como descrição completa de caudas e assimetrias.',
    ],
    charts: ['Série com o desvio-padrão condicional.', 'Autocorrelação dos resíduos padronizados.'],
    glossary: [
      { term: 'Efeito ARCH', definition: 'Dependência da variância atual das inovações quadradas recentes.' },
      { term: 'Persistência', definition: 'α + β no GARCH(1,1), velocidade de dissipação dos choques de volatilidade.' },
    ],
    seeAlso: ['timeseries', 'var'],
  }),
  procedureTopic({
    id: 'statespace',
    title: 'Espaço de estados e Markov switching',
    summary: 'Estimar um nível ou tendência latente com o filtro de Kalman, ou dois regimes com um AR(1) de Markov switching.',
    goal: 'Separar sinal e ruído e descrever séries que alternam entre regimes diferentes.',
    steps: [
      'Escolher o modelo local de nível/tendência ou o Markov switching de dois regimes.',
      'Selecionar a série e o horizonte de previsão.',
      'No modelo local, decidir se inclui a tendência estocástica.',
      'Ler os estados suavizados e a previsão, ou as probabilidades de regime e a matriz de transição.',
    ],
    expected:
      'Modelo local: variâncias, estados filtrados e suavizados, previsões com intervalos. Markov switching: médias e variâncias dos regimes, matriz de transição, probabilidades suavizadas e previsões.',
    whenToUse: [
      'Quando a série observada é uma medida ruidosa de uma quantidade latente mais suave.',
      'Quando a série parece alternar fases calmas e turbulentas, ou baixas e altas.',
      'Quando é necessária uma interpolação fundamentada de história ruidosa ou em falta.',
    ],
    assumptions: [
      'O modelo local é linear e gaussiano com inovações independentes.',
      'O modelo de Markov tem dois regimes, probabilidades de transição constantes e uma média AR(1) em cada regime.',
      'O número de regimes é conhecido e as etiquetas são identificadas pelos valores iniciais.',
    ],
    whenNotToUse: [
      'Quando as mudanças de regime dependem de covariáveis observadas: um modelo de limiar é mais claro.',
      'Com séries muito curtas, variâncias e etiquetas são instáveis.',
      'Quando uma simples regressão de tendência responde à pergunta.',
    ],
    reading: [
      'O estado filtrado usa apenas o passado; o suavizado usa toda a série.',
      'No modelo local, uma variância de observação grande indica muito ruído de medição.',
      'No modelo de Markov, a duração esperada de um regime é 1/(1 − p).',
      'A previsão média pondera os regimes com as probabilidades de transição.',
    ],
    pitfalls: [
      'Ler o estado filtrado como se usasse observações futuras.',
      'Impor uma tendência estocástica quando o modelo de nível único tem melhor AIC/BIC.',
      'Interpretar as etiquetas de regime sem verificar o seu sentido substantivo.',
      'Ignorar a incerteza da classificação dos regimes.',
    ],
    charts: ['Série observada, nível suavizado e previsão.', 'Probabilidade suavizada do segundo regime.'],
    glossary: [
      { term: 'Filtro de Kalman', definition: 'Atualização recursiva de um estado latente a partir de observações ruidosas.' },
      { term: 'Suavizador', definition: 'Estimativa do estado latente que usa toda a série, passado e futuro.' },
      { term: 'Markov switching', definition: 'Modelo em que os parâmetros mudam segundo uma cadeia de Markov oculta.' },
    ],
    seeAlso: ['timeseries', 'var'],
  }),
];
