import type { GridData } from '../../grid/types';
import type { CorrespondenceParams } from '../../io/project';

/** The table editor starts from a balanced 2×2 table; the user edits cells. */
export const defaultCorrespondenceParams = (_grid: GridData): CorrespondenceParams => ({
  rows: ['Basso', 'Alto'],
  cols: ['Basso', 'Alto'],
  values: [
    ['10', '5'],
    ['6', '12'],
  ],
});
