import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { axisChannels, axisScalePatch, type AxisChannel } from '../axisModel';

const layersOf = (spec: unknown): Record<string, any>[] => {
  const layers = (spec as { layer?: unknown } | null)?.layer;
  return Array.isArray(layers) ? (layers as Record<string, any>[]) : [spec as Record<string, any>];
};

/**
 * Apply the per-axis limits and scale type to an already built specification.
 *
 * One pass over the layers instead of a change in every layer builder: the
 * same reason `formatTinyAxes` and `seriesLineColor` post-process the spec.
 * Only quantitative channels of kinds that `axisChannels` allows are touched;
 * nominal axes, hidden axes (`axis: null`) and derived scales stay automatic.
 */
export const applyAxisSettings = <T>(built: T, options: ChartOptions, chart: AnalysisChart): T => {
  const channels = axisChannels(chart.kind);
  if (channels.length === 0) return built;
  for (const layer of layersOf(built)) {
    const encoding = layer?.encoding as Record<string, any> | undefined;
    if (!encoding) continue;
    for (const channel of channels as readonly AxisChannel[]) {
      const channelEncoding = encoding[channel] as Record<string, any> | undefined;
      if (!channelEncoding || channelEncoding.type !== 'quantitative') continue;
      if (channelEncoding.axis === null) continue;
      const patch = axisScalePatch(options, channel);
      if (!patch) continue;
      channelEncoding.scale = { ...(channelEncoding.scale ?? {}), ...patch };
    }
  }
  return built;
};
