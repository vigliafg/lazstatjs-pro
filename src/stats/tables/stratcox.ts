import type { TableSpec } from '../types';
import type { CoxCoefficient } from '../cox/types';

export interface StratifiedCoxSummary {
  n: number;
  events: number;
  strata: number;
  coefficients: CoxCoefficient[];
  logLik: number;
  logLikNull: number;
  lr: number;
  lrP: number;
  wald: number;
  waldP: number;
  score: number;
  scoreP: number;
  concordance: number;
  converged: boolean;
}

export const stratCoxTables = (stats: StratifiedCoxSummary, level: number): TableSpec[] => [
  {
    id: 'stratcox-summary',
    title: 'Cox stratificato',
    subtitle: `${stats.strata} strati · ${stats.n} osservazioni · ${stats.events} eventi`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
    ],
    rows: [
      { metric: 'N', value: stats.n },
      { metric: 'Eventi', value: stats.events },
      { metric: 'Strati', value: stats.strata },
      { metric: 'Log-verosimiglianza', value: stats.logLik },
      { metric: 'LR vs nullo', value: stats.lr },
      { metric: 'p LR', value: stats.lrP },
      { metric: 'Wald', value: stats.wald },
      { metric: 'p Wald', value: stats.waldP },
      { metric: 'Score', value: stats.score },
      { metric: 'p score', value: stats.scoreP },
      { metric: 'Concordanza', value: stats.concordance },
    ],
    notes: [
      'La baseline è stimata separatamente per strato; i coefficienti sono condivisi.',
      'La tabella della baseline non è riportata per il modello stratificato.',
    ],
  },
  {
    id: 'stratcox-coefficients',
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
    notes: ['HR > 1 indica un rischio maggiore per un’unità in più del predittore, a parità di strato.'],
  },
];
