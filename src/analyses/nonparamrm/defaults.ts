import {
  groupColumnIndexes,
  levelLabel,
  orderedColumnLevels,
  type Dataset,
} from '../../grid/types';
import type { NonParamMode, NonParamParams } from '../../io/project';
import { isNumericColumn, numericColumnIndexes } from '../shared/columns';

export const levelsOf = (grid: Dataset, index: number): string[] => {
  const col = grid.cols[index];
  return orderedColumnLevels(col, grid.rows, index).map(level => levelLabel(col, level.value));
};

export const isBinaryColumn = (grid: Dataset, index: number): boolean =>
  levelsOf(grid, index).length === 2;

export const defaultSelection = (grid: Dataset, mode: NonParamMode): number[] => {
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
export const defaultNonParamParams = (grid: Dataset): NonParamParams => {
  const binary = grid.cols.map((_, index) => index).filter(index => isBinaryColumn(grid, index));
  const numeric = numericColumnIndexes(grid);
  return {
    mode: 'friedman',
    selected: defaultSelection(grid, 'friedman'),
    left: binary[0] ?? 0,
    right: binary[1] ?? binary[0] ?? 1,
    outcome: numeric[0] ?? 0,
    group: groupColumnIndexes(grid)[0] ?? 1,
  };
};
