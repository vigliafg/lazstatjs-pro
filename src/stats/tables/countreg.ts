import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import { fmtEst, fmtP } from '../format';
import type { CountStats } from '../countreg/types';

export const countTables = (stats: CountStats, level: number): TableSpec[] => [
  {
    id: 'count-summary',
    title: copy('Sintesi del modello'),
    subtitle: stats.family === 'poisson' ? 'Poisson' : copy('Negative binomial (θ = {s1})', { s1: fmtEst(stats.theta ?? NaN, 3) }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('N'), value: stats.n },
      { metric: copy('Predittori'), value: stats.k },
      { metric: copy('Deviance'), value: stats.deviance },
      { metric: copy('df residui'), value: stats.df },
      { metric: copy('Dispersione (Pearson/df)'), value: stats.dispersion },
      { metric: copy('Log-verosimiglianza'), value: stats.logLik },
      { metric: copy('LR vs nullo'), value: stats.lr },
      { metric: copy('p LR'), value: stats.lrP },
      { metric: copy('AIC'), value: stats.aic },
      { metric: copy('BIC'), value: stats.bic },
      { metric: stats.family === 'negbin' ? 'Theta' : copy('Conteggi non interi'), value: stats.family === 'negbin' ? (stats.theta ?? NaN) : stats.nonInteger },
    ],
    notes: [
      copy('Poisson assume varianza = media. Dispersione > 1 indica overdispersion: meglio negative binomial.'),
      copy('Il test LR confronta il modello con l’intercetta sola.'),
    ],
  },
  {
    id: 'count-coefficients',
    title: copy('Coefficienti'),
    subtitle: copy('IRR e CI {s1}%', { s1: level }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'beta', label: copy('β'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'irr', label: copy('IRR'), format: 'dec4' },
      { key: 'irrLo', label: copy('IRR low'), format: 'dec4' },
      { key: 'irrHi', label: copy('IRR high'), format: 'dec4' },
    ],
    rows: stats.coefficients.map(coefficient => ({ ...coefficient })),
    notes: [
      copy('IRR = exp(β): moltiplicatore del tasso atteso per un’unità in più del predittore.'),
      copy('p da z normale; con dispersione stimata i test sono approssimati.'),
    ],
  },
];
