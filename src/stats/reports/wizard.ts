import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import type { WizardGoal, WizardRecommendation } from '../wizard/types';
import { GOAL_LABELS } from '../wizard/labels';

export const wizardReport = (
  recommendation: WizardRecommendation,
  tables: TableSpec[],
  level: number,
  goal: WizardGoal
): ReportSpec => {
  const audit = tables.find(spec => spec.id === 'wiz-audit')?.rows ?? [];
  const missingColumns = audit.filter(row => Number(row.missing) > 0).length;

  return {
    id: 'wizard',
    title: 'Report di lettura — Statistical Wizard',
    headline: recommendation.headline,
    badge: recommendation.tabLabel,
    tone: recommendation.parametric ? 'positive' : 'caution',
    intro: [
      `La domanda scelta è «${GOAL_LABELS[goal]}»: il wizard legge la struttura del foglio e propone l’analisi adatta, con l’alternativa da usare se le assunzioni non reggono.`,
      `Raccomandazione: ${recommendation.title}. Il wizard non ricalcola i test: apre la scheda giusta, dove la stessa analisi è già implementata e testata.`,
    ],
    sections: [
      {
        heading: 'Perché questa analisi',
        bullets: recommendation.why,
      },
      {
        heading: 'Cosa selezionare',
        bullets: recommendation.selection,
      },
      {
        heading: 'Controlli e alternative',
        bullets: [
          ...(recommendation.checks.length > 0 ? recommendation.checks : ['Nessun controllo automatico disponibile: verifica le assunzioni nella scheda.']),
          `Alternativa: ${recommendation.alternative}`,
        ],
      },
      {
        heading: 'Stato del foglio',
        bullets: [
          `Colonne lette: ${audit.length}${missingColumns > 0 ? `, di cui ${missingColumns} con valori mancanti` : ', nessuna con valori mancanti'}.`,
          `Soglia di significatività usata nei controlli: α = ${(1 - level / 100).toFixed(2)} (livello ${level}%).`,
          'Le colonne con pochi livelli vengono trattate come categoriche, quelle quasi tutte numeriche come continue.',
        ],
      },
    ],
    limitations: [
      'Il wizard è un consulente: la raccomandazione dipende da come hai descritto la domanda e dalla classificazione automatica delle colonne.',
      'I test di normalità e di omoschedasticità sono di screening e non sostituiscono l’esame grafico delle distribuzioni.',
      'Il wizard non esegue il test né precompila i campi: apre la scheda dell’analisi, dove scegli le colonne e premi Run.',
      'Nessun controllo automatico su disegno dello studio, indipendenza delle osservazioni o dati mancanti non casuali.',
    ],
  };
};
