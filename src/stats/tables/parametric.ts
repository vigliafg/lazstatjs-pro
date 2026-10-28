import type { TableSpec } from '../types';
import type { ParametricSurvivalStats } from '../parametric/types';

export const parametricTables = (stats: ParametricSurvivalStats, level: number): TableSpec[] => [
  {
    id: 'param-summary',
    title: 'Sopravvivenza parametrica',
    subtitle: `${stats.distribution === 'weibull' ? 'Weibull AFT' : 'Exponenziale AFT'} · CI ${level}%`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
    ],
    rows: [
      { metric: 'N', value: stats.n },
      { metric: 'Eventi', value: stats.events },
      { metric: 'Intercetta (μ)', value: stats.mu },
      { metric: 'Scala (σ)', value: stats.sigma },
      { metric: 'Log-verosimiglianza', value: stats.logLik },
      { metric: 'AIC', value: stats.aic },
      { metric: 'BIC', value: stats.bic },
    ],
    notes: [
      'Modello AFT: log(T) = μ + Xβ + σ·W, con W extreme-value.',
      'Con la distribuzione esponenziale la scala è fissata a 1.',
    ],
  },
  {
    id: 'param-coefficients',
    title: 'Coefficienti',
    subtitle: 'Time ratio e CI',
    columns: [
      { key: 'term', label: 'Termine', format: 'text' },
      { key: 'beta', label: 'β', format: 'dec4' },
      { key: 'se', label: 'SE', format: 'dec4' },
      { key: 'z', label: 'z', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'timeRatio', label: 'Time ratio', format: 'dec4' },
      { key: 'lo', label: 'TR low', format: 'dec4' },
      { key: 'hi', label: 'TR high', format: 'dec4' },
    ],
    rows: stats.coefficients.map(coefficient => ({ ...coefficient })),
    notes: ['Time ratio > 1 indica tempi di sopravvivenza più lunghi per un’unità in più del predittore.'],
  },
];
