import type { GridData } from '../../grid/types';
import type { ReliabilityParams } from '../../io/project';

/** Reliability growth on the first two columns; one two-component parallel stage. */
export const defaultReliabilityParams = (grid: GridData): ReliabilityParams => ({
  mode: 'growth',
  time: 0,
  failures: Math.min(1, grid.cols.length - 1),
  stages: [['0.9', '0.9']],
});
