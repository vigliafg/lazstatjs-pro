import type { CallToolResult } from '@modelcontextprotocol/server';
import {
  CHART_KIND_COUNT,
  RUNNER_COUNT,
  analysisSchema,
  catalogEntries,
  engineInfo,
} from '../../engine';
import { z } from 'zod';
import { McpError } from '../errors';
import { MCP_VERSION } from '../limits';

const ok = (text: string, structuredContent: Record<string, unknown>): CallToolResult => ({
  content: [{ type: 'text', text }],
  structuredContent,
});

export const engineInfoTool = (): CallToolResult => {
  const info = engineInfo(MCP_VERSION, RUNNER_COUNT, CHART_KIND_COUNT);
  return ok(
    `LazStats engine ${MCP_VERSION}: ${RUNNER_COUNT} runners, ${CHART_KIND_COUNT} chart kinds.`,
    {
      ...info,
      engineSchemaVersion: 1,
      node: process.version,
      transport: 'stdio',
      catalogVisible: catalogEntries(false).length,
      hiddenAnalyses: catalogEntries(true)
        .filter(entry => entry.hidden)
        .map(entry => entry.id),
      limits: {
        maxRows: 50_000,
        maxColumns: 500,
        maxTextFileBytes: 100 * 1024 * 1024,
        maxBinaryFileBytes: 25 * 1024 * 1024,
        maxInlineBytes: 1024 * 1024,
        maxInlineRows: 2_000,
        maxConcurrentRuns: 4,
        maxQueuedRuns: 16,
        timeoutMs: 120_000,
      },
    }
  );
};

export const listAnalysesInput = z.object({
  query: z.string().optional(),
  family: z.string().optional(),
  includeHidden: z.boolean().optional(),
  limit: z.number().int().min(1).max(200).optional(),
});

export type ListAnalysesArgs = z.infer<typeof listAnalysesInput>;

export const engineInfoOutput = z.object({
  name: z.string(),
  version: z.string(),
  runners: z.number(),
  chartKinds: z.number(),
  engineSchemaVersion: z.number(),
  node: z.string(),
  transport: z.literal('stdio'),
  catalogVisible: z.number(),
  hiddenAnalyses: z.array(z.string()),
  limits: z.object({
    maxRows: z.number(),
    maxColumns: z.number(),
    maxTextFileBytes: z.number(),
    maxBinaryFileBytes: z.number(),
    maxInlineBytes: z.number(),
    maxInlineRows: z.number(),
    maxConcurrentRuns: z.number(),
    maxQueuedRuns: z.number(),
    timeoutMs: z.number(),
  }),
});

export const listAnalysesOutput = z.object({
  total: z.number(),
  catalogTotal: z.number(),
  hiddenCount: z.number(),
  shown: z.number(),
  hasMore: z.boolean(),
  analyses: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      family: z.string(),
      familyLabel: z.string(),
      description: z.string(),
      cost: z.enum(['instant', 'heavy']),
      heavy: z.boolean(),
      runnable: z.literal(true),
      hidden: z.boolean(),
    })
  ),
});

export const describeAnalysisOutput = z.object({
  id: z.string(),
  label: z.string(),
  family: z.string(),
  description: z.string(),
  cost: z.enum(['instant', 'heavy']),
  heavy: z.boolean(),
  paramsKey: z.string().nullable(),
  defaultParams: z.unknown(),
  fields: z.array(z.string()),
  exampleSet: z.string(),
  roles: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      kind: z.string(),
      columns: z.array(z.number()),
    })
  ),
  runnable: z.literal(true),
  prerequisites: z.object({
    dataset: z.boolean(),
    minimumRows: z.number(),
    roles: z.array(
      z.object({ key: z.string(), kind: z.string(), columns: z.array(z.number()) })
    ),
  }),
});

export const listAnalysesTool = (args: ListAnalysesArgs): CallToolResult => {
  const all = catalogEntries(args.includeHidden === true);
  const query = args.query?.trim().toLowerCase();
  const family = args.family?.trim().toLowerCase();
  const filtered = all.filter(entry => {
    if (family && entry.family.toLowerCase() !== family && entry.familyLabel.toLowerCase() !== family) {
      return false;
    }
    if (!query) return true;
    return [entry.id, entry.label, entry.description, entry.family, entry.familyLabel]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
  const limit = args.limit ?? 100;
  const items = filtered.slice(0, limit);
  return ok(
    `${items.length} of ${filtered.length} analyses shown (${all.length} in catalog).`,
    {
      total: filtered.length,
      catalogTotal: all.length,
      hiddenCount: catalogEntries(true).length - catalogEntries(false).length,
      shown: items.length,
      hasMore: filtered.length > items.length,
      analyses: items,
    }
  );
};

export const describeAnalysisInput = z.object({ analysisId: z.string().min(1) });

export type DescribeAnalysisArgs = z.infer<typeof describeAnalysisInput>;

export const describeAnalysisTool = (args: DescribeAnalysisArgs): CallToolResult => {
  const schema = analysisSchema(args.analysisId);
  if (!schema) {
    throw new McpError({
      code: 'E_ANALYSIS',
      kind: 'unknown_analysis',
      stage: 'analysis',
      message: `Unknown or non-runnable analysis: ${args.analysisId}`,
      details: { analysisId: args.analysisId },
    });
  }
  return ok(
    `${schema.label} (${schema.id}): ${schema.description}\nExample: ${schema.exampleSet}`,
    {
      ...schema,
      prerequisites: {
        dataset: true,
        minimumRows: 1,
        roles: schema.roles.map(role => ({ key: role.key, kind: role.kind, columns: role.columns })),
      },
    }
  );
};
