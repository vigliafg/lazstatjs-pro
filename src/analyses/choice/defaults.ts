import type { GridData } from '../../grid/types';
import type { ChoiceParams } from '../../io/project';
import { isNumericColumn, numericColumnIndexes } from '../shared/columns';

/** First columns as set/alternative/choice indicators, numeric ones as attributes. */
export const defaultChoiceParams = (grid: GridData): ChoiceParams => {
  const numeric = numericColumnIndexes(grid);
  const categorical = grid.cols
    .map((_, index) => index)
    .filter(index => !isNumericColumn(grid, index));
  const fallback = Math.max(0, grid.cols.length - 1);
  return {
    mode: 'choice',
    set: categorical[0] ?? 0,
    alternative: categorical[1] ?? Math.min(1, fallback),
    chosen: categorical[2] ?? Math.min(2, fallback),
    best: categorical[2] ?? Math.min(2, fallback),
    worst: categorical[3] ?? fallback,
    attributes: numeric.slice(0, 3),
  };
};
