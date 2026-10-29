import type { GridData } from './types';
import { validateValue } from './types';
import { numVal } from './ops/shared';

/* ---------- Cell edits ---------- */

export const setCell = (grid: GridData, r: number, c: number, val: string): GridData => {
  if (r < 0 || r >= grid.rows.length || c < 0 || c >= grid.cols.length) return grid;
  const rows = grid.rows.map((row, i) => (i === r ? row.map((v, j) => (j === c ? val : v)) : [...row]));
  return { cols: grid.cols, rows };
};

/* ---------- View filtering ---------- */

export type RowFilterOp =
  | 'contains'
  | 'equals'
  | 'notEquals'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'empty'
  | 'notEmpty';

export interface RowFilter {
  col: number;
  op: RowFilterOp;
  value: string;
  caseSensitive?: boolean;
}

/** Case-insensitive by default; numeric comparison only when both sides parse. */
export const rowMatchesFilter = (row: string[], filter: RowFilter): boolean => {
  const raw = String(row[filter.col] ?? '').trim();
  if (filter.op === 'empty') return raw === '';
  if (filter.op === 'notEmpty') return raw !== '';

  const needle = filter.value.trim();
  if (needle === '') return true;
  const a = filter.caseSensitive ? raw : raw.toLowerCase();
  const b = filter.caseSensitive ? needle : needle.toLowerCase();

  if (filter.op === 'contains') return a.includes(b);
  if (filter.op === 'equals') return a === b;
  if (filter.op === 'notEquals') return a !== b;

  const na = numVal(raw);
  const nb = numVal(needle);
  if (na === null || nb === null) return false;
  if (filter.op === 'gt') return na > nb;
  if (filter.op === 'gte') return na >= nb;
  if (filter.op === 'lt') return na < nb;
  return na <= nb;
};

export const rowMatches = (grid: GridData, row: string[], filter: RowFilter | null): boolean =>
  !filter || filter.col < 0 || filter.col >= grid.cols.length || rowMatchesFilter(row, filter);

/** Row indexes (original positions) that pass the filter, in grid order. */
export const filterRowIndexes = (grid: GridData, filter: RowFilter | null): number[] =>
  grid.rows.reduce<number[]>((out, row, index) => {
    if (rowMatches(grid, row, filter)) out.push(index);
    return out;
  }, []);

/* ---------- Validation ---------- */

export interface ValidationIssue {
  r: number;
  c: number;
  value: string;
  colName: string;
}

export const findInvalid = (grid: GridData): ValidationIssue[] => {
  const out: ValidationIssue[] = [];
  grid.rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      const col = grid.cols[c];
      if (col && !validateValue(cell, col.type)) out.push({ r, c, value: cell, colName: col.name });
    });
  });
  return out;
};

export const invalidByColumn = (grid: GridData): { name: string; count: number; col: number }[] =>
  grid.cols.map((col, c) => ({
    name: col.name,
    col: c,
    count: grid.rows.filter((row) => !validateValue(row[c] ?? '', col.type)).length,
  }));

/* ---------- Re-exports: the public surface stays `grid/ops` ---------- */

export {
  addColumnEnd,
  computeColumn,
  deleteColumn,
  duplicateColumn,
  insertColumnAt,
  levelsFromColumnValues,
  mergeColumns,
  moveColumn,
  renameColumn,
  setColType,
  setColumnLevels,
  splitColumn,
  splitColumnAll,
} from './ops/columns';
export { recodeColumn, recodeColumnValues, type RecodeLevelsResult } from './ops/recode';
export {
  addRowEnd,
  clearGrid,
  deleteRow,
  fillMissing,
  insertRowAt,
  newGrid,
  removeDuplicateRows,
  removeEmptyRows,
  sortByColumn,
} from './ops/rows';
export {
  clearRange,
  fillDownRange,
  normRange,
  parseTsv,
  pasteTsvAt,
  rangeToTsv,
  setRangeValue,
  trimTrailingEmptyLines,
  type Range,
} from './ops/ranges';
export { coerceGrid, coerceValue, findReplace, trimGrid } from './ops/clean';
