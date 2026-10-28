import { parseNum } from '../../stats/core';
import type { GridData } from '../../grid/types';
import type { RepeatedAnovaParams } from '../../io/project';

export const isNumericColumn = (grid: GridData, index: number): boolean => {
  const values = grid.rows
    .map(row => String(row[index] ?? '').trim())
    .filter(value => value !== '');
  return values.length >= 2 && values.every(value => Number.isFinite(parseNum(value)));
};

/** Le prime tre colonne numeriche come condizioni within-subject. */
export const defaultRepeatedAnovaParams = (grid: GridData): RepeatedAnovaParams => ({
  selected: grid.cols
    .map((_, index) => index)
    .filter(index => isNumericColumn(grid, index))
    .slice(0, 3),
});
