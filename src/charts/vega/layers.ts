import type { AnalysisChart, ChartOptions, ChartRow } from '../../stats/charts';
import { confidenceEllipse, survivalMedians } from '../kits/common';
import { histogramLayers } from './distributionLayers';
import { colorAt, themeFor } from './theme';
import {
  axis,
  bandRows,
  colorEncoding,
  field,
  lineStyle,
  mark,
  num,
  pointMark,
  rowsOf,
  tooltip,
  xEncoding,
  yEncoding,
  type Spec,
} from './encoding';

export const scatterLayers = (chart: AnalysisChart, options: Extract<ChartOptions, { kind: 'scatter' }>): Spec[] => {
  const theme = themeFor(options);
  const layers: Spec[] = [];
  const band = bandRows(chart, options);
  if (band.length > 0) {
    layers.push({
      data: { values: band },
      mark: { type: 'area', opacity: options.bandOpacity, color: colorAt(options, 0), line: false },
      encoding: {
        x: xEncoding(chart, options, theme),
        y: { field: 'lo', type: 'quantitative', title: null },
        y2: { field: 'hi' },
      },
    });
  }
  if (options.fit !== 'none') {
    const fitLayers = options.fit === 'both' ? ['fit', 'robust'] : [options.fit === 'robust' ? 'robust' : 'fit'];
    fitLayers.forEach((layer, index) => {
      const rows = rowsOf(chart, layer);
      if (rows.length === 0) return;
      layers.push({
        data: { values: rows },
        mark: lineStyle(
          options,
          colorAt(options, layer === 'robust' ? 1 : 4),
          layer === 'robust' ? 'solid' : 'dashed'
        ),
        encoding: { x: xEncoding(chart, options, theme), y: yEncoding(chart, options, theme) },
      });
    });
  }
  if (options.showPoints) {
    layers.push({
      data: { values: rowsOf(chart, 'points') },
      mark: pointMark(options, theme),
      encoding: {
        x: xEncoding(chart, options, theme),
        y: yEncoding(chart, options, theme),
      },
    });
  }
  rowsOf(chart, 'rules').forEach((row, index) => {
    layers.push({
      data: { values: [row] },
      mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4], strokeWidth: 1 },
      encoding: { y: { field: 'y', type: 'quantitative' } },
    });
  });
  if (options.pointLabels) {
    const explicit = rowsOf(chart, 'labels');
    const labels =
      explicit.length > 0
        ? explicit
        : rowsOf(chart, 'points')
            .filter(row => row.label !== undefined && row.label !== null)
            .map(row => ({ x: row.x, y: row.y, text: String(row.label) }));
    labels.forEach(row => {
      layers.push({
        data: { values: [row] },
        mark: { type: 'text', align: 'left', dx: 6, dy: -6, fontSize: 9, color: theme.muted },
        encoding: {
          x: xEncoding(chart, options, theme),
          y: yEncoding(chart, options, theme),
          text: { field: 'text', type: 'nominal' },
        },
      });
    });
  }
  if (options.equation !== 'none' || options.showR2 || options.showN) {
    const annotations: string[] = [];
    const eq = typeof chart.stats?.equation === 'string' ? chart.stats.equation : '';
    const shortEq = typeof chart.stats?.equationShort === 'string' ? chart.stats.equationShort : eq;
    if (options.equation !== 'none') {
      const equation = options.equation === 'short' ? shortEq : eq;
      if (equation) annotations.push(equation);
    }
    if (options.showR2 && chart.stats?.r2 !== undefined) annotations.push(`R² = ${chart.stats.r2}`);
    if (options.showN && chart.stats?.n !== undefined) annotations.push(`N = ${chart.stats.n}`);
    if (annotations.length > 0) {
      const points = rowsOf(chart, 'points');
      const values = points.map(row => num(row.x)).filter(Number.isFinite);
      const ys = points.map(row => num(row.y)).filter(Number.isFinite);
      const x = values.length ? Math.min(...values) : 0;
      const y = ys.length ? Math.max(...ys) : 0;
      layers.push({
        data: { values: [{ x, y, text: annotations.join(' · ') }] },
        mark: { type: 'text', align: 'left', baseline: 'top', dx: 6, dy: -4, fontSize: 9, color: theme.text },
        encoding: {
          x: { field: 'x', type: 'quantitative' },
          y: { field: 'y', type: 'quantitative' },
          text: { field: 'text', type: 'nominal' },
        },
      });
    }
  }
  return layers;
};

export const lineLayers = (chart: AnalysisChart, options: Extract<ChartOptions, { kind: 'line' }>): Spec[] => {
  const theme = themeFor(options);
  const series = rowsOf(chart, 'series');
  const layers: Spec[] = [];
  const band = series.filter(row => row.lo !== null && row.hi !== null && row.lo !== undefined && row.hi !== undefined);
  if (options.showBand && band.length > 0) {
    layers.push({
      data: { values: band },
      mark: { type: 'area', opacity: 0.15, color: colorAt(options, 5), line: false },
      encoding: {
        x: xEncoding(chart, options, theme),
        y: { field: 'lo', type: 'quantitative', title: null },
        y2: { field: 'hi' },
        color: colorEncoding(chart, options, theme),
      },
    });
  }
  const seriesColor = chart.data.series?.some(row => row.series !== undefined)
    ? { color: colorEncoding(chart, options, theme) }
    : {};
  // A row with `step: 0` opts out of the step interpolation: the ROC
  // reference diagonal must stay a straight line while the curve is stepped.
  const stepped = options.step ? series.filter(row => row.step !== 0) : series;
  const smooth = options.step ? series.filter(row => row.step === 0) : [];
  const lineLayer = (values: ChartRow[], step: boolean): Spec => ({
    data: { values },
    mark: {
      ...lineStyle(options, colorAt(options, 0)),
      ...(step ? { interpolate: 'step-after' } : {}),
      ...tooltip(options),
    },
    encoding: {
      x: xEncoding(chart, options, theme),
      y: yEncoding(chart, options, theme),
      ...seriesColor,
    },
  });
  if (stepped.length > 0) layers.push(lineLayer(stepped, options.step));
  if (smooth.length > 0) layers.push(lineLayer(smooth, false));
  if (options.showMarkers) {
    const explicit = rowsOf(chart, 'markers');
    const markers = explicit.length > 0 ? explicit : series;
    layers.push({
      data: { values: markers },
      mark: pointMark(options, theme),
      encoding: {
        x: xEncoding(chart, options, theme),
        y: yEncoding(chart, options, theme),
        ...(markers.some(row => row.series !== undefined)
          ? { color: colorEncoding(chart, options, theme) }
          : {}),
      },
    });
  }
  rowsOf(chart, 'rules').forEach(row => {
    layers.push({
      data: { values: [row] },
      mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4], strokeWidth: 1 },
      encoding: { y: { field: row.value !== undefined ? 'value' : 'y', type: 'quantitative' } },
    });
  });
  return layers;
};

export const barLayers = (chart: AnalysisChart, options: Extract<ChartOptions, { kind: 'bar' }>): Spec[] => {
  const theme = themeFor(options);
  const bars = rowsOf(chart, 'bars', options);
  // The nominal axis is sorted alphabetically by default; use the value order
  // for asc/desc so the control actually changes the axis, including grouped
  // or stacked series (the order follows the category total).
  const categories = Array.from(new Set(bars.map(row => String(row.category ?? ''))));
  const totals = new Map<string, number>();
  bars.forEach(row => {
    const category = String(row.category ?? '');
    totals.set(category, (totals.get(category) ?? 0) + num(row.value));
  });
  const orderedCategories =
    options.sort === 'none'
      ? null
      : [...categories].sort(
          (a, b) =>
            ((totals.get(a) ?? 0) - (totals.get(b) ?? 0)) * (options.sort === 'asc' ? 1 : -1)
        );
  const layers: Spec[] = [];
  const intervalOf = (row: ChartRow): { lo: number; hi: number } | null => {
    if (options.error === 'none') return null;
    const value = num(row.value);
    if (options.error === 'sd' && Number.isFinite(num(row.sd)) && Number.isFinite(value)) {
      const sd = num(row.sd);
      return { lo: value - sd, hi: value + sd };
    }
    if (options.error === 'se' && Number.isFinite(num(row.se)) && Number.isFinite(value)) {
      const se = num(row.se);
      return { lo: value - se, hi: value + se };
    }
    if (options.error === 'ci' && row.lo !== undefined && row.hi !== undefined) {
      const lo = num(row.lo);
      const hi = num(row.hi);
      if (Number.isFinite(lo) && Number.isFinite(hi)) return { lo, hi };
    }
    return null;
  };
  const hasSeries = bars.some(row => row.series !== undefined);
  const grouped = options.grouping === 'grouped' && hasSeries;
  const offset = grouped
    ? { xOffset: { field: 'series', type: 'nominal', title: null } }
    : {};
  const errorBars = bars
    .map(row => ({ row, interval: intervalOf(row) }))
    .filter((item): item is { row: ChartRow; interval: { lo: number; hi: number } } => item.interval !== null);
  layers.push({
    data: { values: bars },
    mark: { type: 'bar', color: colorAt(options, 0), ...tooltip(options) },
    encoding: {
      x: {
        field: 'category',
        type: 'nominal',
        sort: orderedCategories,
        axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX),
      },
      y: yEncoding(chart, options, theme, 'value', {
        scale: { zero: true },
        ...(grouped ? { stack: null } : {}),
      }),
      ...(hasSeries ? { color: colorEncoding(chart, options, theme) } : {}),
      ...offset,
    },
  });
  // Error bars ride on top of the filled bars, otherwise the bar layer hides
  // the confidence interval completely.
  if (errorBars.length > 0) {
    layers.push({
      data: {
        values: errorBars.map(({ row, interval }) => ({
          category: row.category,
          series: row.series,
          lo: interval.lo,
          hi: interval.hi,
        })),
      },
      mark: { type: 'rule', color: theme.text, strokeWidth: 1.5 },
      encoding: {
        x: {
          field: 'category',
          type: 'nominal',
          sort: orderedCategories,
          axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX),
        },
        y: { field: 'lo', type: 'quantitative', title: null },
        y2: { field: 'hi' },
        ...offset,
      },
    });
  }
  if (options.valueLabels) {
    layers.push({
      data: { values: bars },
      mark: { type: 'text', dy: -6, fontSize: 9, color: theme.text },
      encoding: {
        x: { field: 'category', type: 'nominal', sort: orderedCategories },
        y: { field: 'value', type: 'quantitative' },
        text: { field: 'value', type: 'quantitative', format: '.2f' },
        ...offset,
      },
    });
  }
  const rules = rowsOf(chart, 'rules');
  if (options.referenceLine === 'zero') rules.push({ value: 0 });
  if (options.referenceLine === 'one') rules.push({ value: 1 });
  rules.forEach(row => {
    layers.push({
      data: { values: [row] },
      mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4], strokeWidth: 1 },
      encoding: { y: { field: 'value', type: 'quantitative' } },
    });
  });
  return layers;
};


export const forestLayers = (chart: AnalysisChart, options: Extract<ChartOptions, { kind: 'forest' }>): Spec[] => {
  const theme = themeFor(options);
  const points = rowsOf(chart, 'points');
  const sorted = options.sort === 'estimate'
    ? [...points].sort((a, b) => num(a.estimate) - num(b.estimate))
    : options.sort === 'label'
      ? [...points].sort((a, b) => String(a.label).localeCompare(String(b.label)))
      : points;
  const reference = options.reference === 'zero' ? 0 : 1;
  return [
    {
      data: { values: sorted },
      mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4], strokeWidth: 1 },
      encoding: { x: { datum: reference, type: 'quantitative' } },
    },
    {
      data: { values: sorted },
      mark: { type: 'rule', color: colorAt(options, 0), strokeWidth: 2 },
      encoding: {
        y: { field: 'label', type: 'nominal', sort: null, axis: axis(options, theme, null, false) },
        x: { field: 'lo', type: 'quantitative', title: options.showXTitle ? field(chart, 'xLabel', '') : null, axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX), scale: options.logScale ? { type: 'log', zero: false } : { zero: false } },
        x2: { field: 'hi' },
      },
    },
    {
      data: { values: sorted },
      mark: { type: 'point', filled: true, size: options.pointSize, color: colorAt(options, 2) },
      encoding: {
        y: { field: 'label', type: 'nominal', sort: null },
        x: { field: 'estimate', type: 'quantitative', scale: options.logScale ? { type: 'log', zero: false } : { zero: false } },
      },
    },
  ];
};

export const survivalLayers = (chart: AnalysisChart, options: Extract<ChartOptions, { kind: 'survival' }>): Spec[] => {
  const theme = themeFor(options);
  const curves = rowsOf(chart, 'curves');
  const layers: Spec[] = [];
  if (options.showCI) {
    layers.push({
      data: { values: curves.filter(row => row.lo !== null && row.hi !== null && row.lo !== undefined && row.hi !== undefined) },
      mark: { type: 'area', opacity: 0.12, color: colorAt(options, 0), line: false },
      encoding: {
        x: xEncoding(chart, options, theme),
        y: { field: 'lo', type: 'quantitative', title: null },
        y2: { field: 'hi' },
        color: colorEncoding(chart, options, theme),
      },
    });
  }
  layers.push({
    data: { values: curves },
    mark: { type: 'line', strokeWidth: options.lineWidth, ...(options.step ? { interpolate: 'step-after' } : {}) },
    encoding: {
      x: xEncoding(chart, options, theme),
      y: yEncoding(chart, options, theme, 'y', { scale: { domain: [0, 1] }, axis: axis(options, theme, options.showYTitle ? field(chart, 'yLabel', '') : null, options.gridY) }),
      color: colorEncoding(chart, options, theme),
    },
  });
  if (options.showCensoring) {
    layers.push({
      data: { values: rowsOf(chart, 'censored') },
      mark: { type: 'tick', size: 10, thickness: 1.5, color: theme.text },
      encoding: {
        x: xEncoding(chart, options, theme),
        y: { field: 'y', type: 'quantitative' },
        color: colorEncoding(chart, options, theme),
      },
    });
  }
  if (options.showMedian) {
    const explicit = rowsOf(chart, 'medians');
    const medians = explicit.length > 0 ? explicit : survivalMedians(curves);
    if (medians.length > 0) {
      const hasSeries = medians.some(row => row.series !== undefined);
      layers.push({
        data: { values: medians },
        mark: { type: 'rule', color: colorAt(options, 3), strokeDash: [4, 4] },
        encoding: {
          x: { field: 'x', type: 'quantitative' },
          ...(hasSeries ? { color: colorEncoding(chart, options, theme) } : {}),
        },
      });
    }
  }
  return layers;
};

export const acfLayers = (chart: AnalysisChart, options: Extract<ChartOptions, { kind: 'acf' }>): Spec[] => {
  const theme = themeFor(options);
  const layers: Spec[] = [
    {
      data: { values: rowsOf(chart, 'bars') },
      mark: { type: 'bar', color: colorAt(options, 0), ...tooltip(options) },
      encoding: {
        x: { field: 'lag', type: 'quantitative', axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX) },
        y: yEncoding(chart, options, theme, 'value'),
      },
    },
  ];
  if (options.showBand) {
    rowsOf(chart, 'band').forEach(row => {
      layers.push({
        data: { values: [row] },
        mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4] },
        encoding: { y: { field: 'value', type: 'quantitative' } },
      });
    });
  }
  return layers;
};

export const heatmapLayers = (chart: AnalysisChart, options: Extract<ChartOptions, { kind: 'heatmap' }>): Spec[] => {
  const theme = themeFor(options);
  const cells = rowsOf(chart, 'cells');
  const marginal = (fieldName: string, category: string): number => {
    const values = cells
      .filter(row => String(row[fieldName] ?? '') === category)
      .map(row => num(row.value))
      .filter(Number.isFinite);
    return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  };
  const orderOf = (fieldName: string): string[] | null => {
    if (options.sort === 'none') return null;
    const categories = Array.from(new Set(cells.map(row => String(row[fieldName] ?? ''))));
    return [...categories].sort(
      (a, b) => (marginal(fieldName, a) - marginal(fieldName, b)) * (options.sort === 'asc' ? 1 : -1)
    );
  };
  const xOrder = orderOf('x');
  const yOrder = orderOf('y');
  const layers: Spec[] = [
    {
      data: { values: cells },
      mark: { type: 'rect', ...tooltip(options) },
      encoding: {
        x: { field: 'x', type: 'nominal', sort: xOrder, axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, false) },
        y: { field: 'y', type: 'nominal', sort: yOrder, axis: axis(options, theme, options.showYTitle ? field(chart, 'yLabel', '') : null, false) },
        color: {
          field: 'value',
          type: 'quantitative',
          scale: options.diverging
            ? { scheme: 'redblue', domainMid: 0 }
            : { scheme: 'blues' },
          legend: options.showLegend ? { title: null, labelColor: theme.muted } : null,
        },
      },
    },
  ];
  if (options.showValues) {
    layers.push({
      data: { values: cells },
      mark: { type: 'text', fontSize: 9, color: theme.text },
      encoding: {
        x: { field: 'x', type: 'nominal', sort: xOrder },
        y: { field: 'y', type: 'nominal', sort: yOrder },
        text: { field: 'label', type: 'nominal' },
      },
    });
  }
  return layers;
};

export const scatterOnly = (chart: AnalysisChart, options: ChartOptions): Spec[] => {
  const theme = themeFor(options);
  const pointRows = rowsOf(chart, 'points');
  const layers: Spec[] = [];
  if (options.kind !== 'residual' || options.showPoints) {
    layers.push({
      data: { values: pointRows },
      mark: pointMark(options, theme),
      encoding: {
        x: xEncoding(chart, options, theme),
        y: yEncoding(chart, options, theme),
        ...(options.kind === 'score' && options.showLabels
          ? { tooltip: { content: 'data' } }
          : {}),
      },
    });
  }
  if (options.kind === 'score' && options.showLabels) {
    const labels = pointRows.filter(row => row.label !== undefined && row.label !== null && String(row.label).length > 0);
    if (labels.length > 0) {
      layers.push({
        data: { values: labels },
        mark: { type: 'text', dx: 6, dy: -6, fontSize: 9, color: theme.muted },
        encoding: {
          x: xEncoding(chart, options, theme),
          y: yEncoding(chart, options, theme),
          text: { field: 'label', type: 'nominal' },
        },
      });
    }
  }
  if (options.kind === 'score' && options.ellipse) {
    const ellipse = confidenceEllipse(pointRows);
    if (ellipse.length > 0) {
      layers.push({
        data: { values: ellipse },
        mark: { type: 'line', color: colorAt(options, 4), strokeDash: [4, 4], strokeWidth: 1 },
        encoding: { x: xEncoding(chart, options, theme), y: yEncoding(chart, options, theme) },
      });
    }
  }
  if (options.kind === 'score' && options.showVectors) {
    const vectors = rowsOf(chart, 'vectors');
    if (vectors.length > 0) {
      layers.push({
        data: { values: vectors },
        mark: { type: 'rule', color: colorAt(options, 2), strokeWidth: 1 },
        encoding: {
          x: { field: 'x', type: 'quantitative' },
          y: { field: 'y', type: 'quantitative' },
          x2: { field: 'x2' },
          y2: { field: 'y2' },
        },
      });
      layers.push({
        data: { values: vectors },
        mark: { type: 'text', dx: 4, dy: -4, fontSize: 8, color: theme.muted },
        encoding: {
          x: { field: 'x2', type: 'quantitative' },
          y: { field: 'y2', type: 'quantitative' },
          text: { field: 'label', type: 'nominal' },
        },
      });
    }
  }
  let rules = rowsOf(chart, 'rules');
  if (options.kind === 'bland') {
    rules = rules.filter((_, index) =>
      index === 0 ? options.showBias : index === 1 || index === 2 ? options.showLoA : true
    );
  }
  if (options.kind === 'residual' && !options.showZeroLine) rules = [];
  if (options.kind === 'bland' && options.showIdentity) rules.push({ y: 0 });
  rules.forEach(row => {
    layers.push({
      data: { values: [row] },
      mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4], strokeWidth: 1 },
      encoding: { y: { field: 'y', type: 'quantitative' } },
    });
  });
  return layers;
};

export const powerLayers = (chart: AnalysisChart, options: Extract<ChartOptions, { kind: 'power' }>): Spec[] => {
  const theme = themeFor(options);
  const layers: Spec[] = [
    {
      data: { values: rowsOf(chart, 'line') },
      mark: lineStyle(options, colorAt(options, 0)),
      encoding: { x: xEncoding(chart, options, theme), y: yEncoding(chart, options, theme) },
    },
    {
      data: { values: rowsOf(chart, 'markers') },
      mark: pointMark(options, theme),
      encoding: { x: xEncoding(chart, options, theme), y: yEncoding(chart, options, theme) },
    },
  ];
  if (options.showTarget) {
    rowsOf(chart, 'targets').forEach(row => {
      layers.push({
        data: { values: [row] },
        mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4] },
        encoding: { y: { field: 'value', type: 'quantitative' } },
      });
    });
  }
  if (options.showDesignMarker) {
    layers.push({
      data: { values: rowsOf(chart, 'design') },
      mark: { type: 'point', filled: true, size: options.pointSize, color: colorAt(options, 1) },
      encoding: { x: { field: 'x', type: 'quantitative' }, y: { field: 'y', type: 'quantitative' } },
    });
  }
  return layers;
};



export const bootstrapLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'bootstrap' }>
): Spec[] => {
  const histogram = histogramLayers(chart, {
    ...options,
    kind: 'histogram',
    showDensity: options.showDensity,
    showRug: false,
    showMeanLine: false,
    bins: 16,
  } as unknown as Extract<ChartOptions, { kind: 'histogram' }>);
  if (options.showObserved) {
    rowsOf(chart, 'observed').forEach(row => {
      histogram.push({
        data: { values: [row] },
        mark: { type: 'rule', color: colorAt(options, 4), strokeWidth: options.lineWidth },
        encoding: { x: { field: 'value', type: 'quantitative' } },
      });
    });
  }
  if (options.showCI) {
    rowsOf(chart, 'ci').forEach(row => {
      histogram.push({
        data: { values: [row] },
        mark: { type: 'rule', color: colorAt(options, 3), strokeDash: [4, 4], strokeWidth: 1 },
        encoding: { x: { field: 'value', type: 'quantitative' } },
      });
    });
  }
  return histogram;
};
