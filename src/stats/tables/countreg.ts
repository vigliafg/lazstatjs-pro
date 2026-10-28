import type { TableSpec } from '../types';
import { fmtEst, fmtP } from '../format';
import type { CountStats } from '../countreg/types';

export const countTables = (stats: CountStats, level: number): TableSpec[] => [
  {
    id: 'count-summary',
    title: 'Sintesi del modello',
    subtitle: stats.family === 'poisson' ? 'Poisson' : `Negative binomial (θ = ${fmtEst(stats.theta ?? NaN, 3)})`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
    ],
    rows: [
      { metric: 'N', value: stats.n },
      { metric: 'Predittori', value: stats.k },
      { metric: 'Deviance', value: stats.deviance },
      { metric: 'df residui', value: stats.df },
      { metric: 'Dispersione (Pearson/df)', value: stats.dispersion },
      { metric: 'Log-verosimiglianza', value: stats.logLik },
      { metric: 'LR vs nullo', value: stats.lr },
      { metric: 'p LR', value: stats.lrP },
      { metric: 'AIC', value: stats.aic },
      { metric: 'BIC', value: stats.bic },
      { metric: stats.family === 'negbin' ? 'Theta' : 'Conteggi non interi', value: stats.family === 'negbin' ? (stats.theta ?? NaN) : stats.nonInteger },
    ],
    notes: [
      'Poisson assume varianza = media. Dispersione > 1 indica overdispersion: meglio negative binomial.',
      'Il test LR confronta il modello con l’intercetta sola.',
    ],
  },
  {
    id: 'count-coefficients',
    title: 'Coefficienti',
    subtitle: `IRR e CI ${level}%`,
    columns: [
      { key: 'term', label: 'Termine', format: 'text' },
      { key: 'beta', label: 'β', format: 'dec4' },
      { key: 'se', label: 'SE', format: 'dec4' },
      { key: 'z', label: 'z', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'irr', label: 'IRR', format: 'dec4' },
      { key: 'irrLo', label: 'IRR low', format: 'dec4' },
      { key: 'irrHi', label: 'IRR high', format: 'dec4' },
    ],
    rows: stats.coefficients.map(coefficient => ({ ...coefficient })),
    notes: [
      'IRR = exp(β): moltiplicatore del tasso atteso per un’unità in più del predittore.',
      'p da z normale; con dispersione stimata i test sono approssimati.',
    ],
  },
];
