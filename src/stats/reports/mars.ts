import { copy, sourceOf } from '../reportCopy';
import { show, tableById } from '../reportKit';
import type { ReportSpec } from './shared';
import type { TableRow, TableSpec } from '../types';

export interface MarsReportNames {
  dep: string;
  predictors: string[];
}

const metric = (rows: TableRow[], label: string): TableRow | undefined =>
  rows.find(row => sourceOf(String(row.metric ?? '')) === sourceOf(label));

const numberOf = (row: TableRow | undefined): number => {
  const value = Number(row?.value);
  return Number.isFinite(value) ? value : Number.NaN;
};

/**
 * Report discorsivo del modello MARS.
 *
 * Legge solo le `TableSpec` già costruite: niente kernel, niente ricalcolo.
 */
export const marsReport = (
  tables: TableSpec[],
  names: MarsReportNames,
  level: number
): ReportSpec => {
  const terms = tableById(tables, 'mars-terms')?.rows ?? [];
  const fit = tableById(tables, 'mars-fit')?.rows ?? [];
  const importance = tableById(tables, 'mars-importance')?.rows ?? [];

  const n = numberOf(metric(fit, copy('Osservazioni')));
  const selected = numberOf(metric(fit, copy('Termini selezionati')));
  const coefficients = numberOf(metric(fit, copy('Coefficienti')));
  const knots = numberOf(metric(fit, copy('Nodi')));
  const rss = numberOf(metric(fit, copy('RSS')));
  const gcv = numberOf(metric(fit, copy('GCV')));
  const r2 = numberOf(metric(fit, copy('R²')));
  const adjR2 = numberOf(metric(fit, copy('R² corretto')));
  const degree = numberOf(metric(fit, copy('Grado')));
  const pruned = String(metric(fit, copy('Potatura'))?.value ?? '') === copy('Sì');
  const converged = String(metric(fit, copy('Convergenza'))?.value ?? '') === copy('Sì');

  const top = [...importance].sort(
    (left, right) => Number(right.reduction ?? 0) - Number(left.reduction ?? 0)
  )[0];
  const topName = String(top?.predictor ?? '—');
  const topShare = Number(top?.share ?? 0);
  const good = Number.isFinite(r2) && r2 >= 0.9;
  const moderate = Number.isFinite(r2) && r2 >= 0.5;

  return {
    id: 'report-mars',
    title: copy('Report di lettura — GAM / MARS'),
    headline: converged
      ? good
        ? copy('Il modello MARS spiega il {s1}% della variabilità di {s2} con {s3} termini e {s4} nodi.', {
            s1: show(r2 * 100, 1),
            s2: names.dep,
            s3: show(selected, 0),
            s4: show(knots, 0),
          })
        : moderate
          ? copy('Il modello MARS spiega il {s1}% della variabilità di {s2}: l’adattamento è parziale.', {
              s1: show(r2 * 100, 1),
              s2: names.dep,
            })
          : copy('Il modello MARS spiega solo il {s1}% della variabilità di {s2}: le cerniere selezionate descrivono poco i dati.', {
              s1: show(r2 * 100, 1),
              s2: names.dep,
            })
      : copy('Il modello non ha raggiunto una soluzione stabile: le stime non sono affidabili.'),
    badge: copy('R² {s1}', { s1: show(r2, 3) }),
    tone: converged ? (good ? 'positive' : moderate ? 'neutral' : 'caution') : 'caution',
    intro: [
      copy('MARS costruisce una regressione flessibile sommando funzioni cerniera scelte dai dati; è un caso additive di GAM con knot selezionati automaticamente.'),
      copy('I nodi non sono stimati come parametri: sono valori osservati scelti dal passaggio in avanti, quindi non hanno un errore standard né un p-value.'),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        bullets: [
          copy('R² = {s1}; R² corretto = {s2}; RSS = {s3}; GCV = {s4}.', {
            s1: show(r2, 3),
            s2: show(adjR2, 3),
            s3: show(rss, 3),
            s4: show(gcv, 3),
          }),
          copy('{s1} osservazioni, {s2} termini selezionati ({s3} coefficienti) e {s4} nodi distinti.', {
            s1: show(n, 0),
            s2: show(selected, 0),
            s3: show(coefficients, 0),
            s4: show(knots, 0),
          }),
          copy('Il modello è stato potato con il criterio GCV: {s1}.', {
            s1: pruned ? copy('sì') : copy('no'),
          }),
          copy('Il predittore con la riduzione di RSS più alta è {s1} ({s2}% della riduzione attribuibile).', {
            s1: topName,
            s2: show(topShare * 100, 1),
          }),
          ...terms
            .filter(row => String(row.term ?? '') !== '(Intercept)')
            .map(row =>
              copy('{s1}: coefficiente {s2}.', {
                s1: String(row.term ?? ''),
                s2: show(Number(row.coefficient), 4),
              })
            ),
        ],
      },
      {
        heading: copy('Come leggerlo'),
        bullets: [
          copy('Una cerniera h(x − t) è zero sotto il nodo e cresce linearmente sopra; h(t − x) fa il contrario. Insieme descrivono un ginocchio in t.'),
          copy('Con grado 1 il modello è additivo; con grado 2 i prodotti tra cerniere permettono interazioni, purché ogni termine non ripeta lo stesso predittore.'),
          copy('Il GCV penalizza il numero di nodi: serve a confrontare modelli MARS sullo stesso insieme di osservazioni, non a produrre un p-value.'),
          copy('La quota di importanza è descrittiva: somma le riduzioni positive e non sostituisce un test sui singoli coefficienti.'),
        ],
      },
    ],
    limitations: [
      copy('Il motore non riporta errori standard, intervalli o p-value per i coefficienti delle cerniere: la selezione dei nodi rende l’inferenza classica non valida senza correzioni.'),
      copy('Il grado massimo è 2 e ogni termine usa un predittore al massimo una volta; interazioni di ordine superiore non sono incluse.'),
      copy('La griglia dei nodi segue la regola di earth (ogni minspan-esima osservazione dopo un margine endspan): nodi molto vicini agli estremi possono non essere candidati.'),
      copy('La potatura è un passo all’indietro goloso basato sul GCV; non esplora tutti i sottoinsiemi possibili.'),
    ],
  };
};
