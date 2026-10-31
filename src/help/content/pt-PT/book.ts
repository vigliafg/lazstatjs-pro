import type { HelpBook, HelpChapter } from '../types';
import { orderTopics } from '../order';
import { areaTopics } from './areas';
import { coreTopics } from './procedures-core';
import { moreTopics } from './procedures-more';

import { chartGuides } from './charts';

const chapters: HelpChapter[] = [
  { id: 'start', title: 'Primeiros passos', blurb: 'Todo o ciclo em três gestos, da grelha ao relatório.' },
  { id: 'data', title: 'Os dados', blurb: 'Importar, editar, limpar e dar nomes legíveis aos grupos.' },
  { id: 'analysis', title: 'Análises', blurb: 'Escolher o procedimento, configurá-lo, voltar a executá-lo.' },
  { id: 'procedures', title: 'Procedimentos, um a um', blurb: 'Um tutorial com um exemplo e uma leitura avançada em linguagem simples.' },
  { id: 'output', title: 'Resultados e projeto', blurb: 'Ler a saída, exportá-la, guardar e reabrir o trabalho e personalizar o aspeto.' },
];

export const ptPTBook: HelpBook = {
  locale: 'pt-PT',
  title: 'Manual do LazStats',
  subtitle: 'Estatística aplicada com o programa, em dois níveis',
  preface:
    'Cada página tem dois níveis. O nível A é um tutorial com um exemplo resolvido; o nível B explica os pressupostos, quando usar o procedimento, como ler a saída e que erros evitar, em linguagem simples mesmo nos procedimentos avançados. As páginas podem ser lidas em sequência ou impressas como um livro.',
  ui: {
    contents: 'Índice',
    tutorial: 'Tutorial',
    advanced: 'Avançado',
    tutorialHint: 'Passo a passo com um exemplo resolvido',
    advancedHint: 'Pressupostos, leitura e erros a evitar, em linguagem simples',
    search: 'Pesquisar no manual',
    searchEmpty: 'Nenhuma página corresponde a esta pesquisa.',
    next: 'Seguinte',
    previous: 'Anterior',
    back: 'Voltar ao índice',
    print: 'Imprimir o manual',
    openApp: 'Abrir o programa',
    exampleData: 'Dados de exemplo',
    expected: 'O que deve ver',
    assumptions: 'Pressupostos',
    whenToUse: 'Quando usar',
    whenNotToUse: 'Quando evitar',
    reading: 'Como ler a saída',
    pitfalls: 'Erros a evitar',
    glossary: 'Termos-chave',

    charts: "Gráficos",
    seeAlso: 'Ver também',
    updated: 'Manual alinhado com as funcionalidades atuais do programa',
  },
  chapters,
  topics: orderTopics([...areaTopics, ...coreTopics, ...moreTopics]).map(topic => ({
    ...topic,
    advanced: {
      ...topic.advanced,
      ...(chartGuides[topic.id] ? { charts: chartGuides[topic.id] } : {}),
    },
  })),
};
