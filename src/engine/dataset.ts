import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import type { ColType, Column, Dataset } from '../grid/types';
import { COL_TYPES } from '../grid/types';
import { detectFormat, type Delimiter } from '../io/detect';
import { readDelimitedTable, readJsonTable, type ImportTable } from '../io/readers';
import { readStatFile } from '../io/statfiles';
import { readXlsxSheets, xlsxSheetToTable } from '../io/xlsx';
import { EngineError } from './errors';

export interface LoadDatasetOptions {
  delimiter?: string;
  header?: boolean;
  decimalComma?: boolean;
  sheet?: string | number;
  types?: string;
  missing?: string;
  /** Force a reader instead of deriving it from the file extension. */
  format?: string;
  /** Keep at most this many data rows after parsing. */
  maxRows?: number;
}

export interface LoadedDataset {
  source: string;
  format: string;
  sha256: string;
  table: ImportTable;
  grid: Dataset;
  truncated?: boolean;
}

const typeIds = new Set<string>(COL_TYPES.map(type => type.id));

const extension = (path: string): string => extname(path).toLowerCase();

const INPUT_FORMATS = new Set(['csv', 'tsv', 'txt', 'pipe', 'json', 'xlsx', 'xls', 'sav', 'dta']);

const inputExtension = (path: string, format: string | undefined): string => {
  if (!format) return extension(path);
  const normalized = format.toLowerCase();
  if (!INPUT_FORMATS.has(normalized)) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'invalid_value',
      stage: 'args',
      message: `Unknown input format: ${format}`,
      details: { format, allowed: [...INPUT_FORMATS] },
    });
  }
  return `.${normalized}`;
};

const delimiterValue = (value: string | undefined, fallback: Delimiter): Delimiter => {
  if (!value || value === 'auto') return fallback;
  if (value === 'tab' || value === '\\t') return '\t';
  if (value === 'comma') return ',';
  if (value === 'semicolon') return ';';
  if (value === 'pipe' || value === '|') return '|';
  if (value === ',' || value === ';') return value;
  throw new EngineError({
    code: 'E_ARGS',
    kind: 'invalid_value',
    stage: 'args',
    message: `Unknown delimiter: ${value}`,
  });
};

const applyTypes = (table: ImportTable, spec: string | undefined): void => {
  if (!spec) return;
  for (const item of spec.split(',')) {
    const [name, type] = item.split(':').map(part => part.trim());
    if (!name || !type) {
      throw new EngineError({
        code: 'E_PARAMS',
        kind: 'invalid_value',
        stage: 'params',
        message: `Invalid --types entry: ${item} (expected Name:type)`,
      });
    }
    if (!typeIds.has(type)) {
      throw new EngineError({
        code: 'E_PARAMS',
        kind: 'invalid_value',
        stage: 'params',
        message: `Unknown column type: ${type}`,
        details: { type, allowed: [...typeIds] },
      });
    }
    const index = table.names.findIndex(column => column === name);
    if (index < 0) {
      throw new EngineError({
        code: 'E_PARAMS',
        kind: 'column_not_found',
        stage: 'params',
        message: `Unknown column in --types: ${name}`,
        details: { column: name, columns: table.names },
      });
    }
    table.types[index] = type as ColType;
  }
};

const applyMissing = (table: ImportTable, spec: string | undefined): void => {
  if (!spec) return;
  const entries = spec.split(',').map(part => part.trim()).filter(Boolean);
  const byColumn = new Map<number, string[]>();
  for (const entry of entries) {
    const equals = entry.indexOf('=');
    if (equals < 0) {
      table.names.forEach((_, index) => {
        byColumn.set(index, [...(byColumn.get(index) ?? []), entry]);
      });
      continue;
    }
    const name = entry.slice(0, equals).trim();
    const values = entry.slice(equals + 1).split('|').map(value => value.trim()).filter(Boolean);
    const index = table.names.findIndex(column => column === name);
    if (index < 0) {
      throw new EngineError({
        code: 'E_PARAMS',
        kind: 'column_not_found',
        stage: 'params',
        message: `Unknown column in --missing: ${name}`,
        details: { column: name, columns: table.names },
      });
    }
    byColumn.set(index, [...(byColumn.get(index) ?? []), ...values]);
  }
  table.meta = table.names.map((_, index) => ({
    ...(table.meta?.[index] ?? {}),
    ...(byColumn.has(index) ? { missing: byColumn.get(index) } : {}),
  }));
};

const toDataset = (table: ImportTable): Dataset => ({
  cols: table.names.map((name, index): Column => ({
    name,
    type: table.types[index],
    ...(table.meta?.[index]?.label ? { label: table.meta[index].label } : {}),
    ...(table.meta?.[index]?.levels ? { levels: table.meta[index].levels } : {}),
    ...(table.meta?.[index]?.reference ? { reference: table.meta[index].reference } : {}),
    ...(table.meta?.[index]?.missing ? { missing: table.meta[index].missing } : {}),
  })),
  rows: table.rows,
});

const readDelimited = (
  path: string,
  text: string,
  options: LoadDatasetOptions
): ImportTable => {
  const detection = detectFormat(path, text);
  const delimiter = delimiterValue(options.delimiter, detection.delimiter);
  const table = readDelimitedTable(text, {
    delimiter,
    hasHeader: options.header ?? detection.hasHeader,
    decimalComma: options.decimalComma ?? detection.decimalComma,
  });
  applyTypes(table, options.types);
  applyMissing(table, options.missing);
  return table;
};

const readWorkbook = (
  path: string,
  buffer: Buffer,
  options: LoadDatasetOptions
): ImportTable => {
  const sheets = readXlsxSheets(buffer);
  let sheet = sheets[0];
  if (options.sheet !== undefined) {
    sheet =
      typeof options.sheet === 'number'
        ? sheets[options.sheet]
        : sheets.find(item => item.name === options.sheet);
    if (!sheet) {
      throw new EngineError({
        code: 'E_DATA',
        kind: 'missing_sheet',
        stage: 'load',
        message: `Worksheet not found: ${String(options.sheet)}`,
        details: { sheet: options.sheet, sheets: sheets.map(item => item.name) },
      });
    }
  }
  const table = xlsxSheetToTable(sheet, {
    hasHeader: options.header ?? true,
    decimalComma: options.decimalComma,
  });
  applyTypes(table, options.types);
  applyMissing(table, options.missing);
  return table;
};

/** Load one dataset and retain the exact file hash used by the envelope. */
export const loadDataset = async (
  path: string,
  options: LoadDatasetOptions = {}
): Promise<LoadedDataset> => {
  let buffer: Buffer;
  try {
    buffer = readFileSync(path);
  } catch (error) {
    throw new EngineError({
      code: 'E_DATA',
      kind: 'file_not_found',
      stage: 'load',
      message: error instanceof Error ? error.message : `Cannot read ${path}`,
      details: { path },
    });
  }

  const hash = createHash('sha256').update(buffer).digest('hex');
  const ext = inputExtension(path, options.format);
  let table: ImportTable;
  let format: string;
  try {
    if (ext === '.csv' || ext === '.tsv' || ext === '.tab' || ext === '.txt' || ext === '.pipe') {
      format = ext === '.tsv' || ext === '.tab' ? 'tsv' : 'csv';
      table = readDelimited(path, buffer.toString('utf8'), options);
    } else if (ext === '.json') {
      format = 'json';
      table = readJsonTable(buffer.toString('utf8'));
      applyTypes(table, options.types);
      applyMissing(table, options.missing);
    } else if (ext === '.xlsx' || ext === '.xls') {
      format = 'xlsx';
      table = readWorkbook(path, buffer, options);
    } else if (ext === '.sav' || ext === '.dta') {
      format = ext.slice(1);
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      ) as ArrayBuffer;
      table = await readStatFile(path, arrayBuffer);
      applyTypes(table, options.types);
      applyMissing(table, options.missing);
    } else if (ext === '.lzs') {
      throw new EngineError({
        code: 'E_ARGS',
        kind: 'invalid_value',
        stage: 'args',
        message: 'A .lzs project must be loaded with --project, not --data',
      });
    } else {
      throw new EngineError({
        code: 'E_DATA',
        kind: 'unsupported_format',
        stage: 'load',
        message: `Unsupported dataset format: ${ext || '(no extension)'}`,
        details: { path, extension: ext },
      });
    }
  } catch (error) {
    if (error instanceof EngineError) throw error;
    throw new EngineError({
      code: 'E_DATA',
      kind: 'parse_error',
      stage: 'load',
      message: error instanceof Error ? error.message : `Cannot parse ${path}`,
      details: { path },
    });
  }

  const truncated = options.maxRows !== undefined && table.rows.length > options.maxRows;
  if (truncated) table = { ...table, rows: table.rows.slice(0, options.maxRows) };
  return {
    source: path,
    format,
    sha256: hash,
    table,
    grid: toDataset(table),
    ...(truncated ? { truncated: true } : {}),
  };
};
