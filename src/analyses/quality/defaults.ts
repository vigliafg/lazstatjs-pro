import type { GridData } from '../../grid/types';
import type { QualityParams } from '../../io/project';
import { continuousColumnIndexes, numericColumnIndexes } from '../shared/columns';

/** First numeric variable, first non-numeric column for Pareto, no group. */
export const defaultQualityParams = (grid: GridData): QualityParams => {
  const numeric = continuousColumnIndexes(grid);
  const first = numericColumnIndexes(grid)[0] ?? 0;
  const category = grid.cols.findIndex(col => col.type !== 'num' && col.type !== 'int');
  return {
    mode: 'control',
    variable: first,
    category: category >= 0 ? category : Math.max(0, grid.cols.length - 1),
    group: -1,
    chart: 'xbar',
    subgroup: 5,
    lsl: 0,
    usl: 10,
    target: 5,
  };
};
