import type {
  AnalysisChart,
  ChartData,
  ChartKind,
  ChartOptions,
  ChartRow,
  ChartValue,
  PanelChart,
  ReportChart,
} from '../stats/charts';
import { CHART_KINDS } from '../stats/charts';
import {
  MAX_CHART_MODEL_CHARS,
  MAX_CHART_POINTS,
  MAX_CHARTS_PER_OUTPUT,
  MAX_PANEL_CHILDREN,
} from '../stats/charts';
import type {
  CellFormat,
  TableColumn,
  TableRow,
  TableSpec,
} from '../stats/types';
import { mergeOptions } from './defaults';

const KINDS: readonly ChartKind[] = CHART_KINDS;

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

const CELL_FORMATS: readonly CellFormat[] = [
  'text',
  'int',
  'dec1',
  'dec2',
  'dec3',
  'dec4',
  'p',
  'pct',
];

const sanitizeCell = (value: unknown): TableRow[string] => {
  if (typeof value === 'string') return value.slice(0, 240);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
};

const sanitizeTableColumns = (value: unknown): TableColumn[] => {
  if (!Array.isArray(value)) return [];
  const columns: TableColumn[] = [];
  for (const raw of value.slice(0, 24)) {
    if (!isRecord(raw)) continue;
    const key = typeof raw.key === 'string' ? raw.key.slice(0, 80) : '';
    const label = typeof raw.label === 'string' ? raw.label.slice(0, 120) : '';
    if (!key || !label) continue;
    columns.push({
      key,
      label,
      ...(typeof raw.format === 'string' && (CELL_FORMATS as readonly string[]).includes(raw.format)
        ? { format: raw.format as CellFormat }
        : {}),
      ...(raw.align === 'left' || raw.align === 'right' ? { align: raw.align } : {}),
    });
  }
  return columns;
};

const sanitizeTables = (value: unknown): TableSpec[] => {
  if (!Array.isArray(value)) return [];
  const tables: TableSpec[] = [];
  for (const raw of value.slice(0, 4)) {
    if (!isRecord(raw)) continue;
    const id = typeof raw.id === 'string' && raw.id.length > 0 ? raw.id.slice(0, 80) : '';
    const title = typeof raw.title === 'string' ? raw.title.slice(0, 160) : '';
    const columns = sanitizeTableColumns(raw.columns);
    if (!id || !title || columns.length === 0) continue;
    const rows: TableRow[] = [];
    if (Array.isArray(raw.rows)) {
      for (const rawRow of raw.rows.slice(0, 200)) {
        if (!isRecord(rawRow)) continue;
        const row: TableRow = {};
        columns.forEach(column => {
          row[column.key] = sanitizeCell(rawRow[column.key]);
        });
        rows.push(row);
      }
    }
    tables.push({
      id,
      title,
      ...(typeof raw.subtitle === 'string' && raw.subtitle.length > 0
        ? { subtitle: raw.subtitle.slice(0, 240) }
        : {}),
      columns,
      rows,
      ...(Array.isArray(raw.notes)
        ? { notes: raw.notes.filter((note): note is string => typeof note === 'string').slice(0, 8) }
        : {}),
    });
  }
  return tables;
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

/**
 * Validate one untrusted L3 panel. Panels are depth 1: children go through
 * `parseChartModel`, which rejects a nested panel. Empty panels are dropped
 * because they would add a card with nothing to render.
 */
export const parsePanelModel = (value: unknown): PanelChart | null => {
  if (!isRecord(value) || value.kind !== 'panel') return null;
  const id = typeof value.id === 'string' && value.id.length > 0 ? value.id.slice(0, 120) : '';
  const title = typeof value.title === 'string' ? value.title.slice(0, 240) : '';
  if (!id || !title) return null;
  const rawChildren = Array.isArray(value.children)
    ? value.children.slice(0, MAX_PANEL_CHILDREN)
    : [];
  const children = rawChildren
    .map(parseChartModel)
    .filter((chart): chart is AnalysisChart => chart !== null);
  if (children.length === 0) return null;
  const tables = sanitizeTables(value.tables);
  const panel: PanelChart = {
    version: 1,
    id,
    kind: 'panel',
    title,
    ...(typeof value.subtitle === 'string' && value.subtitle.length > 0
      ? { subtitle: value.subtitle.slice(0, 240) }
      : {}),
    ...(typeof value.note === 'string' && value.note.length > 0
      ? { note: value.note.slice(0, 1200) }
      : {}),
    layout: value.layout === 'stack' ? 'stack' : 'grid',
    children,
    ...(tables.length > 0 ? { tables } : {}),
  };
  return JSON.stringify(panel).length <= MAX_CHART_MODEL_CHARS ? panel : null;
};

/** Parse a chart or a panel, depending on the discriminator. */
export const parseReportChart = (value: unknown): ReportChart | null =>
  isRecord(value) && value.kind === 'panel' ? parsePanelModel(value) : parseChartModel(value);

/** Parse a stored/worker chart array, ignoring entries that cannot render. */
export const parseChartModels = (value: unknown): AnalysisChart[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map(parseChartModel)
    .filter((chart): chart is AnalysisChart => chart !== null)
    .slice(0, MAX_CHARTS_PER_OUTPUT);
};

/** Parse a stored/worker panel array, ignoring entries that cannot render. */
export const parsePanelModels = (value: unknown): PanelChart[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map(parsePanelModel)
    .filter((panel): panel is PanelChart => panel !== null)
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

export interface PanelBudget {
  panels: PanelChart[];
  overflow: number;
  omitted: number;
}

/** Same budget rules as `fitChartBudget`, applied to the panel collection. */
export const fitPanelBudget = (
  panels: PanelChart[],
  usedChars: number,
  totalBudget = 600_000
): PanelBudget => {
  const bounded = panels.slice(0, MAX_CHARTS_PER_OUTPUT);
  const kept: PanelChart[] = [];
  let used = usedChars;
  let omitted = 0;
  for (const panel of bounded) {
    const size = JSON.stringify(panel).length;
    if (size > MAX_CHART_MODEL_CHARS || used + size > totalBudget) {
      omitted += 1;
      continue;
    }
    kept.push(panel);
    used += size;
  }
  return { panels: kept, overflow: Math.max(0, panels.length - bounded.length), omitted };
};

/**
 * Append a copy of `chart` to a card chart list, assigning a unique id.
 *
 * The style gallery inserts a second view of the same data (classic vs
 * probability Q-Q, box vs violin, ...) without re-running the analysis.
 * Returns `null` when the interface cap is already reached.
 */
export const appendChartCopy = (
  charts: readonly AnalysisChart[],
  chart: AnalysisChart,
  limit = MAX_CHARTS_PER_OUTPUT
): AnalysisChart[] | null => {
  if (charts.length >= limit) return null;
  const used = new Set(charts.map(item => item.id));
  const base = chart.id.slice(0, 100) || 'chart';
  let id = base;
  let suffix = 2;
  while (used.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return [...charts, { ...chart, id }];
};
