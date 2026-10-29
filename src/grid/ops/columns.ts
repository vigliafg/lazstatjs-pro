import type { CategoryLevel, Column, ColType, GridData } from '../types';
import {
  MAX_LEVELS,
  createColumnId,
  distinctColumnValues,
  uniqueColName,
} from '../types';
import { evalFormula, formulaReferencesColumn, renameFormulaReferences } from '../formulas';

/* ---------- Column metadata ---------- */

export const renameColumn = (grid: GridData, c: number, name: string): GridData => {
  if (c < 0 || c >= grid.cols.length) return grid;
  const oldName = grid.cols[c].name;
  const clean = name.trim() || oldName;
  const dupe = grid.cols.some((col, i) => i !== c && col.name.toLowerCase() === clean.toLowerCase());
  const finalName = dupe ? uniqueColName(grid.cols, clean) : clean;
  return {
    cols: grid.cols.map((col, i) => {
      const next = i === c ? { ...col, name: finalName } : col;
      // Persistent formulas follow the rename instead of breaking.
      return next.formula
        ? { ...next, formula: renameFormulaReferences(next.formula, oldName, finalName) }
        : next;
    }),
    rows: grid.rows,
  };
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
  const copy: Column = {
    ...src,
    id: createColumnId(),
    name,
    levels: src.levels?.map((level) => ({ ...level })),
    missing: src.missing ? [...src.missing] : undefined,
  };
  const cols = [...grid.cols.slice(0, c + 1), copy, ...grid.cols.slice(c + 1)];
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
  if (grid.cols.length <= 1 || c < 0 || c >= grid.cols.length) return grid;
  return {
    cols: grid.cols
      .filter((_, i) => i !== c)
      .map((col) =>
        col.formula && formulaReferencesColumn(col.formula, grid.cols, c)
          ? { ...col, formula: undefined }
          : col
      ),
    rows: grid.rows.map((r) => r.filter((_, i) => i !== c)),
  };
};

export const splitColumn = (grid: GridData, col: number, sep: string, newName2?: string): GridData => {
  if (!sep) return grid;
  if (col < 0 || col >= grid.cols.length) return grid;
  const src = grid.cols[col];
  const name2 = uniqueColName(grid.cols, newName2?.trim() || `${src.name}_2`);
  const left: Column = { ...src, formula: undefined };
  const cols = [...grid.cols.slice(0, col), left, { id: createColumnId(), name: name2, type: src.type }, ...grid.cols.slice(col + 1)];
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

/**
 * Split every occurrence of `sep` into new columns. The original column keeps
 * the first part and its id; a file with a;b;c produces a, b, c. If no row
 * contains the separator the grid is returned unchanged.
 */
export const splitColumnAll = (grid: GridData, col: number, sep: string): GridData => {
  if (!sep || col < 0 || col >= grid.cols.length) return grid;
  const src = grid.cols[col];
  const parts = grid.rows.map((row) => String(row[col] ?? '').split(sep));
  const width = parts.reduce((max, row) => Math.max(max, row.length), 1);
  if (width <= 1) return grid;
  const names: string[] = [];
  for (let index = 2; index <= width; index += 1) {
    names.push(uniqueColName([...grid.cols, ...names.map((name) => ({ name, type: src.type }))], `${src.name}_${index}`));
  }
  const left: Column = { ...src, formula: undefined };
  const cols: Column[] = [
    ...grid.cols.slice(0, col),
    left,
    ...names.map((name) => ({ id: createColumnId(), name, type: src.type })),
    ...grid.cols.slice(col + 1),
  ];
  const rows = grid.rows.map((row, r) => {
    const cells = parts[r];
    const copy = [...row];
    copy[col] = cells[0] ?? '';
    copy.splice(col + 1, 0, ...names.map((_, index) => cells[index + 1] ?? ''));
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
  cols[lo] = {
    id: cols[lo].id,
    name: others.some((c) => c.name.toLowerCase() === raw.toLowerCase()) ? uniqueColName(others, raw) : raw,
    // The concatenation is text, not the old numeric/categorical variable:
    // formula, levels, reference, missing and label would all be misleading.
    type: 'str',
  };
  // Removing/renaming the source columns invalidates formulas in the other
  // columns; keep their last values but drop the stale formula.
  for (let i = 0; i < cols.length; i += 1) {
    const col = cols[i];
    if (i !== lo && col.formula &&
      (formulaReferencesColumn(col.formula, grid.cols, lo) || formulaReferencesColumn(col.formula, grid.cols, hi))) {
      cols[i] = { ...col, formula: undefined };
    }
  }
  const rows = grid.rows.map((r) => {
    const merged = [r[lo], r[hi]]
      .map(value => String(value ?? ''))
      .filter(value => value !== '')
      .join(sep);
    const copy = r.filter((_, i) => i !== hi);
    copy[lo] = merged;
    return copy;
  });
  return { cols, rows };
};

/* ---------- Computed columns ---------- */

/**
 * Append a computed column. When `formula` is passed the expression is stored
 * on the column and recalculated on every later edit; otherwise the values are
 * a one-shot snapshot.
 */
export const computeColumn = (
  grid: GridData,
  expr: string,
  newName: string,
  colIndex: Record<string, number>,
  formula?: string
): { grid: GridData; error?: string } => {
  const name = uniqueColName(grid.cols, newName.trim() || 'Computed');
  const cols: Column[] = [
    ...grid.cols,
    {
      id: createColumnId(),
      name,
      type: 'num' as ColType,
      ...(formula ? { formula } : {}),
    },
  ];
  // The new column is not part of the evaluation scope: a formula cannot
  // reference itself. Later formulas can reference it.
  const { values, error } = evalFormula(expr, grid.rows, colIndex);
  if (error) return { grid, error };
  return {
    grid: {
      cols,
      rows: grid.rows.map((row, r) => [...row, values[r] ?? '']),
    },
  };
};
