import type { TopLevelSpec } from 'vega-lite';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { applyChartLink, type ChartLink } from '../interaction';
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
  return applyChartLink(build(), chart, link);
};
