import type { GridData } from '../../grid/types';
import type { SurvivalParams } from '../../io/project';
import { parseNum } from '../../stats/core';

const defaultTime = (grid: GridData): number => {
  for (let index = 0; index < grid.cols.length; index++) {
    const values = grid.rows.map(row => parseNum(row[index])).filter(value => Number.isFinite(value));
    if (values.length > 0 && values.every(value => value >= 0)) return index;
  }
  return 0;
};

const defaultEvent = (grid: GridData): number => {
  for (let index = grid.cols.length - 1; index >= 0; index--) {
    const levels = new Set(
      grid.rows.map(row => String(row[index] ?? '').trim()).filter(value => value !== '')
    );
    if (levels.size === 2) return index;
  }
  return Math.min(1, grid.cols.length - 1);
};

/** Scelta automatica di tempo ed evento; nessun gruppo. */
export const defaultSurvivalParams = (grid: GridData): SurvivalParams => ({
  timeVariable: defaultTime(grid),
  eventVariable: defaultEvent(grid),
  groupVariable: -1,
});
