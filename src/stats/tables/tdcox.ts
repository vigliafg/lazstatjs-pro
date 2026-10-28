import type { TableSpec } from '../types';
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
    title: 'Cox con covariate tempo-dipendenti',
    subtitle: `${stats.intervals} intervalli · ${stats.events} eventi`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
    ],
    rows: [
      { metric: 'Intervalli', value: stats.intervals },
      { metric: 'Eventi', value: stats.events },
      { metric: 'Log-verosimiglianza', value: stats.logLik },
      { metric: 'LR vs nullo', value: stats.lr },
      { metric: 'p LR', value: stats.lrP },
      { metric: 'Wald', value: stats.wald },
      { metric: 'p Wald', value: stats.waldP },
      { metric: 'Score', value: stats.score },
      { metric: 'p score', value: stats.scoreP },
    ],
    notes: [
      'Formato start-stop: ogni riga è un intervallo in cui le covariate sono costanti.',
      'Il rischio a ogni evento include tutti gli intervalli con start < t ≤ stop.',
    ],
  },
  {
    id: 'tdcox-coefficients',
    title: 'Coefficienti',
    subtitle: `Hazard ratio · CI ${level}%`,
    columns: [
      { key: 'term', label: 'Termine', format: 'text' },
      { key: 'beta', label: 'β', format: 'dec4' },
      { key: 'se', label: 'SE', format: 'dec4' },
      { key: 'z', label: 'z', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'hr', label: 'HR', format: 'dec4' },
      { key: 'lo', label: 'HR low', format: 'dec4' },
      { key: 'hi', label: 'HR high', format: 'dec4' },
    ],
    rows: stats.coefficients.map(coefficient => ({ ...coefficient })),
    notes: ['HR > 1 indica un rischio maggiore per un’unità in più della covariata tempo-dipendente.'],
  },
];
