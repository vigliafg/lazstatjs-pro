import type { AnalysisChart, ChartOptions, ChartRow } from '../../stats/charts';
import { confidenceEllipse, kernelDensity } from '../kits/common';
import { colorAt, themeFor } from './theme';
import {
  axis,
  colorEncoding,
  field,
  num,
  rowsOf,
  tooltip,
  xEncoding,
  yEncoding,
  type Spec,
} from './encoding';

const categoryAxis = (
  chart: AnalysisChart,
  options: ChartOptions,
  theme: ReturnType<typeof themeFor>,
  categories: string[] | null
): Spec => ({
  field: 'category',
  type: 'nominal',
  ...(categories ? { sort: categories } : { sort: null }),
  axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX),
});

const orderedCategories = (
  rows: ChartRow[],
  key: string,
  sort: 'none' | 'asc' | 'desc'
): string[] | null => {
  const values = new Map<string, number>();
  rows.forEach(row => values.set(String(row.category ?? ''), num(row[key])));
  const categories = Array.from(values.keys());
  if (sort === 'none') return null;
  return [...categories].sort(
    (a, b) => ((values.get(a) ?? 0) - (values.get(b) ?? 0)) * (sort === 'asc' ? 1 : -1)
  );
};

/** Mean diamond: one estimate per category with its confidence interval. */
export const diamondLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'diamond' }>
): Spec[] => {
  const theme = themeFor(options);
  const rows = rowsOf(chart, 'intervals');
  const ordered = orderedCategories(rows, 'estimate', options.sort);
  const x = categoryAxis(chart, options, theme, ordered);
  const spans = rows
    .map(row => num(row.hi) - num(row.lo))
    .filter(value => Number.isFinite(value) && value >= 0);
  const maxSpan = spans.length > 0 ? Math.max(...spans) : 0;
  const scaled = rows.map(row => {
    const span = num(row.hi) - num(row.lo);
    return {
      ...row,
      span: Number.isFinite(span) && span >= 0 ? span : 0,
    };
  });
  const diamond: Spec = {
    data: { values: scaled },
    mark: {
      type: 'point',
      filled: true,
      shape: 'diamond',
      color: colorAt(options, 2),
      opacity: 1,
      ...(options.scaleToCI ? {} : { size: Math.max(60, options.pointSize) }),
      ...tooltip(options),
    },
    encoding: {
      x,
      y: yEncoding(chart, options, theme, 'estimate'),
      ...(options.scaleToCI && maxSpan > 0
        ? {
            size: {
              field: 'span',
              type: 'quantitative',
              scale: { domain: [0, maxSpan], range: [60, 700] },
              legend: null,
            },
          }
        : {}),
    },
  };
  const layers: Spec[] = [
    {
      data: { values: rows },
      mark: { type: 'rule', color: theme.text, strokeWidth: 1.5 },
      encoding: { x, y: yEncoding(chart, options, theme, 'lo'), y2: { field: 'hi' } },
    },
    {
      data: { values: rows },
      mark: { type: 'tick', color: theme.muted, size: 10 },
      encoding: { x, y: yEncoding(chart, options, theme, 'lo') },
    },
    {
      data: { values: rows },
      mark: { type: 'tick', color: theme.muted, size: 10 },
      encoding: { x, y: yEncoding(chart, options, theme, 'hi') },
    },
    diamond,
  ];
  if (options.showLabels) {
    layers.push({
      data: { values: rows },
      mark: { type: 'text', dy: -10, fontSize: 9, color: theme.text },
      encoding: {
        x,
        y: yEncoding(chart, options, theme, 'estimate'),
        text: { field: 'estimate', type: 'quantitative', format: '.2f' },
      },
    });
  }
  return layers;
};

/** Comparison circles: group estimates on one numeric axis. */
export const circleLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'circles' }>
): Spec[] => {
  const theme = themeFor(options);
  const rows = rowsOf(chart, 'intervals');
  const ordered = orderedCategories(rows, 'estimate', options.sort);
  const spans = rows
    .map(row => num(row.hi) - num(row.lo))
    .filter(value => Number.isFinite(value) && value >= 0);
  const maxSpan = spans.length > 0 ? Math.max(...spans) : 0;
  const scaled = rows.map(row => {
    const span = num(row.hi) - num(row.lo);
    return { ...row, span: Number.isFinite(span) && span >= 0 ? span : 0 };
  });
  const y: Spec = {
    field: 'category',
    type: 'nominal',
    ...(ordered ? { sort: ordered } : { sort: null }),
    axis: axis(options, theme, options.showYTitle ? field(chart, 'yLabel', '') : null, options.gridY),
  };
  const xValue = (fieldName: string): Spec => ({
    field: fieldName,
    type: 'quantitative',
    axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX),
    ...(options.zeroBaseline ? { scale: { zero: true } } : {}),
  });
  const layers: Spec[] = [
    {
      data: { values: scaled },
      mark: {
        type: 'point',
        filled: true,
        shape: 'circle',
        opacity: 0.35,
        color: colorAt(options, 0),
        ...(maxSpan > 0
          ? {}
          : { size: Math.max(80, options.pointSize * 2) }),
        ...tooltip(options),
      },
      encoding: {
        x: xValue('estimate'),
        y,
        ...(maxSpan > 0
          ? {
              size: {
                field: 'span',
                type: 'quantitative',
                scale: { domain: [0, maxSpan], range: [120, 900] },
                legend: null,
              },
            }
          : {}),
      },
    },
  ];
  if (options.showIntervals) {
    layers.push({
      data: { values: rows },
      mark: { type: 'rule', color: theme.text, strokeWidth: 1 },
      encoding: {
        x: { field: 'lo', type: 'quantitative' },
        x2: { field: 'hi' },
        y,
      },
    });
  }
  if (options.showLabels) {
    layers.push({
      data: { values: rows },
      mark: { type: 'text', dx: 8, fontSize: 9, color: theme.text },
      encoding: {
        x: xValue('estimate'),
        y,
        text: { field: 'category', type: 'nominal' },
      },
    });
  }
  return layers;
};

/** Shadowgram: filled KDE silhouette, optional rug and mean line. */
export const shadowgramLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'shadowgram' }>
): Spec[] => {
  const theme = themeFor(options);
  const values = rowsOf(chart, 'values')
    .map(row => num(row.value))
    .filter(Number.isFinite);
  const density = kernelDensity(values).map(point => ({ x: point.x, y: point.y, y2: 0 }));
  const layers: Spec[] = [];
  if (density.length > 0) {
    layers.push({
      data: { values: density },
      mark: {
        type: 'area',
        opacity: 0.35,
        color: colorAt(options, 0),
        line: { color: colorAt(options, 0), strokeWidth: options.lineWidth },
      },
      encoding: {
        x: xEncoding(chart, options, theme, 'x'),
        y: {
          field: 'y',
          type: 'quantitative',
          title: options.showYTitle ? field(chart, 'yLabel', 'Density') : null,
          axis: axis(options, theme, options.showYTitle ? field(chart, 'yLabel', 'Density') : null, options.gridY),
        },
        y2: { field: 'y2' },
      },
    });
  }
  if (options.showRug && values.length > 0) {
    layers.push({
      data: { values: values.map(value => ({ value })) },
      mark: { type: 'tick', size: 8, color: colorAt(options, 3), opacity: 0.5 },
      encoding: { x: { field: 'value', type: 'quantitative' } },
    });
  }
  if (options.showMeanLine && values.length > 0) {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    layers.push({
      data: { values: [{ value: mean }] },
      mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4] },
      encoding: { x: { field: 'value', type: 'quantitative' } },
    });
  }
  return layers;
};

/** Scatterplot matrix: the runner prepares panel-normalised coordinates. */
export const scatterMatrixLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'scattermatrix' }>
): Spec[] => {
  const theme = themeFor(options);
  const dim = Math.max(1, Math.round(Number(chart.stats?.dim) || 1));
  const scaleX = { domain: [0, dim] as [number, number] };
  const scaleY = { domain: [dim, 0] as [number, number] };
  const xBase: Spec = {
    field: 'x',
    type: 'quantitative',
    scale: scaleX,
    axis: null,
  };
  const yBase: Spec = {
    field: 'y',
    type: 'quantitative',
    scale: scaleY,
    axis: null,
  };
  const panels = rowsOf(chart, 'panels');
  const circles = rowsOf(chart, 'ellipses');
  const labels = rowsOf(chart, 'labels');
  const points = rowsOf(chart, 'points');
  const layers: Spec[] = [];
  if (panels.length > 0) {
    layers.push({
      data: { values: panels },
      mark: {
        type: 'rect',
        fill: theme.surface,
        stroke: theme.grid,
        strokeWidth: 1,
      },
      encoding: {
        x: { field: 'px', type: 'quantitative', scale: scaleX, axis: null },
        x2: { field: 'px2' },
        y: { field: 'py', type: 'quantitative', scale: scaleY, axis: null },
        y2: { field: 'py2' },
      },
    });
  }
  layers.push({
    data: { values: points },
    mark: {
      type: 'point',
      filled: true,
      size: 18,
      opacity: 0.6,
      color: colorAt(options, 0),
      ...tooltip(options),
    },
    encoding: { x: xBase, y: yBase },
  });
  if (options.showEllipses && circles.length > 0) {
    layers.push({
      data: { values: circles },
      mark: { type: 'line', color: colorAt(options, 4), strokeDash: [4, 4], strokeWidth: 1 },
      encoding: { x: xBase, y: yBase },
    });
  }
  if (labels.length > 0) {
    layers.push({
      data: { values: labels },
      mark: { type: 'text', fontSize: 8, color: theme.muted },
      encoding: {
        x: { field: 'x', type: 'quantitative', scale: scaleX, axis: null },
        y: { field: 'y', type: 'quantitative', scale: scaleY, axis: null },
        text: { field: 'label', type: 'nominal' },
      },
    });
  }
  return layers;
};

/** Bubble plot: x/y positions plus a size channel. */
export const bubbleLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'bubble' }>
): Spec[] => {
  const theme = themeFor(options);
  const rows = rowsOf(chart, 'points');
  const sizes = rows.map(row => Math.abs(num(row.size))).filter(Number.isFinite);
  const maxSize = sizes.length > 0 ? Math.max(...sizes) : 1;
  const layers: Spec[] = [
    {
      data: { values: rows },
      mark: {
        type: 'point',
        filled: true,
        shape: markOf(options),
        opacity: options.pointOpacity,
        color: colorAt(options, 0),
        ...tooltip(options),
      },
      encoding: {
        x: xEncoding(chart, options, theme),
        y: yEncoding(chart, options, theme),
        size: {
          field: 'size',
          type: 'quantitative',
          scale: { domain: [0, Math.max(1, maxSize)], range: [40, 900] },
          legend: options.showSizeLegend ? { title: field(chart, 'sizeLabel', 'Size') } : null,
        },
        ...(rows.some(row => row.series !== undefined || row.group !== undefined)
          ? {
              color: colorEncoding(
                chart,
                options,
                theme,
                rows.some(row => row.series !== undefined) ? 'series' : 'group',
                rows
              ),
            }
          : {}),
      },
    },
  ];
  if (options.showLabels) {
    layers.push({
      data: { values: rows.filter(row => row.label !== undefined && row.label !== null) },
      mark: { type: 'text', dx: 8, fontSize: 9, color: theme.muted },
      encoding: {
        x: xEncoding(chart, options, theme),
        y: yEncoding(chart, options, theme),
        text: { field: 'label', type: 'nominal' },
      },
    });
  }
  return layers;
};

const markOf = (options: ChartOptions): string =>
  options.kind === 'bubble' || options.kind === 'scatter3d'
    ? options.pointShape === 'circle'
      ? 'circle'
      : options.pointShape === 'square'
        ? 'square'
        : options.pointShape === 'diamond'
          ? 'diamond'
          : 'triangle'
    : 'circle';

const normalise = (value: number, min: number, max: number): number =>
  max > min ? (value - min) / (max - min) : 0.5;

/** Projected 3D scatter with a projected density ellipsoid. */
export const scatter3dLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'scatter3d' }>
): Spec[] => {
  const theme = themeFor(options);
  const rows = rowsOf(chart, 'points');
  const xs = rows.map(row => num(row.x)).filter(Number.isFinite);
  const ys = rows.map(row => num(row.y)).filter(Number.isFinite);
  const zs = rows.map(row => num(row.z)).filter(Number.isFinite);
  const bounds = (values: number[]): [number, number] =>
    values.length > 0 ? [Math.min(...values), Math.max(...values)] : [0, 1];
  const [xMin, xMax] = bounds(xs);
  const [yMin, yMax] = bounds(ys);
  const [zMin, zMax] = bounds(zs);
  const projected = rows.map(row => {
    const nx = normalise(num(row.x), xMin, xMax);
    const ny = normalise(num(row.y), yMin, yMax);
    const nz = normalise(num(row.z), zMin, zMax);
    return {
      x: nx + 0.45 * nz,
      y: ny + 0.28 * nz,
      z: nz,
      ...(row.label !== undefined ? { label: row.label } : {}),
    };
  });
  const extentX = 1.45;
  const extentY = 1.28;
  const x: Spec = {
    field: 'x',
    type: 'quantitative',
    scale: { domain: [0, extentX] as [number, number] },
    axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX),
  };
  const y: Spec = {
    field: 'y',
    type: 'quantitative',
    scale: { domain: [0, extentY] as [number, number] },
    axis: axis(options, theme, options.showYTitle ? field(chart, 'yLabel', '') : null, options.gridY),
  };
  const layers: Spec[] = [];
  if (options.showEllipsoid) {
    const ellipse = confidenceEllipse(
      projected.map(point => ({ x: point.x, y: point.y }))
    );
    if (ellipse.length > 0) {
      layers.push({
        data: { values: ellipse },
        mark: { type: 'line', color: colorAt(options, 4), strokeDash: [4, 4], strokeWidth: 1 },
        encoding: { x, y },
      });
    }
  }
  if (options.showPoints) {
    layers.push({
      data: { values: projected },
      mark: {
        type: 'point',
        filled: true,
        shape: markOf(options),
        opacity: options.pointOpacity,
        color: colorAt(options, 0),
        ...tooltip(options),
      },
      encoding: {
        x,
        y,
        size: {
          field: 'z',
          type: 'quantitative',
          scale: { domain: [0, 1], range: [40, 260] },
          legend: null,
        },
      },
    });
  }
  return layers;
};
