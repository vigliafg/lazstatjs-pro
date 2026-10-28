import type { GridData } from '../../grid/types';
import type { MultivariateParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';

/** PCA su tutte le variabili, standardizzata, con le prime quattro colonne numeriche. */
export const defaultMultivariateParams = (grid: GridData): MultivariateParams => ({
  mode: 'pca',
  standardize: true,
  selected: numericColumnIndexes(grid).slice(0, 4),
  factors: 0,
  rotation: 'varimax',
});
