import type { ReportSpec } from '../report';
import { copy, sourceOf } from '../reportCopy';
import { tableById } from '../reportKit';
import type { TableSpec } from '../types';

/** Plain-language reading of the planning table. */
export const sampleSizeReport = (tables: TableSpec[], level: number): ReportSpec => {
  const resultRows = tableById(tables, 'ss-result')?.rows ?? [];
  const nRow = resultRows.find(row => sourceOf(String(row.metric)) === copy('n per gruppo'));
  const totalRow = resultRows.find(row => sourceOf(String(row.metric)) === copy('N totale'));
  const powerRow = resultRows.find(row => sourceOf(String(row.metric)).startsWith(sourceOf(copy('Potenza raggiunta'))));
  const esRow = resultRows.find(row => sourceOf(String(row.metric)) === copy('Effect size'));
  const inputRows = tableById(tables, 'ss-input')?.rows ?? [];
  const design = String(inputRows[0]?.value ?? '');
  const alpha = String(inputRows.find(row => sourceOf(String(row.parameter)) === 'α')?.value ?? '');
  const power = String(inputRows.find(row => sourceOf(String(row.parameter)) === copy('Potenza target'))?.value ?? '');

  const n = String(nRow?.value ?? '—');
  const total = String(totalRow?.value ?? '—');
  const achieved = String(powerRow?.value ?? '—');

  return {
    id: 'samplesize',
    title: copy('Report di lettura'),
    headline: copy('Piano {s1}: servono {s2} osservazioni per gruppo (N = {s3}) per una potenza dell’{s4}.', { s1: design.toLowerCase(), s2: n, s3: total, s4: power }),
    badge: copy('Piano di campionamento'),
    tone: 'neutral',
    intro: [
      copy('Questo foglio non analizza dati: calcola quante osservazioni servono perché un test abbia una buona probabilità di trovare l’effetto che ti interessa.'),
      copy('La potenza è la probabilità di rifiutare l’ipotesi nulla quando è falsa. Hai chiesto {s1}; con {s2} osservazioni per gruppo il calcolo ne garantisce {s3}. L’α scelto è {s4}: la probabilità di un falso positivo.', { s1: power, s2: n, s3: achieved, s4: alpha }),
    ],
    sections: [
      {
        heading: copy('Come si legge il risultato'),
        bullets: [
          copy('n per gruppo = {s1}: è il numero minimo di osservazioni valide in ciascun gruppo, non il numero di righe da inserire (le mancanti vanno sostituite).', { s1: n }),
          copy('N totale = {s1}: include tutti i gruppi del disegno.', { s1: total }),
          copy('Effect size = {s1}: è la differenza espressa in unità di variabilità (o la dimensione dell’effetto del disegno). Più è piccolo, più osservazioni servono.', { s1: String(esRow?.value ?? '—') }),
          copy('La curva di potenza mostra quanto si guadagna aumentando n: se il punto richiesto è già sulla parte piatta, aumentare il campione serve a poco.'),
        ],
      },
      {
        heading: copy('Da dove viene il numero'),
        body: [
          copy('La numerosità si ottiene imponendo che, sotto l’ipotesi alternativa, la statistica superi il valore critico con probabilità pari alla potenza scelta. Per i test t il calcolo viene iterato perché il valore critico dipende dai gradi di libertà, che dipendono da n.'),
          copy('La formula assume un effetto noto e una variabilità nota: se l’effect size viene da uno studio pilota, la numerosità è esso stesso una stima e va trattata con margine.'),
        ],
      },
      {
        heading: copy('Cosa controllare prima di usarlo'),
        bullets: [
          copy('Il disegno deve essere quello giusto: due gruppi indipendenti, appaiati o una sola media non sono intercambiabili.'),
          copy('Se prevedi abbandoni, aumenta n dividendo per (1 − tasso di abbandono).'),
          copy('Con più confronti o più esiti la potenza per singolo test non basta: correggi α o pianifica l’esito primario.'),
          copy('Per differenze molto piccole la numerosità esplode: valuta se l’effetto è clinicamente rilevante prima di inseguirlo.'),
        ],
      },
    ],
    limitations: [
      copy('Le formule per i test t usano l’approssimazione normale per la potenza: il valore è accurato entro circa un’unità rispetto al calcolo esatto non centrale.'),
      copy('Per l’ANOVA la potenza usa la F non centrale esatta: il numero può differire di un’unità da software che arrotondano diversamente le iterazioni.'),
    ],
  };
};
