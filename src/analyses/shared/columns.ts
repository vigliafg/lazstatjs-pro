import { parseNum } from '../../stats/core';
import type { Dataset } from '../../grid/types';

/** Celle testuali di una colonna, già ripulite dagli spazi. */
export const columnStrings = (grid: Dataset, index: number): string[] =>
  grid.rows.map(row => String(row[index] ?? '').trim());

/** Livelli non vuoti presenti nella colonna. */
export const distinctValues = (grid: Dataset, index: number): Set<string> =>
  new Set(columnStrings(grid, index).filter(value => value !== ''));

/**
 * Una colonna è numerica quando ha almeno due valori e sono tutti parsabili.
 * Regola unica per form, default e builder delle analisi.
 */
export const isNumericColumn = (grid: Dataset, index: number): boolean => {
  const values = columnStrings(grid, index).filter(value => value !== '');
  return values.length >= 2 && values.every(value => Number.isFinite(parseNum(value)));
};

export const numericColumnIndexes = (grid: Dataset): number[] =>
  grid.cols.map((_, index) => index).filter(index => isNumericColumn(grid, index));
