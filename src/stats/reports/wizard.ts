import type { ReportSpec } from '../report';
import { copy } from '../reportCopy';
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
    title: copy('Report di lettura — Statistical Wizard'),
    headline: recommendation.headline,
    badge: recommendation.tabLabel,
    tone: recommendation.parametric ? 'positive' : 'caution',
    intro: [
      copy('La domanda scelta è «{s1}»: il wizard legge la struttura del foglio e propone l’analisi adatta, con l’alternativa da usare se le assunzioni non reggono.', { s1: GOAL_LABELS[goal] }),
      copy('Raccomandazione: {s1}. Il wizard non ricalcola i test: apre la scheda giusta, dove la stessa analisi è già implementata e testata.', { s1: recommendation.title }),
    ],
    sections: [
      {
        heading: copy('Perché questa analisi'),
        bullets: recommendation.why,
      },
      {
        heading: copy('Cosa selezionare'),
        bullets: recommendation.selection,
      },
      {
        heading: copy('Controlli e alternative'),
        bullets: [
          ...(recommendation.checks.length > 0 ? recommendation.checks : [copy('Nessun controllo automatico disponibile: verifica le assunzioni nella scheda.')]),
          copy('Alternativa: {s1}', { s1: recommendation.alternative }),
        ],
      },
      {
        heading: copy('Stato del foglio'),
        bullets: [
          copy('Colonne lette: {s1}{s2}.', { s1: audit.length, s2: missingColumns > 0 ? copy(', di cui {s1} con valori mancanti', { s1: missingColumns }) : copy(', nessuna con valori mancanti') }),
          copy('Soglia di significatività usata nei controlli: α = {s1} (livello {s2}%).', { s1: (1 - level / 100).toFixed(2), s2: level }),
          copy('Le colonne con pochi livelli vengono trattate come categoriche, quelle quasi tutte numeriche come continue.'),
        ],
      },
    ],
    limitations: [
      copy('Il wizard è un consulente: la raccomandazione dipende da come hai descritto la domanda e dalla classificazione automatica delle colonne.'),
      copy('I test di normalità e di omoschedasticità sono di screening e non sostituiscono l’esame grafico delle distribuzioni.'),
      copy('Il wizard non esegue il test né precompila i campi: apre la scheda dell’analisi, dove scegli le colonne e premi Run.'),
      copy('Nessun controllo automatico su disegno dello studio, indipendenza delle osservazioni o dati mancanti non casuali.'),
    ],
  };
};
