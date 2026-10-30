import { jStat } from '../../stats/jstat';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { detrendedQqRows, kernelDensity } from '../kits/common';
import { colorAt, themeFor } from './theme';
import {
  axis,
  field,
  num,
  pointMark,
  rowsOf,
  tooltip,
  xEncoding,
  yEncoding,
  type Spec,
} from './encoding';

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
  const min = numeric.length > 0 ? Math.min(...numeric) : 0;
  const max = numeric.length > 0 ? Math.max(...numeric) : 0;
  const width = (max - min) / Math.max(2, options.bins);
  if (options.showDensity && numeric.length > 2) {
    const mean = jStat.mean(numeric);
    const sd = jStat.stdev(numeric, true);
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
  if (options.showKde && numeric.length > 2) {
    const density = kernelDensity(numeric).map(point => ({
      x: point.x,
      y: numeric.length * width * point.y,
    }));
    if (density.length > 0) {
      layers.push({
        data: { values: density },
        mark: { type: 'line', color: colorAt(options, 3), strokeWidth: options.lineWidth },
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
  const reference = rowsOf(chart, 'reference');
  const points = options.detrended
    ? detrendedQqRows(rowsOf(chart, 'points'), reference)
    : rowsOf(chart, 'points');
  const layers: Spec[] = [];
  if (options.showCI && !options.detrended) {
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
  if (options.detrended) {
    layers.push({
      data: { values: [{ y: 0 }] },
      mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4], strokeWidth: 1 },
      encoding: { y: { field: 'y', type: 'quantitative' } },
    });
  } else if (options.showReference) {
    layers.push({
      data: { values: reference },
      mark: { type: 'line', color: colorAt(options, 4), strokeWidth: options.lineWidth, strokeDash: [4, 4] },
      encoding: { x: xEncoding(chart, options, theme), y: yEncoding(chart, options, theme) },
    });
  }
  layers.push({
    data: { values: points },
    mark: pointMark(options, theme),
    encoding: { x: xEncoding(chart, options, theme), y: yEncoding(chart, options, theme) },
  });
  return layers;
};
