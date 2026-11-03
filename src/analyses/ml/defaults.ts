import type { GridData } from '../../grid/types';
import type { MlParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';

/** First numeric column as outcome, the next ones as predictors. */
export const defaultMlParams = (grid: GridData): MlParams => {
  const numeric = numericColumnIndexes(grid);
  const outcome = numeric[0] ?? 0;
  return {
    mode: 'rf',
    task: 'regression',
    outcome,
    predictors: numeric.filter(index => index !== outcome).slice(0, 4),
    trees: 200,
    minNode: 5,
    mtry: 0,
    shrinkage: 0.05,
    hidden: 4,
    iterations: 500,
    seed: 20261109,
  };
};
