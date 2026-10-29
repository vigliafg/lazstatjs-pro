import type { ColType, GridData } from '../types';

const BOOL_MAP: Record<string, string> = {
  true: '1', yes: '1', y: '1', t: '1', vero: '1', si: '1',
  false: '0', no: '0', n: '0', f: '0', falso: '0',
};

/** Best-effort coercion: trim, decimal comma, booleans; returns changed count. */
export const coerceValue = (val: string, type: ColType): string => {
  const t = val.trim();
  if (t === '') return '';
  if (type === 'bol') {
    const low = t.toLowerCase();
    if (low === '0' || low === '1') return low;
    if (low in BOOL_MAP) return BOOL_MAP[low];
    return val;
  }
  if (type === 'num' || type === 'int' || type === 'dec') {
    // 'num' is the permissive auto-detect column: only trim, never rewrite.
    if (type === 'num') return t === val ? val : t;
    let dot = t;
    // Handle thousands + decimal comma ("1.234,56") vs plain decimal comma ("1,5").
    const hasComma = dot.includes(',');
    const hasDot = dot.includes('.');
    if (hasComma && hasDot) {
      const lastComma = dot.lastIndexOf(',');
      const lastDot = dot.lastIndexOf('.');
      dot = lastComma > lastDot ? dot.replace(/\./g, '').replace(',', '.') : dot.replace(/,/g, '');
    } else if (hasComma) {
      dot = dot.replace(',', '.');
    }
    if (type === 'int') {
      const n = Number(dot);
      if (dot.trim() !== '' && Number.isInteger(n)) return String(n);
      return val;
    }
    if (/^-?\d*\.?\d+(e[+-]?\d+)?$/i.test(dot)) return dot;
    return val;
  }
  return type === 'str' ? val : t;
};

export const coerceGrid = (grid: GridData): { grid: GridData; changed: number } => {
  let changed = 0;
  const rows = grid.rows.map((row) =>
    row.map((cell, c) => {
      const col = grid.cols[c];
      if (!col) return cell;
      const next = coerceValue(cell ?? '', col.type);
      if (next !== cell) changed += 1;
      return next;
    })
  );
  return { grid: { cols: grid.cols, rows }, changed };
};

export const findReplace = (
  grid: GridData,
  search: string,
  replace: string,
  opts: { regex?: boolean; matchCase?: boolean; col?: number | null } = {}
): { grid: GridData; count: number } => {
  if (!search) return { grid, count: 0 };
  let count = 0;
  let re: RegExp | null = null;
  if (opts.regex) {
    try {
      re = new RegExp(search, opts.matchCase ? 'g' : 'gi');
    } catch {
      return { grid, count: 0 };
    }
  }
  const needle = opts.matchCase ? search : search.toLowerCase();
  const rows = grid.rows.map((row) =>
    row.map((cell, c) => {
      if (opts.col !== null && opts.col !== undefined && c !== opts.col) return cell;
      const v = cell ?? '';
      if (re) {
        // '$$' in the replacement would otherwise insert a literal '$'.
        const next = v.replace(re, () => replace);
        if (next !== v) count += 1;
        return next;
      }
      const hay = opts.matchCase ? v : v.toLowerCase();
      if (!hay.includes(needle)) return cell;
      count += 1;
      if (opts.matchCase) return v.split(search).join(replace);
      // case-insensitive replace preserving rest
      let out = '';
      let rest = v;
      let idx = hay.indexOf(needle);
      while (idx >= 0) {
        out += rest.slice(0, idx) + replace;
        rest = rest.slice(idx + search.length);
        idx = (opts.matchCase ? rest : rest.toLowerCase()).indexOf(needle);
      }
      return out + rest;
    })
  );
  return { grid: { cols: grid.cols, rows }, count };
};

export const trimGrid = (grid: GridData): { grid: GridData; changed: number } => {
  let changed = 0;
  const rows = grid.rows.map((row) =>
    row.map((cell) => {
      const next = String(cell ?? '').trim().replace(/\s+/g, ' ');
      if (next !== cell) changed += 1;
      return next;
    })
  );
  return { grid: { cols: grid.cols, rows }, changed };
};
