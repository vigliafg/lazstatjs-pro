import type {
  AnalysisChart,
  ChartData,
  ChartKind,
  ChartOptions,
  ChartRow,
  ChartValue,
} from '../stats/charts';
import {
  MAX_CHART_MODEL_CHARS,
  MAX_CHART_POINTS,
  MAX_CHARTS_PER_OUTPUT,
} from '../stats/charts';
import { mergeOptions } from './defaults';

const KINDS: readonly ChartKind[] = [
  'scatter',
  'line',
  'bar',
  'box',
  'histogram',
  'interval',
  'dot',
  'ecdf',
  'qq',
  'forest',
  'survival',
  'risk',
  'mosaic',
  'acf',
  'heatmap',
  'residual',
  'scree',
  'score',
  'bland',
  'power',
  'bootstrap',
  'missingness',
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isValue = (value: unknown): value is ChartValue =>
  value === null ||
  typeof value === 'string' ||
  (typeof value === 'number' && Number.isFinite(value));

const sanitizeRow = (value: unknown): ChartRow | null => {
  if (!isRecord(value)) return null;
  const row: ChartRow = {};
  for (const [key, cell] of Object.entries(value)) {
    if (key.length === 0 || key.length > 80) continue;
    if (isValue(cell)) row[key] = cell;
    else if (typeof cell === 'number') row[key] = null;
    else if (typeof cell === 'boolean') row[key] = cell ? 1 : 0;
  }
  return row;
};

/** Deterministic even downsample: first and last points are preserved. */
export const downsampleRows = (
  rows: ChartRow[],
  limit = MAX_CHART_POINTS
): { rows: ChartRow[]; sampled: boolean } => {
  if (rows.length <= limit) return { rows, sampled: false };
  const step = rows.length / limit;
  const kept: ChartRow[] = [];
  for (let index = 0; index < limit; index += 1) {
    const position = index === limit - 1 ? rows.length - 1 : Math.floor(index * step);
    kept.push(rows[Math.min(rows.length - 1, position)]);
  }
  return { rows: kept, sampled: true };
};

const sanitizeData = (value: unknown): { data: ChartData; sampled: boolean } => {
  const data: ChartData = {};
  let sampled = false;
  if (!isRecord(value)) return { data, sampled };
  for (const [layer, rows] of Object.entries(value)) {
    if (!Array.isArray(rows) || layer.length === 0 || layer.length > 80) continue;
    const clean = rows
      .map(sanitizeRow)
      .filter((row): row is ChartRow => row !== null);
    if (clean.length === 0) continue;
    const capped = downsampleRows(clean);
    data[layer] = capped.rows;
    sampled = sampled || capped.sampled;
  }
  return { data, sampled };
};

const sanitizeFields = (value: unknown): Record<string, string> => {
  const fields: Record<string, string> = {};
  if (!isRecord(value)) return fields;
  for (const [key, label] of Object.entries(value)) {
    if (typeof label === 'string' && label.length > 0 && label.length <= 120) {
      fields[key] = label;
    }
  }
  return fields;
};

const sanitizeStats = (value: unknown): Record<string, number | string | null> => {
  const stats: Record<string, number | string | null> = {};
  if (!isRecord(value)) return stats;
  for (const [key, item] of Object.entries(value)) {
    if (isValue(item)) stats[key] = item;
  }
  return stats;
};

/**
 * Validate one untrusted chart model (worker payload, `.lzs`, restored card).
 * Returns `null` when the object cannot be rendered safely.
 */
export const parseChartModel = (value: unknown): AnalysisChart | null => {
  if (!isRecord(value)) return null;
  const kind = value.kind;
  if (typeof kind !== 'string' || !KINDS.includes(kind as ChartKind)) return null;
  const id = typeof value.id === 'string' && value.id.length > 0 ? value.id.slice(0, 120) : '';
  const title = typeof value.title === 'string' ? value.title.slice(0, 240) : '';
  if (!id || !title) return null;
  const { data, sampled } = sanitizeData(value.data);
  if (Object.keys(data).length === 0) return null;
  const options = isRecord(value.options)
    ? mergeOptions(kind as ChartKind, value.options as Partial<ChartOptions>)
    : mergeOptions(kind as ChartKind, undefined);
  const chart: AnalysisChart = {
    version: 1,
    id,
    kind: kind as ChartKind,
    title,
    ...(typeof value.subtitle === 'string' && value.subtitle.length > 0
      ? { subtitle: value.subtitle.slice(0, 240) }
      : {}),
    ...(typeof value.note === 'string' && value.note.length > 0
      ? { note: value.note.slice(0, 1200) }
      : {}),
    layout: value.layout === 'half' ? 'half' : 'full',
    data,
    fields: sanitizeFields(value.fields),
    ...(isRecord(value.stats) ? { stats: sanitizeStats(value.stats) } : {}),
    options,
    ...(sampled || value.sampled === true ? { sampled: true } : {}),
  };
  return JSON.stringify(chart).length <= MAX_CHART_MODEL_CHARS ? chart : null;
};

/** Parse a stored/worker chart array, ignoring entries that cannot render. */
export const parseChartModels = (value: unknown): AnalysisChart[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map(parseChartModel)
    .filter((chart): chart is AnalysisChart => chart !== null)
    .slice(0, MAX_CHARTS_PER_OUTPUT);
};

export interface ChartBudget {
  charts: AnalysisChart[];
  /** Charts beyond the interface/persistence cap. */
  overflow: number;
  /** Charts dropped because the serialized model or the card budget is full. */
  omitted: number;
}

/**
 * Keep the charts that fit the card budget. Tables and prose are stored
 * separately, so a dropped chart never takes the rest of the card with it.
 */
export const fitChartBudget = (
  charts: AnalysisChart[],
  htmlChars: number,
  totalBudget = 600_000
): ChartBudget => {
  const bounded = charts.slice(0, MAX_CHARTS_PER_OUTPUT);
  const kept: AnalysisChart[] = [];
  let used = htmlChars;
  let omitted = 0;
  for (const chart of charts.slice(0, MAX_CHARTS_PER_OUTPUT)) {
    const size = JSON.stringify(chart).length;
    if (size > MAX_CHART_MODEL_CHARS || used + size > totalBudget) {
      omitted += 1;
      continue;
    }
    kept.push(chart);
    used += size;
  }
  return { charts: kept, overflow: Math.max(0, charts.length - bounded.length), omitted };
};
