import type { AnalysisRunResult } from './types';
import type { Dataset } from '../grid/types';
import type { ProjectParams } from '../io/project';
import { buildDescriptiveOutput } from './descriptive/run';
import { buildProportionsOutput } from './proportions/run';
import { buildVariancesOutput } from './variances/run';
import { buildTTestOutput } from './ttest/run';
import { buildAnovaOutput } from './anova/run';
import { buildRegressionOutput } from './regression/run';
import { buildGlmOutput } from './glm/run';
import { buildQuantileOutput } from './quantile/run';
import { buildNonlinearOutput } from './nonlinear/run';
import { buildMultinomialOutput } from './multinomial/run';
import { buildGlmmOutput } from './glmm/run';
import { buildPlsOutput } from './pls/run';
import { buildMarsOutput } from './mars/run';
import { buildIvOutput } from './iv/run';
import { buildPanelOutput } from './panel/run';
import { buildSelectionOutput } from './selection/run';
import { buildMediationOutput } from './mediation/run';
import { buildPropensityOutput } from './propensity/run';
import { buildCorrelationOutput } from './correlation/run';
import { buildChiSquareOutput } from './chisquare/run';
import { buildSampleSizeOutput } from './samplesize/run';
import { buildDistributionFitOutput } from './distfit/run';
import { buildLogisticOutput } from './logistic/run';
import { buildCoxOutput } from './cox/run';
import { buildSurvivalOutput } from './survival/run';
import { buildTimeSeriesOutput } from './timeseries/run';
import { buildContingencyOutput } from './contingency/run';
import { buildLoglinearOutput } from './loglinear/run';
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
import { buildGeeOutput } from './gee/run';
import { buildStratifiedCoxOutput } from './stratcox/run';
import { buildTdCoxOutput } from './tdcox/run';
import { buildPartitionOutput } from './partition/run';
import { buildQualityOutput } from './quality/run';
import { buildClusterOutput } from './cluster/run';
import { buildCanonicalOutput } from './canonical/run';
import { buildMdsOutput } from './mds/run';
import { buildCorrespondenceOutput } from './correspondence/run';
import { buildSemOutput } from './sem/run';
import { buildLatentClassOutput } from './latentclass/run';
import { buildIrtOutput } from './irt/run';
import { buildConjointOutput } from './conjoint/run';
import { buildDiscriminantOutput } from './discriminant/run';
import { buildDoeOutput } from './doe/run';
import { buildCompetingOutput } from './competing/run';
import { buildRecurrentOutput } from './recurrent/run';
import { buildAltOutput } from './alt/run';
import { buildReliabilityOutput } from './reliability/run';

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
      mode: params.descMode,
    }),
  variances: ({ grid, params, ciLevel }) =>
    buildVariancesOutput({ grid, params: params.variances, ciLevel }),
  proportions: ({ grid, params, ciLevel }) =>
    buildProportionsOutput({ grid, params: params.proportions, ciLevel }),
  ttest: ({ grid, params, ciLevel }) =>
    buildTTestOutput({ grid, ttestParams: params.ttest, ciLevel }),
  anova: ({ grid, params, ciLevel }) =>
    buildAnovaOutput({ grid, anovaParams: params.anova, ciLevel }),
  regression: ({ grid, params, ciLevel }) =>
    buildRegressionOutput({ grid, regParams: params.reg, ciLevel }),
  glm: ({ grid, params, ciLevel }) =>
    buildGlmOutput({ grid, params: params.glm, ciLevel }),
  quantile: ({ grid, params }) =>
    buildQuantileOutput({ grid, params: params.quantile }),
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
  iv: ({ grid, params, ciLevel }) =>
    buildIvOutput({ grid, params: params.iv, ciLevel }),
  panel: ({ grid, params, ciLevel }) =>
    buildPanelOutput({ grid, params: params.panel, ciLevel }),
  selection: ({ grid, params, ciLevel }) =>
    buildSelectionOutput({ grid, params: params.selection, ciLevel }),
  mediation: ({ grid, params, ciLevel }) =>
    buildMediationOutput({ grid, params: params.mediation, ciLevel }),
  propensity: ({ grid, params, ciLevel }) =>
    buildPropensityOutput({ grid, params: params.propensity, ciLevel }),
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
  loglinear: ({ params, ciLevel }) =>
    buildLoglinearOutput({ params: params.loglinear, ciLevel }),
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
  gee: ({ grid, params, ciLevel }) =>
    buildGeeOutput({ grid, params: params.gee, ciLevel }),
  stratcox: ({ grid, params, ciLevel }) =>
    buildStratifiedCoxOutput({ grid, params: params.stratcox, ciLevel }),
  tdcox: ({ grid, params, ciLevel }) =>
    buildTdCoxOutput({ grid, params: params.tdcox, ciLevel }),
  partition: ({ grid, params, ciLevel }) =>
    buildPartitionOutput({ grid, params: params.partition, ciLevel }),
  quality: ({ grid, params, ciLevel }) =>
    buildQualityOutput({ grid, params: params.quality, ciLevel }),
  cluster: ({ grid, params, ciLevel }) =>
    buildClusterOutput({ grid, params: params.cluster, ciLevel }),
  canonical: ({ grid, params }) =>
    buildCanonicalOutput({ grid, params: params.canonical }),
  mds: ({ grid, params }) => buildMdsOutput({ grid, params: params.mds }),
  correspondence: ({ params }) =>
    buildCorrespondenceOutput({ params: params.correspondence }),
  sem: ({ grid, params }) => buildSemOutput({ grid, params: params.sem }),
  latentclass: ({ grid, params }) =>
    buildLatentClassOutput({ grid, params: params.latentclass }),
  irt: ({ grid, params }) => buildIrtOutput({ grid, params: params.irt }),
  conjoint: ({ grid, params }) =>
    buildConjointOutput({ grid, params: params.conjoint }),
  discriminant: ({ grid, params, ciLevel }) =>
    buildDiscriminantOutput({ grid, params: params.discriminant, ciLevel }),
  doe: ({ grid, params, ciLevel }) =>
    buildDoeOutput({ grid, params: params.doe, ciLevel }),
  competing: ({ grid, params, ciLevel }) =>
    buildCompetingOutput({ grid, params: params.competing, ciLevel }),
  recurrent: ({ grid, params, ciLevel }) =>
    buildRecurrentOutput({ grid, params: params.recurrent, ciLevel }),
  alt: ({ grid, params, ciLevel }) => buildAltOutput({ grid, params: params.alt, ciLevel }),
  reliability: ({ grid, params, ciLevel }) =>
    buildReliabilityOutput({ grid, params: params.reliability, ciLevel }),
};
