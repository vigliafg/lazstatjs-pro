import type { CallToolResult } from '@modelcontextprotocol/server';
import { compile } from 'vega-lite';
import { renderChartSvg } from '../../engine';
import { buildVegaSpec } from '../../charts/vega/buildSpec';
import { z } from 'zod';
import { McpError } from '../errors';
import { MAX_STRUCTURED_BYTES, MAX_TEXT_CHARS } from '../limits';
import type { ResultCache } from '../resultCache';
import { chartList, findChart, fitPayload, paginate, summaryText } from '../summary';

const sectionValues = ['summary', 'tables', 'report', 'charts', 'all'] as const;

export const getResultInput = z.object({
  resultId: z.string().min(1),
  section: z.enum(sectionValues).optional(),
  tableId: z.string().optional(),
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(200).optional(),
});

export type GetResultArgs = z.infer<typeof getResultInput>;

const resultAnalysis = z.object({ id: z.string(), label: z.string(), family: z.string() });
const resultInput = z.object({
  source: z.string(),
  format: z.string(),
  sha256: z.string(),
  rows: z.number(),
  columns: z.number(),
});

export const getResultOutput = z
  .object({
    schemaVersion: z.number(),
    resultId: z.string(),
    status: z.literal('ok'),
    analysis: resultAnalysis,
    input: resultInput,
    ciLevel: z.number(),
    reportLocale: z.string(),
    warnings: z.array(z.string()),
    timings: z.unknown().optional(),
    section: z.string(),
  })
  .passthrough();

const missing = (resultId: string): McpError =>
  new McpError({
    code: 'E_RESULT_EXPIRED',
    kind: 'result_not_found',
    stage: 'execute',
    message: `Result is unavailable or expired: ${resultId}`,
    details: { resultId },
    retryable: false,
  });

export const getResultTool = (args: GetResultArgs, cache: ResultCache): CallToolResult => {
  const cached = cache.get(args.resultId);
  if (!cached) throw missing(args.resultId);
  const { envelope } = cached;
  const section = args.section ?? 'summary';
  const offset = args.offset ?? 0;
  const limit = args.limit ?? 50;
  const summary = cached.summary || summaryText(envelope, args.resultId);
  const base = {
    schemaVersion: 1,
    resultId: args.resultId,
    status: envelope.status,
    analysis: envelope.analysis,
    input: envelope.input,
    ciLevel: envelope.ciLevel,
    reportLocale: envelope.reportLocale,
    warnings: envelope.warnings,
    timings: envelope.timings,
  };
  let body: Record<string, unknown>;
  if (section === 'summary') {
    body = { summary };
  } else if (section === 'tables') {
    if (args.tableId) {
      const table = envelope.result.tables.find(item => item.id === args.tableId);
      if (!table) {
        throw new McpError({
          code: 'E_ARGS',
          kind: 'unknown_table',
          stage: 'args',
          message: `Unknown table: ${args.tableId}`,
          details: { tableId: args.tableId, tables: envelope.result.tables.map(item => item.id) },
        });
      }
      const page = paginate(table.rows, offset, limit);
      body = { tableId: table.id, title: table.title, columns: table.columns, ...page };
    } else {
      body = {
        tables: envelope.result.tables.map(table => ({
          id: table.id,
          title: table.title,
          ...(table.subtitle ? { subtitle: table.subtitle } : {}),
          rows: table.rows.length,
          columns: table.columns.length,
        })),
      };
    }
  } else if (section === 'report') {
    const report = envelope.result.report;
    const page = paginate(report?.sections ?? [], offset, limit);
    body = {
      report: report ? { ...report, sections: page.items } : null,
      total: page.total,
      offset: page.offset,
      limit: page.limit,
      hasMore: page.hasMore,
    };
  } else if (section === 'charts') {
    body = {
      ...paginate(
        chartList(envelope.result).map(chart => ({
          id: chart.id,
          title: chart.title,
          kind: chart.kind,
          ...(chart.subtitle ? { subtitle: chart.subtitle } : {}),
        })),
        offset,
        limit
      ),
      panels: paginate(
        (envelope.result.panels ?? []).map(panel => ({
          id: panel.id,
          title: panel.title,
          children: panel.children.map(child => child.id),
        })),
        offset,
        limit
      ),
    };
  } else {
    body = {
      summary,
      tables: envelope.result.tables.map(table => ({
        id: table.id,
        title: table.title,
        rows: table.rows.length,
      })),
      report: envelope.result.report,
      charts: chartList(envelope.result).map(chart => ({
        id: chart.id,
        title: chart.title,
        kind: chart.kind,
      })).slice(offset, offset + limit),
      panels: (envelope.result.panels ?? []).map(panel => ({
        id: panel.id,
        title: panel.title,
        children: panel.children.map(child => child.id),
      })),
    };
  }
  const structuredContent = { ...base, section, ...body };
  const text = section === 'summary' ? summary : `Result ${args.resultId}: ${section} section`;
  return {
    content: [{ type: 'text', text: text.slice(0, MAX_TEXT_CHARS) }],
    structuredContent: fitPayload(structuredContent, MAX_STRUCTURED_BYTES),
  };
};

export const renderChartInput = z.object({
  resultId: z.string().min(1),
  chartId: z.string().min(1),
  format: z.enum(['svg', 'spec']).optional(),
});

export type RenderChartArgs = z.infer<typeof renderChartInput>;

export const renderChartOutput = z.object({
  resultId: z.string(),
  chartId: z.string(),
  format: z.enum(['svg', 'spec']),
  mediaType: z.string(),
  svg: z.string().optional(),
  spec: z.unknown().optional(),
});

export const renderChartTool = async (
  args: RenderChartArgs,
  cache: ResultCache
): Promise<CallToolResult> => {
  const cached = cache.get(args.resultId);
  if (!cached) throw missing(args.resultId);
  const chart = findChart(cached.envelope.result, args.chartId);
  if (!chart) {
    throw new McpError({
      code: 'E_ARGS',
      kind: 'unknown_chart',
      stage: 'args',
      message: `Unknown chart: ${args.chartId}`,
      details: {
        chartId: args.chartId,
        charts: chartList(cached.envelope.result).map(item => item.id),
      },
    });
  }
  const format = args.format ?? 'svg';
  if (format === 'spec') {
    const spec = compile(buildVegaSpec(chart)).spec;
    return {
      content: [{ type: 'text', text: JSON.stringify(spec) }],
      structuredContent: {
        resultId: args.resultId,
        chartId: chart.id,
        format: 'spec',
        mediaType: 'application/json',
        spec,
      },
    };
  }
  const svg = await renderChartSvg(chart);
  return {
    content: [{ type: 'text', text: svg }],
    structuredContent: {
      resultId: args.resultId,
      chartId: chart.id,
      format: 'svg',
      mediaType: 'image/svg+xml',
      svg,
    },
  };
};
