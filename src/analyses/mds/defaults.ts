import type { GridData } from '../../grid/types';
import type { MdsParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';

/** First three numeric variables, two dimensions, classical metric scaling. */
export const defaultMdsParams = (grid: GridData): MdsParams => ({
  selected: numericColumnIndexes(grid).slice(0, 3),
  dimensions: 2,
  metric: 'classical',
});
