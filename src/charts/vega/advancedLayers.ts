/**
 * Layers for the L4 objects: partition tree, Pareto, dendrogram and response
 * surface. They are ordinary Vega-Lite layers over precomputed rows; the
 * runners own every coordinate and every statistic.
 */
import type { AnalysisChart, ChartOptions, ChartRow } from '../../stats/charts';
import { colorAt, themeFor } from './theme';
import { axis, field, num, rowsOf, tooltip, xEncoding, yEncoding, type Spec } from './encoding';

const hidden = (
  fieldName: string,
  domain: [number, number] = [0, 1]
): Spec => ({
  field: fieldName,
  type: 'quantitative',
  scale: { domain, nice: false },
  axis: null,
});

/** Partition tree: links, rule boxes and leaf predictions. */
export const treeLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'tree' }>
): Spec[] => {
  const theme = themeFor(options);
  const links = rowsOf(chart, 'links');
  const nodes = rowsOf(chart, 'nodes');
  const layers: Spec[] = [];
  if (links.length > 0) {
    layers.push({
      data: { values: links },
      mark: { type: 'rule', color: theme.axis, strokeWidth: 1.2 },
      encoding: {
        x: hidden('x1'),
        y: hidden('y1'),
        x2: { field: 'x2', type: 'quantitative' },
        y2: { field: 'y2', type: 'quantitative' },
      },
    });
  }
  if (nodes.length > 0) {
    layers.push({
      data: { values: nodes },
      mark: {
        type: 'rect',
        width: 140,
        height: 32,
        cornerRadius: 4,
        xOffset: -70,
        yOffset: -16,
        opacity: 0.92,
      },
      encoding: {
        x: hidden('x'),
        y: hidden('y'),
        color: {
          condition: { test: 'datum.terminal === 1', value: colorAt(options, 2) },
          value: colorAt(options, 0),
        },
      },
    });
    layers.push({
      data: { values: nodes },
      mark: { type: 'text', fontSize: 9, color: '#ffffff', align: 'center', baseline: 'middle' },
      encoding: {
        x: hidden('x'),
        y: hidden('y'),
        text: { field: 'label', type: 'nominal' },
      },
    });
    if (options.showValues) {
      layers.push({
        data: { values: nodes.filter(node => num(node.terminal) === 1) },
        mark: { type: 'text', fontSize: 8, color: theme.muted, align: 'center', dy: 22 },
        encoding: {
          x: hidden('x'),
          y: hidden('y'),
          text: { field: 'value', type: 'quantitative', format: '.2f' },
        },
      });
    }
  }
  return layers;
};

/** Pareto: sorted bars plus the cumulative percentage on a second axis. */
export const paretoLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'pareto' }>
): Spec[] => {
  const theme = themeFor(options);
  // Runners key the bar category either as `category` or as `x`. Both layers
  // are normalised onto `category` so they share one sort order: two encodings
  // sorting different fields make Vega-Lite drop the sort and misplace the line.
  const rawBars = rowsOf(chart, 'bars');
  const barKey = rawBars.some(row => row.category !== undefined) ? 'category' : 'x';
  const bars: ChartRow[] = rawBars.map(row => ({ ...row, category: String(row[barKey] ?? '') }));
  const categories = Array.from(
    new Set(
      [...bars]
        .sort((left, right) =>
          (num(left.value) - num(right.value)) * (options.sort === 'asc' ? 1 : -1)
        )
        .map(row => row.category)
    )
  );
  const x: Spec = {
    field: 'category',
    type: 'nominal',
    sort: categories,
    axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX),
  };
  const layers: Spec[] = [
    {
      data: { values: bars },
      mark: { type: 'bar', color: colorAt(options, 0), ...tooltip(options) },
      encoding: {
        x,
        y: {
          field: 'value',
          type: 'quantitative',
          axis: axis(options, theme, options.showYTitle ? field(chart, 'yLabel', '') : null, options.gridY, true),
        },
      },
    },
  ];
  if (options.valueLabels) {
    layers.push({
      data: { values: bars },
      mark: { type: 'text', dy: -6, fontSize: 9, color: theme.text },
      encoding: {
        x,
        y: { field: 'value', type: 'quantitative' },
        text: { field: 'value', type: 'quantitative', format: '.0f' },
      },
    });
  }
  if (options.showCumulative) {
    const cumulative = rowsOf(chart, 'cumulative').map(row => ({
      ...row,
      category: String(row.category ?? row.x ?? ''),
    }));
    layers.push({
      data: { values: cumulative },
      mark: { type: 'line', color: colorAt(options, 3), strokeWidth: options.lineWidth, point: true },
      encoding: {
        x,
        y: {
          field: 'y',
          type: 'quantitative',
          scale: { domain: [0, 100] },
          axis: {
            ...axis(options, theme, options.showYTitle ? field(chart, 'series', 'Cumulata (%)') : null, false, true),
            orient: 'right',
          },
        },
      },
    });
  }
  return layers;
};

/** Dendrogram: rectangular merge tree with optional leaf labels. */
export const dendrogramLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'dendrogram' }>
): Spec[] => {
  const theme = themeFor(options);
  const links = rowsOf(chart, 'links');
  const leaves = rowsOf(chart, 'leaves');
  const layers: Spec[] = [
    {
      data: { values: links },
      mark: { type: 'rule', color: colorAt(options, 0), strokeWidth: 1.4 },
      encoding: {
        x: { ...hidden('x1'), axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, false) },
        y: {
          ...hidden('y1'),
          axis: options.showHeights
            ? axis(options, theme, options.showYTitle ? field(chart, 'yLabel', 'Distanza') : null, options.gridY)
            : null,
        },
        x2: { field: 'x2', type: 'quantitative' },
        y2: { field: 'y2', type: 'quantitative' },
      },
    },
  ];
  if (options.showLabels) {
    layers.push({
      data: { values: leaves },
      mark: { type: 'text', angle: -45, align: 'right', fontSize: 8, color: theme.muted, dy: -2 },
      encoding: {
        x: hidden('x'),
        y: hidden('y', [0, 1]),
        text: { field: 'label', type: 'nominal' },
      },
    });
  }
  return layers;
};

/** Projected response surface or contour map. */
export const surfaceLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'surface' }>
): Spec[] => {
  const theme = themeFor(options);
  const mesh = options.display === 'mesh';
  // The two projections live in different coordinate spaces: mesh rows are the
  // projected drawing (x1..y2 in 0..1), contour segments are in factor units.
  // Pick by display mode so switching in the editor cannot mix the two.
  const lines = rowsOf(chart, mesh ? 'mesh' : 'contours');
  const points = rowsOf(chart, mesh ? 'meshPoints' : 'contourPoints');
  const layers: Spec[] = [
    {
      data: { values: lines },
      mark: { type: 'rule', strokeWidth: 1, opacity: mesh ? 0.55 : 0.9 },
      encoding: {
        x: mesh
          ? hidden('x1')
          : xEncoding(chart, options, theme, 'x1', 'quantitative', { scale: { nice: true } }),
        y: mesh
          ? hidden('y1')
          : yEncoding(chart, options, theme, 'y1', { scale: { nice: true } }),
        x2: { field: 'x2', type: 'quantitative' },
        y2: { field: 'y2', type: 'quantitative' },
        color: {
          field: mesh ? 'z' : 'level',
          type: 'quantitative',
          scale: { scheme: 'viridis' },
          legend: null,
        },
      },
    },
  ];
  if (options.showPoints && points.length > 0) {
    layers.push({
      data: { values: points },
      mark: { type: 'point', filled: true, size: Math.max(40, options.pointSize * 0.7), color: colorAt(options, 2) },
      encoding: {
        x: mesh ? hidden('x') : xEncoding(chart, options, theme, 'x', 'quantitative'),
        y: mesh ? hidden('y') : yEncoding(chart, options, theme, 'y'),
      },
    });
  }
  return layers;
};
