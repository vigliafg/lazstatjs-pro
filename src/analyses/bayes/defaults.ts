import type { GridData } from '../../grid/types';
import type { BayesParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';

/** First numeric column as outcome, the next ones as regression predictors. */
export const defaultBayesParams = (grid: GridData): BayesParams => {
  const numeric = numericColumnIndexes(grid);
  const outcome = numeric[0] ?? 0;
  return {
    mode: 'normal',
    outcome,
    predictors: numeric.filter(index => index !== outcome).slice(0, 3),
    group: -1,
    priorMean: 0,
    priorSd: 10,
    iterations: 4000,
    burnin: 1000,
    chains: 2,
    seed: 20261109,
  };
};
