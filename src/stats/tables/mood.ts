import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { MoodResult } from '../kernels/mood';

export const moodTables = (result: MoodResult, depName: string, groupName: string): TableSpec[] => [
  {
    id: 'mood-counts',
    title: copy('Mood: osservazioni sopra e sotto la mediana'),
    subtitle: copy('{s1} per {s2}', { s1: depName, s2: groupName }),
    columns: [
      { key: 'group', label: groupName, format: 'text' },
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'above', label: copy('Above median'), format: 'int' },
      { key: 'below', label: copy('Below median'), format: 'int' },
    ],
    rows: result.groups.map(group => ({
      group: group.name,
      n: group.n,
      above: group.above,
      below: group.below,
    })),
    notes: [
      copy('Mediana comune: {s1}; {s2} osservazioni sopra e {s3} sotto (o uguali).', {
        s1: result.median,
        s2: result.above,
        s3: result.below,
      }),
    ],
  },
  {
    id: 'mood-test',
    title: copy('Mood: test χ²'),
    columns: [
      { key: 'chi2', label: copy('Chi-square'), format: 'dec4' },
      { key: 'df', label: copy('df'), format: 'int' },
      { key: 'p', label: copy('p-value'), format: 'p' },
    ],
    rows: [{ chi2: result.chi2, df: result.df, p: result.p }],
    notes: [
      copy('Statistica di Brown–Mood con correzione (N − 1)/N, come coin::median_test.'),
    ],
  },
];
