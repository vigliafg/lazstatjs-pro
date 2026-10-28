import {
  groupColumnIndexes,
  levelLabel,
  orderedColumnLevels,
  type GridData,
} from '../../grid/types';
import type { NonParamMode, NonParamParams } from '../../io/project';
import { parseNum } from '../../stats/core';

export const levelsOf = (grid: GridData, index: number): string[] => {
  const col = grid.cols[index];
  return orderedColumnLevels(col, grid.rows, index).map(level => levelLabel(col, level.value));
};

export const isNumericColumn = (grid: GridData, index: number): boolean => {
  const values = grid.rows
    .map(row => String(row[index] ?? '').trim())
    .filter(value => value !== '');
  if (values.length < 2) return false;
  return values.every(value => Number.isFinite(parseNum(value)));
};

export const isBinaryColumn = (grid: GridData, index: number): boolean =>
  levelsOf(grid, index).length === 2;

export const defaultSelection = (grid: GridData, mode: NonParamMode): number[] => {
  if (mode === 'friedman') {
    return grid.cols
      .map((_, index) => index)
      .filter(index => isNumericColumn(grid, index))
      .slice(0, 3);
  }
  if (mode === 'cochran') {
    return grid.cols
      .map((_, index) => index)
      .filter(index => isBinaryColumn(grid, index))
      .slice(0, 3);
  }
  return [];
};

/** Default coerenti con quelli che il pannello calcolava al primo mount. */
export const defaultNonParamParams = (grid: GridData): NonParamParams => {
  const binary = grid.cols.map((_, index) => index).filter(index => isBinaryColumn(grid, index));
  const numeric = grid.cols.map((_, index) => index).filter(index => isNumericColumn(grid, index));
  return {
    mode: 'friedman',
    selected: defaultSelection(grid, 'friedman'),
    left: binary[0] ?? 0,
    right: binary[1] ?? binary[0] ?? 1,
    outcome: numeric[0] ?? 0,
    group: groupColumnIndexes(grid)[0] ?? 1,
  };
};
