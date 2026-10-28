import { groupColumnIndexes, type GridData } from '../../grid/types';
import type { FactorialParams } from '../../io/project';

/**
 * Picks a response and two categorical-looking factors, preferring a pair
 * whose combinations are all present. When the pair is incomplete the
 * interaction is switched off, because the full model would not be estimable.
 */
export const defaultFactorialParams = (grid: GridData): FactorialParams => {
  const distinct = grid.cols.map(
    (_, index) =>
      new Set(
        grid.rows.map(row => String(row[index] ?? '').trim()).filter(value => value !== '')
      ).size
  );
  const candidates = groupColumnIndexes(grid).filter(
    index => distinct[index] >= 2 && distinct[index] <= 8
  );

  const complete = (a: number, b: number): boolean => {
    const seen = new Set<string>();
    grid.rows.forEach(row => {
      const left = String(row[a] ?? '').trim();
      const right = String(row[b] ?? '').trim();
      if (left !== '' && right !== '') seen.add(`${left}|${right}`);
    });
    return seen.size === distinct[a] * distinct[b];
  };

  let factorA = candidates[0] ?? 1;
  let factorB = candidates.find(index => index !== factorA) ?? 0;
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      if (complete(candidates[i], candidates[j])) {
        factorA = candidates[i];
        factorB = candidates[j];
        i = candidates.length;
        break;
      }
    }
  }

  const response = grid.cols.findIndex(
    (_, index) => index !== factorA && index !== factorB && distinct[index] > 2
  );

  return {
    response: response >= 0 ? response : 0,
    factorA,
    factorB,
    interaction: complete(factorA, factorB),
  };
};
