import type { AnalysisChart, PanelChart } from '../stats/charts';
import type { SuccessEnvelope } from '../engine';

export const chartList = (result: SuccessEnvelope['result']): AnalysisChart[] => {
  const charts = [...(result.charts ?? [])];
  for (const panel of result.panels ?? []) charts.push(...panel.children);
  return charts;
};

export const findChart = (
  result: SuccessEnvelope['result'],
  chartId: string
): AnalysisChart | undefined => chartList(result).find(chart => chart.id === chartId);

export const findPanel = (
  result: SuccessEnvelope['result'],
  panelId: string
): PanelChart | undefined => (result.panels ?? []).find(panel => panel.id === panelId);

export const summaryText = (envelope: SuccessEnvelope, resultId: string): string => {
  const result = envelope.result;
  const lines = [
    `${envelope.analysis.label} (${envelope.analysis.id}) — ${result.ok ? 'ok' : 'rejected'}`,
    `Dataset: ${envelope.input.rows} rows × ${envelope.input.columns} columns (${envelope.input.format})`,
    `Tables: ${result.tables.length}`,
    `Charts: ${chartList(result).length}`,
    `Report: ${result.report ? 'yes' : 'no'}`,
    `resultId: ${resultId}`,
  ];
  if (result.title) lines.splice(1, 0, result.title);
  if (envelope.warnings.length > 0) lines.push(`Warnings: ${envelope.warnings.length}`);
  return lines.join('\n');
};

export const compactResult = (
  envelope: SuccessEnvelope,
  include: string[]
): Record<string, unknown> => {
  const result = envelope.result;
  const output: Record<string, unknown> = {};
  if (include.includes('tables')) output.tables = result.tables;
  if (include.includes('report')) output.report = result.report;
  if (include.includes('charts')) {
    output.charts = result.charts ?? [];
    output.panels = result.panels ?? [];
  }
  if (result.title !== undefined) output.title = result.title;
  if (result.header !== undefined) output.header = result.header;
  if (result.warnings !== undefined) output.warnings = result.warnings;
  if (result.callout !== undefined) output.callout = result.callout;
  return output;
};

export const paginate = <T>(items: T[], offset: number, limit: number) => ({
  items: items.slice(offset, offset + limit),
  total: items.length,
  offset,
  limit,
  hasMore: offset + limit < items.length,
});

const size = (value: unknown): number => {
  try {
    return Buffer.byteLength(JSON.stringify(value), 'utf8');
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
};

/** Keep structuredContent under the wire budget, marking what was omitted. */
export const fitPayload = <T extends Record<string, unknown>>(payload: T, maxBytes: number): T => {
  if (size(payload) <= maxBytes) return payload;
  const reduced: Record<string, unknown> = { ...payload, truncated: true };
  if (Array.isArray(reduced.tables)) reduced.tables = [];
  if (Array.isArray(reduced.charts)) reduced.charts = [];
  if (Array.isArray(reduced.items)) reduced.items = [];
  if (reduced.report !== undefined) reduced.report = null;
  if (size(reduced) <= maxBytes) return reduced as T;
  reduced.params = {};
  reduced.warnings = [];
  reduced.summary = String(reduced.summary ?? '').slice(0, 2_000);
  return reduced as T;
};
