import type { GridData } from '../../grid/types';
import { isGroupColumn } from '../../grid/types';
import type { DiscriminantParams } from '../../io/project';
import { continuousColumnIndexes } from '../shared/columns';

/** First grouping column and the first three numeric predictors. */
export const defaultDiscriminantParams = (grid: GridData): DiscriminantParams => {
  const group = grid.cols.findIndex((_, index) => isGroupColumn(grid, index));
  const predictors = continuousColumnIndexes(grid)
    .filter(index => index !== group)
    .slice(0, 3);
  return {
    group: group >= 0 ? group : Math.max(0, grid.cols.length - 1),
    predictors,
  };
};
