import type { AnalysisRunResult } from './types';
import type { GridData } from '../grid/types';
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

export interface AnalysisRunContext {
  grid: GridData;
  params: ProjectParams;
  ciLevel: number;
}

/**
 * Registro dei builder puri (primo passo di `AnalysisSpec`).
 *
 * Le sei analisi legacy sono già funzioni `(dati, parametri) -> risultato`:
 * qui ricevono un contesto unico invece di sei chiamate con firme diverse.
 * `samplesize`, `distfit`, `logistic`, `cox`, `survival`, `timeseries`,
 * `contingency`, `ancova`, `factorial`, `repeatedanova` e `multivariate` sono i
 * pannelli convertiti: parametri nell'App e builder puro, come le analisi
 * legacy. Gli altri 2 restano componenti controllati dal segnale `runSignal`,
 * in attesa di separare i loro parametri dal form.
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
};
