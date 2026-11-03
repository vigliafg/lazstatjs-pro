import type { GridData } from '../../grid/types';
import type { SemParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';

/** Two factors, two indicators each, correlated factors. */
export const defaultSemParams = (grid: GridData): SemParams => {
  const selected = numericColumnIndexes(grid).slice(0, 4);
  const groups = selected.map((_, index) => (index < Math.ceil(selected.length / 2) ? 0 : 1));
  return { selected, factors: 2, groups, structural: false };
};
