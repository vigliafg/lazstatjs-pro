import type { AnalysisRunContext } from '../runners';
import type { AnalysisRunResult } from '../types';
import { buildLmmOutput } from '../lmm/run';
import { buildGeeOutput } from '../gee/run';
import { buildCoxOutput } from '../cox/run';
import { buildStratifiedCoxOutput } from '../stratcox/run';
import { buildTdCoxOutput } from '../tdcox/run';
import { buildParametricOutput } from '../parametric/run';
import { buildTimeSeriesOutput } from '../timeseries/run';
import { buildMiOutput } from '../mi/run';
import { buildResamplingOutput } from '../resampling/run';
import type { HeavyAnalysisId } from './heavyIds';

/**
 * Only the heavy builders are imported by the worker. Keeping this map
 * separate from `analyses/runners.ts` means the worker bundle does not carry
 * the 22 instantaneous procedures.
 */
export const HEAVY_RUNNERS: Record<
  HeavyAnalysisId,
  (context: AnalysisRunContext) => AnalysisRunResult
> = {
  lmm: ({ grid, params, ciLevel }) =>
    buildLmmOutput({ grid, params: params.lmm, ciLevel }),
  gee: ({ grid, params, ciLevel }) =>
    buildGeeOutput({ grid, params: params.gee, ciLevel }),
  cox: ({ grid, params, ciLevel }) =>
    buildCoxOutput({ grid, params: params.cox, ciLevel }),
  stratcox: ({ grid, params, ciLevel }) =>
    buildStratifiedCoxOutput({ grid, params: params.stratcox, ciLevel }),
  tdcox: ({ grid, params, ciLevel }) =>
    buildTdCoxOutput({ grid, params: params.tdcox, ciLevel }),
  parametric: ({ grid, params, ciLevel }) =>
    buildParametricOutput({ grid, params: params.parametric, ciLevel }),
  timeseries: ({ grid, params, ciLevel }) =>
    buildTimeSeriesOutput({ grid, params: params.timeseries, ciLevel }),
  mi: ({ grid, params, ciLevel }) =>
    buildMiOutput({ grid, params: params.mi, ciLevel }),
  resampling: ({ grid, params, ciLevel }) =>
    buildResamplingOutput({ grid, params: params.resampling, ciLevel }),
};
