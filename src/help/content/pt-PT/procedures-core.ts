import type { HelpTopic } from '../types';

/** Procedure chapters: description, comparison of means and regression models. */
export const coreTopics: HelpTopic[] = [
  {
    id: 'descriptive',
    area: 'procedures',
    title: 'Estatística descritiva',
    summary: 'Média, dispersão, quantis, valores omissos e verificações de normalidade para cada variável.',
    tutorial: {
      goal: 'Resumir as variáveis numéricas de um estudo antes de escolher um teste.',
      dataset: 'score-groups.csv',
      steps: [
        'Abra Descritiva na família Descritiva.',
        'Selecione as variáveis numéricas (Score, Age) e mantenha o nível de confiança em 95%.',
        'Prima Executar análise e leia a linha de cada variável.',
        'Verifique a coluna dos omissos e o teste de normalidade antes de comparar grupos.',
      ],
      expected: 'Uma linha por variável com N, média, desvio-padrão, mediana, quartis, mínimo e máximo, mais o resultado da normalidade.',
    },
    advanced: {
      assumptions: ['A média e o desvio-padrão exigem uma variável quantitativa.'],
      whenToUse: [
        'Sempre, como primeiro passo: mostra a forma dos dados e os valores estranhos.',
        'Para decidir entre testes paramétricos e não paramétricos.',
      ],
      whenNotToUse: ['Com variáveis categóricas: use frequências, não a média.'],
      reading: [
        'Uma média longe da mediana sugere assimetria ou valores extremos.',
        'Os testes de normalidade são indicativos: com N grande são demasiado sensíveis, com N pequeno têm pouca potência.',
      ],
      pitfalls: [
        'Nunca apresente o desvio-padrão como erro padrão: são quantidades diferentes.',
        'Um único valor atípico pode dominar a média e o desvio-padrão.',
      ],
      glossary: [
        { term: 'Desvio-padrão', definition: 'Dispersão média dos valores em torno da média, na mesma unidade dos dados.' },
        { term: 'Quantil', definition: 'O valor abaixo do qual cai uma determinada percentagem de observações.' },
      ],
    },
    seeAlso: ['distfit', 'ttest'],
  },
  {
    id: 'distfit',
    area: 'procedures',
    title: 'Ajustamento de distribuições',
    summary: 'Comparar a distribuição observada com famílias teóricas e escolher a melhor.',
    tutorial: {
      goal: 'Descobrir que distribuição teórica descreve melhor uma variável.',
      dataset: 'score-groups.csv',
      steps: [
        'Abra o procedimento e selecione a variável numérica.',
        'Marque as distribuições a comparar (normal, lognormal, gama, Weibull…).',
        'Execute e leia a tabela de qualidade do ajustamento.',
        'Execute de novo apenas com a melhor distribuição para obter o gráfico de comparação.',
      ],
      expected: 'A distribuição com o melhor critério é realçada; o gráfico sobrepõe a densidade teórica ao histograma observado.',
    },
    advanced: {
      assumptions: ['As observações têm de ser independentes.'],
      whenToUse: ['Para escolher uma família antes de modelar tempos, contagens ou montantes.'],
      whenNotToUse: ['Com menos de algumas dezenas de casos é difícil distinguir as famílias.'],
      reading: [
        'Um AIC/BIC mais baixo significa um melhor ajustamento.',
        'Um valor p de qualidade do ajustamento não prova a normalidade: apenas mede a evidência contra ela.',
      ],
      pitfalls: ['Escolher a distribuição a partir dos dados e depois testá-la nos mesmos dados sobrestima o ajustamento.'],
      glossary: [
        { term: 'AIC', definition: 'Um critério que premeia o ajustamento e penaliza o número de parâmetros.' },
        { term: 'Lognormal', definition: 'Uma distribuição cujo logaritmo é normal; típica de montantes e tempos.' },
      ],
    },
    seeAlso: ['descriptive', 'parametric'],
  },
  {
    id: 'ttest',
    area: 'procedures',
    title: 'Teste t',
    summary: 'Comparar duas médias ou duas medições emparelhadas, com alternativa não paramétrica.',
    tutorial: {
      goal: 'Verificar se a pontuação média difere entre dois grupos independentes.',
      dataset: 'score-groups.csv',
      steps: [
        'Abra Teste t e defina Tipo de teste = Amostras independentes.',
        'Variável 1 = Score, Variável 2 = Group.',
        'Mantenha as Variâncias em Welch a menos que saiba que são iguais.',
        'Execute e leia a diferença, o intervalo de confiança e o valor p.',
      ],
      expected: 'Duas linhas descritivas, o teste t com graus de liberdade, a diferença com o respetivo CI e o relatório de leitura.',
    },
    advanced: {
      assumptions: [
        'Observações independentes; no teste emparelhado, uma ligação entre as duas medidas do mesmo sujeito.',
        'Com N pequeno, normalidade ou pelo menos ausência de assimetria forte.',
      ],
      whenToUse: ['Dois grupos ou dois momentos, resultado numérico.'],
      whenNotToUse: ['Mais de dois grupos (use ANOVA) ou um resultado categórico.'],
      reading: [
        'O valor p responde a «quão compatível é isto com a ausência de diferença», não à probabilidade de a hipótese nula ser verdadeira.',
        'O intervalo de confiança também mostra a dimensão possível da diferença: avalie a relevância prática.',
      ],
      pitfalls: [
        'Comparar muitos pares sem correção inflaciona os falsos positivos.',
        'Um resultado não significativo não prova igualdade: olhe para o intervalo.',
      ],
      glossary: [
        { term: 'Welch', definition: 'A variante do teste t que não assume variâncias iguais.' },
        { term: "d de Cohen", definition: 'Tamanho do efeito expresso em unidades de desvio-padrão.' },
      ],
    },
    seeAlso: ['anova', 'nonparamrm', 'tost'],
  },
  {
    id: 'anova',
    area: 'procedures',
    title: 'ANOVA de um fator',
    summary: 'Comparar as médias de dois ou mais grupos com testes post-hoc e Kruskal-Wallis.',
    tutorial: {
      goal: 'Saber se a pontuação média muda entre três grupos de tratamento.',
      dataset: 'score-groups.csv',
      steps: [
        'Abra ANOVA, defina Variável dependente = Score e Variável de grupo = Group.',
        'Mantenha Post-hoc = Holm e ative a alternativa não paramétrica.',
        'Execute e verifique a tabela principal e, depois, as comparações post-hoc.',
      ],
      expected: 'Tabela ANOVA com F, graus de liberdade e p; diferenças post-hoc com CIs; Kruskal-Wallis como verificação.',
    },
    advanced: {
      assumptions: ['Independência, resíduos normais, variâncias semelhantes entre grupos.'],
      whenToUse: ['Um fator entre sujeitos com três ou mais níveis.'],
      whenNotToUse: ['Medidas repetidas (use a ANOVA de medidas repetidas) ou dois grupos (o teste t é equivalente).'],
      reading: [
        'Um p significativo diz que pelo menos uma média difere: o post-hoc diz qual.',
        'Um Levene significativo sugere variâncias desiguais: prefira Welch ou Kruskal-Wallis.',
      ],
      pitfalls: [
        'Escolha o teste post-hoc antes de olhar para os dados, não depois.',
        'Voltar a executar a ANOVA em subgrupos escolhidos a posteriori inflaciona os falsos positivos.',
      ],
      glossary: [
        { term: 'Post-hoc', definition: 'Comparações aos pares executadas após um teste global significativo.' },
        { term: 'Holm', definition: 'Uma correção dos valores p que controla o erro por família sem ser demasiado conservadora.' },
      ],
    },
    seeAlso: ['factorial', 'ancova', 'nonparamrm'],
  },
  {
    id: 'factorial',
    area: 'procedures',
    title: 'ANOVA fatorial',
    summary: 'Dois fatores entre sujeitos, efeitos principais e a sua interação.',
    tutorial: {
      goal: 'Verificar se o efeito de um tratamento depende do sexo dos participantes.',
      dataset: 'score-groups.csv',
      steps: [
        'Selecione a variável dependente e os dois fatores (Fator A, Fator B).',
        'Ative «Incluir interação A × B».',
        'Execute e leia a tabela dos efeitos: A, B e A × B.',
        'Se a interação for significativa, comente as médias das células e não apenas os efeitos principais.',
      ],
      expected: 'Uma linha por efeito com F, graus de liberdade, p e tamanho do efeito, mais as médias das células.',
    },
    advanced: {
      assumptions: ['Independência, resíduos normais, variâncias semelhantes nas células.'],
      whenToUse: ['Dois fatores categóricos entre sujeitos com casos suficientes por célula.'],
      whenNotToUse: ['Células com muito poucos casos tornam a interação instável.'],
      reading: [
        'Um efeito principal significativo na presença de uma interação significativa tem de ser lido com cuidado.',
        'As médias das células mostram a direção da interação.',
      ],
      pitfalls: ['Em delineamentos não equilibrados a ordem dos termos altera os resultados: verifique o tipo de somas de quadrados.'],
      glossary: [
        { term: 'Interação', definition: 'Quando o efeito de um fator muda entre os níveis do outro.' },
        { term: 'Efeito principal', definition: 'O efeito médio de um fator, ignorando o outro.' },
      ],
    },
    seeAlso: ['anova', 'mixedanova'],
  },
  {
    id: 'ancova',
    area: 'procedures',
    title: 'ANCOVA',
    summary: 'Comparar grupos ajustando para covariáveis contínuas, com médias ajustadas.',
    tutorial: {
      goal: 'Comparar grupos tendo em conta a idade dos participantes.',
      dataset: 'score-groups.csv',
      steps: [
        'Escolha a variável dependente, o fator de grupo e pelo menos uma covariável.',
        'Execute e verifique o teste de homogeneidade dos declives.',
        'Leia as médias ajustadas com intervalos de confiança e as comparações de Holm.',
      ],
      expected: 'Efeito do grupo ajustado para as covariáveis, médias ajustadas e diagnósticos dos declives.',
    },
    advanced: {
      assumptions: [
        'Uma relação linear entre a covariável e o resultado dentro de cada grupo.',
        'Declives homogéneos: se o teste for significativo, a ANCOVA clássica não é adequada.',
      ],
      whenToUse: ['Grupos desequilibrados numa variável contínua que influencia o resultado.'],
      whenNotToUse: ['Uma covariável medida depois do tratamento: arrisca-se a retirar o efeito.'],
      reading: ['Apresente as médias ajustadas, não as brutas.'],
      pitfalls: ['Uma covariável correlacionada com o grupo torna a interpretação frágil.'],
      glossary: [
        { term: 'Médias ajustadas', definition: 'Médias estimadas como se todos os grupos tivessem o mesmo valor médio da covariável.' },
        { term: 'Declives homogéneos', definition: 'A relação covariável-resultado tem o mesmo declive em todos os grupos.' },
      ],
    },
    seeAlso: ['anova', 'regression'],
  },
  {
    id: 'repeatedanova',
    area: 'procedures',
    title: 'ANOVA de medidas repetidas',
    summary: 'Comparar condições medidas nos mesmos sujeitos, com correções de esfericidade.',
    tutorial: {
      goal: 'Comparar três medições feitas aos mesmos participantes.',
      dataset: 'score-groups.csv',
      steps: [
        'Organize os dados em formato largo: uma linha por sujeito, uma coluna por condição.',
        'Selecione as colunas das condições (pelo menos três).',
        'Execute e verifique Mauchly e as correções de Greenhouse–Geisser ou Huynh–Feldt.',
        'Se o teste global for significativo, leia as comparações aos pares corrigidas.',
      ],
      expected: 'Tabela intra-sujeito com F, esfericidade e p corrigido, mais comparações post-hoc.',
    },
    advanced: {
      assumptions: ['Esfericidade: as diferenças entre condições têm variabilidade igual.'],
      whenToUse: ['As mesmas unidades medidas em três ou mais ocasiões.'],
      whenNotToUse: ['Muitos dados omissos: um modelo misto é melhor.'],
      reading: [
        'Se Mauchly for significativo, use os graus de liberdade corrigidos.',
        'A correção altera os graus de liberdade, não as médias.',
      ],
      pitfalls: ['Uma ordem de colunas errada compara as condições erradas.'],
      glossary: [
        { term: 'Esfericidade', definition: 'O pressuposto de que as variâncias das diferenças entre condições são iguais.' },
        { term: 'Greenhouse–Geisser', definition: 'Uma correção conservadora dos graus de liberdade quando a esfericidade é violada.' },
      ],
    },
    seeAlso: ['mixedanova', 'nonparamrm'],
  },
  {
    id: 'mixedanova',
    area: 'procedures',
    title: 'ANOVA mista',
    summary: 'Um fator entre sujeitos e condições intra-sujeito, com a respetiva interação.',
    tutorial: {
      goal: 'Comparar a trajetória de dois grupos ao longo de três momentos.',
      dataset: 'score-groups.csv',
      steps: [
        'Prepare o formato largo: uma linha por sujeito e uma coluna por momento.',
        'Defina o grupo entre sujeitos e as colunas das condições intra-sujeito.',
        'Execute e leia os efeitos de tempo, grupo e tempo × grupo.',
      ],
      expected: 'Três linhas de efeitos com valores p corrigidos e médias por grupo e momento.',
    },
    advanced: {
      assumptions: ['Esfericidade intra-sujeito, resíduos normais, independência entre sujeitos.'],
      whenToUse: ['Delineamento longitudinal com um grupo de comparação.'],
      whenNotToUse: ['Grupos muito pequenos ou dados omissos estruturais.'],
      reading: ['Uma interação significativa significa que os grupos mudam de forma diferente ao longo do tempo.'],
      pitfalls: ['Misturar formatos largo e longo produz colunas erradas e resultados sem sentido.'],
      glossary: [
        { term: 'Entre sujeitos', definition: 'Um fator cujos níveis são atribuídos a unidades diferentes.' },
        { term: 'Intra-sujeito', definition: 'Um fator medido repetidamente na mesma unidade.' },
      ],
    },
    seeAlso: ['repeatedanova', 'lmm'],
  },
  {
    id: 'nonparamrm',
    area: 'procedures',
    title: 'Testes não paramétricos para medidas repetidas',
    summary: 'Friedman, McNemar, Q de Cochran e Jonckheere–Terpstra.',
    tutorial: {
      goal: 'Comparar três condições sem assumir normalidade.',
      dataset: 'score-groups.csv',
      steps: [
        'Escolha o teste para o seu delineamento: Friedman para condições ordenadas, McNemar para duas medidas binárias emparelhadas.',
        'Selecione as colunas ou variáveis de que precisa.',
        'Execute e leia a estatística com o respetivo valor p e, no Friedman, o post-hoc de Nemenyi.',
      ],
      expected: 'Estatística, graus de liberdade e p; no Friedman, as comparações aos pares com diferenças de postos.',
    },
    advanced: {
      assumptions: ['Observações emparelhadas; o Q de Cochran exige um resultado binário.'],
      whenToUse: ['Amostras pequenas, resultados ordinais ou distribuições muito assimétricas.'],
      whenNotToUse: ['Amostras grandes e contínuas com distribuição regular: os testes paramétricos têm mais potência.'],
      reading: ['Um p significativo significa que pelo menos uma condição difere; o post-hoc diz qual.'],
      pitfalls: ['Os postos perdem informação de magnitude: apresente também as medianas.'],
      glossary: [
        { term: 'Friedman', definition: 'A alternativa não paramétrica à ANOVA de medidas repetidas.' },
        { term: 'McNemar', definition: 'Um teste para duas medidas binárias emparelhadas.' },
      ],
    },
    seeAlso: ['repeatedanova', 'ttest'],
  },
  {
    id: 'tost',
    area: 'procedures',
    title: 'Equivalência (TOST)',
    summary: 'Demonstrar que dois tratamentos são equivalentes dentro de uma margem fixada à partida.',
    tutorial: {
      goal: 'Demonstrar que um medicamento genérico é equivalente ao de referência dentro de ±0.5.',
      dataset: 'score-groups.csv',
      steps: [
        'Escolha o delineamento (dois grupos ou medidas emparelhadas).',
        'Defina a margem de equivalência (por exemplo 0.5) antes de olhar para os dados.',
        'Execute e leia os dois testes unilaterais e o intervalo de confiança.',
      ],
      expected: 'Dois valores p unilaterais e uma conclusão de equivalência apenas quando todo o intervalo fica dentro da margem.',
    },
    advanced: {
      assumptions: ['As mesmas do teste t correspondente; a margem tem de ser clinicamente justificada.'],
      whenToUse: ['Bioequivalência, não inferioridade e comparação de duas versões de um instrumento.'],
      whenNotToUse: ['Para «provar» a ausência de diferença sem uma margem predefinida.'],
      reading: ['A equivalência exige que todo o intervalo fique dentro de ±margem.'],
      pitfalls: ['Escolher a margem depois de ver os dados invalida o procedimento.'],
      glossary: [
        { term: 'TOST', definition: 'Dois testes unilaterais que, em conjunto, avaliam a equivalência.' },
        { term: 'Margem', definition: 'A maior diferença considerada clinicamente aceitável.' },
      ],
    },
    seeAlso: ['ttest', 'samplesize'],
  },
  {
    id: 'correlation',
    area: 'procedures',
    title: 'Correlação',
    summary: 'Pearson, Spearman e Kendall com intervalos de confiança e uma matriz.',
    tutorial: {
      goal: 'Medir a associação entre duas variáveis contínuas.',
      dataset: 'score-groups.csv',
      steps: [
        'Selecione duas ou mais variáveis.',
        'Escolha o método principal: Pearson para relações lineares, Spearman com valores atípicos ou postos.',
        'Execute e leia o coeficiente, o CI e o p; a matriz mostra todos os pares.',
      ],
      expected: 'Coeficiente com intervalo de confiança, valor p e uma matriz de correlação com uns na diagonal.',
    },
    advanced: {
      assumptions: ['Pearson: relação linear e ausência de valores atípicos dominantes. Spearman: apenas relação monótona.'],
      whenToUse: ['Explorar associações antes de um modelo, ou verificar colinearidade.'],
      whenNotToUse: ['Para inferência causal: a correlação não identifica a direção.'],
      reading: [
        'O sinal dá a direção, o valor absoluto a intensidade.',
        'Com muitas variáveis os valores p sem correção são demasiados: interprete com cautela.',
      ],
      pitfalls: ['Uma correlação forte pode desaparecer ou inverter-se dentro de subgrupos (paradoxo de Simpson).'],
      glossary: [
        { term: 'r de Pearson', definition: 'Uma medida de associação linear entre duas variáveis quantitativas.' },
        { term: 'ρ de Spearman', definition: 'Uma correlação de postos, robusta a valores atípicos.' },
      ],
    },
    seeAlso: ['regression', 'multivariate'],
  },
  {
    id: 'regression',
    area: 'procedures',
    title: 'Regressão linear',
    summary: 'Mínimos quadrados com diagnósticos, erros padrão robustos e Theil-Sen.',
    tutorial: {
      goal: 'Estimar quanto a pontuação muda à medida que a idade aumenta.',
      dataset: 'score-groups.csv',
      steps: [
        'Variável dependente = Score, independentes = Age.',
        'Mantenha OLS e, em Avançado, ative erros padrão robustos se suspeitar de heterocedasticidade.',
        'Execute e leia o coeficiente, o erro padrão, o CI e o R².',
        'Verifique os gráficos de diagnóstico dos resíduos.',
      ],
      expected: 'Tabela de coeficientes com CIs, estatísticas de qualidade do ajustamento e diagnósticos dos resíduos.',
    },
    advanced: {
      assumptions: [
        'Linearidade, erros independentes, homocedasticidade, resíduos normais (para os testes).',
        'Sem colinearidade extrema entre preditores.',
      ],
      whenToUse: ['Resultado contínuo e uma relação aproximadamente linear.'],
      whenNotToUse: ['Resultado binário (logística), contagens (Poisson/BN), tempos censurados (sobrevivência).'],
      reading: [
        'Um coeficiente é a variação esperada do resultado por mais uma unidade do preditor, mantendo o resto constante.',
        'O R² descreve a variabilidade explicada, não a qualidade causal do modelo.',
      ],
      pitfalls: [
        'Extrapolar para fora do intervalo observado dos preditores.',
        'Ler um coeficiente num modelo com interação como se fosse um efeito médio.',
      ],
      glossary: [
        { term: 'HC3', definition: 'Um estimador robusto do erro padrão válido sob heterocedasticidade.' },
        { term: 'Theil-Sen', definition: 'Uma reta robusta baseada na mediana dos declives aos pares.' },
      ],
    },
    seeAlso: ['correlation', 'logistic', 'ancova'],
  },
  {
    id: 'logistic',
    area: 'procedures',
    title: 'Regressão logística',
    summary: 'Resultado binário com odds ratios, análise do ponto de corte e uma opção Firth.',
    tutorial: {
      goal: 'Estimar o efeito da idade na probabilidade de um evento.',
      dataset: 'score-groups.csv',
      steps: [
        'Escolha Resultado (0/1) e os preditores.',
        'Execute e leia os odds ratios com intervalos de confiança.',
        'Veja a tabela de classificação e o ponto de corte sugerido.',
        'Ative Firth com poucos eventos ou separação.',
      ],
      expected: 'Coeficientes, odds ratios com CIs, medidas de discriminação e uma tabela de classificação.',
    },
    advanced: {
      assumptions: ['Observações independentes; logit linear nos preditores.'],
      whenToUse: ['Resultado dicotómico (sim/não, vivo/morto, sucesso/insucesso).'],
      whenNotToUse: ['Resultado ordenado com mais de duas categorias (use a logística ordinal).'],
      reading: [
        'Odds ratio 1 = sem associação; 2 = odds duplicados, não probabilidade duplicada.',
        'Com eventos raros o odds ratio aproxima-se do risco relativo.',
      ],
      pitfalls: [
        'Poucos eventos por parâmetro tornam as estimativas instáveis.',
        'O ponto de corte que maximiza a exatidão não é necessariamente o clinicamente útil.',
      ],
      glossary: [
        { term: 'Odds', definition: 'A razão entre a probabilidade de um evento ocorrer e a de não ocorrer.' },
        { term: 'Firth', definition: 'Uma correção penalizada que reduz o viés com eventos raros.' },
      ],
    },
    seeAlso: ['regression', 'ordinal', 'chisquare'],
  },
  {
    id: 'countreg',
    area: 'procedures',
    title: 'Regressão de contagens',
    summary: 'Modelos de Poisson e binomial negativa para resultados de contagem.',
    tutorial: {
      goal: 'Modelar o número de eventos em função de um preditor.',
      dataset: 'score-groups.csv',
      steps: [
        'Escolha o resultado de contagem e os preditores.',
        'Comece com Poisson; se a dispersão estimada estiver bem acima de 1, passe à binomial negativa.',
        'Execute e leia as razões de taxa com CIs.',
      ],
      expected: 'Coeficientes, razões de taxa, um teste de sobredispersão e a qualidade do ajustamento.',
    },
    advanced: {
      assumptions: ['Contagens não negativas; para Poisson, a média é igual à variância.'],
      whenToUse: ['Número de eventos, chamadas ou defeitos por unidade.'],
      whenNotToUse: ['Contagens com muitos zeros estruturais: considere modelos inflacionados de zeros.'],
      reading: ['Uma razão de taxa de 1.2 significa um aumento esperado de 20% no número de eventos.'],
      pitfalls: ['A regressão linear sobre contagens pequenas produz previsões negativas.'],
      glossary: [
        { term: 'Sobredispersão', definition: 'Variância maior do que a média, típica de dados de contagem reais.' },
        { term: 'NB2', definition: 'Binomial negativa com variância quadrática na média.' },
      ],
    },
    seeAlso: ['logistic', 'regression'],
  },
  {
    id: 'ordinal',
    area: 'procedures',
    title: 'Regressão logística ordinal',
    summary: 'Modelo logit cumulativo para resultados ordenados.',
    tutorial: {
      goal: 'Estudar como um preditor desloca a satisfação entre níveis ordenados.',
      dataset: 'score-groups.csv',
      steps: [
        'Escolha o resultado ordinal (pelo menos três categorias ordenadas).',
        'Selecione os preditores e verifique a ordem dos níveis na coluna.',
        'Execute e leia os odds ratios cumulativos com CIs.',
      ],
      expected: 'Coeficientes com odds ratios cumulativos e um teste do pressuposto de odds proporcionais.',
    },
    advanced: {
      assumptions: ['Odds proporcionais: o efeito do preditor é o mesmo em todos os pontos de corte.'],
      whenToUse: ['Escalas de Likert, gravidade em classes ordenadas.'],
      whenNotToUse: ['Categorias não ordenadas: use multinomial ou qui-quadrado.'],
      reading: ['O odds ratio cumulativo descreve a probabilidade de estar numa categoria superior ou acima.'],
      pitfalls: ['Se a proporcionalidade falhar, precisa de modelos diferentes, não de uma leitura simples dos ORs.'],
      glossary: [
        { term: 'Logit cumulativo', definition: 'Um modelo que compara cada categoria com todas as superiores.' },
        { term: 'Proporcionalidade', definition: 'O pressuposto de que os efeitos dos preditores não mudam entre pontos de corte.' },
      ],
    },
    seeAlso: ['logistic', 'contingency'],
  },
  {
    id: 'lmm',
    area: 'procedures',
    title: 'Modelo linear misto (LMM)',
    summary: 'Intercepto aleatório para medidas repetidas ou sujeitos agrupados.',
    tutorial: {
      goal: 'Analisar medidas repetidas tendo em conta a correlação intra-sujeito.',
      dataset: 'score-groups.csv',
      steps: [
        'Escolha o resultado, os preditores fixos e a coluna do sujeito ou do cluster.',
        'Execute e leia os coeficientes fixos com CIs.',
        'Compare a variância residual com a variância do intercepto aleatório.',
      ],
      expected: 'Efeitos fixos com erros padrão, estimativa da variância aleatória e critérios de ajustamento.',
    },
    advanced: {
      assumptions: ['Resíduos aproximadamente normais; estrutura de covariância correta.'],
      whenToUse: ['Dados longitudinais, clusters, medidas repetidas com dados omissos.'],
      whenNotToUse: ['Poucos clusters: as estimativas de variância são instáveis.'],
      reading: ['Os coeficientes fixos leem-se como numa regressão, mas os erros têm em conta o agrupamento.'],
      pitfalls: ['Tratar medidas repetidas como independentes subestima os erros padrão.'],
      glossary: [
        { term: 'Efeito fixo', definition: 'Um efeito médio válido para a população.' },
        { term: 'Efeito aleatório', definition: 'Variação entre unidades (sujeitos ou clusters).' },
      ],
    },
    seeAlso: ['gee', 'repeatedanova'],
  },
];
