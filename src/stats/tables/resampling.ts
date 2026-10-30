import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { ResamplingStats } from '../resampling/types';

export const resamplingTables = (stats: ResamplingStats, level: number): TableSpec[] => [
  {
    id: 'resampling-groups',
    title: copy('Statistiche per gruppo'),
    subtitle: stats.statistic === 'mean' ? copy('Differenza di medie') : copy('Differenza di mediane'),
    columns: [
      { key: 'group', label: copy('Gruppo'), format: 'text' },
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'statistic', label: copy('Statistica'), format: 'dec4' },
    ],
    rows: [
      { group: stats.groups[0], n: stats.n1, statistic: stats.stat1 },
      { group: stats.groups[1], n: stats.n2, statistic: stats.stat2 },
    ],
    notes: [copy('Differenza osservata ({s1} − {s2}): {s3}.', { s1: stats.groups[1], s2: stats.groups[0], s3: stats.difference })],
  },
  {
    id: 'resampling-test',
    title: copy('Inferenza di resampling'),
    subtitle: copy('{s1} permutazioni · {s2} bootstrap · CI {s3}%', { s1: stats.permutations, s2: stats.bootstrap, s3: level }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('Differenza osservata'), value: stats.difference },
      { metric: copy('p permutation (due code)'), value: stats.pPermutation },
      { metric: copy('CI bootstrap low'), value: stats.ciLo },
      { metric: copy('CI bootstrap high'), value: stats.ciHi },
      { metric: copy('CI BCa low'), value: stats.bcaLo },
      { metric: copy('CI BCa high'), value: stats.bcaHi },
    ],
    notes: [
      copy('Il p di permutazione non assume normalità: confronta la differenza osservata con la distribuzione sotto etichette casuali.'),
      copy('Il CI bootstrap percentile ricampiona dentro ciascun gruppo; con pochi casi può essere instabile.'),
      copy('Il CI BCa corregge bias e asimmetria della distribuzione bootstrap ed è preferibile quando la distribuzione è sbilanciata.'),
    ],
  },
];
