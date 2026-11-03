import type { GridData } from '../../grid/types';
import type { SurveyParams } from '../../io/project';
import { isNumericColumn, numericColumnIndexes } from '../shared/columns';

/** First numeric outcome, first categorical column, no weights or clustering. */
export const defaultSurveyParams = (grid: GridData): SurveyParams => {
  const numeric = numericColumnIndexes(grid);
  const categorical = grid.cols
    .map((_, index) => index)
    .filter(index => !isNumericColumn(grid, index));
  return {
    mode: 'mean',
    variable: numeric[0] ?? 0,
    category: categorical[0] ?? Math.max(0, grid.cols.length - 1),
    successLevel: '',
    weight: -1,
    strata: -1,
    cluster: -1,
    predictors: numeric.slice(1, 3),
  };
};
