import type { GridData } from '../../grid/types';
import type { VarParams } from '../../io/project';

/** VAR on the first two columns, automatic lag order. */
export const defaultVarParams = (grid: GridData): VarParams => ({
  mode: 'var',
  variables: [0, Math.min(1, Math.max(0, grid.cols.length - 1))],
  lags: 0,
  horizon: 12,
});
