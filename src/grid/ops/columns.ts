import type { CategoryLevel, Column, ColType, GridData } from '../types';
import {
  MAX_LEVELS,
  createColumnId,
  distinctColumnValues,
  uniqueColName,
  validateValue,
} from '../types';
import { numVal } from './shared';

/* ---------- Column metadata ---------- */

export const renameColumn = (grid: GridData, c: number, name: string): GridData => {
  if (c < 0 || c >= grid.cols.length) return grid;
  const clean = name.trim() || grid.cols[c].name;
  const dupe = grid.cols.some((col, i) => i !== c && col.name.toLowerCase() === clean.toLowerCase());
  const finalName = dupe ? uniqueColName(grid.cols, clean) : clean;
  return { cols: grid.cols.map((col, i) => (i === c ? { ...col, name: finalName } : col)), rows: grid.rows };
};

export const setColType = (grid: GridData, c: number, type: ColType): GridData => ({
  cols: grid.cols.map((col, i) => (i === c ? { ...col, type } : col)),
  rows: grid.rows,
});

/**
 * Store the levels declared for a categorical column. Codes and labels are
 * trimmed, deduplicated (labels case-insensitively with a numeric suffix) and
 * capped; a reference level that no longer exists is dropped. Cell values are
 * never rewritten: existing data outside the list stays visible as "not in
 * the list".
 */
export const setColumnLevels = (
  grid: GridData,
  c: number,
  levels: CategoryLevel[],
  reference?: string
): GridData => {
  if (c < 0 || c >= grid.cols.length) return grid;
  const values = new Set<string>();
  const labels = new Set<string>();
  const clean: CategoryLevel[] = [];
  for (const level of levels) {
    if (clean.length >= MAX_LEVELS) break;
    const value = String(level?.value ?? '').trim();
    if (value === '' || values.has(value)) continue;
    const base = String(level?.label ?? '').trim() || value;
    let label = base;
    let suffix = 2;
    while (labels.has(label.toLowerCase())) {
      label = `${base} ${suffix}`;
      suffix += 1;
    }
    values.add(value);
    labels.add(label.toLowerCase());
    clean.push({ value, label });
  }
  const ref = reference && values.has(reference) ? reference : undefined;
  return {
    cols: grid.cols.map((col, i) =>
      i === c ? { ...col, levels: clean.length > 0 ? clean : undefined, reference: ref } : col
    ),
    rows: grid.rows,
  };
};

/** Merge the declared levels with every value present in the column. */
export const levelsFromColumnValues = (grid: GridData, c: number): CategoryLevel[] => {
  if (c < 0 || c >= grid.cols.length) return [];
  const col = grid.cols[c];
  const merged: CategoryLevel[] = (col.levels ?? []).map((level) => ({ ...level }));
  const known = new Set(merged.map((level) => level.value));
  distinctColumnValues(grid.rows, c).forEach((value) => {
    if (!known.has(value)) {
      known.add(value);
      merged.push({ value, label: value });
    }
  });
  return merged;
};

/* ---------- Structural column edits ---------- */

export const addColumnEnd = (grid: GridData): GridData => {
  const name = uniqueColName(grid.cols, `Var${grid.cols.length + 1}`);
  return { cols: [...grid.cols, { id: createColumnId(), name, type: 'num' as ColType }], rows: grid.rows.map((r) => [...r, '']) };
};

export const insertColumnAt = (grid: GridData, at: number): GridData => {
  const pos = Math.max(0, Math.min(grid.cols.length, at));
  const name = uniqueColName(grid.cols, `Var${grid.cols.length + 1}`);
  const cols = [...grid.cols.slice(0, pos), { id: createColumnId(), name, type: 'num' as ColType }, ...grid.cols.slice(pos)];
  return { cols, rows: grid.rows.map((r) => [...r.slice(0, pos), '', ...r.slice(pos)]) };
};

export const duplicateColumn = (grid: GridData, c: number): GridData => {
  if (c < 0 || c >= grid.cols.length) return grid;
  const src = grid.cols[c];
  const name = uniqueColName(grid.cols, `${src.name}_copy`);
  const cols = [...grid.cols.slice(0, c + 1), { id: createColumnId(), name, type: src.type }, ...grid.cols.slice(c + 1)];
  const rows = grid.rows.map((r) => [...r.slice(0, c + 1), r[c] ?? '', ...r.slice(c + 1)]);
  return { cols, rows };
};

export const moveColumn = (grid: GridData, c: number, dir: -1 | 1): GridData => {
  const t = c + dir;
  if (t < 0 || t >= grid.cols.length) return grid;
  const cols = [...grid.cols];
  [cols[c], cols[t]] = [cols[t], cols[c]];
  const rows = grid.rows.map((r) => {
    const copy = [...r];
    [copy[c], copy[t]] = [copy[t], copy[c]];
    return copy;
  });
  return { cols, rows };
};

export const deleteColumn = (grid: GridData, c: number): GridData => {
  if (grid.cols.length <= 1) return grid;
  return { cols: grid.cols.filter((_, i) => i !== c), rows: grid.rows.map((r) => r.filter((_, i) => i !== c)) };
};

export const splitColumn = (grid: GridData, col: number, sep: string, newName2?: string): GridData => {
  if (!sep) return grid;
  if (col < 0 || col >= grid.cols.length) return grid;
  const src = grid.cols[col];
  const name2 = uniqueColName(grid.cols, newName2?.trim() || `${src.name}_2`);
  const cols = [...grid.cols.slice(0, col + 1), { id: createColumnId(), name: name2, type: src.type }, ...grid.cols.slice(col + 1)];
  const rows = grid.rows.map((r) => {
    const v = String(r[col] ?? '');
    const idx = v.indexOf(sep);
    const left = idx < 0 ? v : v.slice(0, idx);
    const right = idx < 0 ? '' : v.slice(idx + sep.length);
    const copy = [...r];
    copy[col] = left;
    copy.splice(col + 1, 0, right);
    return copy;
  });
  return { cols, rows };
};

export const mergeColumns = (grid: GridData, a: number, b: number, sep: string, newName?: string): GridData => {
  if (a === b) return grid;
  if (a < 0 || b < 0 || a >= grid.cols.length || b >= grid.cols.length) return grid;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const raw = (newName?.trim() || `${grid.cols[lo].name}_${grid.cols[hi].name}`).trim() || 'Merged';
  const cols = grid.cols.filter((_, i) => i !== hi);
  // uniqueColName checks against the passed list: exclude the slot being
  // renamed so keeping the current name does not gain a spurious suffix.
  const others = cols.filter((_, i) => i !== lo);
  cols[lo] = { ...cols[lo], name: others.some((c) => c.name.toLowerCase() === raw.toLowerCase()) ? uniqueColName(others, raw) : raw };
  const rows = grid.rows.map((r) => {
    const merged = `${r[lo] ?? ''}${sep}${r[hi] ?? ''}`;
    const copy = r.filter((_, i) => i !== hi);
    copy[lo] = merged;
    return copy;
  });
  return { cols, rows };
};

/* ---------- Computed columns ---------- */

const SAFE_EXPR = /^[A-Za-z0-9_+\-*/().\s^%]+$/;

export const computeColumn = (
  grid: GridData,
  expr: string,
  newName: string,
  colIndex: Record<string, number>
): { grid: GridData; error?: string } => {
  if (!SAFE_EXPR.test(expr)) return { grid, error: 'Unsafe characters in expression' };
  if (expr.length > 500) return { grid, error: 'Expression too long' };
  if (/__(?:proto|prototype|constructor)__/i.test(expr)) return { grid, error: 'Unsafe expression' };
  // Column names arrive from user data: only map sane identifiers, and skip
  // dangerous keys so a column literally named "__proto__" cannot pollute.
  const BLOCKED = new Set(['__proto__', 'prototype', 'constructor', 'V']);
  const names = Object.keys(colIndex)
    .filter((n) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(n) && !BLOCKED.has(n))
    .sort((a, b) => b.length - a.length);
  let js = expr.replace(/\^/g, '**');
  names.forEach((name) => {
    js = js.replace(new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), `__v_${colIndex[name]}`);
  });
  if (/[A-Za-z_]/.test(js.replace(/__v_\d+/g, ''))) return { grid, error: 'Unknown column in expression' };
  // Belt and braces: no property access or call expressions may survive.
  if (/[.\[\];,{}'"`\\]/.test(js)) return { grid, error: 'Unsafe expression' };
  let fn: (vals: number[]) => number;
  try {
    fn = new Function('V', `return (${js.replace(/__v_(\d+)/g, 'V[$1]')});`) as (vals: number[]) => number;
  } catch {
    return { grid, error: 'Invalid expression' };
  }
  const name = uniqueColName(grid.cols, newName.trim() || 'Computed');
  const cols: Column[] = [...grid.cols, { id: createColumnId(), name, type: 'num' as ColType }];
  const rows = grid.rows.map((r) => {
    const nums = r.map((v) => {
      const n = numVal(v);
      return n === null ? NaN : n;
    });
    let out = '';
    try {
      const val = fn(nums);
      out = typeof val === 'number' && isFinite(val) ? String(val) : '';
    } catch {
      out = '';
    }
    return [...r, out];
  });
  return { grid: { cols, rows } };
};

/** Validate a cell against a declared type (re-exported for callers of ops). */
export { validateValue };
