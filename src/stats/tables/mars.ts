import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { TableSpec } from '../types';
import type { MarsResult } from '../kernels/mars';

export interface MarsNames {
  dep: string;
  predictors: string[];
  degree: number;
  penalty: number;
}

/**
 * Tabelle del modello MARS: basi con coefficiente, sintesi dell'adattamento e
 * importanza dei predittori. Il report legge esclusivamente queste righe.
 */
export const marsTables = (result: MarsResult, names: MarsNames): TableSpec[] => [
  {
    id: 'mars-terms',
    title: copy('Termini della base MARS'),
    subtitle: copy('{s1} · grado {s2} · {s3} termini', {
      s1: names.dep,
      s2: names.degree,
      s3: result.selectedTerms,
    }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'expression', label: copy('Espressione'), format: 'text' },
      { key: 'knot', label: copy('Nodo'), format: 'dec3' },
      { key: 'coefficient', label: copy('Coefficiente'), format: 'dec4' },
    ],
    rows: result.terms.map(term => ({
      term: term.name,
      expression: term.expression,
      knot: term.knot === null ? '—' : term.knot,
      coefficient: term.coefficient,
    })),
    notes: [
      copy('Ogni termine è una funzione cerniera h(x − t) = max(0, x − t) o h(t − x) = max(0, t − x); le interazioni di grado 2 sono prodotti di due cerniere.'),
      copy('Il nodo t è un valore osservato del predittore, scelto dal passaggio in avanti; non è un parametro stimato con un errore standard.'),
    ],
  },
  {
    id: 'mars-fit',
    title: copy('Bontà del modello'),
    subtitle: copy('{s1} · grado {s2}', { s1: names.dep, s2: names.degree }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Osservazioni'), value: String(result.n) },
      { metric: copy('Termini selezionati'), value: String(result.selectedTerms) },
      { metric: copy('Coefficienti'), value: String(result.p) },
      { metric: copy('Nodi'), value: String(result.knots.length) },
      { metric: copy('RSS'), value: fmtEst(result.rss, 4) },
      { metric: copy('GCV'), value: fmtEst(result.gcv, 4) },
      { metric: copy('R²'), value: fmtEst(result.r2, 4) },
      { metric: copy('R² corretto'), value: fmtEst(result.adjR2, 4) },
      { metric: copy('Grado'), value: String(result.degree) },
      { metric: copy('Penale GCV'), value: fmtEst(result.penalty, 2) },
      { metric: copy('Potatura'), value: result.pruned ? copy('Sì') : copy('No') },
      { metric: copy('Convergenza'), value: result.converged ? copy('Sì') : copy('No') },
    ],
    notes: [
      copy('Il GCV è calcolato come (RSS / n) / (1 − costo)², con costo = (p + penalità × nodi) / n: penalizza i nodi, non solo i termini.'),
      copy('Un GCV più basso è preferibile nel confronto tra modelli MARS con lo stesso numero di osservazioni.'),
    ],
  },
  {
    id: 'mars-importance',
    title: copy('Importanza dei predittori'),
    subtitle: copy('Aumento di RSS quando il predittore è rimosso dal modello selezionato'),
    columns: [
      { key: 'predictor', label: copy('Predittore'), format: 'text' },
      { key: 'reduction', label: copy('Riduzione RSS'), format: 'dec4' },
      { key: 'share', label: copy('Quota'), format: 'pct' },
    ],
    rows: result.importance.map(entry => ({
      predictor: entry.name,
      reduction: entry.reduction,
      share: entry.share,
    })),
    notes: [
      copy('La riduzione è la differenza tra la RSS del modello senza tutte le cerniere del predittore e la RSS del modello completo.'),
      copy('La quota normalizza le riduzioni positive: è una lettura descrittiva, non un test di significatività.'),
    ],
  },
];
