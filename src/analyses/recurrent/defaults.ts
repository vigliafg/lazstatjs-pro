import type { GridData } from '../../grid/types';
import type { RecurrentParams } from '../../io/project';

/** First column as subject id, the next three as start, stop and event. */
export const defaultRecurrentParams = (grid: GridData): RecurrentParams => ({
  id: 0,
  start: Math.min(1, grid.cols.length - 1),
  stop: Math.min(2, grid.cols.length - 1),
  event: Math.min(3, grid.cols.length - 1),
  covariates: [],
  model: 'ag',
});
