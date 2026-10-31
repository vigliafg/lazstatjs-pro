import type {
  AnalysisChart,
  ChartKind,
  ChartOptions,
  CommonChartOptions,
} from '../stats/charts';
import { normalizeAnnotations } from './annotations';

export type ChartDefaults = CommonChartOptions;

export const COMMON_DEFAULTS: CommonChartOptions = {
  preset: 'default',
  theme: 'dark',
  gridX: false,
  gridY: true,
  gridOpacity: 0.35,
  palette: 'default',
  showLegend: true,
  legendPosition: 'bottom',
  showTitle: true,
  showSubtitle: true,
  showNote: true,
  showXTitle: true,
  showYTitle: true,
  zeroBaseline: false,
  pointShape: 'circle',
  pointSize: 60,
  pointOpacity: 0.75,
  lineWidth: 2,
  lineDash: 'solid',
  size: 'regular',
  tooltip: true,
};

const P = { ...COMMON_DEFAULTS };

/** Factory options for a chart kind. User defaults will be merged here later. */
let activeDefaults: ChartDefaults | null = null;

/** Run-scoped user defaults: factory < these < per-card options. */
export const withChartDefaults = <T>(defaults: ChartDefaults | undefined, build: () => T): T => {
  const previous = activeDefaults;
  activeDefaults = defaults ?? null;
  try {
    return build();
  } finally {
    activeDefaults = previous;
  }
};

export const DEFAULT_CHART_DEFAULTS: ChartDefaults = { ...COMMON_DEFAULTS };

/** The single source of truth for the shared chart options. */
export const COMMON_KEYS: readonly (keyof CommonChartOptions)[] = [
  'preset',
  'theme',
  'gridX',
  'gridY',
  'gridOpacity',
  'palette',
  'showLegend',
  'legendPosition',
  'showTitle',
  'showSubtitle',
  'showNote',
  'showXTitle',
  'showYTitle',
  'zeroBaseline',
  'pointShape',
  'pointSize',
  'pointOpacity',
  'lineWidth',
  'lineDash',
  'size',
  'tooltip',
];

export const commonOptionsOf = (options: ChartOptions): ChartDefaults => {
  const result = { ...COMMON_DEFAULTS };
  COMMON_KEYS.forEach(key => {
    (result as unknown as Record<string, unknown>)[key] = options[key];
  });
  return result;
};

/** Defensive parse of settings saved by another version or hand-edited. */
export const normalizeChartDefaults = (value: unknown): ChartDefaults => {
  const raw = typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const result = { ...COMMON_DEFAULTS };
  const set = <K extends keyof ChartDefaults>(key: K, next: ChartDefaults[K]) => {
    result[key] = next;
  };
  const oneOf = <T extends string>(candidate: unknown, values: readonly T[], fallback: T): T =>
    typeof candidate === 'string' && (values as readonly string[]).includes(candidate)
      ? (candidate as T)
      : fallback;
  const bool = (candidate: unknown, fallback: boolean): boolean =>
    typeof candidate === 'boolean' ? candidate : fallback;
  const number = (candidate: unknown, fallback: number, min: number, max: number): number =>
    typeof candidate === 'number' && Number.isFinite(candidate)
      ? Math.min(max, Math.max(min, candidate))
      : fallback;

  set('preset', oneOf(raw.preset, ['default', 'minimal', 'print'] as const, result.preset));
  set('theme', oneOf(raw.theme, ['dark', 'light'] as const, result.theme));
  set('gridX', bool(raw.gridX, result.gridX));
  set('gridY', bool(raw.gridY, result.gridY));
  set('gridOpacity', number(raw.gridOpacity, result.gridOpacity, 0, 1));
  set('palette', oneOf(raw.palette, ['default', 'colorblind', 'mono'] as const, result.palette));
  set('showLegend', bool(raw.showLegend, result.showLegend));
  set('legendPosition', oneOf(raw.legendPosition, ['right', 'bottom'] as const, result.legendPosition));
  set('showTitle', bool(raw.showTitle, result.showTitle));
  set('showSubtitle', bool(raw.showSubtitle, result.showSubtitle));
  set('showNote', bool(raw.showNote, result.showNote));
  set('showXTitle', bool(raw.showXTitle, result.showXTitle));
  set('showYTitle', bool(raw.showYTitle, result.showYTitle));
  set('zeroBaseline', bool(raw.zeroBaseline, result.zeroBaseline));
  set('pointShape', oneOf(raw.pointShape, ['circle', 'square', 'diamond', 'triangle'] as const, result.pointShape));
  set('pointSize', number(raw.pointSize, result.pointSize, 16, 200));
  set('pointOpacity', number(raw.pointOpacity, result.pointOpacity, 0.1, 1));
  set('lineWidth', number(raw.lineWidth, result.lineWidth, 1, 6));
  set('lineDash', oneOf(raw.lineDash, ['solid', 'dashed', 'dotted'] as const, result.lineDash));
  set('size', oneOf(raw.size, ['compact', 'regular', 'wide'] as const, result.size));
  set('tooltip', bool(raw.tooltip, result.tooltip));
  return result;
};

export const factoryOptions = (kind: ChartKind): ChartOptions => {
  switch (kind) {
    case 'scatter':
      return {
        ...P,
        kind,
        showPoints: true,
        fit: 'none',
        showFit: true,
        band: 'none',
        showBand: true,
        bandLevel: 95,
        bandOpacity: 0.18,
        equation: 'none',
        showR2: false,
        showN: false,
        pointLabels: false,
        ellipse: false,
      };
    case 'line':
      return { ...P, kind, step: false, showMarkers: false, showBand: true };
    case 'bar':
      return {
        ...P,
        kind,
        error: 'none',
        showErrorBars: true,
        capSize: 9,
        valueLabels: false,
        sort: 'none',
        referenceLine: 'none',
        grouping: 'stacked',
      };
    case 'box':
      return {
        ...P,
        kind,
        display: 'box',
        showPoints: false,
        showWhiskers: true,
        showOutliers: true,
        showMean: false,
        labelMedian: false,
        sort: 'none',
      };
    case 'histogram':
      return { ...P, kind, showDensity: false, showKde: false, showRug: false, showMeanLine: false, bins: 16 };
    case 'interval':
      return { ...P, kind, valueLabels: false, sort: 'none' };
    case 'dot':
      return { ...P, kind, showMean: false, sort: 'none' };
    case 'ecdf':
      return { ...P, kind, showPoints: false, showMedian: false };
    case 'qq':
      return { ...P, kind, showReference: true, showCI: false, detrended: false };
    case 'forest':
      return { ...P, kind, logScale: false, reference: 'one', sort: 'none' };
    case 'survival':
      return {
        ...P,
        kind,
        showCI: true,
        showCensoring: true,
        showMedian: false,
        step: true,
      };
    case 'risk':
      return { ...P, kind, showEvents: false };
    case 'mosaic':
      return { ...P, kind, showValues: true, residualColor: true };
    case 'acf':
      return { ...P, kind, showBand: true };
    case 'heatmap':
      return { ...P, kind, showValues: false, diverging: false, sort: 'none' };
    case 'residual':
      return { ...P, kind, showPoints: true, showZeroLine: true };
    case 'scree':
      return { ...P, kind, showKaiser: false, showValues: true };
    case 'score':
      return { ...P, kind, showLabels: false, ellipse: false, showVectors: false };
    case 'bland':
      return { ...P, kind, showBias: true, showLoA: true, showIdentity: false };
    case 'power':
      return { ...P, kind, showTarget: true, showDesignMarker: false };
    case 'bootstrap':
      return { ...P, kind, showObserved: true, showCI: true, showDensity: false };
    case 'missingness':
      return { ...P, kind, showLabels: false, display: 'bars' };
  }
};

/** Merge per-card options over the factory defaults, keeping unknown keys out. */
export type BoxDisplay = 'box' | 'notched' | 'violin' | 'raincloud';

/** Runtime guard: stored projects can carry an older or hand-edited value. */
export const boxDisplayOf = (options: ChartOptions): BoxDisplay =>
  options.kind === 'box' &&
  (options.display === 'notched' || options.display === 'violin' || options.display === 'raincloud')
    ? options.display
    : 'box';

export const mergeOptions = (
  kind: ChartKind,
  options: Partial<ChartOptions> | undefined
): ChartOptions => {
  const base = factoryOptions(kind);
  const user = activeDefaults ?? {};
  if (!options) return { ...base, ...user, kind } as ChartOptions;
  if (options.kind !== undefined && options.kind !== kind) return { ...base, ...user, kind } as ChartOptions;
  const merged = { ...base, ...user, ...options, kind } as ChartOptions;
  // Annotations are a per-card list, never a global default. Normalising here
  // keeps restored projects and hand-edited .lzs files safe.
  if (options.annotations !== undefined) {
    merged.annotations = normalizeAnnotations(options.annotations);
  }
  return merged;
};

/** Defaults for a chart, preserving a valid stored option object. */
export const chartOptions = (chart: AnalysisChart): ChartOptions =>
  mergeOptions(chart.kind, chart.options);

export const PRESET_OPTIONS: Record<
  CommonChartOptions['preset'],
  Partial<CommonChartOptions>
> = {
  default: {},
  minimal: {
    gridX: false,
    gridY: false,
    showLegend: false,
    showSubtitle: false,
    showNote: false,
  },
  print: {
    theme: 'light',
    palette: 'mono',
    gridY: true,
    gridOpacity: 0.25,
  },
};

export const SIZE_OPTIONS: Record<
  CommonChartOptions['size'],
  { height: number; width: number }
> = {
  compact: { height: 220, width: 420 },
  regular: { height: 300, width: 520 },
  wide: { height: 340, width: 780 },
};

/**
 * Apply one of the three built-in presets.
 *
 * The preset is a snapshot of the shared options, not a patch on whatever the
 * user had before: `Default` must be able to undo `Print light`, otherwise
 * theme and palette stay stuck on the previous preset. Specific options,
 * annotations and `kind` are preserved.
 */
export const applyPreset = (
  options: ChartOptions,
  preset: CommonChartOptions['preset']
): ChartOptions => ({
  ...options,
  ...COMMON_DEFAULTS,
  ...PRESET_OPTIONS[preset],
  preset,
});
