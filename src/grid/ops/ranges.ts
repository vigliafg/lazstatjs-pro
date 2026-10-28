import type { Column, GridData } from '../types';
import { createColumnId, emptyRow, uniqueColName } from '../types';

export interface Range {
  r0: number;
  c0: number;
  r1: number;
  c1: number;
}

export const normRange = (a: Range): Range => ({
  r0: Math.min(a.r0, a.r1),
  c0: Math.min(a.c0, a.c1),
  r1: Math.max(a.r0, a.r1),
  c1: Math.max(a.c0, a.c1),
});

export const rangeToTsv = (grid: GridData, range: Range): string => {
  const { r0, c0, r1, c1 } = normRange(range);
  const lines: string[] = [];
  for (let r = r0; r <= r1; r += 1) {
    const cells: string[] = [];
    for (let c = c0; c <= c1; c += 1) cells.push(grid.rows[r]?.[c] ?? '');
    lines.push(cells.join('\t'));
  }
  return lines.join('\n');
};

export const parseTsv = (text: string): string[][] =>
  text.replace(/\r\n?/g, '\n').split('\n').map((line) => line.split('\t'));

/** Paste a TSV block at anchor, expanding rows/cols as needed. */
export const pasteTsvAt = (grid: GridData, r0: number, c0: number, block: string[][]): GridData => {
  if (!block || block.length === 0) return grid;
  const ar = Math.max(0, Math.min(grid.rows.length, r0));
  const ac = Math.max(0, c0);
  const needRows = ar + block.length;
  const needCols = Math.max(grid.cols.length, ac + Math.max(0, ...block.map((r) => r.length)));
  let cols: Column[] = [...grid.cols];
  while (cols.length < needCols) cols = [...cols, { id: createColumnId(), name: uniqueColName(cols, `Var${cols.length + 1}`), type: 'num' }];
  const rows: string[][] = grid.rows.map((r) => {
    const copy = [...r];
    while (copy.length < needCols) copy.push('');
    return copy;
  });
  while (rows.length < needRows) rows.push(emptyRow(needCols));
  block.forEach((line, dr) => {
    line.forEach((val, dc) => {
      rows[ar + dr][ac + dc] = val;
    });
  });
  return { cols, rows };
};

export const clearRange = (grid: GridData, range: Range): GridData => {
  const { r0, c0, r1, c1 } = normRange(range);
  // Preserve ragged row widths: only touch cells that exist.
  return {
    cols: grid.cols,
    rows: grid.rows.map((row, r) =>
      r < r0 || r > r1 ? [...row] : row.map((v, c) => (c >= c0 && c <= c1 ? '' : v))
    ),
  };
};

/** Overwrite every selected cell with one value (multi-cell typing). */
export const setRangeValue = (grid: GridData, range: Range, value: string): GridData => {
  const { r0, c0, r1, c1 } = normRange(range);
  let changed = false;
  const rows = grid.rows.map((row, r) => {
    if (r < r0 || r > r1) return row;
    return row.map((cell, c) => {
      if (c < c0 || c > c1 || cell === value) return cell;
      changed = true;
      return value;
    });
  });
  return changed ? { cols: grid.cols, rows } : grid;
};

export const fillDownRange = (grid: GridData, range: Range): GridData => {
  const { r0, c0, r1, c1 } = normRange(range);
  if (grid.rows.length === 0 || grid.cols.length === 0) return grid;
  const ar0 = Math.max(0, Math.min(grid.rows.length - 1, r0));
  const ar1 = Math.max(0, Math.min(grid.rows.length - 1, r1));
  const ac0 = Math.max(0, Math.min(grid.cols.length - 1, c0));
  const ac1 = Math.max(0, Math.min(grid.cols.length - 1, c1));
  const rows = grid.rows.map((r) => [...r]);
  for (let c = ac0; c <= ac1; c += 1) {
    const top = rows[ar0]?.[c] ?? '';
    for (let r = ar0 + 1; r <= ar1; r += 1) {
      if (c < rows[r].length) rows[r][c] = top;
    }
  }
  return { cols: grid.cols, rows };
};
