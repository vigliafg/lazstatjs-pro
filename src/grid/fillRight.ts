import type { GridData } from './types';
import { normRange, type Range } from './ops';

/** Copy the leftmost cell of each row across the selected columns. */
export const fillRightRange = (grid: GridData, range: Range): GridData => {
  const { r0, c0, r1, c1 } = normRange(range);
  if (grid.rows.length === 0 || grid.cols.length === 0) return grid;
  const ar0 = Math.max(0, Math.min(grid.rows.length - 1, r0));
  const ar1 = Math.max(0, Math.min(grid.rows.length - 1, r1));
  const ac0 = Math.max(0, Math.min(grid.cols.length - 1, c0));
  const ac1 = Math.max(0, Math.min(grid.cols.length - 1, c1));
  const rows = grid.rows.map((row, r) => {
    if (r < ar0 || r > ar1) return [...row];
    const copy = [...row];
    const left = copy[ac0] ?? '';
    for (let c = ac0 + 1; c <= ac1; c += 1) {
      if (c < copy.length) copy[c] = left;
    }
    return copy;
  });
  return { cols: grid.cols, rows };
};
