import type { GridData } from '../../grid/types';
import type { IrtParams } from '../../io/project';
import { columnStrings, isNumericColumn } from '../shared/columns';

/** First four numeric columns that look binary (0/1). */
export const defaultIrtParams = (grid: GridData): IrtParams => {
  const binary = grid.cols
    .map((_, index) => index)
    .filter(index => {
      if (!isNumericColumn(grid, index)) return false;
      const values = columnStrings(grid, index).filter(value => value !== '');
      return values.length > 0 && values.every(value => value === '0' || value === '1');
    });
  return { selected: binary.slice(0, 4), model: '2pl', quadrature: 21 };
};
