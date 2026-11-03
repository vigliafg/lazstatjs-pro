import type { GridData } from '../../grid/types';
import type { ConjointParams } from '../../io/project';
import { isNumericColumn, numericColumnIndexes } from '../shared/columns';

/** First two categorical attributes and the first numeric rating. */
export const defaultConjointParams = (grid: GridData): ConjointParams => {
  const categorical = grid.cols
    .map((_, index) => index)
    .filter(index => !isNumericColumn(grid, index));
  const numeric = numericColumnIndexes(grid);
  return {
    attributes: categorical.slice(0, 2),
    response: numeric[0] ?? 0,
  };
};
