import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { CusumResult } from '../kernels/cusum';

export const cusumTables = (result: CusumResult, variableName: string): TableSpec[] => [
  {
    id: 'cusum',
    title: copy('CUSUM'),
    subtitle: variableName,
    columns: [
      { key: 'index', label: copy('Observation'), format: 'int' },
      { key: 'value', label: copy('Value'), format: 'dec4' },
      { key: 'cplus', label: copy('C+'), format: 'dec3' },
      { key: 'cminus', label: copy('C−'), format: 'dec3' },
      { key: 'signal', label: copy('Signal'), format: 'text' },
    ],
    rows: result.points.map(point => ({
      index: point.index,
      value: point.value,
      cplus: point.cplus,
      cminus: point.cminus,
      signal: point.signal === 'high' ? copy('High') : point.signal === 'low' ? copy('Low') : '',
    })),
    notes: [
      copy('C+ accumula gli scostamenti sopra il target, C− quelli sotto: entrambi partono da zero e non scendono mai sotto zero.'),
      copy('k = {s1}·σ (allowance), h = {s2}·σ (intervallo di decisione); il primo punto oltre h è il segnale.', {
        s1: result.k,
        s2: result.h,
      }),
    ],
  },
];
