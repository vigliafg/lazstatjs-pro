import type { GridData } from './types';
import { createColumnId } from './types';

/** Seed grid shown on a fresh session. */
export const createDefaultGrid = (): GridData => ({
  cols: [
    { id: createColumnId(), name: 'Score_Pre', type: 'num' },
    { id: createColumnId(), name: 'Score_Post', type: 'num' },
    { id: createColumnId(), name: 'Group', type: 'int' },
    { id: createColumnId(), name: 'Age', type: 'int' },
  ],
  rows: Array.from({ length: 20 }, (_, i) => {
    if (i < 10) {
      return [
        (50 + i * 2).toString(),
        (60 + i * 2.5).toString(),
        '1',
        (20 + (i % 3)).toString(),
      ];
    }
    return [
      (45 + (i - 10) * 3).toString(),
      (55 + (i - 10) * 2).toString(),
      '2',
      (21 + (i % 2)).toString(),
    ];
  }),
});
