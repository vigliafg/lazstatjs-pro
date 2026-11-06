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
      'As componentes de variância têm erro padrão e IC de Wald na escala log, e os testes dos efeitos fixos dão o Wald por termo.'],
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
  {
    id: 'pls',
    area: 'procedures',
    title: 'Mínimos quadrados parciais (PLS)',
    summary:
      'Componentes latentes que maximizam a covariância com o desfecho, pensadas para muitos preditores correlacionados.',
    tutorial: {
      goal: 'Prever um desfecho contínuo a partir de muitos preditores fortemente correlacionados, onde a regressão OLS dá coeficientes instáveis ou ilegíveis.',
      steps: [
        'Variável dependente: o desfecho contínuo a prever.',
        'Preditores: as medidas correlacionadas, como bandas espectrais, canais de sensores ou itens de questionário.',
        'Componentes: comece com duas ou três e aumente enquanto o Q² em validação cruzada melhorar.',
        'Folds de validação cruzada: cinco é uma escolha comum; zero desliga o Q².',
        'Execute o modelo e leia os coeficientes, a variância explicada por componente, R² e Q² acumulados e as pontuações VIP.',
      ],
      expected:
        'Uma tabela de coeficientes na escala original, uma tabela de componentes com R², R² acumulado e Q², uma tabela VIP com o limiar em um e gráficos de observado versus previsto e do ajuste por componente.',
    },
    advanced: {
      whenToUse: [
        'Muitos preditores com colinearidade forte, como em espetroscopia, quimiometria, ómica ou dados de sensores.',
        'O objetivo é a previsão e os coeficientes individuais não são objeto de inferência.',
        'O número de preditores é próximo ou superior ao número de observações.',
        'Pretende poucas direções latentes interpretáveis em vez de um modelo de caixa negra.',
      ],
      whenNotToUse: [
        'Precisa de valores p ou de um efeito causal por preditor: use uma regressão com um desenho claro.',
        'Há poucos preditores e pouco correlacionados: a OLS é mais simples e legível.',
        'A relação é fortemente não linear: splines ou modelos de árvore podem ajustar melhor.',
        'Não é possível validar de forma cruzada porque a amostra é minúscula ou as observações estão agrupadas.',
      ],
      reading: [
        'Um coeficiente é a variação do desfecho por unidade desse preditor quando os restantes são mantidos nos valores observados através das componentes; não é um efeito parcial no sentido da regressão.',
        'R² é a proporção de variância do desfecho explicada na amostra; Q² é a mesma quantidade em validação cruzada e a medida honesta do valor preditivo.',
        'Um VIP acima de um assinala preditores que contribuem mais do que a média; é um critério de seleção, não um teste de significância.',
        'Escolha o menor número de componentes após o qual Q² deixa de melhorar; depois disso ajusta-se sobretudo ruído.',
      ],
      pitfalls: [
        'Escolher as componentes apenas por R², que cresce sempre e esconde o sobreajuste.',
        'Ler um coeficiente PLS como uma inclinação parcial OLS ou um efeito causal.',
        'Esquecer de centrar os preditores, fazendo a primeira componente captar sobretudo a média.',
        'Usar folds que deixam passar informação entre treino e teste em dados agrupados.',
        'Apresentar o VIP como valor p ou prova de importância.',
      ],
      charts: [
        'Observado versus previsto, com a diagonal como referência e os pontos coloridos pelo resíduo.',
        'R² e Q² por número de componentes, para escolher o menor modelo útil.',
        'Pontuações VIP por preditor, com a linha em um.',
      ],
    },
    seeAlso: ['regression', 'glm', 'mars'],
  },
  {
    id: 'mars',
    area: 'procedures',
    title: 'GAM / MARS (splines adaptativas)',
    summary:
      'Funções hinge lineares por troços escolhidas automaticamente, com interações opcionais e poda por GCV.',
    tutorial: {
      goal: 'Ajustar uma relação não linear flexível entre um desfecho contínuo e um ou mais preditores sem fixar antecipadamente a forma funcional.',
      steps: [
        'Variável dependente: o desfecho contínuo.',
        'Preditores: as variáveis contínuas cujo efeito pode curvar-se ou mudar de direção.',
        'Grau máximo: um para efeitos aditivos, dois para permitir o produto de duas funções hinge.',
        'Termos máximos: um orçamento para as funções de base; comece por volta de vinte e deixe a poda reduzir o modelo.',
        'Penalização e poda: mantenha a penalização predefinida em dois e ative a poda GCV salvo se precisar do modelo forward completo.',
        'Execute o modelo e leia os termos selecionados, os nós, GCV, R² e a importância dos preditores.',
      ],
      expected:
        'Uma tabela de termos hinge com nós e coeficientes, uma tabela de ajuste com RSS, GCV, R² e R² ajustado, uma tabela de importância e gráficos de observado versus previsto e do efeito parcial do preditor principal.',
    },
    advanced: {
      whenToUse: [
        'A forma do efeito é desconhecida ou muda de direção ao longo do intervalo do preditor.',
        'Pretende uma alternativa automática à escolha do grau de um polinómio.',
        'Precisa de explorar muitos preditores para efeitos não lineares e interações.',
        'A previsão importa mais do que um único coeficiente interpretável.',
      ],
      whenNotToUse: [
        'Precisa de um coeficiente por preditor com interpretação causal clara.',
        'Tem de extrapolar muito além do intervalo observado: as funções hinge são locais.',
        'A amostra é muito pequena ou todos os preditores são categóricos.',
        'Um modelo linear ou polinomial simples já ajusta e é mais fácil de comunicar.',
      ],
      reading: [
        'Cada termo hinge é uma mudança de inclinação num nó: um coeficiente positivo aumenta a inclinação depois do nó, um negativo reduz.',
        'A GCV equilibra a soma dos quadrados residuais com o número de termos; mais baixa é melhor e guia a poda.',
        'Os termos selecionados são as peças que sobrevivem à poda; um preditor sem termo não tem contributo não linear detetável.',
        'O gráfico do efeito parcial mantém os outros preditores nos valores observados e mostra a forma atribuída a um preditor.',
      ],
      pitfalls: [
        'Construir um modelo forward enorme e esquecer a poda, fazendo o ajuste seguir o ruído.',
        'Extrapolar além dos nós observados, onde a forma por troços é arbitrária.',
        'Ler um coeficiente hinge como inclinação global em vez de mudança local.',
        'Ignorar interações quando o gráfico de resíduos ainda mostra estrutura.',
        'Comparar GCV entre modelos ajustados com números diferentes de linhas completas.',
      ],
      charts: [
        'Observado versus previsto com a diagonal, para verificar a calibração.',
        'Perfil do efeito parcial do primeiro preditor, com os restantes nos valores observados.',
        'Importância dos preditores, medida pela perda de ajuste ao removê-los.',
      ],
    },
    seeAlso: ['regression', 'nonlinear', 'pls'],
  },
  {
    id: 'iv',
    area: 'procedures',
    title: 'Variáveis instrumentais (2SLS)',
    summary:
      'Um efeito consistente para um regressor endógeno, usando instrumentos que o afetam mas não atuam diretamente no desfecho.',
    tutorial: {
      goal: 'Estimar o efeito de um preditor correlacionado com o erro por variáveis omitidas, erro de medida ou simultaneidade.',
      steps: [
        'Desfecho: a variável dependente contínua.',
        'Preditores endógenos: os regressores cujo efeito pretende mas que não são exógenos.',
        'Instrumentos: variáveis que preveem os regressores endógenos e atuam no desfecho apenas através deles.',
        'Preditores exógenos: controlos já válidos como instrumentos de si próprios.',
        'Erros robustos: ative HC1 quando a variância dos resíduos não é constante.',
        'Execute o modelo e leia os coeficientes estruturais, a F parcial de primeira etapa, o teste de Sargan e o de Wu–Hausman.',
      ],
      expected:
        'Uma equação estrutural com coeficientes, erros padrão, valores t e intervalos, uma tabela de primeira etapa com os instrumentos excluídos e a F parcial, uma tabela de diagnóstico com Sargan e Wu–Hausman e gráficos de observado versus previsto e OLS versus 2SLS.',
    },
    advanced: {
      whenToUse: [
        'Variáveis omitidas não observadas mas correlacionadas com um regressor.',
        'Erro de medida num regressor central, quando existe uma segunda medida ou um instrumento.',
        'Simultaneidade, como oferta e procura ou preço e quantidade.',
        'Experiências naturais, desenhos de incentivo aleatorizado e instrumentos de política.',
      ],
      whenNotToUse: [
        'Os instrumentos são fracos: uma F de primeira etapa abaixo de dez torna o 2SLS enviesado e os erros padrão pouco fiáveis.',
        'A restrição de exclusão não é credível: a validade de um instrumento não se testa apenas com os dados.',
        'Precisa do efeito médio da população e os efeitos são heterogéneos.',
        'Não existe instrumento credível: uma estimativa IV com um mau instrumento é pior do que uma OLS honesta com uma ressalva.',
      ],
      reading: [
        'O coeficiente 2SLS é o efeito de uma variação unitária do regressor endógeno para a parte da variação impulsionada pelos instrumentos.',
        'A F parcial de primeira etapa testa se os instrumentos excluídos acrescentam poder explicativo; valores abaixo de dez indicam instrumentos fracos.',
        'Sargan testa as restrições de sobreidentificação quando há mais instrumentos do que regressores endógenos; um p alto é compatível com a validade, mas não é prova.',
        'Wu–Hausman compara OLS e 2SLS; um p baixo sugere que o regressor é endógeno e que o 2SLS é necessário.',
      ],
      pitfalls: [
        'Usar um instrumento fraco, que enviesa o 2SLS para a OLS e inflaciona os erros padrão.',
        'Incluir o desfecho ou uma variável pós-tratamento entre os instrumentos.',
        'Tratar um Sargan não significativo como prova de validade.',
        'Esquecer que a exclusão é um pressuposto, não um teste.',
        'Comparar OLS e 2SLS sem reportar a primeira etapa e o diagnóstico.',
      ],
      charts: [
        'Observado versus previsto da equação estrutural.',
        'Coeficientes OLS e 2SLS do regressor endógeno lado a lado, com intervalos.',
        'Resíduos versus previstos, para verificar estrutura remanescente.',
      ],
    },
    seeAlso: ['regression', 'panel', 'selection'],
  },
  {
    id: 'panel',
    area: 'procedures',
    title: 'Modelo em painel (efeitos fixos e aleatórios)',
    summary:
      'Efeitos fixos within e efeitos aleatórios GLS para observações repetidas das mesmas unidades.',
    tutorial: {
      goal: 'Estimar o efeito de preditores que variam no tempo controlando diferenças estáveis não observadas entre unidades.',
      steps: [
        'Desfecho: a variável dependente contínua medida repetidamente.',
        'Preditores: os regressores que variam no tempo.',
        'Entidade: a coluna que identifica a unidade (pessoa, empresa, país).',
        'Tempo: a coluna que ordena as observações repetidas dentro de cada entidade.',
        'Modelo: efeitos fixos, efeitos aleatórios ou ambos para os comparar com o teste de Hausman.',
        'Execute o modelo e leia os coeficientes within, as componentes de variância, o teste de Hausman e os efeitos por entidade.',
      ],
      expected:
        'Uma tabela de efeitos fixos com coeficientes within e erros agrupados, uma de efeitos aleatórios com coeficientes GLS, componentes de variância para entidade e erro, o teste de Hausman e gráficos de observado versus previsto e dos efeitos por entidade.',
    },
    advanced: {
      whenToUse: [
        'Dados longitudinais com observações repetidas das mesmas unidades.',
        'Pretende remover todo o confundimento estável entre entidades, observado ou não.',
        'Dados de painel agregados, como países ou empresas ao longo dos anos.',
        'Precisa de comparar a variação within e between.',
      ],
      whenNotToUse: [
        'O preditor de interesse é invariante no tempo: os efeitos fixos absorvem-no por completo.',
        'O teste de Hausman rejeita os efeitos aleatórios: a estimativa RE é inconsistente.',
        'Há muito poucas entidades, pelo que as componentes de variância e os erros agrupados não são fiáveis.',
        'O modelo é dinâmico e inclui a dependente desfasada: o estimador within é enviesado.',
      ],
      reading: [
        'Um coeficiente de efeitos fixos é a variação média dentro de uma entidade quando o seu preditor muda; identifica o efeito apenas pela variação within.',
        'Um coeficiente de efeitos aleatórios é uma combinação ponderada pela precisão das variações within e between, mais eficiente quando o pressuposto se verifica.',
        'Hausman compara os dois: um p baixo indica diferenças sistemáticas e favorece os efeitos fixos.',
        'A componente de entidade mede a persistência da variabilidade entre unidades; a idiossincrática é o ruído within restante.',
      ],
      pitfalls: [
        'Interpretar um coeficiente de efeitos fixos como comparação entre entidades.',
        'Incluir um preditor invariante no tempo num modelo de efeitos fixos.',
        'Usar efeitos aleatórios quando Hausman os rejeita.',
        'Ignorar a correlação serial e reportar erros não agrupados.',
        'Tratar um painel curto como se tivesse muitas entidades.',
      ],
      charts: [
        'Observado versus previsto para verificar a calibração do painel.',
        'Gráfico caterpillar dos efeitos por entidade, ordenados.',
        'Coeficientes de efeitos fixos e aleatórios com intervalos.',
      ],
    },
    seeAlso: ['regression', 'lmm', 'iv'],
  },
  {
    id: 'selection',
    area: 'procedures',
    title: 'Tobit e seleção de Heckman',
    summary:
      'Regressão censurada para desfechos limitados e correção em dois passos para seleção da amostra.',
    tutorial: {
      goal: 'Estimar o efeito dos preditores quando o desfecho só é observado acima ou abaixo de um limiar, ou apenas num subgrupo selecionado.',
      steps: [
        'Modelo: Tobit para um desfecho censurado, Heckman para uma amostra selecionada.',
        'Desfecho: a variável censurada para Tobit, ou o desfecho observado para Heckman.',
        'Preditores: os regressores da equação do desfecho.',
        'Limites de censura: o limiar inferior e, opcionalmente, o superior para Tobit.',
        'Indicador de seleção e preditores de seleção: a variável 0/1 de inclusão e as variáveis que explicam a inclusão; inclua pelo menos uma variável que não esteja na equação do desfecho.',
        'Execute o modelo e leia coeficientes, sigma, rho e o coeficiente do rácio de Mills inverso.',
      ],
      expected:
        'Para Tobit, coeficientes na escala latente com erros padrão, sigma, log-verosimilhança e AIC. Para Heckman, equação do desfecho, equação de seleção, sigma, rho, lambda, rácio de Mills inverso e teste de Wald da correção. Os gráficos mostram observado versus previsto e o padrão de censura ou seleção.',
    },
    advanced: {
      whenToUse: [
        'Salários observados apenas para quem trabalha, com a não participação como mecanismo de seleção.',
        'Despesas ou horas com um limite inferior significativo e censura real.',
        'Limites de deteção em medidas de laboratório.',
        'Seleção em fatores não observáveis que o emparelhamento por covariáveis não consegue tratar.',
      ],
      whenNotToUse: [
        'Os zeros são desfechos verdadeiros e não valores censurados: um modelo de duas partes ou hurdle é mais adequado.',
        'A seleção depende apenas de covariáveis observadas: o emparelhamento por propensão é mais transparente.',
        'Não há restrição de exclusão: Heckman é identificado apenas pela não linearidade do rácio de Mills e é frágil.',
        'Os erros são fortemente não normais ou heteroscedásticos: Tobit e Heckman são inconsistentes.',
      ],
      reading: [
        'Os coeficientes Tobit são efeitos no desfecho latente não censurado, não na média observada; o efeito na média observada diminui com a probabilidade de não estar censurado.',
        'Sigma é o desvio padrão do erro latente; um sigma grande indica censura substancial.',
        'Em Heckman, rho é a correlação entre os erros de seleção e do desfecho; um rho diferente de zero indica que a seleção importa.',
        'Lambda é o coeficiente do rácio de Mills inverso na equação do desfecho; é o termo de correção, não um efeito causal.',
        'A equação de seleção deve conter um instrumento que preveja a inclusão mas possa ser excluído do desfecho; sem ele, a identificação depende apenas da forma funcional.',
      ],
      pitfalls: [
        'Ler os coeficientes Tobit como efeitos no desfecho observado.',
        'Usar Heckman sem restrição de exclusão e tratar o resultado como robusto.',
        'Usar OLS na amostra selecionada ignorando o enviesamento de seleção.',
        'Confundir censura com truncatura: na censura as unidades ficam na amostra no limite, na truncatura desaparecem.',
        'Acreditar que Heckman em dois passos é máxima verosimilhança: é consistente mas menos eficiente e os erros precisam da correção.',
      ],
      charts: [
        'Observado versus previsto na escala observada.',
        'Tobit: média latente versus desfecho observado, com a linha de censura.',
        'Heckman: distribuição do rácio de Mills inverso e probabilidade de seleção por desfecho.',
      ],
    },
    seeAlso: ['regression', 'iv', 'propensity'],
  },
  {
    id: 'mediation',
    area: 'procedures',
    title: 'Análise de mediação',
    summary:
      'Efeitos indiretos, diretos e totais de um preditor através de um mediador, com intervalos de Sobel e bootstrap.',
    tutorial: {
      goal: 'Quantificar que parte do efeito de um preditor no desfecho passa por uma variável intermédia.',
      steps: [
        'Desfecho: a resposta final contínua.',
        'Preditor: a exposição ou variável independente.',
        'Mediador: a variável intermédia que se supõe estar no percurso.',
        'Covariáveis: confundidores opcionais das relações preditor–mediador, preditor–desfecho e mediador–desfecho.',
        'Réplicas bootstrap: 1000 é um início razoável; zero deixa apenas os intervalos de Sobel e delta.',
        'Execute o modelo e leia os percursos a, b e c′, os efeitos indireto e total, a proporção mediada e o intervalo bootstrap.',
      ],
      expected:
        'Uma tabela de percursos com a, b e c′, uma tabela de efeitos total, direto e indireto com erros e intervalos, a proporção mediada e um gráfico dos tamanhos de efeito e da distribuição bootstrap do efeito indireto.',
    },
    advanced: {
      whenToUse: [
        'Questões de mecanismo: não só se X afeta Y, mas por que percurso.',
        'Avaliação de processos e percursos clínicos ou psicológicos.',
        'Existe uma ordem temporal credível e os principais confundidores foram medidos.',
        'O efeito indireto é a quantidade de interesse.',
      ],
      whenNotToUse: [
        'Os dados são transversais e a ordem temporal é apenas assumida: fale de associação, não de mediação.',
        'Existe um confundidor mediador–desfecho não medido e afetado pela exposição.',
        'Preditor e mediador interagem: é necessário um modelo de mediação moderada.',
        'O efeito total está próximo de zero, o que torna a proporção mediada instável.',
      ],
      reading: [
        'O efeito indireto é a × b; o total é c′ + a × b; o direto é c′.',
        'A proporção mediada é o efeito indireto dividido pelo total; é instável quando o total é pequeno e pode sair de 0–1.',
        'O erro padrão de Sobel usa o método delta e é conservador; o intervalo bootstrap percentil é normalmente preferido.',
        'Um intervalo bootstrap que exclui zero é evidência de efeito indireto; não é uma probabilidade a posteriori bayesiana.',
      ],
      pitfalls: [
        'Chamar mediação a uma associação transversal sem ordem temporal credível.',
        'Ignorar o confundimento da relação mediador–desfecho.',
        'Reportar a proporção mediada quando o efeito total está próximo de zero.',
        'Usar o teste de Sobel como única inferência quando o efeito indireto é assimétrico.',
        'Esquecer de fixar a semente do bootstrap, fazendo o intervalo mudar em cada execução.',
      ],
      charts: [
        'Tamanhos dos efeitos direto, indireto e total com intervalos.',
        'Distribuição bootstrap do efeito indireto, com o intervalo percentil e o zero marcado.',
        'Coeficientes dos percursos a, b e c′ para ler o mecanismo.',
      ],
    },
    seeAlso: ['regression', 'propensity'],
  },
  {
    id: 'propensity',
    area: 'procedures',
    title: 'Propensão',
    summary:
      'Emparelhamento e ponderação pela probabilidade inversa para efeitos do tratamento em dados observacionais.',
    tutorial: {
      goal: 'Comparar um grupo tratado e um não tratado quando o tratamento não foi aleatório mas os confundidores relevantes foram medidos.',
      steps: [
        'Tratamento: o indicador 0/1 de receber o tratamento.',
        'Desfecho: a resposta contínua.',
        'Covariáveis: as variáveis anteriores ao tratamento que preveem tanto o tratamento como o desfecho.',
        'Método: emparelhamento do vizinho mais próximo ou ponderação pela probabilidade inversa.',
        'Caliper e rácio: para o emparelhamento, a distância máxima em desvios padrão da pontuação logit e o número de controlos por unidade tratada.',
        'Execute o modelo e leia o modelo de propensão, a tabela de equilíbrio antes e depois, o ATT e o número de observações emparelhadas ou efetivas.',
      ],
      expected:
        'Uma tabela do modelo de propensão, uma tabela de equilíbrio com diferenças de médias padronizadas antes e depois, o ATT com erro padrão e intervalo, o número de unidades emparelhadas ou o tamanho efetivo e gráficos de sobreposição e melhoria do equilíbrio.',
    },
    advanced: {
      whenToUse: [
        'Estudos observacionais em que a atribuição depende de confundidores medidos.',
        'Avaliação de programas e investigação de eficácia comparativa.',
        'Pretende tornar comparáveis os grupos tratado e não tratado antes de estimar o efeito.',
        'O estimando de interesse é o efeito sobre os tratados (ATT).',
      ],
      whenNotToUse: [
        'O confundimento não medido é plausível: o emparelhamento não o elimina.',
        'Os grupos sobrepõem-se pouco, pelo que muitas unidades tratadas não têm controlos comparáveis.',
        'Existe um instrumento credível: as variáveis instrumentais visam outro efeito, muitas vezes mais credível.',
        'O tratamento varia no tempo ou as covariáveis são medidas depois do tratamento.',
      ],
      reading: [
        'O ATT é o efeito médio para as unidades tratadas, não para toda a população; o ATE exige ponderar toda a amostra.',
        'Uma diferença de médias padronizada inferior a 0,1 após ajustamento é a regra prática para um bom equilíbrio.',
        'O caliper descarta unidades tratadas sem um controlo próximo; um caliper menor melhora o equilíbrio mas muda o estimando e reduz a amostra.',
        'A ponderação pela probabilidade inversa dá peso 1/e aos tratados e 1/(1−e) aos controlos; pesos muito grandes indicam pouca sobreposição.',
      ],
      pitfalls: [
        'Julgar o equilíbrio com testes de significância em vez de diferenças padronizadas.',
        'Ignorar o suporte comum e extrapolar para unidades tratadas sem controlos comparáveis.',
        'Incluir variáveis pós-tratamento ou o desfecho no modelo de propensão.',
        'Reportar o ATT como se fosse o efeito médio para todos.',
        'Usar emparelhamento sem verificar o equilíbrio da amostra emparelhada.',
      ],
      charts: [
        'Sobreposição das pontuações de propensão entre tratados e controlos.',
        'Love plot das diferenças de médias padronizadas antes e depois do ajustamento.',
        'ATT com intervalo de confiança e número de observações emparelhadas ou efetivas.',
      ],
    },
    seeAlso: ['logistic', 'iv', 'regression'],
  },
];
