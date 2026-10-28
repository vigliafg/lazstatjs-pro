import type { GridData } from '../../grid/types';
import type { CoxParams } from '../../io/project';
import { parseNum } from '../../stats/core';
import { columnStrings } from '../shared/columns';

const defaultTime = (grid: GridData): number => {
  for (let index = 0; index < grid.cols.length; index++) {
    const values = columnStrings(grid, index).filter(value => value !== '');
    if (values.length >= 3 && values.every(value => Number.isFinite(parseNum(value)) && parseNum(value) >= 0)) {
      return index;
    }
  }
  return 0;
};

const defaultEvent = (grid: GridData): number => {
  for (let index = grid.cols.length - 1; index >= 0; index--) {
    const levels = new Set(columnStrings(grid, index).filter(value => value !== ''));
    if (levels.size === 2) return index;
  }
  return Math.min(1, grid.cols.length - 1);
};

const defaultCovariates = (grid: GridData): number[] => {
  const time = defaultTime(grid);
  const event = defaultEvent(grid);
  const numeric = grid.cols
    .map((_, index) => index)
    .filter(index => {
      const values = columnStrings(grid, index).filter(value => value !== '');
      return values.length > 0 && values.every(value => Number.isFinite(parseNum(value)));
    });
  const candidate = numeric.find(index => index !== time && index !== event);
  if (candidate !== undefined) return [candidate];
  const fallback = numeric[0];
  return fallback === undefined ? [] : [fallback];
};

/** Scelta automatica di tempo, evento e prima covariata numerica. */
export const defaultCoxParams = (grid: GridData): CoxParams => ({
  timeVariable: defaultTime(grid),
  eventVariable: defaultEvent(grid),
  covariates: defaultCovariates(grid),
});
