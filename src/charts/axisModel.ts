import type { AxisScaleType, ChartKind, ChartOptions } from '../stats/charts';

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
} as const;

export type AxisKey = keyof typeof AXIS_DEFAULTS;

export const AXIS_KEYS = Object.keys(AXIS_DEFAULTS) as readonly AxisKey[];

export type AxisLimitKey = 'xMin' | 'xMax' | 'yMin' | 'yMax';
export type AxisFlagKey = 'xReverse' | 'yReverse' | 'xClamp' | 'yClamp' | 'xNice' | 'yNice';

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
