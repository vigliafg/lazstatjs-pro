import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { TwoSampleKsResult } from '../kernels/ks';

export const ksTables = (
  result: TwoSampleKsResult,
  variableName: string,
  groupName: string,
  firstName: string,
  secondName: string
): TableSpec[] => [
  {
    id: 'ks-two',
    title: copy('Kolmogorov–Smirnov (due campioni)'),
    subtitle: copy('{s1} per {s2}', { s1: variableName, s2: groupName }),
    columns: [
      { key: 'group', label: copy('Group'), format: 'text' },
      { key: 'n', label: copy('N'), format: 'int' },
    ],
    rows: [
      { group: firstName, n: result.n1 },
      { group: secondName, n: result.n2 },
    ],
    notes: [
      copy('D = {s1}: la massima distanza verticale tra le due distribuzioni cumulative.', {
        s1: result.d,
      }),
      copy('Il p è {s1}.', {
        s1: result.method === 'exact' ? copy('esatto (enumerazione dei ranghi)') : copy('asintotico (serie di Kolmogorov)'),
      }),
    ],
  },
  {
    id: 'ks-stat',
    title: copy('Statistica e p-value'),
    columns: [
      { key: 'd', label: copy('D'), format: 'dec4' },
      { key: 'p', label: copy('p-value'), format: 'p' },
      { key: 'method', label: copy('Method'), format: 'text' },
    ],
    rows: [
      {
        d: result.d,
        p: result.p,
        method: result.method === 'exact' ? copy('Exact') : copy('Asymptotic'),
      },
    ],
    notes: [
      copy('Il test bilaterale confronta le due distribuzioni cumulative: un p piccolo indica che non provengono dalla stessa popolazione.'),
    ],
  },
];
