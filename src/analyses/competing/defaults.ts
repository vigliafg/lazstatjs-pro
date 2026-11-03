import type { GridData } from '../../grid/types';
import type { CompetingParams } from '../../io/project';
import { parseNum } from '../../stats/core';
import { columnStrings, numericColumnIndexes } from '../shared/columns';

const defaultTime = (grid: GridData): number => {
  for (const index of numericColumnIndexes(grid)) {
    const values = columnStrings(grid, index).filter(value => value !== '');
    if (values.every(value => parseNum(value) >= 0)) return index;
  }
  return 0;
};

const defaultEvent = (grid: GridData): number => {
  for (let index = grid.cols.length - 1; index >= 0; index--) {
    const levels = new Set(columnStrings(grid, index).filter(value => value !== ''));
    if (levels.size >= 2) return index;
  }
  return Math.min(1, grid.cols.length - 1);
};

/** Time, event code and no covariates; the first cause is analysed. */
export const defaultCompetingParams = (grid: GridData): CompetingParams => ({
  time: defaultTime(grid),
  event: defaultEvent(grid),
  cause: 1,
  covariates: [],
});
