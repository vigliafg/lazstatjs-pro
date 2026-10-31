import type { HelpBook, HelpChapter } from '../types';
import { orderTopics } from '../order';
import { areaTopics } from './areas';
import { coreTopics } from './procedures-core';
import { moreTopics } from './procedures-more';

import { chartGuides } from './charts';

const chapters: HelpChapter[] = [
  { id: 'start', title: 'Primi passi', blurb: 'Il percorso completo in tre mosse, dalla griglia al report.' },
  { id: 'data', title: 'I dati', blurb: 'Importare, correggere, pulire e dare nomi ai gruppi.' },
  { id: 'analysis', title: 'Le analisi', blurb: 'Scegliere la procedura, impostarla, rieseguirla.' },
  { id: 'procedures', title: 'Le procedure, una per una', blurb: 'Tutorial con esempio e lettura avanzata in parole semplici.' },
  { id: 'output', title: 'Risultati e progetto', blurb: 'Leggere l’output, esportarlo, salvare e riaprire il lavoro e personalizzare l’aspetto.' },
];

export const itBook: HelpBook = {
  locale: 'it',
  title: 'Manuale LazStats',
  subtitle: 'Statistica applicata con il programma, in due livelli',
  preface:
    'Ogni scheda ha due livelli. Il livello A è un tutorial con un esempio da eseguire passo passo; il livello B spiega assunzioni, quando usare la procedura, come leggerne l’output e quali errori evitare, con parole semplici anche per le procedure avanzate. Le schede sono pensate per essere lette in sequenza o stampate come libro.',
  ui: {
    contents: 'Indice',
    tutorial: 'Tutorial',
    advanced: 'Avanzato',
    tutorialHint: 'Passo passo con un esempio',
    advancedHint: 'Assunzioni, lettura e trappole, in parole semplici',
    search: 'Cerca nel manuale',
    searchEmpty: 'Nessuna scheda corrisponde alla ricerca.',
    next: 'Successiva',
    previous: 'Precedente',
    back: 'Torna all’indice',
    print: 'Stampa il libro',
    openApp: 'Apri il programma',
    exampleData: 'Dati di esempio',
    expected: 'Cosa devi vedere',
    assumptions: 'Assunzioni',
    whenToUse: 'Quando usarla',
    whenNotToUse: 'Quando evitarla',
    reading: 'Come leggere l’output',
    pitfalls: 'Errori da evitare',
    glossary: 'Parole chiave',

    charts: "Grafici",
    seeAlso: 'Vedi anche',
    updated: 'Manuale allineato alle funzioni attuali del programma',
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
