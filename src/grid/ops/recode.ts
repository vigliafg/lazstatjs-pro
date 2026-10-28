import type { ColType, GridData } from '../types';
import { distinctColumnValues, validateValue } from '../types';
import { setColType, setColumnLevels } from './columns';

export interface RecodeLevelsResult {
  grid: GridData;
  /** Cells whose value actually changed. */
  changed: number;
  /** Cells emptied by mapping a code to "". */
  cleared: number;
  /** Groups that disappeared because two or more codes now share a target. */
  merged: number;
  /** Set when the new codes no longer satisfy the declared column type. */
  typeChangedTo?: ColType;
}

/**
 * Recode the group codes of one column: rename, merge (two codes mapped to the
 * same target) or clear (mapped to "") in a single pass. Every cell is matched
 * against its *original* value, so swaps like 1→2 and 2→1 behave as expected.
 * Declared levels follow the mapping, keeping their labels; a merged level
 * keeps the label of the first code that reaches the target. The reference
 * level follows its own code and is dropped when that code disappears. When
 * the new codes no longer fit the column type (for example text codes in an
 * `int` column) the type becomes `cat`, so validation stays honest.
 */
export const recodeColumnValues = (
  grid: GridData,
  c: number,
  mapping: Record<string, string>
): RecodeLevelsResult => {
  if (c < 0 || c >= grid.cols.length) return { grid, changed: 0, cleared: 0, merged: 0 };
  const map = new Map<string, string>();
  Object.entries(mapping ?? {}).forEach(([from, to]) => {
    const key = String(from ?? '').trim();
    if (key === '') return;
    map.set(key, String(to ?? '').trim());
  });
  if (map.size === 0) return { grid, changed: 0, cleared: 0, merged: 0 };

  let changed = 0;
  let cleared = 0;
  const rows = grid.rows.map((row) => {
    const raw = String(row[c] ?? '').trim();
    if (!map.has(raw)) return [...row];
    const next = map.get(raw) as string;
    if (next === raw) return [...row];
    changed += 1;
    if (next === '') cleared += 1;
    const copy = [...row];
    copy[c] = next;
    return copy;
  });

  const col = grid.cols[c];
  const levels = (col.levels ?? []).flatMap((level) => {
    if (!map.has(level.value)) return [{ ...level }];
    const next = map.get(level.value) as string;
    return next === '' ? [] : [{ value: next, label: level.label }];
  });
  const ref = col.reference && map.has(col.reference) ? map.get(col.reference) : col.reference;

  let next = setColumnLevels({ cols: grid.cols, rows }, c, levels, ref || undefined);
  // Groups that disappear minus the ones removed by clearing: a code emptied
  // by "clear" is not a merge, while 21 → 20 fuses into the existing group 20.
  const before = distinctColumnValues(grid.rows, c);
  const after = distinctColumnValues(rows, c);
  const clearedGroups = before.filter((value) => map.get(value) === '').length;
  const merged = Math.max(0, before.length - after.length - clearedGroups);
  let typeChangedTo: ColType | undefined;
  if (next.cols[c].type !== 'cat' && rows.some((row) => !validateValue(row[c] ?? '', next.cols[c].type))) {
    typeChangedTo = 'cat';
    next = setColType(next, c, 'cat');
  }
  return { grid: next, changed, cleared, merged, typeChangedTo };
};

/** Apply a plain value mapping; unmatched values can be kept or cleared. */
export const recodeColumn = (
  grid: GridData,
  col: number,
  mapping: Record<string, string>,
  unmatched: 'keep' | 'empty' = 'keep'
): { grid: GridData; changed: number } => {
  if (col < 0 || col >= grid.cols.length) return { grid, changed: 0 };
  let changed = 0;
  const rows = grid.rows.map((row) => {
    const v = row[col] ?? '';
    if (v in mapping) {
      if (mapping[v] !== v) changed += 1;
      const copy = [...row];
      copy[col] = mapping[v];
      return copy;
    }
    if (unmatched === 'empty' && String(v).trim() !== '') {
      changed += 1;
      const copy = [...row];
      copy[col] = '';
      return copy;
    }
    return [...row];
  });
  return { grid: { cols: grid.cols, rows }, changed };
};
