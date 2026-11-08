import type { TopLevelSpec } from 'vega-lite';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { axisChannels, type AxisChannel } from '../axisModel';

/** Name of the scale-binding parameter added when zoom is on. */
export const ZOOM_PARAM = 'chartZoom';

export const zoomEnabled = (options: ChartOptions): boolean =>
  (options as unknown as { enableZoom?: unknown }).enableZoom === true;

type SpecRecord = Record<string, any>;

const layersOf = (spec: unknown): SpecRecord[] | null => {
  const layers = (spec as { layer?: unknown })?.layer;
  return Array.isArray(layers) ? (layers as SpecRecord[]) : null;
};

/** A scale can be bound only when its domain is continuous and not binned. */
const continuous = (encoding: SpecRecord | undefined): boolean =>
  encoding?.type === 'quantitative' &&
  encoding?.bin !== true &&
  typeof encoding?.bin !== 'object';

/** Encodings that draw a field, as opposed to fixed marks (value/datum). */
const fielded = (layers: readonly SpecRecord[], channel: AxisChannel): SpecRecord[] =>
  layers
    .map(layer => layer?.encoding?.[channel] as SpecRecord | undefined)
    .filter(
      (encoding): encoding is SpecRecord =>
        encoding !== undefined && typeof encoding.field === 'string'
    );

/**
 * Scale binding covers the whole view, so every channel that plots a field
 * must be continuous: Vega-Lite refuses to bind a nominal domain (bar with
 * categories) or a binned one (histogram). Reference layers carry a fixed
 * `value` instead of a field and are ignored here: the parameter is declared
 * on a data layer, so they never take part in the projection.
 *
 * At least one channel allowed by `axisChannels(kind)` must remain zoomable,
 * otherwise the switch is useless.
 */
const canBindScales = (spec: unknown, allowed: readonly AxisChannel[]): boolean => {
  const layers = layersOf(spec) ?? [spec as SpecRecord];
  for (const channel of ['x', 'y'] as const) {
    const drawn = fielded(layers, channel);
    if (drawn.length > 0 && drawn.some(encoding => !continuous(encoding))) return false;
  }
  return allowed.some(channel => layers.some(layer => continuous(layer?.encoding?.[channel])));
};

const withoutZoom = (params: unknown): SpecRecord[] =>
  Array.isArray(params) ? params.filter((param: SpecRecord) => param?.name !== ZOOM_PARAM) : [];

const zoomParameter = { name: ZOOM_PARAM, select: 'interval', bind: 'scales' };

/**
 * Bind the view scales to an interval parameter so the wheel zooms and the drag
 * pans, with the axes following the domain.
 *
 * The row-level brush in `interaction.ts` does not use specification
 * parameters: it keeps the selection in the `linkKeys`/`hiddenKeys` signals.
 * The two therefore coexist, and the link signals written by `applyChartLink`
 * are preserved here.
 *
 * On a layered spec the parameter is declared on the first layer that carries a
 * field for a scalable channel. At the top level Vega-Lite would try to project
 * the selection on every layer and warn about reference layers that only have
 * one axis (a horizontal rule has no `x`); on a layer it emits the same
 * view-wide `chartZoom_x`/`chartZoom_y` scale signals without the warning.
 */
export const applyZoom = <T extends TopLevelSpec>(
  spec: T,
  options: ChartOptions,
  chart: AnalysisChart
): T => {
  if (!zoomEnabled(options)) return spec;
  const allowed = axisChannels(chart.kind);
  if (!canBindScales(spec, allowed)) return spec;
  const layers = layersOf(spec);
  if (!layers) {
    return {
      ...spec,
      params: [...withoutZoom((spec as unknown as SpecRecord).params), zoomParameter],
    } as T;
  }
  const target = layers.findIndex(layer => allowed.some(channel => continuous(layer?.encoding?.[channel])));
  const cleaned = layers.map(layer => ({ ...layer, params: withoutZoom(layer.params) }));
  const index = target >= 0 ? target : 0;
  cleaned[index] = {
    ...cleaned[index],
    params: [...(cleaned[index].params ?? []), zoomParameter],
  };
  return {
    ...spec,
    params: withoutZoom((spec as unknown as SpecRecord).params),
    layer: cleaned,
  } as T;
};
