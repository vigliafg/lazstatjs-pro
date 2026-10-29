import { jStat } from '../../stats/jstat';
import type { AnalysisChart, ChartOptions, ChartRow } from '../../stats/charts';
import { colorAt, themeFor } from './theme';
import {
  axis,
  bandRows,
  colorEncoding,
  field,
  lineStyle,
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
        ...(options.pointLabels
          ? {
              tooltip: { content: 'data' },
            }
          : {}),
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
  rowsOf(chart, 'labels').forEach(row => {
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
  if (options.equation !== 'none' || options.showR2 || options.showN) {
    const annotations: string[] = [];
    const eq = typeof chart.stats?.equation === 'string' ? chart.stats.equation : '';
    if (options.equation !== 'none' && eq) annotations.push(eq);
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
  layers.push({
    data: { values: series },
    mark: {
      ...lineStyle(options, colorAt(options, 0)),
      ...(options.step ? { interpolate: 'step-after' } : {}),
    },
    encoding: {
      x: xEncoding(chart, options, theme),
      y: yEncoding(chart, options, theme),
      ...(chart.data.series?.some(row => row.series !== undefined)
        ? { color: colorEncoding(chart, options, theme) }
        : {}),
    },
  });
  if (options.showMarkers) {
    layers.push({
      data: { values: rowsOf(chart, 'markers') },
      mark: pointMark(options, theme),
      encoding: {
        x: xEncoding(chart, options, theme),
        y: yEncoding(chart, options, theme),
        ...(chart.data.markers?.some(row => row.series !== undefined)
          ? { color: colorEncoding(chart, options, theme) }
          : {}),
      },
    });
  }
  return layers;
};

export const barLayers = (chart: AnalysisChart, options: Extract<ChartOptions, { kind: 'bar' }>): Spec[] => {
  const theme = themeFor(options);
  const bars = rowsOf(chart, 'bars', options);
  const layers: Spec[] = [];
  const hasError = bars.some(row => row.lo !== undefined && row.hi !== undefined && row.lo !== null && row.hi !== null);
  if (options.error !== 'none' && hasError) {
    layers.push({
      data: { values: bars },
      mark: { type: 'rule', color: theme.muted, strokeWidth: 1 },
      encoding: {
        x: { field: 'category', type: 'nominal', axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX) },
        y: { field: 'lo', type: 'quantitative', title: null },
        y2: { field: 'hi' },
      },
    });
  }
  layers.push({
    data: { values: bars },
    mark: { type: 'bar', color: colorAt(options, 0), ...tooltip(options) },
    encoding: {
      x: {
        field: 'category',
        type: 'nominal',
        sort: options.sort === 'none' ? null : undefined,
        axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX),
      },
      y: yEncoding(chart, options, theme, 'value', { scale: { zero: true } }),
      ...(chart.data.bars?.some(row => row.series !== undefined)
        ? { color: colorEncoding(chart, options, theme) }
        : {}),
    },
  });
  if (options.valueLabels) {
    layers.push({
      data: { values: bars },
      mark: { type: 'text', dy: -6, fontSize: 9, color: theme.text },
      encoding: {
        x: { field: 'category', type: 'nominal' },
        y: { field: 'value', type: 'quantitative' },
        text: { field: 'value', type: 'quantitative', format: '.2f' },
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

export const boxLayers = (chart: AnalysisChart, options: Extract<ChartOptions, { kind: 'box' }>): Spec[] => {
  const theme = themeFor(options);
  const summary = rowsOf(chart, 'summary', options);
  const baseEncoding = {
    x: {
      field: 'category',
      type: 'nominal',
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
      mark: { type: 'point', size: 16, color: colorAt(options, 1), opacity: 0.5 },
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

export const histogramLayers = (chart: AnalysisChart, options: Extract<ChartOptions, { kind: 'histogram' }>): Spec[] => {
  const theme = themeFor(options);
  const values = rowsOf(chart, 'values');
  const layers: Spec[] = [
    {
      data: { values },
      transform: [{ bin: { maxbins: options.bins }, field: 'value', as: 'bin' }],
      mark: { type: 'bar', color: colorAt(options, 1), ...tooltip(options) },
      encoding: {
        x: {
          field: 'bin',
          type: 'quantitative',
          bin: { binned: true },
          axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX),
        },
        x2: { field: 'bin_end' },
        y: {
          aggregate: 'count',
          type: 'quantitative',
          title: options.showYTitle ? field(chart, 'yLabel', 'Count') : null,
          axis: axis(options, theme, options.showYTitle ? field(chart, 'yLabel', 'Count') : null, options.gridY),
        },
      },
    },
  ];
  if (options.showRug) {
    layers.push({
      data: { values },
      mark: { type: 'tick', size: 8, color: colorAt(options, 0), opacity: 0.5 },
      encoding: { x: { field: 'value', type: 'quantitative' } },
    });
  }
  const numeric = values.map(row => num(row.value)).filter(Number.isFinite);
  if (options.showDensity && numeric.length > 2) {
    const mean = jStat.mean(numeric);
    const sd = jStat.stdev(numeric, true);
    const min = Math.min(...numeric);
    const max = Math.max(...numeric);
    const width = (max - min) / Math.max(2, options.bins);
    if (sd > 0) {
      const density = Array.from({ length: 60 }, (_, index) => {
        const x = min + ((max - min) * index) / 59;
        return { x, y: numeric.length * width * jStat.normal.pdf(x, mean, sd) };
      });
      layers.push({
        data: { values: density },
        mark: { type: 'line', color: colorAt(options, 4), strokeWidth: options.lineWidth },
        encoding: {
          x: { field: 'x', type: 'quantitative' },
          y: { field: 'y', type: 'quantitative' },
        },
      });
    }
  }
  if (options.showMeanLine) {
    const mean = values.reduce((sum, row) => sum + (Number.isFinite(num(row.value)) ? num(row.value) : 0), 0) / Math.max(1, values.length);
    if (Number.isFinite(mean)) {
      layers.push({
        data: { values: [{ value: mean }] },
        mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4] },
        encoding: { x: { field: 'value', type: 'quantitative' } },
      });
    }
  }
  return layers;
};

export const qqLayers = (chart: AnalysisChart, options: Extract<ChartOptions, { kind: 'qq' }>): Spec[] => {
  const theme = themeFor(options);
  const layers: Spec[] = [];
  if (options.showCI) {
    layers.push({
      data: { values: rowsOf(chart, 'band') },
      mark: { type: 'area', opacity: 0.15, color: colorAt(options, 0), line: false },
      encoding: {
        x: xEncoding(chart, options, theme),
        y: { field: 'lo', type: 'quantitative', title: null },
        y2: { field: 'hi' },
      },
    });
  }
  if (options.showReference) {
    layers.push({
      data: { values: rowsOf(chart, 'reference') },
      mark: { type: 'line', color: colorAt(options, 4), strokeWidth: options.lineWidth, strokeDash: [4, 4] },
      encoding: { x: xEncoding(chart, options, theme), y: yEncoding(chart, options, theme) },
    });
  }
  layers.push({
    data: { values: rowsOf(chart, 'points') },
    mark: pointMark(options, theme),
    encoding: { x: xEncoding(chart, options, theme), y: yEncoding(chart, options, theme) },
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
    layers.push({
      data: { values: rowsOf(chart, 'medians') },
      mark: { type: 'rule', color: colorAt(options, 3), strokeDash: [4, 4] },
      encoding: {
        x: { field: 'x', type: 'quantitative' },
        color: colorEncoding(chart, options, theme),
      },
    });
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
  const layers: Spec[] = [
    {
      data: { values: cells },
      mark: { type: 'rect', ...tooltip(options) },
      encoding: {
        x: { field: 'x', type: 'nominal', axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, false) },
        y: { field: 'y', type: 'nominal', axis: axis(options, theme, options.showYTitle ? field(chart, 'yLabel', '') : null, false) },
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
        x: { field: 'x', type: 'nominal' },
        y: { field: 'y', type: 'nominal' },
        text: { field: 'label', type: 'nominal' },
      },
    });
  }
  return layers;
};

export const scatterOnly = (chart: AnalysisChart, options: ChartOptions): Spec[] => {
  const theme = themeFor(options);
  const layers: Spec[] = [
    {
      data: { values: rowsOf(chart, 'points') },
      mark: pointMark(options, theme),
      encoding: {
        x: xEncoding(chart, options, theme),
        y: yEncoding(chart, options, theme),
        ...(options.kind === 'score' && options.showLabels
          ? { tooltip: { content: 'data' } }
          : {}),
      },
    },
  ];
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
    showDensity: false,
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
