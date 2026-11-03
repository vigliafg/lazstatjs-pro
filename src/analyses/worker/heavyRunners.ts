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
import { buildQuantileOutput } from '../quantile/run';
import { buildNonlinearOutput } from '../nonlinear/run';
import { buildMultinomialOutput } from '../multinomial/run';
import { buildGlmmOutput } from '../glmm/run';
import { buildPlsOutput } from '../pls/run';
import { buildMarsOutput } from '../mars/run';
import { buildPanelOutput } from '../panel/run';
import { buildSelectionOutput } from '../selection/run';
import { buildMediationOutput } from '../mediation/run';
import { buildPropensityOutput } from '../propensity/run';
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
  quantile: ({ grid, params }) => buildQuantileOutput({ grid, params: params.quantile }),
  nonlinear: ({ grid, params, ciLevel }) =>
    buildNonlinearOutput({ grid, params: params.nonlinear, ciLevel }),
  multinomial: ({ grid, params, ciLevel }) =>
    buildMultinomialOutput({ grid, params: params.multinomial, ciLevel }),
  glmm: ({ grid, params, ciLevel }) =>
    buildGlmmOutput({ grid, params: params.glmm, ciLevel }),
  pls: ({ grid, params, ciLevel }) =>
    buildPlsOutput({ grid, params: params.pls, ciLevel }),
  mars: ({ grid, params, ciLevel }) =>
    buildMarsOutput({ grid, params: params.mars, ciLevel }),
  panel: ({ grid, params, ciLevel }) =>
    buildPanelOutput({ grid, params: params.panel, ciLevel }),
  selection: ({ grid, params, ciLevel }) =>
    buildSelectionOutput({ grid, params: params.selection, ciLevel }),
  mediation: ({ grid, params, ciLevel }) =>
    buildMediationOutput({ grid, params: params.mediation, ciLevel }),
  propensity: ({ grid, params, ciLevel }) =>
    buildPropensityOutput({ grid, params: params.propensity, ciLevel }),
};
