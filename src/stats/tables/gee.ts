import type { TableSpec } from '../types';
import type { GeeStats } from '../gee/types';

export const geeTables = (stats: GeeStats, level: number): TableSpec[] => [
  {
    id: 'gee-summary',
    title: 'GEE',
    subtitle: `${stats.family === 'gaussian' ? 'Gaussiana' : 'Binomiale'} · ${stats.correlation} · CI ${level}%`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
    ],
    rows: [
      { metric: 'N', value: stats.n },
      { metric: 'Cluster', value: stats.clusters },
      { metric: 'Dimensione massima cluster', value: stats.maxCluster },
      { metric: 'Alpha (correlazione di lavoro)', value: stats.alpha },
      { metric: 'Phi (dispersione)', value: stats.phi },
      { metric: 'Iterazioni', value: stats.iterations },
    ],
    notes: [
      'Gli errori standard sono robusti per cluster (sandwich), non model-based.',
      'La correlazione exchangeable assume la stessa correlazione tra tutte le coppie dentro cluster.',
    ],
  },
  {
    id: 'gee-coefficients',
    title: 'Coefficienti',
    subtitle: 'SE robusti per cluster',
    columns: [
      { key: 'term', label: 'Termine', format: 'text' },
      { key: 'beta', label: 'β', format: 'dec4' },
      { key: 'se', label: 'SE robusto', format: 'dec4' },
      { key: 'z', label: 'z', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'or', label: 'exp(β)', format: 'dec4' },
      { key: 'lo', label: 'CI low', format: 'dec4' },
      { key: 'hi', label: 'CI high', format: 'dec4' },
    ],
    rows: stats.coefficients.map(coefficient => ({ ...coefficient })),
    notes: ['Per la famiglia binomiale exp(β) è l’odds ratio; per la gaussiana è un rapporto di medie.'],
  },
];
