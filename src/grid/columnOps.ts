/**
 * Column-index operations shared by the grid and the analysis parameters.
 *
 * These functions are pure: they describe how an old column position maps to
 * the new one after a structural edit. They never look at analysis params.
 */

export type ColumnOperation =
  | { kind: 'insert'; at: number; count?: number }
  | { kind: 'delete'; at: number; count?: number }
  | { kind: 'move'; from: number; to: number }
  | { kind: 'split'; at: number; count?: number }
  | { kind: 'merge'; a: number; b: number }
  | { kind: 'map'; map: Record<number, number> }
  | { kind: 'reset' };

/** Map one column index; `-1` (no selection) stays `-1`. */
export const mapColumnIndex = (index: number, op: ColumnOperation): number => {
  if (index < 0) return -1;
  switch (op.kind) {
    case 'insert': {
      const count = Math.max(1, op.count ?? 1);
      return index < op.at ? index : index + count;
    }
    case 'delete': {
      const count = Math.max(1, op.count ?? 1);
      if (index < op.at) return index;
      if (index < op.at + count) return -1;
      return index - count;
    }
    case 'move': {
      if (op.from === op.to || index === op.from) return op.to;
      if (op.from < op.to) return index > op.from && index <= op.to ? index - 1 : index;
      return index >= op.to && index < op.from ? index + 1 : index;
    }
    case 'split': {
      // Split all inserts `count` columns after `at`; the plain split inserts 1.
      const count = Math.max(1, op.count ?? 1);
      if (index < op.at) return index;
      if (index === op.at) return -1;
      return index + count;
    }
    case 'merge': {
      const lo = Math.min(op.a, op.b);
      const hi = Math.max(op.a, op.b);
      if (index < lo) return index;
      if (index === lo || index === hi) return -1;
      if (index < hi) return index;
      return index - 1;
    }
    case 'map':
      return op.map[index] ?? -1;
    case 'reset':
      return -1;
  }
};

/** Map and deduplicate a list of column indexes, dropping invalid roles. */
export const mapColumnIndexes = (
  indexes: readonly number[],
  op: ColumnOperation
): number[] => {
  const mapped = indexes.map(index => mapColumnIndex(index, op)).filter(index => index >= 0);
  return Array.from(new Set(mapped));
};

/** Number of columns left after an operation, when it is known. */
export const columnCountAfter = (width: number, op: ColumnOperation): number => {
  switch (op.kind) {
    case 'insert':
      return width + Math.max(1, op.count ?? 1);
    case 'delete':
      return Math.max(0, width - Math.max(1, op.count ?? 1));
    case 'split':
      return width + Math.max(1, op.count ?? 1);
    case 'merge':
      return Math.max(0, width - 1);
    case 'move':
    case 'reset':
    case 'map':
      return width;
  }
};
