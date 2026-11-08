/**
 * Built-in style gallery.
 *
 * A style is a complete set of the kind-specific options that change the look
 * of one chart type (box display, Q-Q axis, histogram overlays, ...). Unlike a
 * named preset it is scoped to a single `kind`. It never touches colours,
 * theme, titles or annotations; a line dash is allowed only when it is part of
 * the look (the Q-Q reference line).
 *
 * Every kind that has a meaningful visual switch declares its styles here, in
 * gallery order, with exactly one `isDefault` entry. The default entry mirrors
 * the factory options, so a chart produced by a procedure always matches it
 * (`defaultChartStyle` + `applyChartStyle` keep the two in sync).
 */

import type { MessageKey } from '../i18n';
import type { AnalysisChart, ChartKind, ChartOptions, ChartRow } from '../stats/charts';
import { CHART_KINDS } from '../stats/charts';
import { AXIS_KEYS } from './axisModel';
import { COMMON_KEYS, factoryOptions } from './defaults';

/** Kind-specific options a style can own. Values are JSON primitives. */
export type ChartStylePatch = Readonly<Record<string, string | number | boolean>>;

/** Who proposes a built-in style: the app default or a documented convention. */
export type ChartStyleOrigin = 'lazstat' | 'jmp';

/** Precalculated chart data a style needs before it can be offered. */
export type ChartCapability = 'meanY' | 'meanCI' | 'percentile' | 'band' | 'group' | 'residSd';

/** Context used to decide whether a style can be applied to a card. */
export interface ChartStyleContext {
  chart?: AnalysisChart;
  analysisId?: string;
}

export interface ChartStyle {
  /** Stable id inside the kind, used by tests and DOM attributes. */
  id: string;
  kind: ChartKind;
  /** Translated label of a built-in style. */
  labelKey?: MessageKey;
  /** Name of a style saved by the user. */
  name?: string;
  /** The style procedures emit for this kind. */
  isDefault?: boolean;
  /** Saved by the user (Settings → Charts) instead of shipped with the app. */
  user?: boolean;
  /** Family of a built-in style; user styles are identified by `user`. */
  origin?: ChartStyleOrigin;
  /** Short, translated explanation of what changes statistically. */
  descriptionKey?: MessageKey;
  /** Procedures this style is meant for, when the kind is reused elsewhere. */
  analyses?: readonly string[];
  /** Data the style needs; without it the tile is not offered. */
  requires?: readonly ChartCapability[];
  options: ChartStylePatch;
}

/** A style saved by the user for one chart kind. */
export interface UserChartStyle {
  id: string;
  name: string;
  kind: ChartKind;
  options: ChartStylePatch;
}

export const MAX_USER_CHART_STYLES = 40;
export const MAX_USER_CHART_STYLE_NAME = 48;
export const MAX_USER_CHART_STYLE_ID = 48;
export const MAX_USER_CHART_STYLE_BYTES = 20_000;

const COMMON = new Set<string>(COMMON_KEYS as readonly string[]);

/** Factory-look style of a built-in gallery. */
const PLAIN: MessageKey = 'chart.preset.default';

const style = (
  kind: ChartKind,
  id: string,
  labelKey: MessageKey,
  options: ChartStylePatch,
  isDefault = false,
  meta: Partial<Pick<ChartStyle, 'origin' | 'descriptionKey' | 'analyses' | 'requires'>> = {}
): ChartStyle => ({
  id,
  kind,
  labelKey,
  options,
  origin: 'lazstat',
  ...(isDefault ? { isDefault: true } : {}),
  ...meta,
});

const sanitizeName = (value: unknown): string =>
  typeof value === 'string'
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_USER_CHART_STYLE_NAME)
    : '';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Axis limits and scale type are per card: a saved style must not pin a range
 * that belongs to one dataset, even though the keys exist in the factory.
 */
const AXIS = new Set<string>(AXIS_KEYS as readonly string[]);

/** Keep only known kind-specific keys with a matching primitive type. */
const sanitizePatch = (kind: ChartKind, value: unknown): ChartStylePatch => {
  if (!isRecord(value)) return {};
  const factory = factoryOptions(kind) as unknown as Record<string, unknown>;
  const patch: Record<string, string | number | boolean> = {};
  for (const [key, item] of Object.entries(value)) {
    if (key === 'kind' || key === 'annotations' || COMMON.has(key) || AXIS.has(key)) continue;
    if (!(key in factory)) continue;
    const expected = typeof factory[key];
    if (typeof item !== expected) continue;
    if (typeof item === 'boolean' || typeof item === 'string' || typeof item === 'number') {
      patch[key] = item;
    }
  }
  return patch;
};

const cleanId = (value: unknown, fallback: string, used: Set<string>): string => {
  const base =
    typeof value === 'string'
      ? value.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, MAX_USER_CHART_STYLE_ID)
      : '';
  let id = base || fallback;
  let suffix = 2;
  while (used.has(id)) {
    id = `${base || fallback}-${suffix}`;
    suffix += 1;
  }
  used.add(id);
  return id;
};

const isKind = (value: unknown): value is ChartKind =>
  typeof value === 'string' && (CHART_KINDS as readonly string[]).includes(value);

/** Validate a persisted/imported list of user styles. */
export const normalizeUserStyles = (value: unknown): UserChartStyle[] => {
  if (!Array.isArray(value)) return [];
  const styles: UserChartStyle[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();
  for (let index = 0; index < value.length && styles.length < MAX_USER_CHART_STYLES; index += 1) {
    const raw = value[index];
    if (!isRecord(raw)) continue;
    const name = sanitizeName(raw.name);
    if (!name || !isKind(raw.kind)) continue;
    const nameKey = `${raw.kind}:${name.toLowerCase()}`;
    if (names.has(nameKey)) continue;
    const options = sanitizePatch(raw.kind, raw.options);
    if (Object.keys(options).length === 0) continue;
    styles.push({
      id: cleanId(raw.id, `u-style-${index + 1}`, ids),
      name,
      kind: raw.kind,
      options,
    });
    names.add(nameKey);
  }
  while (styles.length > 0 && JSON.stringify(styles).length > MAX_USER_CHART_STYLE_BYTES) {
    styles.pop();
  }
  return styles;
};

export const userStyleNameExists = (
  styles: readonly UserChartStyle[],
  kind: ChartKind,
  name: string,
  exceptId?: string
): boolean => {
  const key = name.trim().toLowerCase();
  return styles.some(
    style => style.kind === kind && style.id !== exceptId && style.name.toLowerCase() === key
  );
};

let userStyleSequence = 0;

const createUserStyle = (
  name: string,
  kind: ChartKind,
  options: ChartStylePatch,
  existing: readonly UserChartStyle[]
): UserChartStyle => {
  const used = new Set(existing.map(style => style.id));
  const id = cleanId(
    `u-${Date.now().toString(36)}-${(userStyleSequence++).toString(36)}`,
    `user-style-${used.size + 1}`,
    used
  );
  return { id, name: sanitizeName(name) || 'Style', kind, options: sanitizePatch(kind, options) };
};

/** All kind-specific options currently set on a card, ready to be saved. */
export const stylePatchOf = (options: ChartOptions): ChartStylePatch => {
  const patch: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(options)) {
    if (key === 'kind' || key === 'annotations' || COMMON.has(key)) continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      patch[key] = value;
    }
  }
  return patch;
};

/**
 * Save the current kind-specific options under a name. Same name and kind
 * overwrite, mirroring the named presets.
 */
export const saveUserStyle = (
  styles: readonly UserChartStyle[],
  name: string,
  kind: ChartKind,
  options: ChartStylePatch
): UserChartStyle[] => {
  const clean = sanitizeName(name);
  const patch = sanitizePatch(kind, options);
  if (!clean || Object.keys(patch).length === 0) return [...styles];
  const existing = styles.find(
    style => style.kind === kind && style.name.toLowerCase() === clean.toLowerCase()
  );
  if (existing) {
    return styles.map(style =>
      style.id === existing.id ? { ...style, options: patch } : style
    );
  }
  if (styles.length >= MAX_USER_CHART_STYLES) return [...styles];
  return [...styles, createUserStyle(clean, kind, patch, styles)];
};

export const renameUserStyle = (
  styles: readonly UserChartStyle[],
  id: string,
  name: string
): UserChartStyle[] => {
  const clean = sanitizeName(name);
  if (!clean) return [...styles];
  const target = styles.find(style => style.id === id);
  if (!target || userStyleNameExists(styles, target.kind, clean, id)) return [...styles];
  return styles.map(style => (style.id === id ? { ...style, name: clean } : style));
};

export const deleteUserStyle = (
  styles: readonly UserChartStyle[],
  id: string
): UserChartStyle[] => styles.filter(style => style.id !== id);

const asStyle = (userStyle: UserChartStyle): ChartStyle => ({
  id: userStyle.id,
  kind: userStyle.kind,
  name: userStyle.name,
  user: true,
  options: userStyle.options,
});

const GALLERY: Partial<Record<ChartKind, readonly ChartStyle[]>> = {
  qq: [
    style(
      'qq',
      'probability',
      'chart.qqAxis.probability',
      { ciStyle: 'curves', qqAxis: 'both', lineDash: 'solid' },
      true,
      { origin: 'jmp', descriptionKey: 'chart.style.jmpQqHint' }
    ),
    style('qq', 'classic', 'chart.style.classic', {
      ciStyle: 'band',
      qqAxis: 'z',
      lineDash: 'dashed',
    }),
  ],
  box: [
    style('box', 'box', PLAIN, { display: 'box' }, true),
    style('box', 'notched', 'chart.display.notched', { display: 'notched' }),
    style('box', 'violin', 'chart.display.violin', { display: 'violin' }),
    style('box', 'raincloud', 'chart.display.raincloud', { display: 'raincloud' }),
    style(
      'box',
      'jmp-oneway',
      'chart.style.jmpOneway',
      {
        display: 'box',
        whisker: 'percentile',
        showPoints: true,
        jitter: true,
        showMean: true,
        showMeanInterval: true,
        showOutliers: true,
      },
      false,
      {
        origin: 'jmp',
        descriptionKey: 'chart.style.jmpOnewayHint',
        requires: ['percentile', 'meanCI'],
      }
    ),
    style(
      'box',
      'jmp-outlier',
      'chart.style.jmpOutlier',
      {
        display: 'box',
        whisker: 'tukey',
        showPoints: false,
        jitter: false,
        showMean: true,
        showMeanInterval: true,
        showOutliers: true,
      },
      false,
      {
        origin: 'jmp',
        descriptionKey: 'chart.style.jmpOutlierHint',
        requires: ['meanCI'],
      }
    ),
  ],
  histogram: [
    style(
      'histogram',
      'plain',
      PLAIN,
      { showDensity: false, showKde: false, showRug: false, showMeanLine: false },
      true
    ),
    style('histogram', 'density', 'chart.feature.density', {
      showDensity: true,
      showKde: false,
      showRug: false,
      showMeanLine: false,
    }),
    style('histogram', 'kde', 'chart.feature.kde', {
      showDensity: false,
      showKde: true,
      showRug: true,
      showMeanLine: false,
    }),
    style('histogram', 'mean', 'chart.feature.meanLine', {
      showDensity: false,
      showKde: false,
      showRug: false,
      showMeanLine: true,
    }),
    style(
      'histogram',
      'jmp-basic',
      'chart.style.jmpBasic',
      {
        showDensity: false,
        showKde: false,
        showRug: true,
        showMeanLine: true,
      },
      false,
      {
        origin: 'jmp',
        descriptionKey: 'chart.style.jmpBasicHint',
      }
    ),
  ],
  scatter: [
    style('scatter', 'points', PLAIN, { fit: 'none', band: 'none', ellipse: false }, true),
    style('scatter', 'ols', 'chart.fit.ols', { fit: 'ols', band: 'ci', ellipse: false }),
    style('scatter', 'robust', 'chart.fit.robust', { fit: 'robust', band: 'none', ellipse: false }),
    style('scatter', 'ellipse', 'chart.feature.ellipse', {
      fit: 'ols',
      band: 'none',
      ellipse: true,
    }),
    style(
      'scatter',
      'jmp-regression',
      'chart.style.jmpRegression',
      {
        fit: 'ols',
        band: 'ci',
        showBand: true,
        bandLevel: 95,
        showMeanLine: true,
        equation: 'short',
        ellipse: false,
      },
      false,
      {
        origin: 'jmp',
        descriptionKey: 'chart.style.jmpRegressionHint',
        analyses: ['regression'],
        requires: ['meanY', 'band'],
      }
    ),
  ],
  bar: [
    style('bar', 'plain', PLAIN, { error: 'none', valueLabels: false, grouping: 'stacked' }, true),
    style('bar', 'errors', 'chart.error.se', {
      error: 'se',
      valueLabels: false,
      grouping: 'stacked',
    }),
    style('bar', 'labels', 'chart.feature.labels', {
      error: 'none',
      valueLabels: true,
      grouping: 'stacked',
    }),
    style('bar', 'grouped', 'chart.grouping.grouped', {
      error: 'none',
      valueLabels: false,
      grouping: 'grouped',
    }),
  ],
  line: [
    style('line', 'plain', PLAIN, { step: false, showMarkers: false }, true),
    style('line', 'step', 'chart.feature.step', { step: true, showMarkers: false }),
    style('line', 'markers', 'chart.feature.markers', { step: false, showMarkers: true }),
    style(
      'line',
      'jmp-connected',
      'chart.style.jmpLineConnected',
      { step: false, showMarkers: true },
      false,
      { origin: 'jmp', descriptionKey: 'chart.style.jmpLineConnectedHint' }
    ),
  ],
  interval: [
    style('interval', 'plain', PLAIN, { valueLabels: false }, true),
    style('interval', 'labels', 'chart.feature.labels', { valueLabels: true }),
    style(
      'interval',
      'jmp-mean-diamond',
      'chart.style.jmpMeanDiamond',
      { valueLabels: false, showMeanDiamond: true },
      false,
      { origin: 'jmp', descriptionKey: 'chart.style.jmpMeanDiamondHint' }
    ),
  ],
  dot: [
    style('dot', 'plain', PLAIN, { showMean: false }, true),
    style('dot', 'mean', 'chart.feature.mean', { showMean: true }),
    style(
      'dot',
      'jmp-strip',
      'chart.style.jmpStrip',
      { showMean: false, jitter: 'wide' },
      false,
      { origin: 'jmp', descriptionKey: 'chart.style.jmpStripHint' }
    ),
  ],
  residual: [
    style(
      'residual',
      'plain',
      PLAIN,
      { showPoints: true, showZeroLine: true, showStdBand: false },
      true
    ),
    style(
      'residual',
      'jmp-residual',
      'chart.style.jmpResidual',
      { showPoints: true, showZeroLine: true, showStdBand: true },
      false,
      {
        origin: 'jmp',
        descriptionKey: 'chart.style.jmpResidualHint',
        requires: ['residSd'],
      }
    ),
  ],
  ecdf: [
    style('ecdf', 'plain', PLAIN, { showPoints: false, showMedian: false }, true),
    style('ecdf', 'points', 'chart.feature.points', { showPoints: true, showMedian: false }),
    style('ecdf', 'median', 'chart.feature.median', { showPoints: false, showMedian: true }),
  ],
  survival: [
    style('survival', 'plain', PLAIN, { showMedian: false, step: true }, true),
    style('survival', 'median', 'chart.feature.median', { showMedian: true, step: true }),
    style(
      'survival',
      'jmp-km',
      'chart.style.jmpSurvivalKm',
      { step: true, showCI: true, showCensoring: true, showMedian: true },
      false,
      { origin: 'jmp', descriptionKey: 'chart.style.jmpSurvivalKmHint' }
    ),
  ],
  forest: [
    style('forest', 'linear', PLAIN, { logScale: false }, true),
    style('forest', 'log', 'chart.feature.logScale', { logScale: true }),
    style(
      'forest',
      'jmp-ratio',
      'chart.style.jmpForestRatio',
      { logScale: true, reference: 'one' },
      false,
      { origin: 'jmp', descriptionKey: 'chart.style.jmpForestRatioHint' }
    ),
  ],
  heatmap: [
    style('heatmap', 'sequential', PLAIN, { diverging: false, showValues: false }, true),
    style('heatmap', 'diverging', 'chart.feature.diverging', { diverging: true, showValues: true }),
  ],
  missingness: [
    style('missingness', 'bars', PLAIN, { display: 'bars' }, true),
    style('missingness', 'matrix', 'chart.display.matrix', { display: 'matrix' }),
  ],
  risk: [
    style('risk', 'plain', PLAIN, { showEvents: false }, true),
    style('risk', 'events', 'chart.feature.events', { showEvents: true }),
  ],
  power: [
    style('power', 'plain', PLAIN, { showDesignMarker: false }, true),
    style('power', 'design', 'chart.feature.designMarker', { showDesignMarker: true }),
  ],
  bootstrap: [
    style('bootstrap', 'plain', PLAIN, { showDensity: false }, true),
    style('bootstrap', 'density', 'chart.feature.density', { showDensity: true }),
  ],
  scree: [
    style('scree', 'plain', PLAIN, { showKaiser: false }, true),
    style('scree', 'kaiser', 'chart.feature.kaiser', { showKaiser: true }),
  ],
  score: [
    style('score', 'plain', PLAIN, { showVectors: false, ellipse: false }, true),
    style('score', 'vectors', 'chart.feature.vectors', { showVectors: true, ellipse: false }),
    style('score', 'ellipse', 'chart.feature.ellipse', { showVectors: false, ellipse: true }),
  ],
  bland: [
    style('bland', 'plain', PLAIN, { showIdentity: false }, true),
    style('bland', 'identity', 'chart.feature.identity', { showIdentity: true }),
  ],
};

/** Built-in styles plus the user styles saved for that kind. */
export const stylesFor = (
  kind: ChartKind,
  user: readonly UserChartStyle[] = []
): readonly ChartStyle[] => [
  ...(GALLERY[kind] ?? []),
  ...user.filter(style => style.kind === kind).map(asStyle),
];

/** Built-in styles of one family; user styles are not included. */
export const stylesByOrigin = (
  kind: ChartKind,
  origin: ChartStyleOrigin,
  user: readonly UserChartStyle[] = []
): readonly ChartStyle[] =>
  stylesFor(kind, user).filter(style => !style.user && style.origin === origin);

const finiteNumber = (value: unknown): boolean =>
  (typeof value === 'number' && Number.isFinite(value)) ||
  (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value)));

const someSummary = (chart: AnalysisChart, keys: readonly string[]): boolean =>
  (chart.data.summary ?? []).some(row =>
    keys.every(key => finiteNumber((row as Record<string, unknown>)[key]))
  );

const capabilityAvailable = (
  chart: AnalysisChart,
  capability: ChartCapability
): boolean => {
  switch (capability) {
    case 'meanY':
      return finiteNumber(chart.stats?.meanY);
    case 'meanCI':
      return someSummary(chart, ['meanLo', 'meanHi']);
    case 'percentile':
      return someSummary(chart, ['p10', 'p90']);
    case 'band':
      return (
        (chart.data.grid ?? []).some(
          (row: ChartRow) => Number.isFinite(row.seMean) || Number.isFinite(row.sePred)
        ) || (chart.data.band ?? []).length > 0
      );
    case 'group':
      return (chart.data.points ?? []).some(row => row.group !== undefined && row.group !== null);
    case 'residSd':
      return finiteNumber(chart.stats?.residSd);
  }
};

/**
 * True when the style can be offered for the given card and procedure.
 *
 * Before the first run there is no chart yet, so only `analyses` is decisive
 * and the data capabilities are optimistic: the run setup must not hide a
 * style that the future card may support.
 */
export const styleAvailable = (
  item: ChartStyle,
  context: ChartStyleContext = {}
): boolean => {
  if (item.analyses && context.analysisId && !item.analyses.includes(context.analysisId)) {
    return false;
  }
  if (!context.chart || !item.requires || item.requires.length === 0) return true;
  return item.requires.every(capability => capabilityAvailable(context.chart as AnalysisChart, capability));
};

/** True when the editor should show the gallery strip. */
export const hasStyleGallery = (
  kind: ChartKind,
  user: readonly UserChartStyle[] = []
): boolean => stylesFor(kind, user).length > 1;

export const defaultChartStyle = (kind: ChartKind): ChartStyle | undefined =>
  (GALLERY[kind] ?? []).find(item => item.isDefault);

/** Style of a kind by id, falling back to the built-in default. */
export const styleById = (
  kind: ChartKind,
  id: string | undefined,
  user: readonly UserChartStyle[] = []
): ChartStyle | undefined =>
  (id ? stylesFor(kind, user).find(item => item.id === id) : undefined) ??
  defaultChartStyle(kind);

/**
 * Effective style of a kind: explicit id (analysis override, then global
 * default) or the built-in default. Missing styles fall back, never throw.
 */
export const resolvedStyle = (
  kind: ChartKind,
  globalId: string | undefined,
  overrideId: string | undefined,
  user: readonly UserChartStyle[] = []
): ChartStyle | undefined => styleById(kind, overrideId ?? globalId, user);

/** Copy of the options with the style's kind-specific keys replaced. */
export const applyChartStyle = (options: ChartOptions, item: ChartStyle): ChartOptions => {
  if (options.kind !== item.kind) return options;
  return { ...options, ...item.options, kind: options.kind } as ChartOptions;
};

/**
 * The style a card currently matches. A style matches when every option it
 * owns has the style's value; the result is unique because the styles of a
 * kind own the same keys with different values.
 */
export const matchingChartStyle = (
  options: ChartOptions,
  user: readonly UserChartStyle[] = []
): ChartStyle | undefined => {
  const matches = stylesFor(options.kind, user).filter(item =>
    Object.entries(item.options).every(
      ([key, value]) => (options as unknown as Record<string, unknown>)[key] === value
    )
  );
  if (matches.length <= 1) return matches[0];
  // Several styles can match when a saved style copies a built-in one: the
  // most specific wins, the built-in breaks the tie.
  return [...matches].sort(
    (a, b) =>
      Object.keys(b.options).length - Object.keys(a.options).length ||
      Number(Boolean(a.user)) - Number(Boolean(b.user))
  )[0];
};
