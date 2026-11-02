import type { GridData } from '../../grid/types';
import type { ClusterParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';

/** First four numeric variables, average linkage and three clusters. */
export const defaultClusterParams = (grid: GridData): ClusterParams => ({
  selected: numericColumnIndexes(grid).slice(0, 4),
  method: 'average',
  clusters: 3,
  standardize: true,
});
