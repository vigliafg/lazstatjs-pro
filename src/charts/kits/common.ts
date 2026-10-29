import { jStat } from '../../stats/jstat';
import type {
  AnalysisChart,
  ChartData,
  ChartKind,
  ChartLayout,
  ChartOptions,
  ChartRow,
} from '../../stats/charts';
import { factoryOptions, mergeOptions } from '../defaults';
import { downsampleRows } from '../schema';

export interface ChartInit {
  id: string;
  kind: ChartKind;
  title: string;
  subtitle?: string;
  note?: string;
  layout?: ChartLayout;
  data: ChartData;
  fields?: Record<string, string>;
  stats?: Record<string, number | string | null>;
  options?: Partial<ChartOptions>;
}

/** Common constructor: one place for `version`, layout and factory options. */
export const makeChart = (init: ChartInit): AnalysisChart => {
  const options = mergeOptions(init.kind, init.options as ChartOptions | undefined);
  const data: ChartData = {};
  let sampled = false;
  for (const [layer, rows] of Object.entries(init.data)) {
    const capped = downsampleRows(rows);
    data[layer] = capped.rows;
    sampled = sampled || capped.sampled;
  }
  return {
    version: 1,
    id: init.id,
    kind: init.kind,
    title: init.title,
    ...(init.subtitle ? { subtitle: init.subtitle } : {}),
    ...(init.note ? { note: init.note } : {}),
    layout: init.layout ?? 'full',
    data,
    fields: init.fields ?? {},
    ...(init.stats ? { stats: init.stats } : {}),
    ...(sampled ? { sampled: true } : {}),
    options,
  };
};

export interface BoxStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  outliers: number[];
}

/** Five-number summary with Tukey fences, the same definition used by the tables. */
export const boxStats = (values: number[]): BoxStats | null => {
  const clean = values.filter(value => Number.isFinite(value));
  if (clean.length === 0) return null;
  const quartiles = jStat.quartiles(clean);
  const q1 = quartiles[0];
  const median = quartiles[1];
  const q3 = quartiles[2];
  const iqr = q3 - q1;
  const lowFence = q1 - 1.5 * iqr;
  const highFence = q3 + 1.5 * iqr;
  const inside = clean.filter(value => value >= lowFence && value <= highFence);
  return {
    min: inside.length > 0 ? jStat.min(inside) : jStat.min(clean),
    q1,
    median,
    q3,
    max: inside.length > 0 ? jStat.max(inside) : jStat.max(clean),
    mean: jStat.mean(clean),
    outliers: clean.filter(value => value < lowFence || value > highFence),
  };
};

/** Build `summary`/`points`/`outliers` layers for a categorical boxplot. */
export const boxRows = (
  groups: { category: string; values: number[] }[]
): { summary: ChartRow[]; points: ChartRow[]; outliers: ChartRow[] } => {
  const summary: ChartRow[] = [];
  const points: ChartRow[] = [];
  const outliers: ChartRow[] = [];
  groups.forEach(group => {
    const stats = boxStats(group.values);
    if (!stats) return;
    summary.push({
      category: group.category,
      min: stats.min,
      q1: stats.q1,
      median: stats.median,
      q3: stats.q3,
      max: stats.max,
      mean: stats.mean,
    });
    group.values
      .filter(value => Number.isFinite(value))
      .forEach(value => points.push({ category: group.category, value }));
    stats.outliers.forEach(value => outliers.push({ category: group.category, value }));
  });
  return { summary, points, outliers };
};

export const qqPoints = (values: number[]): ChartRow[] => {
  const sorted = [...values].filter(value => Number.isFinite(value)).sort((a, b) => a - b);
  const n = sorted.length;
  if (n < 3) return [];
  return sorted.map((value, index) => {
    const p = (index + 1 - 0.375) / (n + 0.25);
    return { x: jStat.normal.inv(p, 0, 1), y: value };
  });
};

export const qqReference = (points: ChartRow[]): ChartRow[] => {
  if (points.length < 2) return [];
  const xs = points.map(row => Number(row.x));
  const ys = points.map(row => Number(row.y));
  const meanX = jStat.mean(xs);
  const meanY = jStat.mean(ys);
  const sxx = xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0);
  const sxy = xs.reduce((sum, x, index) => sum + (x - meanX) * (ys[index] - meanY), 0);
  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = meanY - slope * meanX;
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  return [
    { x: min, y: intercept + slope * min },
    { x: max, y: intercept + slope * max },
  ];
};

export const emptyOptions = factoryOptions;
