import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { ParametricSurvivalStats } from '../parametric/types';

export const parametricTables = (stats: ParametricSurvivalStats, level: number): TableSpec[] => [
  {
    id: 'param-summary',
    title: copy('Sopravvivenza parametrica'),
    subtitle: copy('{s1} · CI {s2}%', { s1: stats.distribution === 'weibull' ? copy('Weibull AFT') : copy('Exponenziale AFT'), s2: level }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('N'), value: stats.n },
      { metric: copy('Eventi'), value: stats.events },
      { metric: copy('Intercetta (μ)'), value: stats.mu },
      { metric: copy('Scala (σ)'), value: stats.sigma },
      { metric: copy('Log-verosimiglianza'), value: stats.logLik },
      { metric: copy('AIC'), value: stats.aic },
      { metric: copy('BIC'), value: stats.bic },
    ],
    notes: [
      copy('Modello AFT: log(T) = μ + Xβ + σ·W, con W extreme-value.'),
      copy('Con la distribuzione esponenziale la scala è fissata a 1.'),
    ],
  },
  {
    id: 'param-coefficients',
    title: copy('Coefficienti'),
    subtitle: copy('Time ratio e CI'),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'beta', label: copy('β'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'timeRatio', label: copy('Time ratio'), format: 'dec4' },
      { key: 'lo', label: copy('TR low'), format: 'dec4' },
      { key: 'hi', label: copy('TR high'), format: 'dec4' },
    ],
    rows: stats.coefficients.map(coefficient => ({ ...coefficient })),
    notes: [copy('Time ratio > 1 indica tempi di sopravvivenza più lunghi per un’unità in più del predittore.')],
  },
];
