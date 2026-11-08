import type { AxisLabelFormat, AxisScaleType, ChartKind, ChartOptions } from '../stats/charts';

export type AxisChannel = 'x' | 'y';

export const AXIS_SCALE_TYPES: readonly AxisScaleType[] = ['auto', 'linear', 'log', 'sqrt'];

/**
 * Factory values for the axis controls.
 *
 * These do **not** live in `COMMON_DEFAULTS`: style presets and user defaults
 * are built from `COMMON_KEYS`, and an axis range saved into a preset would be
 * applied to unrelated data. Keeping them separate means a preset never
 * freezes a limit while the editor still resets a card to `auto`.
 */
export const AXIS_DEFAULTS = {
  xMin: null,
  xMax: null,
  yMin: null,
  yMax: null,
  xScaleType: 'auto',
  yScaleType: 'auto',
  xReverse: false,
  yReverse: false,
  xClamp: false,
  yClamp: false,
  xNice: false,
  yNice: false,
  xTickCount: null,
  yTickCount: null,
  xLabelFormat: 'auto',
  yLabelFormat: 'auto',
} as const;

export type AxisKey = keyof typeof AXIS_DEFAULTS;

export const AXIS_KEYS = Object.keys(AXIS_DEFAULTS) as readonly AxisKey[];

export type AxisLimitKey = 'xMin' | 'xMax' | 'yMin' | 'yMax';
export type AxisFlagKey = 'xReverse' | 'yReverse' | 'xClamp' | 'yClamp' | 'xNice' | 'yNice';
export type AxisTickKey = 'xTickCount' | 'yTickCount';
export type AxisFormatKey = 'xLabelFormat' | 'yLabelFormat';

export const AXIS_LABEL_FORMATS: readonly AxisLabelFormat[] = [
  'auto',
  'decimal',
  'compact',
  'percent',
  'scientific',
];

/**
 * d3-format spec handed to Vega-Lite for each choice. `~` trims trailing
 * zeros, `s` is the SI prefix (1.2k) and `%` multiplies by 100.
 */
export const AXIS_FORMAT_SPEC: Record<Exclude<AxisLabelFormat, 'auto'>, string> = {
  decimal: '~f',
  compact: '~s',
  percent: '.1%',
  scientific: '.2~e',
};

const TICK_MIN = 2;
const TICK_MAX = 50;

/**
 * Kinds whose axes are derived from a transform or shared with a second scale.
 * Editing them would fight the transform (Q-Q probability axis, Pareto's
 * percentage axis) or the layout (dendrogram, surface projections, nominal
 * matrices), so both the editor and the spec builder leave them automatic.
 */
const CHANNELS: Partial<Record<ChartKind, readonly AxisChannel[]>> = {
  qq: ['y'],
  forest: ['x'],
  scree: ['y'],
  tree: ['x'],
  pareto: [],
  dendrogram: [],
  surface: [],
  heatmap: [],
  mosaic: [],
  missingness: [],
  scattermatrix: [],
  scatter3d: [],
};

/** Channels that accept user limits for this chart kind. */
export const axisChannels = (kind: ChartKind): readonly AxisChannel[] =>
  CHANNELS[kind] ?? ['x', 'y'];

const read = (options: ChartOptions, key: AxisKey): unknown =>
  (options as unknown as Record<string, unknown>)[key];

const write = (options: ChartOptions, key: AxisKey, value: unknown): ChartOptions =>
  ({ ...options, [key]: value }) as ChartOptions;

export const axisNumber = (options: ChartOptions, key: AxisLimitKey): number | null => {
  const value = read(options, key);
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

export const axisScaleType = (
  options: ChartOptions,
  key: 'xScaleType' | 'yScaleType'
): AxisScaleType => {
  const value = read(options, key);
  return typeof value === 'string' && (AXIS_SCALE_TYPES as readonly string[]).includes(value)
    ? (value as AxisScaleType)
    : 'auto';
};

export const axisFlag = (options: ChartOptions, key: AxisFlagKey): boolean =>
  read(options, key) === true;

export const axisTickCount = (options: ChartOptions, key: AxisTickKey): number | null => {
  const value = read(options, key);
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

export const axisLabelFormat = (
  options: ChartOptions,
  key: AxisFormatKey
): AxisLabelFormat => {
  const value = read(options, key);
  return typeof value === 'string' && (AXIS_LABEL_FORMATS as readonly string[]).includes(value)
    ? (value as AxisLabelFormat)
    : 'auto';
};

export const setAxisTickCount = (
  options: ChartOptions,
  key: AxisTickKey,
  value: number | null
): ChartOptions =>
  write(options, key, typeof value === 'number' && Number.isFinite(value) ? value : null);

export const setAxisLabelFormat = (
  options: ChartOptions,
  key: AxisFormatKey,
  value: string | number | boolean
): ChartOptions => {
  const next =
    typeof value === 'string' && (AXIS_LABEL_FORMATS as readonly string[]).includes(value)
      ? value
      : 'auto';
  return write(options, key, next);
};

export const setAxisNumber = (
  options: ChartOptions,
  key: AxisLimitKey,
  value: number | null
): ChartOptions =>
  write(options, key, typeof value === 'number' && Number.isFinite(value) ? value : null);

export const setAxisScaleType = (
  options: ChartOptions,
  key: 'xScaleType' | 'yScaleType',
  value: string | number | boolean
): ChartOptions => {
  const next = typeof value === 'string' && (AXIS_SCALE_TYPES as readonly string[]).includes(value)
    ? value
    : 'auto';
  return write(options, key, next);
};

export const setAxisFlag = (
  options: ChartOptions,
  key: AxisFlagKey,
  value: string | number | boolean
): ChartOptions => write(options, key, Boolean(value));

/**
 * Sanitise the axis pair of one channel.
 *
 * Stored projects and hand-edited `.lzs` files can carry anything: an inverted
 * range, a NaN from a cleared input, a log scale with non-positive limits.
 * Invalid input degrades to `auto` instead of producing a Vega warning.
 */
const normalizeAxis = (options: ChartOptions, axis: AxisChannel): ChartOptions => {
  const minKey = `${axis}Min` as AxisLimitKey;
  const maxKey = `${axis}Max` as AxisLimitKey;
  const typeKey = `${axis}ScaleType` as 'xScaleType' | 'yScaleType';
  let min = axisNumber(options, minKey);
  let max = axisNumber(options, maxKey);
  const type = axisScaleType(options, typeKey);
  if (min !== null && max !== null && min >= max) {
    min = null;
    max = null;
  }
  if (type === 'log') {
    if (min !== null && min <= 0) min = null;
    if (max !== null && max <= 0) max = null;
    if (min !== null && max !== null && min >= max) {
      min = null;
      max = null;
    }
  }
  let next = setAxisNumber(options, minKey, min);
  next = setAxisNumber(next, maxKey, max);
  next = write(next, typeKey, type);
  next = write(next, `${axis}Reverse` as AxisKey, axisFlag(next, `${axis}Reverse` as AxisFlagKey));
  next = write(next, `${axis}Clamp` as AxisKey, axisFlag(next, `${axis}Clamp` as AxisFlagKey));
  next = write(next, `${axis}Nice` as AxisKey, axisFlag(next, `${axis}Nice` as AxisFlagKey));
  // Out-of-range tick counts and unknown formats fall back to automatic: the
  // request is a hint (Vega-Lite may pick another count), never an error.
  const tickKey = `${axis}TickCount` as AxisTickKey;
  const ticks = axisTickCount(next, tickKey);
  const rounded = ticks === null ? null : Math.round(ticks);
  next = write(
    next,
    tickKey as AxisKey,
    rounded !== null && rounded >= TICK_MIN && rounded <= TICK_MAX ? rounded : null
  );
  const formatKey = `${axis}LabelFormat` as AxisFormatKey;
  next = write(next, formatKey as AxisKey, axisLabelFormat(next, formatKey));
  return next;
};

/** Fill and validate every axis key; unknown or missing input becomes `auto`. */
export const normalizeAxisOptions = <T extends ChartOptions>(options: T): T =>
  normalizeAxis(normalizeAxis(options, 'x'), 'y') as T;

export interface AxisScalePatch {
  domainMin?: number;
  domainMax?: number;
  zero?: false;
  type?: Exclude<AxisScaleType, 'auto'>;
  reverse?: true;
  clamp?: true;
  nice?: true;
}

/**
 * Vega-Lite scale properties for one channel, or `null` when the axis is fully
 * automatic (so the builder leaves the layer untouched).
 */
export const axisScalePatch = (
  options: ChartOptions,
  channel: AxisChannel
): AxisScalePatch | null => {
  const min = axisNumber(options, `${channel}Min`);
  const max = axisNumber(options, `${channel}Max`);
  const type = axisScaleType(options, `${channel}ScaleType`);
  const reverse = axisFlag(options, `${channel}Reverse`);
  const clamp = axisFlag(options, `${channel}Clamp`);
  const nice = axisFlag(options, `${channel}Nice`);
  if (min === null && max === null && type === 'auto' && !reverse && !clamp && !nice) return null;
  return {
    ...(min !== null ? { domainMin: min } : {}),
    ...(max !== null ? { domainMax: max } : {}),
    // An explicit limit must win over `zeroBaseline`, otherwise a positive
    // minimum would be silently extended down to zero.
    ...(min !== null || max !== null ? { zero: false as const } : {}),
    ...(type !== 'auto' ? { type } : {}),
    ...(reverse ? { reverse: true as const } : {}),
    ...(clamp ? { clamp: true as const } : {}),
    ...(nice ? { nice: true as const } : {}),
  };
};

export interface AxisPropertyPatch {
  tickCount?: number;
  /** Ready-made d3-format spec, not the semantic choice. */
  format?: string;
}

/** Axis object patch (ticks and label format), or `null` when both are auto. */
export const axisPropertyPatch = (
  options: ChartOptions,
  channel: AxisChannel
): AxisPropertyPatch | null => {
  const ticks = axisTickCount(options, `${channel}TickCount`);
  const choice = axisLabelFormat(options, `${channel}LabelFormat`);
  const format = choice === 'auto' ? undefined : AXIS_FORMAT_SPEC[choice];
  if (ticks === null && format === undefined) return null;
  return {
    ...(ticks !== null ? { tickCount: ticks } : {}),
    ...(format !== undefined ? { format } : {}),
  };
};
