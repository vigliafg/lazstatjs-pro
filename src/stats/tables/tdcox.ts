import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { CoxCoefficient } from '../cox/types';

export interface TimeDependentCoxSummary {
  n: number;
  events: number;
  intervals: number;
  coefficients: CoxCoefficient[];
  logLik: number;
  logLikNull: number;
  lr: number;
  lrP: number;
  wald: number;
  waldP: number;
  score: number;
  scoreP: number;
  converged: boolean;
}

export const tdCoxTables = (stats: TimeDependentCoxSummary, level: number): TableSpec[] => [
  {
    id: 'tdcox-summary',
    title: copy('Cox con covariate tempo-dipendenti'),
    subtitle: copy('{s1} intervalli · {s2} eventi', { s1: stats.intervals, s2: stats.events }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('Intervalli'), value: stats.intervals },
      { metric: copy('Eventi'), value: stats.events },
      { metric: copy('Log-verosimiglianza'), value: stats.logLik },
      { metric: copy('LR vs nullo'), value: stats.lr },
      { metric: copy('p LR'), value: stats.lrP },
      { metric: copy('Wald'), value: stats.wald },
      { metric: copy('p Wald'), value: stats.waldP },
      { metric: copy('Score'), value: stats.score },
      { metric: copy('p score'), value: stats.scoreP },
    ],
    notes: [
      copy('Formato start-stop: ogni riga è un intervallo in cui le covariate sono costanti.'),
      copy('Il rischio a ogni evento include tutti gli intervalli con start < t ≤ stop.'),
    ],
  },
  {
    id: 'tdcox-coefficients',
    title: copy('Coefficienti'),
    subtitle: copy('Hazard ratio · CI {s1}%', { s1: level }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'beta', label: copy('β'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'hr', label: copy('HR'), format: 'dec4' },
      { key: 'lo', label: copy('HR low'), format: 'dec4' },
      { key: 'hi', label: copy('HR high'), format: 'dec4' },
    ],
    rows: stats.coefficients.map(coefficient => ({ ...coefficient })),
    notes: [copy('HR > 1 indica un rischio maggiore per un’unità in più della covariata tempo-dipendente.')],
  },
];
