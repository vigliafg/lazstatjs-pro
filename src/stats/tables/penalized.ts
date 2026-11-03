import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { PenalizedResult } from '../kernels/penalized';

export interface PenalizedNames {
  dep: string;
  predictors: string[];
}

export const penalizedTables = (
  fit: PenalizedResult,
  names: PenalizedNames,
  level: number
): TableSpec[] => [
  {
    id: 'penalized-coefficients',
    title: copy('Coefficienti penalizzati'),
    subtitle: copy('{s1} · {s2} · λ = {s3} · CI {s4}%', {
      s1: names.dep,
      s2: fit.penalty,
      s3: fit.lambda,
      s4: level,
    }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'coefficient', label: copy('Coefficiente'), format: 'dec4' },
    ],
    rows: [
      { term: '(Intercept)', coefficient: fit.intercept },
      ...fit.coefficients.map((value, index) => ({
        term: names.predictors[index] ?? `X${index + 1}`,
        coefficient: value,
      })),
    ],
    notes: [
      copy('I coefficienti sono sulla scala originale delle variabili; il modello è stato stimato su predittori standardizzati.'),
      copy('Con LASSO i coefficienti esattamente nulli indicano variabili escluse dal modello.'),
    ],
  },
  {
    id: 'penalized-fit',
    title: copy('Bontà del modello'),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Penalità'), value: fit.penalty },
      { metric: 'λ', value: String(fit.lambda) },
      { metric: 'α', value: fit.alpha.toFixed(2) },
      { metric: copy('Coefficienti non nulli'), value: String(fit.df) },
      { metric: 'R²', value: fit.r2.toFixed(6) },
      { metric: copy('Iterazioni'), value: String(fit.iterations) },
      { metric: copy('Convergenza'), value: fit.converged ? copy('Sì') : copy('No') },
    ],
    notes: [
      copy('λ governa la forza della penalizzazione: valori più alti producono modelli più semplici.'),
      copy('α = 0 è ridge, α = 1 è LASSO, valori intermedi sono elastic net.'),
    ],
  },
];
