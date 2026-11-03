import type { GridData } from '../../grid/types';
import type { AltParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';

/** Time, event and the first remaining numeric column as stress. */
export const defaultAltParams = (grid: GridData): AltParams => {
  const numeric = numericColumnIndexes(grid);
  const time = numeric[0] ?? 0;
  const stress = numeric.find(index => index !== time) ?? Math.min(1, grid.cols.length - 1);
  return {
    time,
    event: 1,
    stress,
    covariates: [],
    model: 'arrhenius',
    useStress: 1,
  };
};
