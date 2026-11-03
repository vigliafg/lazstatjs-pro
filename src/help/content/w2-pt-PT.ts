import type { HelpTopic } from './types';

/** Procedimentos da vaga 2: GLM, quantílica, não linear e multinomial. */
export const w2Topics: HelpTopic[] = [
  {
    id: 'glm',
    area: 'procedures',
    title: 'Modelo linear generalizado (GLM)',
    summary: 'Famílias gaussiana, binomial, Poisson e Gamma com escolha da função de ligação.',
    tutorial: {
      goal: 'Estimar como uma pontuação muda com a idade quando o resultado não é uma média contínua simples.',
      dataset: 'score-groups.csv',
      steps: [
        'Variável dependente = Score, independentes = Age.',
        'Escolha a família: gaussiana para uma pontuação contínua, binomial para 0/1, Poisson para contagens, Gamma para valores positivos e assimétricos.',
        'Escolha uma ligação coerente com a família: identidade, log, logit, probit ou inversa.',
        'Execute e leia os coeficientes na escala da ligação juntamente com a desviância e o AIC.',
      ],
      expected: 'Tabela de coeficientes na escala da ligação, qualidade do ajustamento (desviância, AIC), resíduos e, com um só preditor, o perfil da média estimada.',
    },
    advanced: {
      assumptions: [
        'Observações independentes e uma resposta cuja variância segue a família escolhida.',
        'A ligação une o valor esperado a um preditor linear: a parte linear tem de estar correta.',
        'Binomial exige resposta 0/1, Poisson contagens não negativas, Gamma valores estritamente positivos.',
      ],
      whenToUse: [
        'Resultado contínuo mas assimétrico ou heterocedástico, tipicamente Gamma com ligação log.',
        'Resultado binário quando é preciso uma ligação probit ou uma família fora do menu logístico clássico.',
        'Contagens quando quer comparar a ligação log de Poisson com os diagnósticos de desviância.',
      ],
      whenNotToUse: [
        'Resultado binário que se enquadra no procedimento logístico dedicado, com odds ratios e análise do ponto de corte.',
        'Contagens com sobredispersão: o binomial negativo da regressão para contagens costuma ser melhor.',
        'Medidas repetidas ou agrupadas: use modelos mistos ou GEE.',
      ],
      reading: [
        'Os coeficientes vivem na escala da ligação: com ligação log, exp(β) é um rácio multiplicativo; com ligação logit, é um odds ratio.',
        'Uma desviância residual muito superior aos graus de liberdade indica sobredispersão, sobretudo em Poisson e binomial.',
        'O AIC compara modelos com a mesma resposta e a mesma família; não é uma medida absoluta de ajustamento.',
      ],
      pitfalls: [
        'Ler um coeficiente com ligação log como variação aditiva do resultado.',
        'Manter a família gaussiana com uma resposta 0/1 ou de contagem só porque o modelo corre.',
        'Escolher a ligação probit e depois interpretar os coeficientes como odds ratios.',
      ],
      charts: [
        'Valores observados e estimados: pontos próximos da diagonal indicam boa calibração.',
        'Resíduos face aos valores estimados: um funil ou uma curva revelam família ou ligação erradas.',
        'Perfil da média estimada: com um só preditor, a curva ajustada no intervalo observado.',
      ],
      glossary: [
        { term: 'Ligação', definition: 'A função que liga o valor esperado ao preditor linear.' },
        { term: 'Desviância', definition: 'Medida de qualidade do ajustamento: mais baixa é melhor e é comparável entre modelos aninhados.' },
        { term: 'Sobredispersão', definition: 'Variância maior do que a família pressupõe, que inflaciona os erros padrão.' },
      ],
    },
    seeAlso: ['regression', 'logistic', 'countreg'],
  },
  {
    id: 'quantile',
    area: 'procedures',
    title: 'Regressão quantílica',
    summary: 'Modela um quantil condicional (τ) em vez da média, robusta a valores extremos.',
    tutorial: {
      goal: 'Ver se a idade desloca a pontuação mediana, e não apenas a média.',
      dataset: 'score-groups.csv',
      steps: [
        'Variável dependente = Score, independentes = Age.',
        'Defina τ: 0,5 é a mediana; 0,1 e 0,9 descrevem as caudas inferior e superior.',
        'Execute e leia o coeficiente de cada preditor nesse quantil.',
        'Repita com outro τ e compare as duas retas ajustadas.',
      ],
      expected: 'Coeficientes, erros padrão e IC para o quantil escolhido; com um só preditor, a reta do quantil e o gráfico de resíduos.',
    },
    advanced: {
      assumptions: [
        'Observações independentes; no τ escolhido o quantil condicional é linear nos preditores.',
        'Não é exigida normalidade dos resíduos nem variância constante.',
      ],
      whenToUse: [
        'Resultados assimétricos, valores extremos ou interesse nas caudas (rendimentos, latências, pontuações).',
        'Quando o efeito de um preditor pode variar ao longo da distribuição.',
      ],
      whenNotToUse: [
        'Quando precisa de um único efeito médio e o alvo é a média.',
        'Com amostras muito pequenas: cada quantil de cauda usa poucas observações eficazes.',
      ],
      reading: [
        'O coeficiente é a variação do quantil τ por uma unidade a mais do preditor.',
        'Declives diferentes entre os τ indicam que o preditor atua de forma diferente no centro e nas caudas.',
        'Os erros padrão vêm da teoria dos quantis (tipo sanduíche); com poucos casos os intervalos são largos.',
      ],
      pitfalls: [
        'Ler um coeficiente mediano como efeito médio: a média pode estar noutro lugar.',
        'Retas de quantis que se cruzam (τ1 < τ2 mas a reta de τ1 acima) sugerem um modelo mal especificado.',
      ],
      charts: [
        'Reta do quantil: observações com a reta do τ ajustado; o declive é o efeito sobre o quantil.',
        'Resíduos face aos quantis estimados: uma estrutura indica que o modelo quantílico linear está errado.',
      ],
      glossary: [
        { term: 'Quantil τ', definition: 'O valor abaixo do qual cai uma proporção τ da distribuição condicional.' },
        { term: 'Regressão mediana', definition: 'Regressão quantílica com τ = 0,5, robusta a observações extremas.' },
      ],
    },
    seeAlso: ['regression', 'nonparamrm', 'lmm'],
  },
  {
    id: 'nonlinear',
    area: 'procedures',
    title: 'Regressão não linear',
    summary: 'Curvas exponencial, logística, Gompertz, potência e Michaelis–Menten por mínimos quadrados.',
    tutorial: {
      goal: 'Ajustar uma curva que sobe depressa e depois se aplana, e ler os seus parâmetros.',
      dataset: 'score-groups.csv',
      steps: [
        'Variável dependente = Score, preditor = Time.',
        'Escolha a forma: exponencial, logística, Gompertz, potência ou Michaelis–Menten.',
        'Execute e verifique se o ajustamento convergiu; depois leia os parâmetros com os respetivos IC.',
        'Observe a curva e os resíduos; experimente outra forma se o padrão for sistemático.',
      ],
      expected: 'Tabela de parâmetros com SE, t, p e IC, R², RMSE, curva ajustada e gráfico de resíduos.',
    },
    advanced: {
      assumptions: [
        'A forma funcional escolhida está correta; os resíduos são independentes e aproximadamente homocedásticos.',
        'O intervalo do preditor cobre a parte da curva que quer descrever.',
        'Valores distintos suficientes do preditor para identificar todos os parâmetros.',
      ],
      whenToUse: [
        'Formas de crescimento, decaimento, saturação e dose–resposta que uma reta não descreve.',
        'Quando os parâmetros têm significado: assíntota, taxa, semissaturação.',
      ],
      whenNotToUse: [
        'Quando uma transformação torna a relação linear e interpretável, como log–log para uma lei de potência.',
        'Com poucos pontos ou um intervalo estreito do preditor: os parâmetros ficam fracamente identificados.',
      ],
      reading: [
        'Exponencial y = a·exp(b·x): b > 0 é crescimento, b < 0 é decaimento.',
        'Logística L/(1+exp(−k(x−x0))): L é a assíntota superior, k o declive, x0 o ponto de inflexão.',
        'Gompertz a·exp(−b·exp(−c·x)): crescimento assimétrico que se aproxima mais devagar da assíntota.',
        'Potência a·x^b: b é o expoente; Michaelis–Menten vmax·x/(km+x): km é o valor de semissaturação.',
      ],
      pitfalls: [
        'Comparar R² entre curvas diferentes sem verificar o padrão dos resíduos.',
        'Confiar num ajustamento convergido com intervalos de parâmetros largos ou implausíveis.',
        'Extrapolar para além do intervalo observado do preditor, sobretudo no crescimento exponencial.',
      ],
      charts: [
        'Curva estimada: observações com a curva ajustada sobreposta.',
        'Resíduos face aos valores estimados: arcos sistemáticos indicam que a curva escolhida está errada.',
      ],
      glossary: [
        { term: 'Assíntota', definition: 'O valor para o qual a curva tende quando o preditor cresce.' },
        { term: 'Semissaturação', definition: 'O valor do preditor em que a resposta atinge metade do máximo (km).' },
      ],
    },
    seeAlso: ['regression', 'glm', 'countreg'],
  },
  {
    id: 'multinomial',
    area: 'procedures',
    title: 'Regressão logística multinomial',
    summary: 'Resultado nominal com três ou mais classes, cada uma comparada com uma classe de referência.',
    tutorial: {
      goal: 'Estimar como os preditores mudam a probabilidade de pertencer a cada classe de um resultado nominal.',
      steps: [
        'Resultado = a coluna categórica com pelo menos três classes, por exemplo baixo/médio/alto.',
        'Selecione os preditores numéricos.',
        'Execute e leia um bloco de coeficientes por classe face à classe de referência.',
        'Verifique a exatidão global e a de cada classe antes de confiar na classificação.',
      ],
      expected: 'Coeficientes e rácios de risco relativo com IC para cada classe face à referência, exatidão global e tabela de classificação.',
    },
    advanced: {
      assumptions: [
        'Observações independentes; o log-odds de cada classe face à referência é linear nos preditores.',
        'Independência das alternativas irrelevantes: acrescentar ou retirar uma classe não deve alterar as outras.',
        'Cada classe tem observações suficientes para o número de parâmetros.',
      ],
      whenToUse: [
        'Resultado nominal com mais de duas categorias não ordenadas, como meio de transporte ou escolha de produto.',
        'Quando quer efeitos específicos por classe em vez de um único contraste binário.',
      ],
      whenNotToUse: [
        'Classes ordenadas: a logística ordinal é mais parcimoniosa.',
        'Resultado binário: use a regressão logística.',
        'Classes muito raras: as estimativas são instáveis.',
      ],
      reading: [
        'Cada classe é comparada com a de referência: exp(β) é um rácio de risco relativo, não uma probabilidade.',
        'Um rácio acima de 1 significa que o preditor aumenta as odds dessa classe face à referência.',
        'A exatidão global pode ser alta só porque uma classe domina: leia também a exatidão por classe.',
      ],
      pitfalls: [
        'Interpretar os rácios de risco relativo como probabilidades ou como rácios de risco.',
        'Mudar a classe de referência e esperar os mesmos números: a comparação muda.',
        'Usar a multinomial quando as classes são ordenadas.',
      ],
      charts: [
        'Distribuição das classes previstas: cada barra conta quantas observações o modelo atribui a essa classe.',
        'Exatidão por classe: percentagem corretamente classificada em cada classe, com a exatidão global como linha de referência.',
      ],
      glossary: [
        { term: 'Classe de referência', definition: 'A classe com a qual todas as outras são comparadas.' },
        { term: 'Rácio de risco relativo', definition: 'A variação multiplicativa das odds de uma classe face à referência por uma unidade a mais do preditor.' },
        { term: 'Softmax', definition: 'A função que transforma as pontuações das classes em probabilidades que somam um.' },
      ],
    },
    seeAlso: ['logistic', 'multivariate', 'ordinal'],
  },
];
