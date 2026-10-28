import type { GridData } from './types';

const SAFE_EXPR = /^[A-Za-z0-9_+\-*/().\s^%]+$/;
const BLOCKED = new Set(['__proto__', 'prototype', 'constructor', 'V']);

/** Parse a cell as a number, accepting decimal commas. */
const numVal = (v: string): number | null => {
  const t = String(v ?? '').trim().replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return isNaN(n) ? null : n;
};

/**
 * Compile a column formula against the current column names.
 *
 * Returns one value per row; unparsable inputs become `''` (missing), like the
 * one-shot Compute panel. The expression is a small arithmetic language: column
 * names, numbers, `+ - * / % ^`, parentheses. Anything else is rejected.
 */
export const evalFormula = (
  expr: string,
  rows: readonly (readonly string[])[],
  colIndex: Record<string, number>
): { values: string[]; error?: string } => {
  const empty = rows.map(() => '');
  if (!SAFE_EXPR.test(expr)) return { values: empty, error: 'Unsafe characters in expression' };
  if (expr.length > 500) return { values: empty, error: 'Expression too long' };
  if (/__(?:proto|prototype|constructor)__/i.test(expr)) return { values: empty, error: 'Unsafe expression' };
  // Column names arrive from user data: only map sane identifiers, and skip
  // dangerous keys so a column literally named "__proto__" cannot pollute.
  const names = Object.keys(colIndex)
    .filter((n) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(n) && !BLOCKED.has(n))
    .sort((a, b) => b.length - a.length);
  let js = expr.replace(/\^/g, '**');
  names.forEach((name) => {
    js = js.replace(new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), `__v_${colIndex[name]}`);
  });
  if (/[A-Za-z_]/.test(js.replace(/__v_\d+/g, ''))) return { values: empty, error: 'Unknown column in expression' };
  // Belt and braces: no property access or call expressions may survive.
  if (/[.\[\];,{}'"`\\]/.test(js)) return { values: empty, error: 'Unsafe expression' };
  let fn: (vals: number[]) => number;
  try {
    fn = new Function('V', `return (${js.replace(/__v_(\d+)/g, 'V[$1]')});`) as (vals: number[]) => number;
  } catch {
    return { values: empty, error: 'Invalid expression' };
  }
  const values = rows.map((r) => {
    const nums = r.map((v) => {
      const n = numVal(v);
      return n === null ? NaN : n;
    });
    try {
      const val = fn(nums);
      return typeof val === 'number' && isFinite(val) ? String(val) : '';
    } catch {
      return '';
    }
  });
  return { values };
};

/** Name → index map used by formula evaluation. */
export const columnIndex = (cols: readonly { name: string }[]): Record<string, number> => {
  const index: Record<string, number> = {};
  cols.forEach((col, i) => {
    index[col.name] = i;
  });
  return index;
};

/**
 * Recompute every persistent formula column from the current data.
 *
 * Columns are evaluated left to right, so a formula can reference an earlier
 * computed column. A formula that no longer compiles (for example because a
 * referenced column was deleted) keeps its previous values instead of silently
 * blanking the column; undo of the structural edit restores the reference.
 */
export const recalculateFormulas = (grid: GridData): GridData => {
  const computed = grid.cols.map((col, index) => (col.formula?.trim() ? index : -1)).filter((c) => c >= 0);
  if (computed.length === 0) return grid;

  const cols = grid.cols;
  const index = columnIndex(cols);
  const rows = grid.rows.map((row) => [...row]);
  let changed = false;
  for (const c of computed) {
    const formula = cols[c].formula?.trim() ?? '';
    const { values, error } = evalFormula(formula, rows, index);
    if (error) continue;
    values.forEach((value, r) => {
      if (rows[r][c] !== value) {
        rows[r][c] = value;
        changed = true;
      }
    });
  }
  return changed ? { cols, rows } : grid;
};

/** Keep existing formulas valid when a column is renamed. */
export const renameFormulaReferences = (formula: string, from: string, to: string): string => {
  if (!formula || !from || from === to) return formula;
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return formula.replace(new RegExp(`\\b${escaped}\\b`, 'g'), to);
};
