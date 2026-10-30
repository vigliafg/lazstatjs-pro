import type { AnalysisChart, ChartOptions, ChartRow } from '../../stats/charts';
import { boxDisplayOf } from '../defaults';
import { violinRows } from '../kits/common';
import { colorAt, themeFor } from './theme';
import {
  axis,
  field,
  mark,
  num,
  rowsOf,
  tooltip,
  yEncoding,
  type Spec,
} from './encoding';

const HALF_WIDTH = 0.4;
const CAP_WIDTH = 0.15;

const categoriesOf = (chart: AnalysisChart, options: ChartOptions): string[] => {
  const seen = new Set<string>();
  const categories: string[] = [];
  rowsOf(chart, 'summary', options).forEach(row => {
    const category = String(row.category ?? '');
    if (seen.has(category)) return;
    seen.add(category);
    categories.push(category);
  });
  return categories;
};

const centersOf = (categories: string[]): Map<string, number> =>
  new Map(categories.map((category, index) => [category, index]));

interface NumericSetup {
  summary: ChartRow[];
  categories: string[];
  centers: Map<string, number>;
}

/** Summary rows in display order, with the numeric centre attached. */
const numericSetup = (chart: AnalysisChart, options: ChartOptions): NumericSetup => {
  const categories = categoriesOf(chart, options);
  const centers = centersOf(categories);
  const summary = rowsOf(chart, 'summary', options).map(row => ({
    ...row,
    center: centers.get(String(row.category ?? '')) ?? 0,
  }));
  return { summary, categories, centers };
};

export interface NotchBounds {
  lo: number;
  hi: number;
}

/**
 * Notch bounds for a boxplot: median ± 1.57 · IQR / √n, folded back into the
 * box when the interval falls outside Q1/Q3. `null` means "draw a plain box".
 */
export const notchBounds = (
  q1: number,
  median: number,
  q3: number,
  n: number
): NotchBounds | null => {
  if (![q1, median, q3, n].every(Number.isFinite) || n <= 1) return null;
  const iqr = q3 - q1;
  if (!(iqr > 0)) return null;
  const half = (1.57 * iqr) / Math.sqrt(n);
  const lo = Math.max(q1, median - half);
  const hi = Math.min(q3, median + half);
  return hi > lo ? { lo, hi } : null;
};

const nominalBoxLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'box' }>
): Spec[] => {
  const theme = themeFor(options);
  const summary = rowsOf(chart, 'summary', options);
  const categories = categoriesOf(chart, options);
  const baseEncoding = {
    x: {
      field: 'category',
      type: 'nominal',
      ...(categories.length > 0 ? { sort: categories } : {}),
      axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX),
    },
  };
  const layers: Spec[] = [
    {
      data: { values: summary },
      mark: { type: 'rule', color: colorAt(options, 4), strokeWidth: 1 },
      encoding: { ...baseEncoding, y: yEncoding(chart, options, theme, 'min'), y2: { field: 'max' } },
    },
    {
      data: { values: summary },
      mark: { type: 'bar', size: 22, color: colorAt(options, 0), opacity: 0.35 },
      encoding: { ...baseEncoding, y: yEncoding(chart, options, theme, 'q1'), y2: { field: 'q3' } },
    },
    {
      data: { values: summary },
      mark: { type: 'tick', color: theme.text, size: 22, thickness: 2 },
      encoding: { ...baseEncoding, y: yEncoding(chart, options, theme, 'median') },
    },
    {
      data: { values: summary },
      mark: { type: 'tick', color: theme.muted, size: 8 },
      encoding: { ...baseEncoding, y: yEncoding(chart, options, theme, 'min') },
    },
    {
      data: { values: summary },
      mark: { type: 'tick', color: theme.muted, size: 8 },
      encoding: { ...baseEncoding, y: yEncoding(chart, options, theme, 'max') },
    },
  ];
  if (options.showMean) {
    layers.push({
      data: { values: summary.filter(row => Number.isFinite(num(row.mean))) },
      mark: { type: 'point', shape: 'diamond', size: 36, color: colorAt(options, 2) },
      encoding: { ...baseEncoding, y: yEncoding(chart, options, theme, 'mean') },
    });
  }
  if (options.showOutliers) {
    layers.push({
      data: { values: rowsOf(chart, 'outliers') },
      mark: { type: 'point', size: 18, color: colorAt(options, 4), opacity: 0.8 },
      encoding: { ...baseEncoding, y: yEncoding(chart, options, theme, 'value') },
    });
  }
  if (options.showPoints) {
    layers.push({
      data: { values: rowsOf(chart, 'points') },
      mark: {
        type: 'point',
        filled: true,
        shape: mark(options),
        size: options.pointSize,
        color: colorAt(options, 1),
        opacity: options.pointOpacity,
        ...tooltip(options),
      },
      encoding: { ...baseEncoding, y: yEncoding(chart, options, theme, 'value') },
    });
  }
  if (options.labelMedian) {
    layers.push({
      data: { values: summary },
      mark: { type: 'text', dy: -8, fontSize: 9, color: theme.text },
      encoding: {
        ...baseEncoding,
        y: yEncoding(chart, options, theme, 'median'),
        text: { field: 'median', type: 'quantitative', format: '.2f' },
      },
    });
  }
  rowsOf(chart, 'rules').forEach(row => {
    layers.push({
      data: { values: [row] },
      mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4], strokeWidth: 1 },
      encoding: { y: { field: 'y', type: 'quantitative' } },
    });
  });
  return layers;
};

interface NumericEncodings {
  x: (name: string, axisOn?: boolean) => Spec;
  y: (name: string, axisOn?: boolean) => Spec;
}

const numericEncodings = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'box' }>,
  theme: ReturnType<typeof themeFor>,
  categories: string[]
): NumericEncodings => {
  const numericAxis = {
    ...axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX),
    values: categories.map((_, index) => index),
    labelExpr: `${JSON.stringify(categories)}[datum.value]`,
  };
  const scale = { domain: [-0.5, Math.max(0.5, categories.length - 0.5)], nice: false };
  return {
    x: (name, axisOn = false) => ({
      field: name,
      type: 'quantitative',
      scale,
      ...(axisOn ? { axis: numericAxis } : {}),
    }),
    y: (name) => yEncoding(chart, options, theme, name),
  };
};

const notchedLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'box' }>
): Spec[] => {
  const theme = themeFor(options);
  const { summary, categories, centers } = numericSetup(chart, options);
  if (summary.length === 0) return [];
  const { x, y } = numericEncodings(chart, options, theme, categories);

  const areaRows: ChartRow[] = [];
  summary.forEach(row => {
    const center = Number(row.center);
    const q1 = num(row.q1);
    const median = num(row.median);
    const q3 = num(row.q3);
    const bounds = notchBounds(q1, median, q3, num(row.n));
    areaRows.push({ category: row.category, y: q1, x1: center - HALF_WIDTH, x2: center + HALF_WIDTH });
    if (bounds) {
      areaRows.push({ category: row.category, y: bounds.lo, x1: center - HALF_WIDTH, x2: center + HALF_WIDTH });
      areaRows.push({ category: row.category, y: median, x1: center, x2: center });
      areaRows.push({ category: row.category, y: bounds.hi, x1: center - HALF_WIDTH, x2: center + HALF_WIDTH });
    }
    areaRows.push({ category: row.category, y: q3, x1: center - HALF_WIDTH, x2: center + HALF_WIDTH });
  });

  const layers: Spec[] = [
    {
      data: { values: areaRows },
      mark: {
        type: 'area',
        color: colorAt(options, 0),
        opacity: 0.35,
        stroke: colorAt(options, 0),
        strokeWidth: 1,
        ...tooltip(options),
      },
      encoding: {
        x: x('x1'),
        x2: { field: 'x2' },
        y: y('y'),
        detail: { field: 'category' },
      },
    },
    {
      data: { values: summary },
      mark: { type: 'rule', color: colorAt(options, 4), strokeWidth: 1 },
      encoding: { x: x('center', true), y: y('min'), y2: { field: 'max' } },
    },
    {
      data: {
        values: summary.map(row => ({
          ...row,
          x1: Number(row.center) - HALF_WIDTH,
          x2: Number(row.center) + HALF_WIDTH,
        })),
      },
      mark: { type: 'rule', color: theme.text, strokeWidth: 2 },
      encoding: { x: x('x1'), x2: { field: 'x2' }, y: y('median') },
    },
    {
      data: {
        values: summary.map(row => ({
          ...row,
          x1: Number(row.center) - CAP_WIDTH,
          x2: Number(row.center) + CAP_WIDTH,
        })),
      },
      mark: { type: 'rule', color: theme.muted, strokeWidth: 1 },
      encoding: { x: x('x1'), x2: { field: 'x2' }, y: y('min') },
    },
    {
      data: {
        values: summary.map(row => ({
          ...row,
          x1: Number(row.center) - CAP_WIDTH,
          x2: Number(row.center) + CAP_WIDTH,
        })),
      },
      mark: { type: 'rule', color: theme.muted, strokeWidth: 1 },
      encoding: { x: x('x1'), x2: { field: 'x2' }, y: y('max') },
    },
  ];

  if (options.showMean) {
    layers.push({
      data: { values: summary.filter(row => Number.isFinite(num(row.mean))) },
      mark: { type: 'point', shape: 'diamond', size: 36, color: colorAt(options, 2) },
      encoding: { x: x('center'), y: y('mean') },
    });
  }
  if (options.showOutliers) {
    layers.push({
      data: {
        values: rowsOf(chart, 'outliers').map(row => ({
          ...row,
          center: centers.get(String(row.category ?? '')) ?? NaN,
        })),
      },
      mark: { type: 'point', size: 18, color: colorAt(options, 4), opacity: 0.8 },
      encoding: { x: x('center'), y: y('value') },
    });
  }
  if (options.showPoints) {
    layers.push({
      data: {
        values: rowsOf(chart, 'points').map(row => ({
          ...row,
          center: centers.get(String(row.category ?? '')) ?? NaN,
        })),
      },
      mark: {
        type: 'point',
        filled: true,
        shape: mark(options),
        size: options.pointSize,
        color: colorAt(options, 1),
        opacity: options.pointOpacity,
        ...tooltip(options),
      },
      encoding: { x: x('center'), y: y('value') },
    });
  }
  if (options.labelMedian) {
    layers.push({
      data: { values: summary },
      mark: { type: 'text', dy: -8, fontSize: 9, color: theme.text },
      encoding: {
        x: x('center'),
        y: y('median'),
        text: { field: 'median', type: 'quantitative', format: '.2f' },
      },
    });
  }
  rowsOf(chart, 'rules').forEach(row => {
    layers.push({
      data: { values: [row] },
      mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4], strokeWidth: 1 },
      encoding: { y: { field: 'y', type: 'quantitative', axis: null } },
    });
  });
  return layers;
};

const violinLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'box' }>
): Spec[] => {
  const theme = themeFor(options);
  const { summary, categories, centers } = numericSetup(chart, options);
  const { rows, skipped } = violinRows(rowsOf(chart, 'points'), categories, centers);
  const stubs = skipped.flatMap(category => {
    const match = summary.find(row => String(row.category ?? '') === category);
    if (!match) return [];
    return [{
      category,
      center: centers.get(category) ?? 0,
      min: num(match.min),
      max: num(match.max),
    }];
  }).filter(row => Number.isFinite(row.min) && Number.isFinite(row.max));

  if (rows.length === 0 && stubs.length === 0) return nominalBoxLayers(chart, options);
  const { x, y } = numericEncodings(chart, options, theme, categories);

  const layers: Spec[] = [];
  if (rows.length > 0) {
    layers.push({
      data: { values: rows },
      mark: {
        type: 'area',
        color: colorAt(options, 0),
        opacity: 0.3,
        stroke: colorAt(options, 0),
        strokeWidth: 1,
        ...tooltip(options),
      },
      encoding: {
        x: x('x1', true),
        x2: { field: 'x2' },
        y: y('value'),
        detail: { field: 'category' },
      },
    });
  }
  stubs.forEach((row, index) => {
    const first = rows.length === 0 && index === 0;
    const constant = row.min === row.max;
    layers.push({
      data: { values: [row] },
      mark: constant
        ? { type: 'point', size: 18, color: colorAt(options, 0), opacity: 0.8 }
        : {
            type: 'rule',
            color: colorAt(options, 0),
            opacity: 0.6,
            strokeDash: [4, 3],
            strokeWidth: 1,
          },
      encoding: constant
        ? { x: x('center', first), y: y('min') }
        : { x: x('center', first), y: y('min'), y2: { field: 'max' } },
    });
  });
  rowsOf(chart, 'rules').forEach(row => {
    layers.push({
      data: { values: [row] },
      mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4], strokeWidth: 1 },
      encoding: { y: { field: 'y', type: 'quantitative', axis: null } },
    });
  });
  return layers;
};

export const boxLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'box' }>
): Spec[] => {
  const display = boxDisplayOf(options);
  if (display === 'notched') return notchedLayers(chart, options);
  if (display === 'violin') return violinLayers(chart, options);
  return nominalBoxLayers(chart, options);
};
