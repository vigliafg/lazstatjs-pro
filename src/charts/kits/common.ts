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
  n: number;
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
    n: clean.length,
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
      n: stats.n,
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

export interface ViolinRowsResult {
  rows: ChartRow[];
  /** Categories without enough variance/data for a density estimate. */
  skipped: string[];
}

/**
 * Gaussian KDE rows for a categorical violin plot.
 *
 * One row per grid point: `{ category, value, x1, x2 }`, sorted by category
 * order and then by y. The bandwidth is Silverman's rule; the maximum
 * half-width is 0.38 category units. Categories with fewer than two values or
 * zero variance are reported in `skipped` so the renderer can draw an explicit
 * summary range instead of a fake density.
 */
export const violinRows = (
  points: ChartRow[],
  categories: string[],
  centers: Map<string, number>
): ViolinRowsResult => {
  const byCategory = new Map<string, number[]>();
  points.forEach(row => {
    const category = String(row.category ?? '');
    const value = Number(row.value);
    if (!Number.isFinite(value) || !centers.has(category)) return;
    const values = byCategory.get(category) ?? [];
    values.push(value);
    byCategory.set(category, values);
  });

  const rows: ChartRow[] = [];
  const skipped: string[] = [];
  categories.forEach(category => {
    const center = centers.get(category);
    if (center === undefined) return;
    const values = byCategory.get(category) ?? [];
    if (values.length < 2) {
      skipped.push(category);
      return;
    }
    const sd = jStat.stdev(values, true);
    const bandwidth = 1.06 * sd * values.length ** -0.2;
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (!Number.isFinite(bandwidth) || bandwidth <= 0 || !(max > min)) {
      skipped.push(category);
      return;
    }
    const grid = Array.from(
      { length: 60 },
      (_, index) => min + ((max - min) * index) / 59
    );
    const densities = grid.map(y => {
      const sum = values.reduce(
        (total, value) => total + Math.exp(-0.5 * ((y - value) / bandwidth) ** 2),
        0
      );
      return sum / (values.length * bandwidth * Math.sqrt(2 * Math.PI));
    });
    const maxDensity = Math.max(...densities);
    if (!Number.isFinite(maxDensity) || maxDensity <= 0) {
      skipped.push(category);
      return;
    }
    grid.forEach((value, index) => {
      const half = 0.38 * (densities[index] / maxDensity);
      rows.push({ category, value, x1: center - half, x2: center + half });
    });
  });
  return { rows, skipped };
};

/**
 * 95% data ellipse for a two-dimensional score plot. The axes are the square
 * roots of the covariance eigenvalues scaled by the chi-square quantile; the
 * angle comes from the covariance eigenvector. Returns 60 outline points.
 */
export const confidenceEllipse = (points: ChartRow[], level = 0.95): ChartRow[] => {
  const pairs = points
    .map(row => ({ x: Number(row.x), y: Number(row.y) }))
    .filter(pair => Number.isFinite(pair.x) && Number.isFinite(pair.y));
  const n = pairs.length;
  if (n < 3) return [];
  const meanX = pairs.reduce((sum, pair) => sum + pair.x, 0) / n;
  const meanY = pairs.reduce((sum, pair) => sum + pair.y, 0) / n;
  const sxx = pairs.reduce((sum, pair) => sum + (pair.x - meanX) ** 2, 0) / (n - 1);
  const syy = pairs.reduce((sum, pair) => sum + (pair.y - meanY) ** 2, 0) / (n - 1);
  const sxy = pairs.reduce((sum, pair) => sum + (pair.x - meanX) * (pair.y - meanY), 0) / (n - 1);
  const trace = sxx + syy;
  const determinant = sxx * syy - sxy * sxy;
  const root = Math.sqrt(Math.max(0, (trace * trace) / 4 - determinant));
  const lambda1 = trace / 2 + root;
  const lambda2 = Math.max(0, trace / 2 - root);
  const chi2 = level >= 0.99 ? 9.21 : level >= 0.95 ? 5.991 : 4.605;
  const axis1 = Math.sqrt(Math.max(0, lambda1 * chi2));
  const axis2 = Math.sqrt(Math.max(0, lambda2 * chi2));
  const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return Array.from({ length: 60 }, (_, index) => {
    const t = (2 * Math.PI * index) / 59;
    const u = axis1 * Math.cos(t);
    const v = axis2 * Math.sin(t);
    return { x: meanX + u * cos - v * sin, y: meanY + u * sin + v * cos };
  });
};

/** First time each survival curve reaches 50%, one row per series. */
export const survivalMedians = (curves: ChartRow[]): ChartRow[] => {
  const groups = new Map<string, ChartRow[]>();
  curves.forEach(row => {
    const x = Number(row.x);
    const y = Number(row.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const series = String(row.series ?? '');
    groups.set(series, [...(groups.get(series) ?? []), { x, y }]);
  });
  const medians: ChartRow[] = [];
  groups.forEach((rows, series) => {
    const crossing = [...rows].sort((a, b) => Number(a.x) - Number(b.x)).find(row => Number(row.y) <= 0.5);
    if (!crossing) return;
    medians.push({ x: crossing.x, ...(series ? { series } : {}) });
  });
  return medians;
};

/** Gaussian KDE on a 60-point grid; empty when the sample has no variance. */
export const kernelDensity = (values: number[], gridSize = 60): { x: number; y: number }[] => {
  const clean = values.filter(Number.isFinite);
  if (clean.length < 2) return [];
  const sd = jStat.stdev(clean, true);
  const bandwidth = 1.06 * sd * clean.length ** -0.2;
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  if (!Number.isFinite(bandwidth) || bandwidth <= 0 || !(max > min)) return [];
  return Array.from({ length: gridSize }, (_, index) => {
    const x = min + ((max - min) * index) / (gridSize - 1);
    const density =
      clean.reduce(
        (sum, value) => sum + Math.exp(-0.5 * ((x - value) / bandwidth) ** 2),
        0
      ) /
      (clean.length * bandwidth * Math.sqrt(2 * Math.PI));
    return { x, y: density };
  });
};

/** Empirical CDF points: sorted values with the cumulative proportion. */
export const ecdfRows = (values: number[], series?: string): ChartRow[] => {
  const sorted = [...values].filter(value => Number.isFinite(value)).sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return [];
  return sorted.map((value, index) => ({
    x: value,
    y: (index + 1) / n,
    ...(series !== undefined ? { series } : {}),
  }));
};

export const qqPoints = (values: number[]): ChartRow[] => {  const sorted = [...values].filter(value => Number.isFinite(value)).sort((a, b) => a - b);
  const n = sorted.length;
  if (n < 3) return [];
  return sorted.map((value, index) => {
    const p = (index + 1 - 0.375) / (n + 0.25);
    return { x: jStat.normal.inv(p, 0, 1), y: value };
  });
};

/** Residuals of observed points around the Q-Q reference line. */
export const detrendedQqRows = (points: ChartRow[], reference: ChartRow[]): ChartRow[] => {
  const line = reference
    .map(row => ({ x: Number(row.x), y: Number(row.y) }))
    .filter(row => Number.isFinite(row.x) && Number.isFinite(row.y));
  if (line.length < 2) return [];
  const first = line[0];
  const last = line[line.length - 1];
  const slope = last.x === first.x ? 0 : (last.y - first.y) / (last.x - first.x);
  const intercept = first.y - slope * first.x;
  return points
    .map(row => ({ x: Number(row.x), y: Number(row.y) }))
    .filter(row => Number.isFinite(row.x) && Number.isFinite(row.y))
    .map(row => ({ x: row.x, y: row.y - (intercept + slope * row.x) }));
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
