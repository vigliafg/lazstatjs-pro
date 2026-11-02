import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { SignTestResult } from '../kernels/sign';

export const signTestTables = (
  result: SignTestResult,
  name1: string,
  name2: string
): TableSpec[] => [
  {
    id: 'sign-test',
    title: copy('Test dei segni'),
    subtitle: copy('{s1} − {s2}', { s1: name1, s2: name2 }),
    columns: [
      { key: 'n', label: copy('N (non-zero)'), format: 'int' },
      { key: 'zeros', label: copy('Zeros'), format: 'int' },
      { key: 'positive', label: copy('Positive'), format: 'int' },
      { key: 'negative', label: copy('Negative'), format: 'int' },
      { key: 'exactP', label: copy('Exact p'), format: 'p' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'asymptoticP', label: copy('Asymptotic p'), format: 'p' },
      { key: 'median', label: copy('Median difference'), format: 'dec4' },
    ],
    rows: [
      {
        n: result.n,
        zeros: result.zeros,
        positive: result.positive,
        negative: result.negative,
        exactP: result.exactP,
        z: result.z,
        asymptoticP: result.asymptoticP,
        median: result.median,
      },
    ],
    notes: [
      copy('p esatto da binom.test sul numero di differenze positive; le differenze nulle sono escluse.'),
      copy('L’approssimazione normale con correzione di continuità è usata per il p asintotico.'),
    ],
  },
];
