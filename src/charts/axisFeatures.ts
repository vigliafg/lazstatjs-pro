import type { MessageKey } from '../i18n';
import type { AnalysisChart, ChartOptions } from '../stats/charts';
import {
  axisChannels,
  axisFlag,
  axisLabelFormat,
  axisNumber,
  axisScaleType,
  axisTickCount,
  setAxisFlag,
  setAxisLabelFormat,
  setAxisNumber,
  setAxisScaleType,
  setAxisTickCount,
  type AxisFlagKey,
  type AxisFormatKey,
  type AxisLimitKey,
  type AxisTickKey,
} from './axisModel';
import type { FeatureDescriptor } from './featureTypes';

/** Local copy: `choice` is private to features.ts and importing it would cycle. */
const choice = (value: string, labelKey: MessageKey) => ({ value, labelKey });

type Axis = 'x' | 'y';

const visibleFor =
  (axis: Axis) =>
  (_options: ChartOptions, chart: AnalysisChart): boolean =>
    axisChannels(chart.kind).includes(axis);

const axisFeature = (
  id: string,
  labelKey: MessageKey,
  type: FeatureDescriptor['type'],
  axis: Axis,
  get: FeatureDescriptor['get'],
  set: FeatureDescriptor['set'],
  extra: Partial<FeatureDescriptor> = {}
): FeatureDescriptor => ({
  id,
  labelKey,
  group: 'general',
  type,
  section: 'chart.section.axis',
  visible: visibleFor(axis),
  get,
  set,
  ...extra,
});

const limit = (axis: Axis, edge: 'Min' | 'Max', labelKey: MessageKey): FeatureDescriptor => {
  const key = `${axis}${edge}` as AxisLimitKey;
  return axisFeature(
    `general.${key}`,
    labelKey,
    'numberInput',
    axis,
    options => axisNumber(options, key) ?? '',
    (options, value) => setAxisNumber(options, key, value === '' ? null : Number(value))
  );
};

const scale = (axis: Axis, labelKey: MessageKey): FeatureDescriptor => {
  const key = `${axis}ScaleType` as 'xScaleType' | 'yScaleType';
  return axisFeature(
    `general.${key}`,
    labelKey,
    'select',
    axis,
    options => axisScaleType(options, key),
    (options, value) => setAxisScaleType(options, key, value),
    {
      choices: [
        choice('auto', 'chart.scale.auto'),
        choice('linear', 'chart.scale.linear'),
        choice('log', 'chart.scale.log'),
        choice('sqrt', 'chart.scale.sqrt'),
      ],
    }
  );
};

const tickCount = (axis: Axis, labelKey: MessageKey): FeatureDescriptor => {
  const key = `${axis}TickCount` as AxisTickKey;
  return axisFeature(
    `general.${key}`,
    labelKey,
    'numberInput',
    axis,
    options => axisTickCount(options, key) ?? '',
    (options, value) => setAxisTickCount(options, key, value === '' ? null : Number(value)),
    { min: 2, max: 50, step: 1 }
  );
};

const labelFormat = (axis: Axis, labelKey: MessageKey): FeatureDescriptor => {
  const key = `${axis}LabelFormat` as AxisFormatKey;
  return axisFeature(
    `general.${key}`,
    labelKey,
    'select',
    axis,
    options => axisLabelFormat(options, key),
    (options, value) => setAxisLabelFormat(options, key, value),
    {
      choices: [
        choice('auto', 'chart.format.auto'),
        choice('decimal', 'chart.format.decimal'),
        choice('compact', 'chart.format.compact'),
        choice('percent', 'chart.format.percent'),
        choice('scientific', 'chart.format.scientific'),
      ],
    }
  );
};

const toggle = (axis: Axis, flag: 'Reverse' | 'Clamp' | 'Nice', labelKey: MessageKey): FeatureDescriptor => {
  const key = `${axis}${flag}` as AxisFlagKey;
  return axisFeature(
    `general.${key}`,
    labelKey,
    'checkbox',
    axis,
    options => axisFlag(options, key),
    (options, value) => setAxisFlag(options, key, value)
  );
};

/**
 * Axis controls, kept out of features.ts so the registry file stays readable.
 * `general.` keeps the shared reset/close plumbing in the editor working.
 */
export const AXIS_FEATURES: FeatureDescriptor[] = [
  limit('x', 'Min', 'chart.feature.xMin'),
  limit('x', 'Max', 'chart.feature.xMax'),
  tickCount('x', 'chart.feature.xTicks'),
  limit('y', 'Min', 'chart.feature.yMin'),
  limit('y', 'Max', 'chart.feature.yMax'),
  tickCount('y', 'chart.feature.yTicks'),
  scale('x', 'chart.feature.xScale'),
  scale('y', 'chart.feature.yScale'),
  labelFormat('x', 'chart.feature.xFormat'),
  labelFormat('y', 'chart.feature.yFormat'),
  toggle('x', 'Reverse', 'chart.feature.xReverse'),
  toggle('y', 'Reverse', 'chart.feature.yReverse'),
  toggle('x', 'Clamp', 'chart.feature.xClamp'),
  toggle('y', 'Clamp', 'chart.feature.yClamp'),
  toggle('x', 'Nice', 'chart.feature.xNice'),
  toggle('y', 'Nice', 'chart.feature.yNice'),
];
