import type { GridData } from '../../grid/types';
import type { SpatialParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';

/** First three numeric columns as value, X and Y; the rest as predictors. */
export const defaultSpatialParams = (grid: GridData): SpatialParams => {
  const numeric = numericColumnIndexes(grid);
  const fallback = Math.max(0, grid.cols.length - 1);
  const variable = numeric[0] ?? 0;
  const x = numeric[1] ?? variable;
  const y = numeric[2] ?? x;
  return {
    mode: 'moran',
    variable,
    predictors: numeric.filter(index => ![variable, x, y].includes(index)).slice(0, 3),
    x,
    y,
    k: 4,
    permutations: 999,
    seed: 20261109,
  };
};
