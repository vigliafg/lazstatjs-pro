import type { CallToolResult } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { columnMetadata, inlineDataset, loadFromPath, previewRows } from '../data';
import { McpError } from '../errors';
import { DEFAULT_PREVIEW_ROWS, MAX_PREVIEW_ROWS, MAX_ROWS } from '../limits';
import type { PathGuard } from '../paths';

export const inspectDatasetInput = z.object({
  path: z.string().optional(),
  dataPath: z.string().optional(),
  data: z.unknown().optional(),
  format: z.string().optional(),
  delimiter: z.string().optional(),
  header: z.boolean().optional(),
  hasHeader: z.boolean().optional(),
  decimalComma: z.boolean().optional(),
  sheet: z.union([z.string(), z.number().int().min(0)]).optional(),
  types: z.string().optional(),
  missing: z.string().optional(),
  maxRows: z.number().int().min(1).max(MAX_ROWS).optional(),
  previewRows: z.number().int().min(1).max(MAX_PREVIEW_ROWS).optional(),
});

export type InspectDatasetArgs = z.infer<typeof inspectDatasetInput>;

export const inspectDatasetOutput = z.object({
  schemaVersion: z.number(),
  source: z.string(),
  format: z.string(),
  sha256: z.string(),
  rows: z.number(),
  columns: z.number(),
  truncated: z.boolean(),
  columnsMeta: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      label: z.string().nullable(),
      missing: z.array(z.unknown()),
      levels: z.array(z.unknown()),
      reference: z.string().optional(),
    })
  ),
  preview: z.array(z.array(z.string())),
});

export const inspectDatasetTool = async (
  args: InspectDatasetArgs,
  guard: PathGuard
): Promise<CallToolResult> => {
  const pathInput = args.path ?? args.dataPath;
  const hasPath = pathInput !== undefined;
  const hasData = args.data !== undefined;
  if (hasPath === hasData || (args.path !== undefined && args.dataPath !== undefined)) {
    throw new McpError({
      code: 'E_ARGS',
      kind: 'invalid_source',
      stage: 'args',
      message: 'Provide exactly one of path or data',
    });
  }
  const header = args.hasHeader ?? args.header;
  const dataset = hasPath
    ? await loadFromPath(guard, pathInput as string, {
        ...(args.format ? { format: args.format } : {}),
        ...(args.delimiter ? { delimiter: args.delimiter } : {}),
        ...(header !== undefined ? { header } : {}),
        ...(args.decimalComma !== undefined ? { decimalComma: args.decimalComma } : {}),
        ...(args.sheet !== undefined ? { sheet: args.sheet } : {}),
        ...(args.types ? { types: args.types } : {}),
        ...(args.missing ? { missing: args.missing } : {}),
        ...(args.maxRows !== undefined ? { maxRows: args.maxRows } : {}),
      })
    : inlineDataset(args.data);
  if (dataset.grid.cols.length > 500) {
    throw new McpError({
      code: 'E_DATA',
      kind: 'too_many_columns',
      stage: 'load',
      message: `Dataset has ${dataset.grid.cols.length} columns; the MCP limit is 500`,
      details: { columns: dataset.grid.cols.length, limit: 500 },
    });
  }
  const previewCount = args.previewRows ?? DEFAULT_PREVIEW_ROWS;
  const structuredContent = {
    schemaVersion: 1,
    source: dataset.source,
    format: dataset.format,
    sha256: dataset.sha256,
    rows: dataset.grid.rows.length,
    columns: dataset.grid.cols.length,
    truncated: dataset.truncated,
    columnsMeta: columnMetadata(dataset.grid).map(column => ({
      name: column.name,
      type: column.type,
      label: column.label ?? null,
      missing: column.missing ?? [],
      levels: column.levels ?? [],
      ...(column.reference ? { reference: column.reference } : {}),
    })),
    preview: previewRows(dataset.grid, previewCount),
  };
  const text = [
    `Dataset ${dataset.source}`,
    `${structuredContent.rows} rows × ${structuredContent.columns} columns (${dataset.format})`,
    `Columns: ${dataset.grid.cols.map(column => `${column.name}:${column.type}`).join(', ')}`,
    `sha256: ${dataset.sha256}`,
  ].join('\n');
  return {
    content: [{ type: 'text', text }],
    structuredContent,
  };
};
