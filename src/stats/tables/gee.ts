import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { GeeStats } from '../gee/types';

export const geeTables = (stats: GeeStats, level: number): TableSpec[] => [
  {
    id: 'gee-summary',
    title: copy('GEE'),
    subtitle: copy('{s1} · {s2} · CI {s3}%', { s1: stats.family === 'gaussian' ? 'Gaussiana' : 'Binomiale', s2: stats.correlation, s3: level }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('N'), value: stats.n },
      { metric: copy('Cluster'), value: stats.clusters },
      { metric: copy('Dimensione massima cluster'), value: stats.maxCluster },
      { metric: copy('Alpha (correlazione di lavoro)'), value: stats.alpha },
      { metric: copy('Phi (dispersione)'), value: stats.phi },
      { metric: copy('Iterazioni'), value: stats.iterations },
    ],
    notes: [
      copy('Gli errori standard sono robusti per cluster (sandwich), non model-based.'),
      copy('La correlazione exchangeable assume la stessa correlazione tra tutte le coppie dentro cluster.'),
    ],
  },
  {
    id: 'gee-coefficients',
    title: copy('Coefficienti'),
    subtitle: copy('SE robusti per cluster'),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'beta', label: copy('β'), format: 'dec4' },
      { key: 'se', label: copy('SE robusto'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'or', label: copy('exp(β)'), format: 'dec4' },
      { key: 'lo', label: copy('CI low'), format: 'dec4' },
      { key: 'hi', label: copy('CI high'), format: 'dec4' },
    ],
    rows: stats.coefficients.map(coefficient => ({ ...coefficient })),
    notes: [copy('Per la famiglia binomiale exp(β) è l’odds ratio; per la gaussiana è un rapporto di medie.')],
  },
];
