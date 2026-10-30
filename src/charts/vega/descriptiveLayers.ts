import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { colorAt, themeFor } from './theme';
import {
  axis,
  colorEncoding,
  field,
  num,
  pointMark,
  rowsOf,
  tooltip,
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

export const intervalLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'interval' }>
): Spec[] => {
  const theme = themeFor(options);
  const rows = rowsOf(chart, 'intervals');
  const estimates = new Map<string, number>();
  rows.forEach(row => estimates.set(String(row.category ?? ''), num(row.estimate)));
  const categories = Array.from(estimates.keys());
  const ordered =
    options.sort === 'none'
      ? null
      : [...categories].sort(
          (a, b) =>
            ((estimates.get(a) ?? 0) - (estimates.get(b) ?? 0)) * (options.sort === 'asc' ? 1 : -1)
        );
  const x = categoryAxis(chart, options, theme, ordered);
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
    {
      data: { values: rows },
      mark: { ...pointMark(options, theme), ...tooltip(options) },
      encoding: { x, y: yEncoding(chart, options, theme, 'estimate') },
    },
  ];
  if (options.valueLabels) {
    layers.push({
      data: { values: rows },
      mark: { type: 'text', dy: -8, fontSize: 9, color: theme.text },
      encoding: {
        x,
        y: yEncoding(chart, options, theme, 'estimate'),
        text: { field: 'estimate', type: 'quantitative', format: '.2f' },
      },
    });
  }
  return layers;
};

export const dotLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'dot' }>
): Spec[] => {
  const theme = themeFor(options);
  const rows = rowsOf(chart, 'points');
  const means = new Map<string, number[]>();
  rows.forEach(row => {
    const category = String(row.category ?? '');
    means.set(category, [...(means.get(category) ?? []), num(row.value)]);
  });
  const categories = Array.from(means.keys());
  const meanOf = (category: string): number => {
    const values = (means.get(category) ?? []).filter(Number.isFinite);
    return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  };
  const ordered =
    options.sort === 'none'
      ? null
      : [...categories].sort(
          (a, b) => (meanOf(a) - meanOf(b)) * (options.sort === 'asc' ? 1 : -1)
        );
  const jittered = rows.map((row, index) => ({
    ...row,
    jitter: ((index % 9) - 4) * 0.04,
  }));
  const x = categoryAxis(chart, options, theme, ordered);
  const layers: Spec[] = [
    {
      data: { values: jittered },
      mark: { ...pointMark(options, theme), opacity: options.pointOpacity },
      encoding: {
        x,
        xOffset: {
          field: 'jitter',
          type: 'quantitative',
          scale: { domain: [-0.2, 0.2] },
          legend: null,
        },
        y: yEncoding(chart, options, theme, 'value'),
      },
    },
  ];
  if (options.showMean) {
    layers.push({
      data: { values: categories.map(category => ({ category, mean: meanOf(category) })) },
      mark: { type: 'point', shape: 'diamond', size: 36, color: colorAt(options, 3) },
      encoding: { x, y: yEncoding(chart, options, theme, 'mean') },
    });
  }
  return layers;
};

export const ecdfLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'ecdf' }>
): Spec[] => {
  const theme = themeFor(options);
  const rows = rowsOf(chart, 'points');
  const hasSeries = rows.some(row => row.series !== undefined);
  const layers: Spec[] = [
    {
      data: { values: rows },
      mark: { type: 'line', interpolate: 'step-after', stroke: colorAt(options, 0), strokeWidth: options.lineWidth },
      encoding: {
        x: { field: 'x', type: 'quantitative', axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, options.gridX) },
        y: { field: 'y', type: 'quantitative', scale: { domain: [0, 1] }, axis: axis(options, theme, options.showYTitle ? field(chart, 'yLabel', '') : null, options.gridY) },
        ...(hasSeries ? { color: colorEncoding(chart, options, theme, 'series', rows) } : {}),
      },
    },
  ];
  if (options.showPoints) {
    layers.push({
      data: { values: rows },
      mark: pointMark(options, theme),
      encoding: {
        x: { field: 'x', type: 'quantitative' },
        y: { field: 'y', type: 'quantitative' },
      },
    });
  }
  if (options.showMedian) {
    const crossing = rows.find(row => num(row.y) >= 0.5);
    if (crossing) {
      layers.push({
        data: { values: [crossing] },
        mark: { type: 'rule', color: colorAt(options, 4), strokeDash: [4, 4] },
        encoding: { x: { field: 'x', type: 'quantitative' } },
      });
    }
  }
  return layers;
};
