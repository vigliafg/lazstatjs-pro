import { groupColumnIndexes, type GridData } from '../../grid/types';
import type { AncovaParams } from '../../io/project';
import { isNumericColumn } from './columns';

/** Response numerica, fattore categorico e fino a due covariate numeriche. */
export const defaultAncovaParams = (grid: GridData): AncovaParams => {
  const distinct = grid.cols.map(
    (_, index) =>
      new Set(
        grid.rows.map(row => String(row[index] ?? '').trim()).filter(value => value !== '')
      ).size
  );
  const factorCandidates = groupColumnIndexes(grid);
  // Prefer a genuine categorical column, then fall back to a numeric code.
  const factor =
    factorCandidates.find(index => !isNumericColumn(grid, index)) ??
    factorCandidates[0] ??
    0;
  const response = grid.cols.findIndex(
    (_, index) => index !== factor && isNumericColumn(grid, index) && distinct[index] > 2
  );
  const covariates = grid.cols
    .map((_, index) => index)
    .filter(index => index !== response && index !== factor && isNumericColumn(grid, index))
    .slice(0, 2);
  return {
    response: response >= 0 ? response : 0,
    factor,
    covariates,
  };
};
