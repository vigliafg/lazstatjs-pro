import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import { describeP, isDecided } from './shared';

export interface PolynomialNames {
  dep: string;
  predictor: string;
}

export const polynomialReport = (
  tables: TableSpec[],
  names: PolynomialNames,
  level: number
): ReportSpec => {
  const coefficients = tables.find(table => table.id === 'polynomial-coefficients')?.rows ?? [];
  const fitRows = tables.find(table => table.id === 'polynomial-fit')?.rows ?? [];
  const metric = (label: string): string =>
    String(fitRows.find(row => String(row.metric) === label)?.value ?? '—');
  const r2 = Number(metric('R²'));
  const pF = Number(metric('p (F)'));
  const highest = coefficients[coefficients.length - 1];

  return {
    id: 'report-polynomial',
    title: copy('Report di lettura — Regressione polinomiale'),
    headline: copy('{s1} spiegato da un polinomio di grado {s2} in {s3} (R² = {s4}).', {
      s1: names.dep,
      s2: coefficients.length - 1,
      s3: names.predictor,
      s4: Number.isFinite(r2) ? r2.toFixed(3) : '—',
    }),
    badge: copy('Regressione'),
    tone: isDecided(pF, level) ? 'positive' : 'neutral',
    intro: [
      copy('La regressione polinomiale estende la retta a una curva: aggiunge potenze di {s1} per catturare andamenti non lineari.', {
        s1: names.predictor,
      }),
      copy('Il grado misura la flessibilità della curva; un grado alto riduce i residui ma aumenta il rischio di overfitting.'),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        bullets: [
          copy('R² = {s1}, R² adattato = {s2}, F = {s3}, p = {s4}.', {
            s1: metric('R²'),
            s2: metric('R² adattato'),
            s3: metric('F'),
            s4: describeP(pF),
          }),
          copy('Il termine di grado più alto è {s1}: B = {s2}, p = {s3}.', {
            s1: String(highest?.term ?? '—'),
            s2: Number(highest?.b ?? NaN).toFixed(4),
            s3: describeP(Number(highest?.p ?? NaN)),
          }),
          copy('RMSE = {s1}; AIC = {s2}; BIC = {s3}.', {
            s1: metric('RMSE'),
            s2: metric('AIC'),
            s3: metric('BIC'),
          }),
        ],
      },
      {
        heading: copy('Come scegliere il grado'),
        bullets: [
          copy('Confronta R² adattato, AIC e BIC tra gradi diversi: il grado più alto non è automaticamente migliore.'),
          copy('Guarda il grafico: una curva che insegue ogni punto è un segnale di overfitting.'),
          copy('Non estrapolare fuori dall’intervallo osservato di {s1}: i polinomi divergono rapidamente.', {
            s1: names.predictor,
          }),
        ],
      },
    ],
    limitations: [
      copy('La collinearità tra potenze rende i singoli coefficienti instabili anche quando la curva è ben stimata: interpreta la forma, non solo i segni.'),
    ],
  };
};
