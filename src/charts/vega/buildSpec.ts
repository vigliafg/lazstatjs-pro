import type { TopLevelSpec } from 'vega-lite';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { applyChartLink, type ChartLink } from '../interaction';
import { applyAxisSettings } from './axis';
import { base, spec } from './encoding';
import { boxLayers } from './boxLayers';
import { dotLayers, ecdfLayers, intervalLayers } from './descriptiveLayers';
import { histogramLayers, qqLayers } from './distributionLayers';
import {
  bubbleLayers,
  circleLayers,
  diamondLayers,
  scatter3dLayers,
  scatterMatrixLayers,
  shadowgramLayers,
} from './objectLayers';
import { mosaicLayers } from './mosaicLayers';
import { matrixLayers } from './missingLayers';
import { riskLayers } from './riskLayers';
import {
  dendrogramLayers,
  paretoLayers,
  surfaceLayers,
  treeLayers,
} from './advancedLayers';
import {
  acfLayers,
  bootstrapLayers,
  barLayers,
  forestLayers,
  heatmapLayers,
  lineLayers,
  powerLayers,
  scatterLayers,
  scatterOnly,
  survivalLayers,
} from './layers';

/** Axes over a range below this print 6+ decimals with the default format. */
const TINY_AXIS_RANGE = 1e-3;

/**
 * Ticks on a tiny domain (random slopes near zero, residuals of a perfect fit)
 * otherwise come out as `0.0000000000003`. Switch those axes to trimmed
 * significant digits, which reads as `3e-13`.
 */
const formatTinyAxes = <T extends TopLevelSpec>(built: T): T => {
  const layers: any[] = Array.isArray((built as any).layer) ? (built as any).layer : [built];
  for (const layer of layers) {
    const values = layer?.data?.values;
    if (!Array.isArray(values) || values.length === 0) continue;
    for (const channel of ['x', 'y'] as const) {
      const encoding = layer.encoding?.[channel];
      const field = encoding?.field;
      if (encoding?.type !== 'quantitative' || typeof field !== 'string') continue;
      // `axis: null` hides the axis on purpose (matrix panels): leave it alone.
      if (encoding.axis === null) continue;
      const ticks = values
        .map((row: any) => row?.[field])
        .filter((value: any): value is number => typeof value === 'number' && Number.isFinite(value));
      if (ticks.length === 0) continue;
      const maxAbs = Math.max(...ticks.map(value => Math.abs(value)));
      if (maxAbs >= TINY_AXIS_RANGE) continue;
      encoding.axis = { ...(encoding.axis ?? {}), format: '.4~g' };
    }
  }
  return built;
};

/**
 * Vega-Lite gives a mark-level `stroke` precedence over the `color` encoding:
 * a line layer with both draws every series in the mark colour, while the
 * legend still lists the series colours. Move the mark colour to `color`,
 * which is only a default — the encoding wins when the layer has series — so
 * single-series lines keep their fixed colour and multi-series lines get one
 * colour per series.
 */
const seriesLineColor = <T extends TopLevelSpec>(built: T): T => {
  const layers: any[] = Array.isArray((built as any).layer) ? (built as any).layer : [built];
  for (const layer of layers) {
    if (layer?.mark?.type !== 'line' || typeof layer.mark.stroke !== 'string') continue;
    if (typeof layer.encoding?.color?.field !== 'string') continue;
    layer.mark = { ...layer.mark, color: layer.mark.stroke };
    delete layer.mark.stroke;
  }
  return built;
};

/** Build the Vega-Lite specification for a semantic chart model. */
export const buildVegaSpec = (
  chart: AnalysisChart,
  options: ChartOptions = chart.options,
  link?: ChartLink
): TopLevelSpec => {
  const build = (): TopLevelSpec => {
    switch (options.kind) {
    case 'scatter':
      return spec(chart, options, scatterLayers(chart, options));
    case 'line':
      return spec(chart, options, lineLayers(chart, options));
    case 'bar':
      return spec(chart, options, barLayers(chart, options));
    case 'box':
      return spec(chart, options, boxLayers(chart, options));
    case 'histogram':
      return spec(chart, options, histogramLayers(chart, options));
    case 'interval':
      return spec(chart, options, intervalLayers(chart, options));
    case 'dot':
      return spec(chart, options, dotLayers(chart, options));
    case 'ecdf':
      return spec(chart, options, ecdfLayers(chart, options));
    case 'qq': {
      const layers = qqLayers(chart, options);
      // The probability axis lives on the main scale; the z-score axis on top
      // needs its own identical scale, hence the independent x resolution.
      const secondScale = options.qqAxis === 'both' && !options.detrended;
      return spec(
        chart,
        options,
        layers,
        secondScale ? { resolve: { scale: { x: 'independent' } } } : {}
      );
    }
    case 'forest':
      return spec(chart, options, forestLayers(chart, options));
    case 'survival':
      return spec(chart, options, survivalLayers(chart, options));
    case 'risk':
      return spec(chart, options, riskLayers(chart, options));
    case 'mosaic':
      return spec(chart, options, mosaicLayers(chart, options));
    case 'acf':
      return spec(chart, options, acfLayers(chart, options));
    case 'heatmap':
      return spec(chart, options, heatmapLayers(chart, options as Extract<ChartOptions, { kind: 'heatmap' }>));
    case 'residual':
    case 'score':
    case 'bland':
      return spec(chart, options, scatterOnly(chart, options));
    case 'scree': {
      const data = options.showKaiser ? chart.data : { ...chart.data, rules: [] };
      const barOptions = {
        ...options,
        kind: 'bar',
        valueLabels: options.showValues,
        error: 'none',
        sort: 'none',
        referenceLine: 'none',
      } as unknown as Extract<ChartOptions, { kind: 'bar' }>;
      return spec(chart, options, barLayers({ ...chart, data }, barOptions));
    }
    case 'power':
      return spec(chart, options, powerLayers(chart, options));
    case 'bootstrap':
      return spec(chart, options, bootstrapLayers(chart, options));
    case 'missingness':
      if (options.display === 'matrix') return spec(chart, options, matrixLayers(chart, options));
      return spec(
        chart,
        options,
        barLayers(chart, {
          ...options,
          kind: 'bar',
          valueLabels: options.showLabels,
          error: 'none',
          sort: 'none',
          referenceLine: 'none',
        } as unknown as Extract<ChartOptions, { kind: 'bar' }>)
      );
    case 'diamond':
      return spec(chart, options, diamondLayers(chart, options));
    case 'circles':
      return spec(chart, options, circleLayers(chart, options));
    case 'shadowgram':
      return spec(chart, options, shadowgramLayers(chart, options));
    case 'scattermatrix':
      return spec(chart, options, scatterMatrixLayers(chart, options));
    case 'bubble':
      return spec(chart, options, bubbleLayers(chart, options));
    case 'scatter3d':
      return spec(chart, options, scatter3dLayers(chart, options));
    case 'tree':
      return spec(chart, options, treeLayers(chart, options));
    case 'pareto':
      return spec(chart, options, paretoLayers(chart, options), {
        resolve: { scale: { y: 'independent' } },
      });
    case 'dendrogram':
      return spec(chart, options, dendrogramLayers(chart, options));
    case 'surface':
      return spec(chart, options, surfaceLayers(chart, options));
    }
  };
  // Axis labels are applied after `formatTinyAxes`, so an explicit format wins
  // over its tiny-domain default; the scale part is order-independent.
  return applyChartLink(
    seriesLineColor(applyAxisSettings(formatTinyAxes(build()), options, chart)),
    chart,
    link
  );
};
