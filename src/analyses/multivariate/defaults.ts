import { parseNum } from '../../stats/core';
import type { GridData } from '../../grid/types';
import type { MultivariateParams } from '../../io/project';

export const isNumericColumn = (grid: GridData, index: number): boolean => {
  const values = grid.rows
    .map(row => String(row[index] ?? '').trim())
    .filter(value => value !== '');
  return values.length >= 2 && values.every(value => Number.isFinite(parseNum(value)));
};

/** PCA su tutte le variabili, standardizzata, con le prime quattro colonne numeriche. */
export const defaultMultivariateParams = (grid: GridData): MultivariateParams => ({
  mode: 'pca',
  standardize: true,
  selected: grid.cols
    .map((_, index) => index)
    .filter(index => isNumericColumn(grid, index))
    .slice(0, 4),
});
