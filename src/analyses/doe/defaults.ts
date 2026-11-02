import type { GridData } from '../../grid/types';
import type { DoeParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';

/** First numeric variable as response, the next two as factors. */
export const defaultDoeParams = (grid: GridData): DoeParams => {
  const numeric = numericColumnIndexes(grid);
  return {
    response: numeric[0] ?? 0,
    factorA: numeric[1] ?? Math.max(0, grid.cols.length - 2),
    factorB: numeric[2] ?? Math.max(0, grid.cols.length - 1),
    model: 'quadratic',
  };
};
