import type { GridData } from '../../grid/types';
import type { MetaParams } from '../../io/project';
import { isNumericColumn, numericColumnIndexes } from '../shared/columns';

/** First two numeric columns are effect and standard error. */
export const defaultMetaParams = (grid: GridData): MetaParams => {
  const numeric = numericColumnIndexes(grid);
  const labels = grid.cols
    .map((_, index) => index)
    .filter(index => !isNumericColumn(grid, index));
  return {
    effect: numeric[0] ?? 0,
    se: numeric[1] ?? numeric[0] ?? 0,
    study: labels[0] ?? -1,
    method: 'DL',
    egger: true,
  };
};
