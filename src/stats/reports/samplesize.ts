import type { ReportSpec } from '../report';
import { tableById } from '../reportKit';
import type { TableSpec } from '../types';

/** Plain-language reading of the planning table. */
export const sampleSizeReport = (tables: TableSpec[], level: number): ReportSpec => {
  const resultRows = tableById(tables, 'ss-result')?.rows ?? [];
  const nRow = resultRows.find(row => String(row.metric) === 'n per gruppo');
  const totalRow = resultRows.find(row => String(row.metric) === 'N totale');
  const powerRow = resultRows.find(row => String(row.metric).startsWith('Potenza raggiunta'));
  const esRow = resultRows.find(row => String(row.metric) === 'Effect size');
  const inputRows = tableById(tables, 'ss-input')?.rows ?? [];
  const design = String(inputRows[0]?.value ?? '');
  const alpha = String(inputRows.find(row => String(row.parameter) === 'α')?.value ?? '');
  const power = String(inputRows.find(row => String(row.parameter) === 'Potenza target')?.value ?? '');

  const n = String(nRow?.value ?? '—');
  const total = String(totalRow?.value ?? '—');
  const achieved = String(powerRow?.value ?? '—');

  return {
    id: 'samplesize',
    title: 'Report di lettura',
    headline: `Piano ${design.toLowerCase()}: servono ${n} osservazioni per gruppo (N = ${total}) per una potenza dell’${power}.`,
    badge: 'Piano di campionamento',
    tone: 'neutral',
    intro: [
      'Questo foglio non analizza dati: calcola quante osservazioni servono perché un test abbia una buona probabilità di trovare l’effetto che ti interessa.',
      `La potenza è la probabilità di rifiutare l’ipotesi nulla quando è falsa. Hai chiesto ${power}; con ${n} osservazioni per gruppo il calcolo ne garantisce ${achieved}. L’α scelto è ${alpha}: la probabilità di un falso positivo.`,
    ],
    sections: [
      {
        heading: 'Come si legge il risultato',
        bullets: [
          `n per gruppo = ${n}: è il numero minimo di osservazioni valide in ciascun gruppo, non il numero di righe da inserire (le mancanti vanno sostituite).`,
          `N totale = ${total}: include tutti i gruppi del disegno.`,
          `Effect size = ${String(esRow?.value ?? '—')}: è la differenza espressa in unità di variabilità (o la dimensione dell’effetto del disegno). Più è piccolo, più osservazioni servono.`,
          'La curva di potenza mostra quanto si guadagna aumentando n: se il punto richiesto è già sulla parte piatta, aumentare il campione serve a poco.',
        ],
      },
      {
        heading: 'Da dove viene il numero',
        body: [
          'La numerosità si ottiene imponendo che, sotto l’ipotesi alternativa, la statistica superi il valore critico con probabilità pari alla potenza scelta. Per i test t il calcolo viene iterato perché il valore critico dipende dai gradi di libertà, che dipendono da n.',
          'La formula assume un effetto noto e una variabilità nota: se l’effect size viene da uno studio pilota, la numerosità è esso stesso una stima e va trattata con margine.',
        ],
      },
      {
        heading: 'Cosa controllare prima di usarlo',
        bullets: [
          'Il disegno deve essere quello giusto: due gruppi indipendenti, appaiati o una sola media non sono intercambiabili.',
          'Se prevedi abbandoni, aumenta n dividendo per (1 − tasso di abbandono).',
          'Con più confronti o più esiti la potenza per singolo test non basta: correggi α o pianifica l’esito primario.',
          'Per differenze molto piccole la numerosità esplode: valuta se l’effetto è clinicamente rilevante prima di inseguirlo.',
        ],
      },
    ],
    limitations: [
      'Le formule per i test t usano l’approssimazione normale per la potenza: il valore è accurato entro circa un’unità rispetto al calcolo esatto non centrale.',
      'Per l’ANOVA la potenza usa la F non centrale esatta: il numero può differire di un’unità da software che arrotondano diversamente le iterazioni.',
    ],
  };
};
