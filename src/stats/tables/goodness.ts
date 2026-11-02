import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { GofResult } from '../kernels/goodness';

export const goodnessTables = (result: GofResult): TableSpec[] => [
  {
    id: 'gof',
    title: copy('Bontà di adattamento'),
    columns: [
      { key: 'category', label: copy('Category'), format: 'text' },
      { key: 'observed', label: copy('Observed'), format: 'int' },
      { key: 'expected', label: copy('Expected'), format: 'dec3' },
      { key: 'proportion', label: copy('Proportion'), format: 'dec4' },
      { key: 'residual', label: copy('Residual'), format: 'dec3' },
    ],
    rows: result.labels.map((label, index) => ({
      category: label,
      observed: result.observed[index],
      expected: result.expected[index],
      proportion: result.proportions[index],
      residual: result.observed[index] - result.expected[index],
    })),
    notes: [
      copy('Le attese sono la proporzione indicata moltiplicata per il totale ({s1}).', {
        s1: result.total,
      }),
    ],
  },
  {
    id: 'gof-test',
    title: copy('Test χ²'),
    columns: [
      { key: 'chi2', label: copy('Chi-square'), format: 'dec4' },
      { key: 'df', label: copy('df'), format: 'int' },
      { key: 'p', label: copy('p-value'), format: 'p' },
    ],
    rows: [{ chi2: result.chi2, df: result.df, p: result.p }],
    notes: [copy('df = numero di categorie − 1.')],
  },
];
