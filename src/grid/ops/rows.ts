import type { GridData } from '../types';
import { emptyRow, isMissingCell, isMissingCode } from '../types';
import { numVal } from './shared';

export const addRowEnd = (grid: GridData): GridData => ({
  cols: grid.cols,
  rows: [...grid.rows, emptyRow(grid.cols.length)],
});

export const insertRowAt = (grid: GridData, at: number): GridData => {
  const pos = Math.max(0, Math.min(grid.rows.length, at));
  return {
    cols: grid.cols,
    rows: [...grid.rows.slice(0, pos), emptyRow(grid.cols.length), ...grid.rows.slice(pos)],
  };
};

export const deleteRow = (grid: GridData, r: number): GridData => {
  if (grid.rows.length <= 1 || r < 0 || r >= grid.rows.length) return grid;
  return {
    cols: grid.cols,
    rows: grid.rows.filter((_, i) => i !== r),
  };
};

export const clearGrid = (grid: GridData): GridData => ({
  cols: grid.cols,
  rows: grid.rows.map(() => emptyRow(grid.cols.length)),
});

export const newGrid = (): GridData => ({ cols: [{ name: 'Var1', type: 'num' }], rows: Array(20).fill(null).map(() => ['']) });

export const removeEmptyRows = (grid: GridData): { grid: GridData; removed: number } => {
  const kept = grid.rows.filter((r) =>
    r.some((value, column) => !isMissingCell(grid.cols[column], value))
  );
  return { grid: { cols: grid.cols, rows: kept.length ? kept : [emptyRow(grid.cols.length)] }, removed: grid.rows.length - kept.length };
};

export const removeDuplicateRows = (grid: GridData): { grid: GridData; removed: number } => {
  const seen = new Set<string>();
  const kept: string[][] = [];
  grid.rows.forEach((r) => {
    const full = grid.cols.map((_, i) => String(r[i] ?? '').trim());
    const key = JSON.stringify(full);
    const empty = full.every((v) => v === '');
    if (empty || !seen.has(key)) {
      if (!empty) seen.add(key);
      kept.push(r);
    }
  });
  return { grid: { cols: grid.cols, rows: kept }, removed: grid.rows.length - kept.length };
};

export const fillMissing = (
  grid: GridData,
  col: number,
  strategy: 'mean' | 'median' | 'mode' | { value: string }
): { grid: GridData; filled: number; fillWith: string } => {
  if (col < 0 || col >= grid.cols.length) return { grid, filled: 0, fillWith: '' };
  const column = grid.cols[col];
  const isMissing = (value: string): boolean =>
    String(value).trim() === '' || isMissingCode(column, value);
  const vals = grid.rows.map((r) => r[col] ?? '');
  const filled = vals.filter((v) => !isMissing(v));
  let fillWith = '';
  if (typeof strategy === 'object') {
    fillWith = strategy.value;
  } else if (strategy === 'mode') {
    const freq = new Map<string, number>();
    filled.forEach((v) => freq.set(v, (freq.get(v) ?? 0) + 1));
    let best = '';
    let bestN = -1;
    freq.forEach((n, v) => {
      if (n > bestN) {
        bestN = n;
        best = v;
      }
    });
    fillWith = best;
  } else {
    const nums = filled.map((v) => Number(String(v).replace(',', '.'))).filter((n) => !isNaN(n));
    if (nums.length === 0) return { grid, filled: 0, fillWith: '' };
    const sorted = [...nums].sort((a, b) => a - b);
    fillWith = strategy === 'mean'
      ? String(nums.reduce((a, b) => a + b, 0) / nums.length)
      : String(sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2);
  }
  let n = 0;
  const rows = grid.rows.map((row) => {
    if (!isMissing(row[col] ?? '')) return [...row];
    n += 1;
    const copy = [...row];
    copy[col] = fillWith;
    return copy;
  });
  return { grid: { cols: grid.cols, rows }, filled: n, fillWith };
};

export const sortByColumn = (grid: GridData, col: number, dir: 'asc' | 'desc', nullsFirst = false): GridData => {
  if (col < 0 || col >= grid.cols.length) return grid;
  const rows = grid.rows.map((r, i) => ({ r: [...r], i }));
  rows.sort((a, b) => {
    const va = a.r[col] ?? '';
    const vb = b.r[col] ?? '';
    const na = numVal(va);
    const nb = numVal(vb);
    const aEmpty = String(va).trim() === '';
    const bEmpty = String(vb).trim() === '';
    if (aEmpty || bEmpty) {
      if (aEmpty && bEmpty) return a.i - b.i;
      if (nullsFirst) return aEmpty ? -1 : 1;
      return aEmpty ? 1 : -1;
    }
    let cmp: number;
    if (na !== null && nb !== null) cmp = na - nb;
    else cmp = String(va).localeCompare(String(vb));
    if (dir === 'desc') cmp = -cmp;
    return cmp === 0 ? a.i - b.i : cmp;
  });
  return { cols: grid.cols, rows: rows.map((x) => x.r) };
};
