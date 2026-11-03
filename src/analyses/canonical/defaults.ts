import type { GridData } from '../../grid/types';
import type { CanonicalParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';

/** First two numeric variables in X, the next two in Y. */
export const defaultCanonicalParams = (grid: GridData): CanonicalParams => {
  const numeric = numericColumnIndexes(grid);
  return { x: numeric.slice(0, 2), y: numeric.slice(2, 4) };
};
