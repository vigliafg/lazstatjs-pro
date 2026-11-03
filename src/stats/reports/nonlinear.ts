import { copy, sourceOf } from '../reportCopy';
import { describeP, isDecided, show, tableById } from '../reportKit';
import type { ReportSpec } from './shared';
import type { TableRow, TableSpec } from '../types';

export interface NonlinearReportNames {
  dep: string;
  predictor: string;
}

/** Riga della tabella di sintesi cercata per etichetta tradotta. */
const metric = (rows: TableRow[], label: string): TableRow | undefined =>
  rows.find(row => sourceOf(String(row.metric ?? '')) === sourceOf(label));

const numberOf = (row: TableRow | undefined): number => {
  const value = Number(row?.value);
  return Number.isFinite(value) ? value : Number.NaN;
};

/**
 * Report discorsivo della regressione non lineare.
 *
 * Legge solo le `TableSpec` già costruite: niente kernel, niente ricalcolo.
 */
export const nonlinearReport = (
  tables: TableSpec[],
  names: NonlinearReportNames,
  level: number
): ReportSpec => {
  const fitRows = tableById(tables, 'nonlinear-fit')?.rows ?? [];
  const parameterRows = tableById(tables, 'nonlinear-parameters')?.rows ?? [];

  const modelName = String(metric(fitRows, copy('Modello'))?.value ?? '');
  const n = numberOf(metric(fitRows, copy('Osservazioni')));
  const df = numberOf(metric(fitRows, copy('df')));
  const r2 = numberOf(metric(fitRows, copy('R²')));
  const adjR2 = numberOf(metric(fitRows, copy('R² corretto')));
  const rmse = numberOf(metric(fitRows, copy('RMSE')));
  const iterations = numberOf(metric(fitRows, copy('Iterazioni')));
  const converged = String(metric(fitRows, copy('Convergenza'))?.value ?? '') === copy('Sì');

  const decided = parameterRows.filter(row => isDecided(Number(row.p), level));
  const good = Number.isFinite(r2) && r2 >= 0.9;
  const moderate = Number.isFinite(r2) && r2 >= 0.5;

  const describeParameter = (row: TableRow): string =>
    copy('{s1}: {s2} (CI {s3} – {s4}), {s5}.', {
      s1: String(row.parameter ?? ''),
      s2: show(Number(row.estimate), 4),
      s3: show(Number(row.ciLo), 4),
      s4: show(Number(row.ciHi), 4),
      s5: describeP(Number(row.p)),
    });

  return {
    id: 'report-nonlinear',
    title: copy('Report di lettura — Regressione non lineare'),
    headline: good
      ? copy('La curva {s1} aderisce bene ai dati: spiega il {s2}% della variabilità di {s3}.', {
          s1: modelName,
          s2: show(r2 * 100, 1),
          s3: names.dep,
        })
      : moderate
        ? copy('La curva {s1} spiega il {s2}% della variabilità di {s3}: l’adattamento è parziale.', {
            s1: modelName,
            s2: show(r2 * 100, 1),
            s3: names.dep,
          })
        : copy('La curva {s1} spiega solo il {s2}% della variabilità di {s3}: la forma scelta non descrive bene i dati.', {
            s1: modelName,
            s2: show(r2 * 100, 1),
            s3: names.dep,
          }),
    badge: copy('R² {s1}', { s1: show(r2, 3) }),
    tone: good ? 'positive' : moderate ? 'neutral' : 'caution',
    intro: [
      copy('La regressione non lineare stima i parametri di una curva scelta a priori, invece di una retta: la forma del modello è un’ipotesi, non un risultato dei dati.'),
      copy('Il confronto tra curve diverse non si fa con l’R²: modelli con un numero diverso di parametri vanno confrontati con criteri che penalizzano la complessità.'),
    ],
    sections: [
      {
        heading: copy('La curva e i suoi parametri'),
        body: [
          copy('Modello {s1} stimato su {s2} osservazioni, con {s3} gradi di libertà residui; la convergenza è stata raggiunta in {s4} iterazioni.', {
            s1: modelName,
            s2: show(n, 0),
            s3: show(df, 0),
            s4: show(iterations, 0),
          }),
          copy('R² = {s1}, R² corretto = {s2}, RMSE = {s3} (nella unità di {s4}).', {
            s1: show(r2, 4),
            s2: show(adjR2, 4),
            s3: show(rmse, 4),
            s4: names.dep,
          }),
        ],
      },
      {
        heading: copy('Parametri stimati'),
        bullets: parameterRows.map(describeParameter),
      },
      {
        heading: copy('Come leggere i numeri'),
        body: [
          converged
            ? copy('La convergenza dice che l’algoritmo ha trovato un punto stabile, non che il modello sia quello giusto: controlla sempre i residui e la forma della curva.')
            : copy('L’algoritmo non ha raggiunto la convergenza: le stime non sono affidabili e non vanno lette come risultato.'),
          copy('{s1} parametri su {s2} hanno un p sotto il {s3}%: un parametro non significativo può comunque essere necessario alla forma della curva.', {
            s1: decided.length,
            s2: parameterRows.length,
            s3: level,
          }),
          copy('La curva interpolata tra i punti osservati è una sintesi del modello: fuori dall’intervallo dei dati la sua forma non è verificata.'),
        ],
      },
    ],
    limitations: [
      copy('La scelta della curva deve venire dalla conoscenza del fenomeno, non dal solo confronto degli R².'),
      copy('Le stime ai minimi quadrati sono sensibili ai valori estremi e ai punti con leva alta.'),
      copy('Gli errori standard assumono residui indipendenti e a varianza costante: con dati nel tempo o misure ripetute vanno rivisti.'),
      copy('Con pochi punti rispetto ai parametri la stima è instabile: servono più osservazioni che parametri.'),
    ],
  };
};
