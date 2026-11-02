import type { GridData } from '../../grid/types';
import type { PartitionParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';

/** Regression tree on the first numeric variables; response and first predictor separated. */
export const defaultPartitionParams = (grid: GridData): PartitionParams => {
  const numeric = numericColumnIndexes(grid);
  const response = numeric[0] ?? 0;
  return {
    response,
    predictors: numeric.filter(index => index !== response).slice(0, 5),
    maxDepth: 3,
    minSplit: 10,
  };
};
