import { createHash } from 'node:crypto';
import type { Dataset } from '../grid/types';
import { readJsonTable } from '../io/readers';
import { datasetFromTable, loadDataset, type LoadedDataset } from '../engine';
import { McpError } from './errors';
import { MAX_INLINE_BYTES, MAX_INLINE_ROWS, MAX_ROWS } from './limits';
import type { PathGuard } from './paths';

export interface DatasetOptions {
  format?: string;
  delimiter?: string;
  header?: boolean;
  decimalComma?: boolean;
  sheet?: string | number;
  types?: string;
  missing?: string;
  maxRows?: number;
}

export interface McpDataset {
  source: string;
  format: string;
  sha256: string;
  grid: Dataset;
  truncated: boolean;
}

const inlineText = (data: unknown): string => {
  let text: string;
  try {
    text = JSON.stringify(data);
  } catch {
    throw new McpError({
      code: 'E_DATA',
      kind: 'invalid_inline_data',
      stage: 'load',
      message: 'The inline data is not JSON-serializable',
    });
  }
  if (typeof text !== 'string') {
    throw new McpError({
      code: 'E_DATA',
      kind: 'invalid_inline_data',
      stage: 'load',
      message: 'The inline data must be a JSON value',
    });
  }
  if (Buffer.byteLength(text, 'utf8') > MAX_INLINE_BYTES) {
    throw new McpError({
      code: 'E_DATA',
      kind: 'inline_too_large',
      stage: 'load',
      message: 'Inline data exceeds the 1 MiB limit',
    });
  }
  return text;
};

export const inlineDataset = (data: unknown): McpDataset => {
  const text = inlineText(data);
  let table;
  try {
    table = readJsonTable(text);
  } catch (error) {
    throw new McpError({
      code: 'E_DATA',
      kind: 'invalid_inline_data',
      stage: 'load',
      message: error instanceof Error ? error.message : 'Cannot parse inline data',
    });
  }
  if (table.rows.length > MAX_INLINE_ROWS) {
    table = { ...table, rows: table.rows.slice(0, MAX_INLINE_ROWS) };
  }
  return {
    source: '(inline)',
    format: 'json',
    sha256: createHash('sha256').update(text).digest('hex'),
    grid: datasetFromTable(table),
    truncated: table.rows.length >= MAX_INLINE_ROWS,
  };
};

const toMcpDataset = (loaded: LoadedDataset): McpDataset => ({
  source: loaded.source,
  format: loaded.format,
  sha256: loaded.sha256,
  grid: loaded.grid,
  truncated: loaded.truncated === true,
});

const cleanOptions = (options: DatasetOptions): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const key of ['format', 'delimiter', 'header', 'decimalComma', 'sheet', 'types', 'missing']) {
    const value = options[key as keyof DatasetOptions];
    if (value !== undefined) result[key] = value;
  }
  return result;
};

export const loadFromPath = async (
  guard: PathGuard,
  input: string,
  options: DatasetOptions = {}
): Promise<McpDataset> => {
  const path = guard.resolve(input);
  const maxRows = Math.min(options.maxRows ?? MAX_ROWS, MAX_ROWS);
  const loaded = await loadDataset(path, { ...cleanOptions(options), maxRows } as never);
  return toMcpDataset(loaded);
};

export const previewRows = (grid: Dataset, limit: number): string[][] =>
  grid.rows.slice(0, limit).map(row =>
    row.map(value => {
      const text = String(value ?? '');
      return text.length > 200 ? `${text.slice(0, 197)}...` : text;
    })
  );

export const columnMetadata = (grid: Dataset) =>
  grid.cols.map((column, index) => ({
    index,
    name: column.name,
    type: column.type,
    ...(column.label ? { label: column.label } : {}),
    ...(column.levels ? { levels: column.levels } : {}),
    ...(column.reference ? { reference: column.reference } : {}),
    ...(column.missing ? { missing: column.missing } : {}),
  }));
