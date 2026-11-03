import type { HelpTopic } from './types';

/** Procedimentos da vaga 4: modelos log-lineares para tabelas de duas vias. */
export const w4Topics: HelpTopic[] = [
  {
    id: 'loglinear',
    area: 'procedures',
    title: 'Modelo log-linear para tabelas de duas vias',
    summary: 'Modelo de Poisson para as contagens de uma tabela de duas vias: independência ou interação saturada.',
    tutorial: {
      goal: 'Decidir se as categorias de linha e coluna de uma tabela de duas vias estão associadas e quantificar a associação.',
      steps: [
        'Escolher as etiquetas de linha e coluna e introduzir as contagens observadas célula a célula.',
        'Começar pelo modelo de independência: estima apenas os efeitos principais de linha e coluna.',
        'Executar e ler G², os respetivos graus de liberdade e o valor p.',
        'Se o modelo de independência não se ajustar, passar ao modelo saturado para ver quanto as células se afastam da independência.',
        'Ler os coeficientes na escala log e exp(β) como fatores multiplicativos.',
        'Numa tabela 2×2, ler a exponencial da interação como odds ratio com o respetivo intervalo de confiança.',
      ],
      expected:
        'Uma tabela de ajustamento com G², df, p, desvio nulo e AIC; uma tabela de coeficientes com β, SE, z, p, exp(β) e CI; contagens esperadas e resíduos estandardizados; um heatmap dos resíduos e barras observado/esperado.',
    },
    advanced: {
      assumptions: [
        'As contagens são observações independentes, uma por célula, e cada unidade cai numa única célula.',
        'A contagem esperada de cada célula é positiva; a variância de Poisson é igual à média.',
        'O logaritmo da contagem esperada é uma função linear dos efeitos de linha e coluna, e da sua interação no modelo saturado.',
        'Com contagens esperadas pequenas a aproximação χ² de G² é frágil.',
      ],
      whenToUse: [
        'Duas variáveis categóricas cruzadas, quando se pretende um teste de independência baseado num modelo.',
        'Quando são necessárias contagens esperadas, resíduos e uma leitura da associação ao nível dos coeficientes.',
        'Para comparar o modelo de independência com o saturado numa tabela 2×2 e obter o odds ratio.',
      ],
      whenNotToUse: [
        'Três ou mais fatores categóricos: são necessárias interações de ordem superior e esta página cobre apenas tabelas de duas vias.',
        'Tabelas muito esparsas com muitas células nulas: os métodos exatos ou penalizados são mais seguros.',
      ],
      reading: [
        'G² é a estatística de razão de verosimilhança: valores grandes face aos graus de liberdade indicam que as contagens esperadas do modelo estão longe das observadas.',
        'Numa tabela de duas vias o modelo de independência tem (R−1)(C−1) graus de liberdade residuais; o modelo saturado não tem nenhum e reproduz exatamente os dados.',
        'Os coeficientes estão na escala log: exp(β) é o fator pelo qual a contagem esperada muda quando a categoria muda, mantendo o outro fator fixo.',
        'Numa tabela 2×2 o coeficiente de interação é o log odds ratio; exp(β) = 1 significa independência.',
      ],
      pitfalls: [
        'Ler o p de um coeficiente como teste do modelo completo: começar por G² e pelos graus de liberdade residuais.',
        'Interpretar a associação como causalidade: a ordem linha/coluna é arbitrária e o modelo não diz qual variável influencia a outra.',
        'Ignorar contagens esperadas pequenas: o p de G² pode ser anticonservador.',
        'Usar o modelo saturado como prova: ajusta-se sempre e não tem teste.',
      ],
      charts: [
        'Heatmap dos resíduos estandardizados, com as células longe de zero realçadas.',
        'Barras observado/esperado por célula, para ver onde o modelo falha.',
      ],
      glossary: [
        { term: 'G²', definition: 'Estatística de razão de verosimilhança que compara as contagens observadas com as esperadas do modelo.' },
        { term: 'Modelo saturado', definition: 'Modelo com um parâmetro por célula; reproduz os dados e tem zero graus de liberdade residuais.' },
        { term: 'Odds ratio', definition: 'Rácio entre os odds de um grupo e os do outro; exp(interação) num modelo log-linear 2×2.' },
      ],
    },
    seeAlso: ['contingency', 'chisquare'],
  },
];
