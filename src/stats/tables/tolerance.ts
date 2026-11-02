import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import { observedCoverage, type ToleranceInterval } from '../kernels/tolerance';

export const toleranceTables = (
  interval: ToleranceInterval,
  values: number[],
  variableName: string
): TableSpec[] => [
  {
    id: 'tolerance',
    title: copy('Intervallo di tolleranza'),
    subtitle: variableName,
    columns: [
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'mean', label: copy('Mean'), format: 'dec4' },
      { key: 'sd', label: copy('SD'), format: 'dec4' },
      { key: 'proportion', label: copy('Population proportion'), format: 'pct' },
      { key: 'confidence', label: copy('Confidence'), format: 'pct' },
      { key: 'k', label: copy('Factor k'), format: 'dec4' },
      { key: 'lo', label: copy('Lower bound'), format: 'dec4' },
      { key: 'hi', label: copy('Upper bound'), format: 'dec4' },
      { key: 'coverage', label: copy('Observed coverage'), format: 'pct' },
    ],
    rows: [
      {
        n: interval.n,
        mean: interval.mean,
        sd: interval.sd,
        proportion: interval.proportion * 100,
        confidence: interval.confidence * 100,
        k: interval.k,
        lo: interval.lo,
        hi: interval.hi,
        coverage: observedCoverage(values, interval) * 100,
      },
    ],
    notes: [
      copy('x̄ ± k·s: l’intervallo contiene la proporzione indicata della popolazione, non della media.'),
      copy('Fattore calcolato con l’approssimazione di Howe; il metodo esatto basato sulla t non centrale differisce di circa lo 0,1% per n = 10.'),
    ],
  },
];
