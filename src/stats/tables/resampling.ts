import type { TableSpec } from '../types';
import type { ResamplingStats } from '../resampling/types';

export const resamplingTables = (stats: ResamplingStats, level: number): TableSpec[] => [
  {
    id: 'resampling-groups',
    title: 'Statistiche per gruppo',
    subtitle: stats.statistic === 'mean' ? 'Differenza di medie' : 'Differenza di mediane',
    columns: [
      { key: 'group', label: 'Gruppo', format: 'text' },
      { key: 'n', label: 'N', format: 'int' },
      { key: 'statistic', label: 'Statistica', format: 'dec4' },
    ],
    rows: [
      { group: stats.groups[0], n: stats.n1, statistic: stats.stat1 },
      { group: stats.groups[1], n: stats.n2, statistic: stats.stat2 },
    ],
    notes: [`Differenza osservata (${stats.groups[1]} − ${stats.groups[0]}): ${stats.difference}.`],
  },
  {
    id: 'resampling-test',
    title: 'Inferenza di resampling',
    subtitle: `${stats.permutations} permutazioni · ${stats.bootstrap} bootstrap · CI ${level}%`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
    ],
    rows: [
      { metric: 'Differenza osservata', value: stats.difference },
      { metric: 'p permutation (due code)', value: stats.pPermutation },
      { metric: 'CI bootstrap low', value: stats.ciLo },
      { metric: 'CI bootstrap high', value: stats.ciHi },
    ],
    notes: [
      'Il p di permutazione non assume normalità: confronta la differenza osservata con la distribuzione sotto etichette casuali.',
      'Il CI bootstrap percentile ricampiona dentro ciascun gruppo; con pochi casi può essere instabile.',
    ],
  },
];
