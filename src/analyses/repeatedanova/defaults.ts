import type { GridData } from '../../grid/types';
import type { RepeatedAnovaParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';

/** Le prime tre colonne numeriche come condizioni within-subject. */
export const defaultRepeatedAnovaParams = (grid: GridData): RepeatedAnovaParams => ({
  selected: numericColumnIndexes(grid).slice(0, 3),
});
