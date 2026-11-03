import type { GridData } from '../../grid/types';
import type { LatentClassParams } from '../../io/project';
import { isNumericColumn } from '../shared/columns';

/** First three categorical columns, two classes. */
export const defaultLatentClassParams = (grid: GridData): LatentClassParams => {
  const categorical = grid.cols
    .map((_, index) => index)
    .filter(index => !isNumericColumn(grid, index));
  return { selected: categorical.slice(0, 3), classes: 2, maxIterations: 500 };
};
