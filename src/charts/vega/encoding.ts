import type { TopLevelSpec } from 'vega-lite';
import { jStat } from '../../stats/jstat';
import type {
  AnalysisChart,
  ChartOptions,
  ChartRow,
  CommonChartOptions,
} from '../../stats/charts';
import { SIZE_OPTIONS } from '../defaults';
import { colorAt, themeFor } from './theme';

export type Spec = Record<string, any>;

export const sizeOf = (options: CommonChartOptions): { width: number; height: number } => {
  const size = SIZE_OPTIONS[options.size] ?? SIZE_OPTIONS.regular;
  return size;
};

export const finiteRows = (rows: ChartRow[] | undefined): ChartRow[] =>
  (rows ?? []).filter(row =>
    Object.values(row).every(
      value => value === null || typeof value === 'string' || Number.isFinite(value)
    )
  );

export const num = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : NaN);

export const rowsOf = (chart: AnalysisChart, layer: string, options?: ChartOptions): ChartRow[] => {
  const rows = finiteRows(chart.data[layer]);
  if (!options || (options.kind !== 'bar' && options.kind !== 'box') || options.sort === 'none') {
    return rows;
  }
  const key = options.kind === 'bar' ? 'value' : 'median';
  const direction = options.sort === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => (num(a[key]) - num(b[key])) * direction);
};

export const field = (chart: AnalysisChart, key: string, fallback = key): string =>
  chart.fields[key] ?? fallback;

export const axis = (
  options: CommonChartOptions,
  theme: ReturnType<typeof themeFor>,
  title: string | null,
  showGrid: boolean,
  zero = false
): Spec => ({
  ...(title ? { title } : { title: null }),
  titleColor: theme.muted,
  titleFontSize: 10,
  titleFontWeight: 500,
  labelColor: theme.muted,
  labelFontSize: 9,
  labelPadding: 4,
  grid: showGrid,
  gridColor: theme.grid,
  gridOpacity: options.gridOpacity,
  domainColor: theme.axis,
  tickColor: theme.axis,
  tickSize: 3,
});

export const colorEncoding = (
  chart: AnalysisChart,
  options: CommonChartOptions,
  theme: ReturnType<typeof themeFor>,
  fieldName = 'series'
): Spec => {
  const domain = Array.from(
    new Set(rowsOf(chart, 'series').map(row => String(row[fieldName] ?? '')))
  ).filter(Boolean);
  return {
    field: fieldName,
    type: 'nominal',
    title: chart.fields.series ?? null,
    scale: {
      domain: domain.length > 0 ? domain : undefined,
      range: domain.length > 0
        ? domain.map((_, index) => colorAt(options, index))
        : theme.palette,
    },
    legend: options.showLegend
      ? {
          orient: options.legendPosition === 'right' ? 'right' : 'bottom',
          labelColor: theme.muted,
          titleColor: theme.muted,
          labelFontSize: 9,
          titleFontSize: 9,
        }
      : null,
  };
};

export const titleFor = (chart: AnalysisChart, options: CommonChartOptions, theme: ReturnType<typeof themeFor>): Spec | undefined => {
  const title = options.showTitle ? chart.title : '';
  const subtitle = options.showSubtitle && chart.subtitle ? chart.subtitle : '';
  if (!title && !subtitle) return undefined;
  return {
    ...(title || subtitle ? { text: title || ' ' } : {}),
    ...(subtitle ? { subtitle } : {}),
    color: theme.text,
    subtitleColor: theme.muted,
    fontSize: 12,
    subtitleFontSize: 9,
    font: theme.font,
    anchor: 'start',
    offset: 6,
  };
};

export const tooltip = (options: CommonChartOptions): Spec =>
  options.tooltip ? { tooltip: { content: 'data' } } : {};

export const mark = (options: CommonChartOptions): string =>
  options.pointShape === 'circle'
    ? 'circle'
    : options.pointShape === 'square'
      ? 'square'
      : options.pointShape === 'diamond'
        ? 'diamond'
        : 'triangle';

export const pointMark = (options: CommonChartOptions, theme: ReturnType<typeof themeFor>): Spec => ({
  type: 'point',
  filled: true,
  shape: mark(options),
  size: options.pointSize,
  opacity: options.pointOpacity,
  color: colorAt(options, 0),
  ...tooltip(options),
});

export const lineStyle = (
  options: CommonChartOptions,
  color: string,
  dash = options.lineDash
): Spec => ({
  type: 'line',
  stroke: color,
  strokeWidth: options.lineWidth,
  ...(dash === 'dashed' ? { strokeDash: [6, 4] } : {}),
  ...(dash === 'dotted' ? { strokeDash: [2, 3] } : {}),
});

export const gridConfig = (
  options: CommonChartOptions,
  theme: ReturnType<typeof themeFor>
): Spec => ({
  font: theme.font,
  background: 'transparent',
  view: { stroke: null },
  axis: {
    labelColor: theme.muted,
    titleColor: theme.muted,
    gridColor: theme.grid,
    gridOpacity: options.gridOpacity,
    domainColor: theme.axis,
    tickColor: theme.axis,
  },
  legend: { labelColor: theme.muted, titleColor: theme.muted },
  title: { color: theme.text, subtitleColor: theme.muted },
});

export const base = (chart: AnalysisChart, options: ChartOptions) => {
  const theme = themeFor(options);
  const size = sizeOf(options);
  return {
    theme,
    size,
    title: titleFor(chart, options, theme),
    background: theme.background,
    config: gridConfig(options, theme),
  };
};

export const spec = (
  chart: AnalysisChart,
  options: ChartOptions,
  layers: Spec[],
  extra: Spec = {}
): TopLevelSpec => {
  const { theme, size, title, background, config } = base(chart, options);
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: size.width,
    height: size.height,
    background,
    ...(title ? { title } : {}),
    config,
    ...extra,
    layer: layers,
    ...(options.showNote && chart.note
      ? {
          // Vega-Lite has no note slot: the renderer prints the note as HTML.
        }
      : {}),
    ...(theme.mono ? {} : {}),
  } as TopLevelSpec;
};

export const xEncoding = (
  chart: AnalysisChart,
  options: CommonChartOptions,
  theme: ReturnType<typeof themeFor>,
  fieldName = 'x',
  type: 'quantitative' | 'nominal' | 'ordinal' = chart.fields.xType === 'nominal' ? 'nominal' : 'quantitative',
  extra: Spec = {}
): Spec => ({
  field: fieldName,
  type,
  ...(options.showXTitle
    ? { axis: axis(options, theme, field(chart, 'xLabel', chart.fields.x ?? fieldName), options.gridX) }
    : { axis: axis(options, theme, null, options.gridX) }),
  ...extra,
});

export const yEncoding = (
  chart: AnalysisChart,
  options: CommonChartOptions,
  theme: ReturnType<typeof themeFor>,
  fieldName = 'y',
  extra: Spec = {}
): Spec => ({
  field: fieldName,
  type: 'quantitative',
  ...(options.showYTitle
    ? { axis: axis(options, theme, field(chart, 'yLabel', chart.fields.y ?? fieldName), options.gridY) }
    : { axis: axis(options, theme, null, options.gridY) }),
  ...(options.zeroBaseline ? { scale: { zero: true } } : {}),
  ...extra,
});

export const bandRows = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'scatter' }>
): ChartRow[] => {
  if (options.band === 'none') return [];
  const grid = chart.data.grid;
  if (grid && grid.length > 0) {
    const df = Number(chart.stats?.df);
    const level = options.bandLevel;
    const critical = Number.isFinite(df) && df > 0
      ? jStat.studentt.inv(1 - (1 - level / 100) / 2, df)
      : 1.96;
    return grid
      .map((row): ChartRow | null => {
        const value = num(row.x);
        const fit = num(row.yhat);
        const se = num(options.band === 'ci' ? row.seMean : row.sePred);
        if (!Number.isFinite(value) || !Number.isFinite(fit) || !Number.isFinite(se)) return null;
        return { x: value, lo: fit - critical * se, hi: fit + critical * se };
      })
      .filter((row): row is ChartRow => row !== null);
  }
  return finiteRows(chart.data.band);
};

