import type { GridData } from '../../grid/types';
import type { TextParams } from '../../io/project';
import { isNumericColumn } from '../shared/columns';

/** First text-like column; the first categorical column becomes the group. */
export const defaultTextParams = (grid: GridData): TextParams => {
  const textColumns = grid.cols
    .map((_, index) => index)
    .filter(index => !isNumericColumn(grid, index));
  const group = textColumns.length > 1 ? textColumns[1] : -1;
  return {
    mode: 'frequency',
    text: textColumns[0] ?? 0,
    group,
    maxTerms: 20,
    minDocFreq: 1,
    topics: 3,
    iterations: 300,
    seed: 20261109,
    stopwords: true,
  };
};
