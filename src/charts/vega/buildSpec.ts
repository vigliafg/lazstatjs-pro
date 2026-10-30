import type { TopLevelSpec } from 'vega-lite';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { base, spec } from './encoding';
import { boxLayers } from './boxLayers';
import { dotLayers, ecdfLayers, intervalLayers } from './descriptiveLayers';
import { histogramLayers, qqLayers } from './distributionLayers';
import { mosaicLayers } from './mosaicLayers';
import { riskLayers } from './riskLayers';
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
export const buildVegaSpec = (chart: AnalysisChart, options: ChartOptions = chart.options): TopLevelSpec => {
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
    case 'qq':
      return spec(chart, options, qqLayers(chart, options));
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
  }
};
