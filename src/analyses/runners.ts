import type { AnalysisRunResult } from './types';
import type { Dataset } from '../grid/types';
import type { ProjectParams } from '../io/project';
import { buildDescriptiveOutput } from './descriptive/run';
import { buildTTestOutput } from './ttest/run';
import { buildAnovaOutput } from './anova/run';
import { buildRegressionOutput } from './regression/run';
import { buildCorrelationOutput } from './correlation/run';
import { buildChiSquareOutput } from './chisquare/run';
import { buildSampleSizeOutput } from './samplesize/run';
import { buildDistributionFitOutput } from './distfit/run';
import { buildLogisticOutput } from './logistic/run';
import { buildCoxOutput } from './cox/run';
import { buildSurvivalOutput } from './survival/run';
import { buildTimeSeriesOutput } from './timeseries/run';
import { buildContingencyOutput } from './contingency/run';
import { buildAncovaOutput } from './ancova/run';
import { buildFactorialOutput } from './factorial/run';
import { buildRepeatedAnovaOutput } from './repeatedanova/run';
import { buildMultivariateOutput } from './multivariate/run';
import { buildNonParamOutput } from './nonparamrm/run';
import { buildWizardOutput } from './wizard/run';
import { buildTostOutput } from './tost/run';
import { buildAgreementOutput } from './agreement/run';
import { buildCountOutput } from './countreg/run';
import { buildLmmOutput } from './lmm/run';
import { buildOrdinalOutput } from './ordinal/run';
import { buildMiOutput } from './mi/run';
import { buildMixedAnovaOutput } from './mixedanova/run';
import { buildParametricOutput } from './parametric/run';
import { buildResamplingOutput } from './resampling/run';

export interface AnalysisRunContext {
  grid: Dataset;
  params: ProjectParams;
  ciLevel: number;
}

/**
 * Registro dei builder puri (primo passo di `AnalysisSpec`).
 *
 * Le sei analisi legacy sono già funzioni `(dati, parametri) -> risultato`:
 * qui ricevono un contesto unico invece di sei chiamate con firme diverse.
 * Tutte le 19 analisi (6 legacy + 13 pannelli) hanno un builder puro nel
 * registro: parametri nell'App, nessun `forwardRef` e nessun segnale.
 */
export const ANALYSIS_RUNNERS: Record<string, (ctx: AnalysisRunContext) => AnalysisRunResult> = {
  descriptive: ({ grid, params, ciLevel }) =>
    buildDescriptiveOutput({
      rows: grid.rows,
      columnNames: grid.cols.map(col => col.name),
      indices: params.descVars,
      level: ciLevel,
    }),
  ttest: ({ grid, params, ciLevel }) =>
    buildTTestOutput({ grid, ttestParams: params.ttest, ciLevel }),
  anova: ({ grid, params, ciLevel }) =>
    buildAnovaOutput({ grid, anovaParams: params.anova, ciLevel }),
  regression: ({ grid, params, ciLevel }) =>
    buildRegressionOutput({ grid, regParams: params.reg, ciLevel }),
  correlation: ({ grid, params, ciLevel }) =>
    buildCorrelationOutput({ grid, corrParams: params.corr, ciLevel }),
  chisquare: ({ grid, params, ciLevel }) =>
    buildChiSquareOutput({ grid, chisqParams: params.chisq, ciLevel }),
  samplesize: ({ params }) => buildSampleSizeOutput(params.samplesize),
  distfit: ({ grid, params, ciLevel }) =>
    buildDistributionFitOutput({ grid, params: params.distfit, ciLevel }),
  logistic: ({ grid, params, ciLevel }) =>
    buildLogisticOutput({ grid, params: params.logistic, ciLevel }),
  cox: ({ grid, params, ciLevel }) =>
    buildCoxOutput({ grid, params: params.cox, ciLevel }),
  survival: ({ grid, params, ciLevel }) =>
    buildSurvivalOutput({ grid, params: params.survival, ciLevel }),
  timeseries: ({ grid, params, ciLevel }) =>
    buildTimeSeriesOutput({ grid, params: params.timeseries, ciLevel }),
  contingency: ({ params, ciLevel }) =>
    buildContingencyOutput({ params: params.contingency, ciLevel }),
  ancova: ({ grid, params, ciLevel }) =>
    buildAncovaOutput({ grid, params: params.ancova, ciLevel }),
  factorial: ({ grid, params, ciLevel }) =>
    buildFactorialOutput({ grid, params: params.factorial, ciLevel }),
  repeatedanova: ({ grid, params, ciLevel }) =>
    buildRepeatedAnovaOutput({ grid, params: params.repeatedanova, ciLevel }),
  multivariate: ({ grid, params, ciLevel }) =>
    buildMultivariateOutput({ grid, params: params.multivariate, ciLevel }),
  nonparamrm: ({ grid, params, ciLevel }) =>
    buildNonParamOutput({ grid, params: params.nonparamrm, ciLevel }),
  wizard: ({ grid, params, ciLevel }) =>
    buildWizardOutput({ grid, params: params.wizard, ciLevel }),
  tost: ({ grid, params, ciLevel }) =>
    buildTostOutput({ grid, params: params.tost, ciLevel }),
  agreement: ({ grid, params, ciLevel }) =>
    buildAgreementOutput({ grid, params: params.agreement, ciLevel }),
  countreg: ({ grid, params, ciLevel }) =>
    buildCountOutput({ grid, params: params.countreg, ciLevel }),
  lmm: ({ grid, params, ciLevel }) =>
    buildLmmOutput({ grid, params: params.lmm, ciLevel }),
  ordinal: ({ grid, params, ciLevel }) =>
    buildOrdinalOutput({ grid, params: params.ordinal, ciLevel }),
  mi: ({ grid, params, ciLevel }) =>
    buildMiOutput({ grid, params: params.mi, ciLevel }),
  mixedanova: ({ grid, params, ciLevel }) =>
    buildMixedAnovaOutput({ grid, params: params.mixedanova, ciLevel }),
  parametric: ({ grid, params, ciLevel }) =>
    buildParametricOutput({ grid, params: params.parametric, ciLevel }),
  resampling: ({ grid, params, ciLevel }) =>
    buildResamplingOutput({ grid, params: params.resampling, ciLevel }),
};
