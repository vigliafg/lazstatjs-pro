import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { PolynomialFit } from '../kernels/polynomial';

export interface PolynomialNames {
  dep: string;
  predictor: string;
}

export const polynomialTables = (
  fit: PolynomialFit,
  names: PolynomialNames,
  level: number
): TableSpec[] => [
  {
    id: 'polynomial-coefficients',
    title: copy('Coefficienti del polinomio'),
    subtitle: copy('{s1} su {s2} · grado {s3}', {
      s1: names.dep,
      s2: names.predictor,
      s3: fit.degree,
    }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'b', label: copy('B'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 't', label: copy('t'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
      { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
    ],
    rows: fit.coefficients.map(coefficient => ({
      term: coefficient.degree === 0 ? '(Intercept)' : `${names.predictor}^${coefficient.degree}`,
      b: coefficient.b,
      se: coefficient.se,
      t: coefficient.t,
      p: coefficient.p,
      ciLo: coefficient.ciLo,
      ciHi: coefficient.ciHi,
    })),
    notes: [
      copy('Il modello usa la base polinomiale grezza: i coefficienti sono quelli di x, x², … senza ortogonalizzazione.'),
      copy('CI al {s1}%.', { s1: level }),
    ],
  },
  {
    id: 'polynomial-fit',
    title: copy('Bontà del modello'),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Osservazioni'), value: String(fit.n) },
      { metric: copy('Gradi di libertà'), value: String(fit.df) },
      { metric: 'R²', value: fit.r2.toFixed(6) },
      { metric: 'R² adattato', value: fit.adjR2.toFixed(6) },
      { metric: 'F', value: fit.f.toFixed(4) },
      { metric: 'p (F)', value: fit.pF.toPrecision(4) },
      { metric: 'SSE', value: fit.sse.toFixed(4) },
      { metric: 'RMSE', value: fit.rmse.toFixed(4) },
      { metric: 'AIC', value: fit.aic.toFixed(2) },
      { metric: 'BIC', value: fit.bic.toFixed(2) },
    ],
  },
];
