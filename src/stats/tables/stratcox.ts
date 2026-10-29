import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
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
    title: copy('Cox stratificato'),
    subtitle: copy('{s1} strati · {s2} osservazioni · {s3} eventi', { s1: stats.strata, s2: stats.n, s3: stats.events }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('N'), value: stats.n },
      { metric: copy('Eventi'), value: stats.events },
      { metric: copy('Strati'), value: stats.strata },
      { metric: copy('Log-verosimiglianza'), value: stats.logLik },
      { metric: copy('LR vs nullo'), value: stats.lr },
      { metric: copy('p LR'), value: stats.lrP },
      { metric: copy('Wald'), value: stats.wald },
      { metric: copy('p Wald'), value: stats.waldP },
      { metric: copy('Score'), value: stats.score },
      { metric: copy('p score'), value: stats.scoreP },
      { metric: copy('Concordanza'), value: stats.concordance },
    ],
    notes: [
      copy('La baseline è stimata separatamente per strato; i coefficienti sono condivisi.'),
      copy('La tabella della baseline non è riportata per il modello stratificato.'),
    ],
  },
  {
    id: 'stratcox-coefficients',
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
    notes: [copy('HR > 1 indica un rischio maggiore per un’unità in più del predittore, a parità di strato.')],
  },
];
