import { jStat } from '../../stats/jstat';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { detrendedQqRows, kernelDensity } from '../kits/common';
import { colorAt, themeFor } from './theme';
import {
  axis,
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
  // Specification, target and mean references are vertical rules. A rule is
  // drawn per row so a capability chart can show LSL, USL and target together.
  rowsOf(chart, 'rules').forEach(row => {
    layers.push({
      data: { values: [row] },
      mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4], strokeWidth: 1 },
      encoding: { x: { field: 'value', type: 'quantitative' } },
    });
  });
  return layers;
};

/**
 * Probability-paper ticks of the normal Q-Q axis. The z column is the linear
 * position used by the data, the p column the label shown on the bottom axis
 * (the probability of a standard normal below that z).
 */
const QQ_AXIS_TICKS: readonly { z: number; p: string }[] = [
  { z: -2.33, p: '0.01' },
  { z: -1.64, p: '0.05' },
  { z: -1.28, p: '0.10' },
  { z: -0.67, p: '0.25' },
  { z: 0, p: '0.50' },
  { z: 0.67, p: '0.75' },
  { z: 1.28, p: '0.90' },
  { z: 1.64, p: '0.95' },
  { z: 2.33, p: '0.99' },
];

const QQ_Z_VALUES = QQ_AXIS_TICKS.map(tick => tick.z);

/** Map the numeric tick back to its probability label inside the axis. */
const probabilityLabelExpr = (): string =>
  QQ_AXIS_TICKS.map(tick => `datum.value === ${tick.z} ? '${tick.p}'`).join(' : ') + " : ''";

export const qqLayers = (chart: AnalysisChart, options: Extract<ChartOptions, { kind: 'qq' }>): Spec[] => {
  const theme = themeFor(options);
  const reference = rowsOf(chart, 'reference');
  const points = options.detrended
    ? detrendedQqRows(rowsOf(chart, 'points'), reference)
    : rowsOf(chart, 'points');
  const showProbability = options.qqAxis === 'probability' || options.qqAxis === 'both';
  const hasSecondScale = options.qqAxis === 'both' && !options.detrended;
  const band = rowsOf(chart, 'band');
  // The second (z) axis needs its own scale, so every layer states the same
  // domain explicitly: otherwise the reference line, which starts slightly
  // outside the points, would shift the two axes apart.
  const domainValues = hasSecondScale
    ? [...points, ...reference, ...(options.showCI && !options.detrended ? band : [])]
        .map(row => num(row.x))
        .filter(Number.isFinite)
    : [];
  const domain: [number, number] | undefined =
    domainValues.length > 0
      ? [Math.min(...domainValues), Math.max(...domainValues)]
      : undefined;
  const scale = domain ? { scale: { domain } } : {};
  // Probability and z are the same axis: the linear scale keeps z, only the
  // tick labels change, so the plotted positions never move.
  const x: Spec = showProbability
    ? {
        field: 'x',
        type: 'quantitative',
        axis: {
          ...axis(
            options,
            theme,
            options.showXTitle ? field(chart, 'xLabel', '') : null,
            options.gridX
          ),
          values: QQ_Z_VALUES,
          labelExpr: probabilityLabelExpr(),
        },
      }
    : xEncoding(chart, options, theme);
  const layers: Spec[] = [];
  // With the second (top) x scale Vega-Lite gives every layer its own axis, so
  // only the point layer keeps the bottom axis and the invisible layer carries
  // the z-score one. Both scales pin the same explicit domain.
  const xMain: Spec = { ...x, ...scale };
  const quietX: Spec = hasSecondScale ? { ...xMain, axis: null } : xMain;
  if (options.showCI && !options.detrended) {
    if (options.ciStyle === 'band') {
      layers.push({
        data: { values: band },
        mark: { type: 'area', opacity: 0.15, color: colorAt(options, 0), line: false },
        encoding: {
          x: quietX,
          y: { field: 'lo', type: 'quantitative', title: null },
          y2: { field: 'hi' },
        },
      });
    } else {
      // JMP draws the envelope as two dotted curves instead of a filled band.
      for (const bound of ['lo', 'hi'] as const) {
        layers.push({
          data: { values: band },
          mark: {
            type: 'line',
            color: colorAt(options, 4),
            strokeWidth: 1.5,
            strokeDash: [2, 3],
            opacity: 0.85,
          },
          encoding: {
            x: quietX,
            y: { field: bound, type: 'quantitative', title: null },
          },
        });
      }
    }
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
      mark: lineStyle(options, colorAt(options, 4)),
      encoding: { x: quietX, y: yEncoding(chart, options, theme) },
    });
  }
  layers.push({
    data: { values: points },
    mark: pointMark(options, theme),
    encoding: { x: xMain, y: yEncoding(chart, options, theme) },
  });
  if (hasSecondScale) {
    // Second x scale with the same domain: only carries the z-score axis on
    // top, so the linear scale can stay in z while the bottom reads as p.
    layers.push({
      data: { values: points },
      mark: { type: 'point', filled: true, opacity: 0, size: 0 },
      encoding: {
        x: {
          field: 'x',
          type: 'quantitative',
          ...scale,
          axis: {
            ...axis(options, theme, null, options.gridX),
            orient: 'top',
            values: QQ_Z_VALUES,
            format: '.2f',
          },
        },
        y: yEncoding(chart, options, theme),
      },
    });
  }
  return layers;
};
