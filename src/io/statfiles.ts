import { MAX_COLS, MAX_ROWS, toImportTable, type ImportTable } from './readers';
import type { ColType } from '../grid/types';

/**
 * SPSS `.sav` and Stata `.dta` import.
 *
 * The binary formats are read by `@irbisadm/statfmt` (a TypeScript port of
 * ReadStat). This module is the boundary: it turns the library's generic
 * dataset into the string grid the rest of LazStats speaks, while preserving
 * variable labels, value labels, dates and user-missing values.
 *
 * The parser is loaded lazily so the main bundle does not pay for the format
 * readers until the user actually imports a statistical file.
 */

type StatFormat = 'sav' | 'dta';

interface StatVariable {
  index?: number;
  name: string;
  label: string | null;
  type: number;
  format: string | null;
  valueLabels: { value: number | string; label: string }[] | null;
  missingRanges: { lo: number | string; hi: number | string }[];
}

interface StatDataset {
  variables: StatVariable[];
  rows: (number | string | null)[][];
}

const SPSS_EPOCH_SECONDS = Date.UTC(1582, 9, 14) / 1000;
const STATA_EPOCH_MS = Date.UTC(1960, 0, 1);

type DateKind = 'dat' | 'dtm' | 'tim';

const dateKindOf = (format: string | null): DateKind | null => {
  if (!format) return null;
  const value = format.trim();
  if (/^%t[cC]$/.test(value)) return 'dtm';
  if (/^%t[dmqhy]$/.test(value) || /^%d$/.test(value)) return 'dat';
  if (/^(DATETIME|DTIME)/i.test(value)) return value.toUpperCase().startsWith('DTIME') ? 'tim' : 'dtm';
  if (/^TIME/i.test(value)) return 'tim';
  if (/^(DATE|ADATE|EDATE|JDATE|SDATE)/i.test(value)) return 'dat';
  return null;
};

const pad = (value: number): string => String(value).padStart(2, '0');

const isoDate = (date: Date): string =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

const isoDateTime = (date: Date): string =>
  `${isoDate(date)} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;

const formatTime = (seconds: number): string => {
  const total = Math.abs(Math.floor(seconds)) % 86400;
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
};

/** Convert a format-specific date number to the matching ISO-like string. */
const convertDate = (value: number, format: string | null, kind: DateKind): string | null => {
  const raw = format?.trim() ?? '';
  let date: Date | null = null;
  if (/^%t[cC]$/.test(raw)) {
    date = new Date(STATA_EPOCH_MS + value);
  } else if (/^%t[dD]$/.test(raw) || /^%d$/.test(raw)) {
    date = new Date(STATA_EPOCH_MS + value * 86400000);
  } else if (/^%tm$/.test(raw)) {
    date = new Date(Date.UTC(1960, value, 1));
  } else if (/^%tq$/.test(raw)) {
    date = new Date(Date.UTC(1960 + Math.floor(value / 4), (value % 4) * 3, 1));
  } else if (/^%th$/.test(raw)) {
    date = new Date(Date.UTC(1960 + Math.floor(value / 2), (value % 2) * 6, 1));
  } else if (/^%ty$/.test(raw)) {
    date = new Date(Date.UTC(value, 0, 1));
  } else if (kind === 'tim') {
    return formatTime(value);
  } else {
    // SPSS dates are seconds since 1582-10-14; DATETIME keeps the fraction.
    date = new Date((value + SPSS_EPOCH_SECONDS) * 1000);
  }
  if (!date || Number.isNaN(date.getTime())) return null;
  return kind === 'dtm' ? isoDateTime(date) : isoDate(date);
};

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) return '';
  if (Object.is(value, -0)) return '0';
  return String(value);
};

const inMissingRange = (value: number | string | null, variable: StatVariable): boolean => {
  if (value === null || variable.missingRanges.length === 0) return false;
  if (typeof value === 'string') {
    return variable.missingRanges.some(range => value >= String(range.lo) && value <= String(range.hi));
  }
  return variable.missingRanges.some(range => value >= Number(range.lo) && value <= Number(range.hi));
};

const cellText = (
  value: number | string | null,
  variable: StatVariable,
  kind: DateKind | null
): string => {
  if (value === null) return '';
  // Keep user-missing sentinels in the grid and declare them on the column:
  // analyses mask them like blanks, but the original code is not lost.
  if (inMissingRange(value, variable)) {
    return typeof value === 'number' ? formatNumber(value) : value.trim();
  }
  if (typeof value === 'string') return value.trim();
  if (kind) return convertDate(value, variable.format, kind) ?? formatNumber(value);
  return formatNumber(value);
};

const missingCodes = (
  rows: (number | string | null)[][],
  variable: StatVariable,
  index: number
): string[] => {
  const seen = new Set<string>();
  for (const row of rows) {
    const value = row[index];
    if (value === null || !inMissingRange(value, variable)) continue;
    const code = typeof value === 'number' ? formatNumber(value) : value.trim();
    if (code !== '') seen.add(code);
  }
  return Array.from(seen);
};

const uniqueValues = (rows: (number | string | null)[][], index: number): boolean => {
  const seen = new Set<string>();
  for (const row of rows) {
    const value = row[index];
    if (value === null || value === '') continue;
    const key = String(value);
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
};

const allIntegers = (rows: (number | string | null)[][], index: number): boolean => {
  const values = rows.map(row => row[index]).filter((value): value is number => typeof value === 'number');
  return values.length > 0 && values.every(value => Number.isInteger(value));
};

const typeOf = (
  variable: StatVariable,
  rows: (number | string | null)[][],
  index: number,
  kind: DateKind | null,
  hasLabels: boolean
): ColType => {
  if (kind) return kind;
  if (hasLabels) return 'cat';
  if (variable.type === 0) return 'str';
  const lower = variable.name.trim().toLowerCase();
  if (lower === 'id' && uniqueValues(rows, index)) return 'id';
  return allIntegers(rows, index) ? 'int' : 'num';
};

const formatOf = (fileName: string, bytes: Uint8Array): StatFormat | null => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.sav')) return 'sav';
  if (lower.endsWith('.dta')) return 'dta';
  if (lower.endsWith('.zsav')) {
    throw new Error('Compressed .zsav files are not supported. Export the data as .sav or .dta.');
  }
  // Magic bytes: "$FL2" for SAV; DTA versions are ASCII digits in the header.
  const head = new TextDecoder('latin1').decode(bytes.slice(0, 8));
  if (head.startsWith('$FL2')) return 'sav';
  if (/^\d{3}[a-z]/.test(head) || head.startsWith('<stata_dta>')) return 'dta';
  return null;
};

/**
 * Read an SPSS or Stata file into the shared import table. Throws a
 * user-facing error for unsupported files, oversized data or parse failures.
 */
export const readStatFile = async (fileName: string, buffer: ArrayBuffer): Promise<ImportTable> => {
  const bytes = new Uint8Array(buffer);
  if (bytes.byteLength > 25_000_000) {
    throw new Error('The statistical file is too large (max 25 MB)');
  }
  const format = formatOf(fileName, bytes);
  if (!format) throw new Error('Unsupported statistical file: expected .sav or .dta');
  const { readData } = await import('@irbisadm/statfmt');
  let dataset: StatDataset;
  try {
    dataset = readData(format, bytes, { rowLimit: MAX_ROWS + 1 }) as unknown as StatDataset;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Could not read ${format.toUpperCase()} file: ${error.message}`
        : `Could not read ${format.toUpperCase()} file`
    );
  }

  const variables = dataset.variables.filter(variable => variable.name.trim() !== '');
  if (variables.length === 0) throw new Error('No variables found in the statistical file');
  if (variables.length > MAX_COLS) {
    throw new Error(`Too many columns (${variables.length} > ${MAX_COLS})`);
  }
  if (dataset.rows.length === 0) throw new Error('No data rows found in the statistical file');
  if (dataset.rows.length > MAX_ROWS) {
    throw new Error(`Too many rows (${dataset.rows.length} > ${MAX_ROWS})`);
  }

  const kinds = variables.map(variable => dateKindOf(variable.format));
  const names = variables.map(variable => variable.name);
  const rows = dataset.rows.map(row =>
    variables.map((variable, index) => cellText(row[variable.index ?? index] ?? null, variable, kinds[index]))
  );
  const types = variables.map((variable, index) =>
    typeOf(variable, dataset.rows, variable.index ?? index, kinds[index], (variable.valueLabels?.length ?? 0) > 0)
  );
  const meta = variables.map((variable, index) => {
    const levels = (variable.valueLabels ?? []).map(entry => ({
      value: typeof entry.value === 'number' ? formatNumber(entry.value) : String(entry.value),
      label: String(entry.label),
    }));
    const missing = missingCodes(dataset.rows, variable, variable.index ?? index);
    return {
      ...(variable.label?.trim() ? { label: variable.label.trim() } : {}),
      ...(levels.length > 0 ? { levels } : {}),
      ...(missing.length > 0 ? { missing } : {}),
    };
  });

  const table = toImportTable(names, rows, {
    hasHeader: true,
    decimalComma: false,
    typeOverrides: Object.fromEntries(types.map((type, index) => [index, type])),
  });
  return {
    ...table,
    meta,
    source: format === 'sav' ? 'spss' : 'stata',
  };
};
