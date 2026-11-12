import type { CallToolResult } from '@modelcontextprotocol/server';
import { inspectProject } from '../../engine';
import { z } from 'zod';
import { McpError } from '../errors';
import type { PathGuard } from '../paths';

export const validateProjectInput = z.object({
  path: z.string().min(1).optional(),
  projectPath: z.string().min(1).optional(),
});

export type ValidateProjectArgs = z.infer<typeof validateProjectInput>;

export const validateProjectOutput = z.object({
  schemaVersion: z.number(),
  valid: z.literal(true),
  source: z.string(),
  sha256: z.string(),
  app: z.string(),
  version: z.number(),
  fileVersion: z.number().nullable(),
  savedAt: z.string(),
  rows: z.number(),
  columns: z.number(),
  datasetId: z.string().optional(),
  dataRevision: z.number().optional(),
  activeAnalysis: z.string(),
  paramKeys: z.array(z.string()),
  outputCount: z.number(),
  ignoredFields: z.array(z.string()),
  migration: z.object({ fromVersion: z.number(), toVersion: z.number() }).optional(),
});

export const validateProjectTool = (
  args: ValidateProjectArgs,
  guard: PathGuard
): CallToolResult => {
  const input = args.path ?? args.projectPath;
  if (!input || (args.path && args.projectPath)) {
    throw new McpError({
      code: 'E_ARGS',
      kind: 'invalid_source',
      stage: 'args',
      message: 'Provide exactly one of path or projectPath',
    });
  }
  const path = guard.resolve(input);
  const inspection = inspectProject(path);
  return {
    content: [{
      type: 'text',
      text: [
        `Project ${inspection.source}`,
        `${inspection.rows} rows × ${inspection.columns} columns`,
        `Active analysis: ${inspection.activeAnalysis}`,
        `Outputs: ${inspection.outputCount}`,
        inspection.migration
          ? `Migration: ${inspection.migration.fromVersion} → ${inspection.migration.toVersion}`
          : 'Migration: none',
      ].join('\n'),
    }],
    structuredContent: {
      schemaVersion: 1,
      valid: true,
      ...inspection,
    },
  };
};
