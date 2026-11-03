/**
 * Data-shape adapters shared by the import wizard and the future procedures.
 *
 * New methods do not all read a rectangular wide table: repeated measures and
 * paired designs need long/wide pivots, time-dependent survival needs
 * start-stop intervals, SEM/IRT need a numeric matrix, text mining needs a
 * document-term matrix. Keeping the transformations here means the same rules
 * (stable ordering, explicit duplicate handling, no silent coercion) apply to
 * every caller.
 *
 * `ShapeTable` is structural, so `ImportTable` and the grid table both fit.
 */

export interface ShapeTable {
  names: readonly string[];
  rows: readonly (readonly string[])[];
}

export interface ShapeTableResult {
  names: string[];
  rows: string[][];
}

const EMPTY = '';

const number = (value: string | undefined): number =>
  value === undefined ? Number.NaN : Number.parseFloat(value.trim().replace(',', '.'));

const isBlank = (value: string | undefined): boolean => (value ?? '').trim().length === 0;

const assertIndices = (label: string, table: ShapeTable, indices: readonly number[]): void => {
  for (const index of indices) {
    if (!Number.isInteger(index) || index < 0 || index >= table.names.length) {
      throw new Error(`${label}: column index ${index} is out of range`);
    }
  }
};

export interface WideToLongOptions {
  /** Columns kept as identifiers, repeated on every produced row. */
  idColumns: readonly number[];
  /** Columns pivoted into `<variableName>` / `<valueName>`. */
  valueColumns: readonly number[];
  variableName?: string;
  valueName?: string;
  /** Drop empty cells instead of emitting a blank value (default `true`). */
  skipMissing?: boolean;
}

/** One row per (original row × value column). */
export const wideToLong = (table: ShapeTable, options: WideToLongOptions): ShapeTableResult => {
  const { idColumns, valueColumns } = options;
  const variableName = options.variableName ?? 'Variable';
  const valueName = options.valueName ?? 'Value';
  const skipMissing = options.skipMissing ?? true;
  if (valueColumns.length === 0) throw new Error('wideToLong: at least one value column is required');
  assertIndices('wideToLong', table, [...idColumns, ...valueColumns]);
  if (new Set(idColumns).size !== idColumns.length || new Set(valueColumns).size !== valueColumns.length) {
    throw new Error('wideToLong: duplicate column index');
  }
  if (idColumns.some(index => valueColumns.includes(index))) {
    throw new Error('wideToLong: a column cannot be both id and value');
  }
  const names = [...idColumns.map(index => table.names[index]), variableName, valueName];
  if (new Set(names).size !== names.length) throw new Error('wideToLong: duplicated output column name');

  const rows: string[][] = [];
  for (const row of table.rows) {
    const ids = idColumns.map(index => row[index] ?? EMPTY);
    for (const column of valueColumns) {
      const value = row[column] ?? EMPTY;
      if (skipMissing && isBlank(value)) continue;
      rows.push([...ids, table.names[column], value]);
    }
  }
  return { names, rows };
};

export interface LongToWideOptions {
  /** Columns that identify one unit (subject, group, …). */
  idColumns: readonly number[];
  /** Column holding the repeated-measure label. */
  keyColumn: number;
  /** Column holding the value. */
  valueColumn: number;
}

/**
 * Pivot long to wide. Keys and identifier combinations keep their first-seen
 * order; a duplicated (ids, key) pair is an error instead of a silent
 * last-wins overwrite.
 */
export const longToWide = (table: ShapeTable, options: LongToWideOptions): ShapeTableResult => {
  const { idColumns, keyColumn, valueColumn } = options;
  assertIndices('longToWide', table, [...idColumns, keyColumn, valueColumn]);
  if (new Set([...idColumns, keyColumn, valueColumn]).size !== idColumns.length + 2) {
    throw new Error('longToWide: id, key and value columns must be distinct');
  }

  const keys: string[] = [];
  const rowsByKey = new Map<string, Map<string, string>>();
  const idOrder: string[] = [];
  const idValues = new Map<string, string[]>();

  table.rows.forEach((row, rowIndex) => {
    const ids = idColumns.map(index => row[index] ?? EMPTY);
    const key = row[keyColumn] ?? EMPTY;
    if (key.trim().length === 0) throw new Error(`longToWide: empty key at row ${rowIndex + 1}`);
    const id = JSON.stringify(ids);
    if (!idValues.has(id)) {
      idValues.set(id, ids);
      idOrder.push(id);
    }
    if (!rowsByKey.has(key)) {
      rowsByKey.set(key, new Map());
      keys.push(key);
    }
    const bucket = rowsByKey.get(key)!;
    if (bucket.has(id)) throw new Error(`longToWide: duplicate id/key at row ${rowIndex + 1}`);
    bucket.set(id, row[valueColumn] ?? EMPTY);
  });

  const names = [...idColumns.map(index => table.names[index]), ...keys];
  const rows = idOrder.map(id => {
    const ids = idValues.get(id)!;
    return [...ids, ...keys.map(key => rowsByKey.get(key)!.get(id) ?? EMPTY)];
  });
  return { names, rows };
};

export interface StartStopOptions {
  startColumn: number;
  stopColumn: number;
  /** Omit for a single-event table where every row is an event. */
  eventColumn?: number;
}

export interface StartStopInterval {
  /** 0-based row in the source table. */
  row: number;
  start: number;
  stop: number;
  event: number;
}

export interface StartStopResult {
  intervals: StartStopInterval[];
  /** Rows dropped because of non-numeric times, `stop <= start` or a non-0/1 event. */
  skipped: number;
}

/** Validate a start-stop table into the interval list used by time-dependent Cox. */
export const startStopIntervals = (table: ShapeTable, options: StartStopOptions): StartStopResult => {
  const columns = [options.startColumn, options.stopColumn, options.eventColumn].filter(
    (value): value is number => value !== undefined
  );
  assertIndices('startStopIntervals', table, columns);
  const intervals: StartStopInterval[] = [];
  let skipped = 0;

  table.rows.forEach((row, rowIndex) => {
    const start = number(row[options.startColumn]);
    const stop = number(row[options.stopColumn]);
    const event = options.eventColumn === undefined ? 1 : number(row[options.eventColumn]);
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(stop) ||
      !(stop > start) ||
      (event !== 0 && event !== 1)
    ) {
      skipped += 1;
      return;
    }
    intervals.push({ row: rowIndex, start, stop, event });
  });
  return { intervals, skipped };
};

export interface MatrixFromGridOptions {
  /** Columns extracted, in order. */
  columns: readonly number[];
  requireSquare?: boolean;
  requireSymmetric?: boolean;
  /** Absolute tolerance used for the symmetry check (default `1e-8`). */
  tolerance?: number;
}

export interface NumericMatrix {
  labels: string[];
  values: number[][];
}

/**
 * Extract a numeric matrix. Rows that are entirely blank are ignored; a row
 * with a missing or non-numeric cell makes the extraction fail (`null`) rather
 * than producing a matrix with hidden zeros.
 */
export const matrixFromGrid = (
  table: ShapeTable,
  options: MatrixFromGridOptions
): NumericMatrix | null => {
  const { columns } = options;
  if (columns.length === 0) return null;
  if (columns.some(index => !Number.isInteger(index) || index < 0 || index >= table.names.length)) {
    return null;
  }
  const tolerance = options.tolerance ?? 1e-8;
  const values: number[][] = [];
  for (const row of table.rows) {
    if (columns.every(index => isBlank(row[index]))) continue;
    const parsed = columns.map(index => number(row[index]));
    if (parsed.some(value => !Number.isFinite(value))) return null;
    values.push(parsed);
  }
  const width = columns.length;
  if (values.length === 0) return null;
  if (values.some(row => row.length !== width)) return null;
  if (options.requireSquare && values.length !== width) return null;
  if (options.requireSymmetric) {
    if (values.length !== width) return null;
    for (let i = 0; i < width; i += 1) {
      for (let j = i + 1; j < width; j += 1) {
        const scale = Math.max(1, Math.abs(values[i][j]), Math.abs(values[j][i]));
        if (Math.abs(values[i][j] - values[j][i]) > tolerance * scale) return null;
      }
    }
  }
  return { labels: columns.map(index => table.names[index]), values };
};

export interface TokenizeOptions {
  /** Minimum token length (default 2, so single letters do not enter the vocabulary). */
  minLength?: number;
}

/** Lower-case Unicode words and numbers; everything else is a separator. */
export const tokenize = (text: string, options: TokenizeOptions = {}): string[] => {
  const minLength = options.minLength ?? 2;
  return text
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(token => token.length >= minLength);
};

export interface TextDocument {
  id: string;
  text: string;
}

export interface DocumentTermMatrixOptions extends TokenizeOptions {
  /** Keep only the most frequent terms (0 or omitted keeps all). */
  maxTerms?: number;
}

export interface DocumentTermMatrix {
  documentIds: string[];
  /** Terms sorted by total frequency (descending) and then alphabetically. */
  terms: string[];
  /** `counts[document][term]`. */
  counts: number[][];
}

/** Build a document-term count matrix with a deterministic vocabulary. */
export const documentTermMatrix = (
  documents: readonly TextDocument[],
  options: DocumentTermMatrixOptions = {}
): DocumentTermMatrix => {
  const perDocument = documents.map(document => {
    const counts = new Map<string, number>();
    for (const token of tokenize(document.text, options)) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
    return counts;
  });

  const totals = new Map<string, number>();
  perDocument.forEach(counts => {
    counts.forEach((count, term) => totals.set(term, (totals.get(term) ?? 0) + count));
  });
  let terms = [...totals.keys()].sort((left, right) => {
    const difference = (totals.get(right) ?? 0) - (totals.get(left) ?? 0);
    return difference !== 0 ? difference : left.localeCompare(right);
  });
  if (options.maxTerms && options.maxTerms > 0) terms = terms.slice(0, options.maxTerms);

  const index = new Map(terms.map((term, position) => [term, position]));
  const counts = perDocument.map(documentCounts => {
    const row = new Array<number>(terms.length).fill(0);
    documentCounts.forEach((count, term) => {
      const position = index.get(term);
      if (position !== undefined) row[position] = count;
    });
    return row;
  });

  return { documentIds: documents.map(document => document.id), terms, counts };
};
