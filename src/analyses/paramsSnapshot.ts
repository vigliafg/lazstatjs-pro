import type { ProjectParams } from '../io/project';

/** Project-parameter slot owned by each analysis. */
const PARAMS_KEY: Record<string, keyof ProjectParams> = {
  descriptive: 'descVars',
  ttest: 'ttest',
  anova: 'anova',
  regression: 'reg',
  correlation: 'corr',
  chisquare: 'chisq',
  samplesize: 'samplesize',
  distfit: 'distfit',
  logistic: 'logistic',
  cox: 'cox',
  survival: 'survival',
  timeseries: 'timeseries',
  contingency: 'contingency',
  ancova: 'ancova',
  factorial: 'factorial',
  repeatedanova: 'repeatedanova',
  multivariate: 'multivariate',
  nonparamrm: 'nonparamrm',
  tdcox: 'tdcox',
  stratcox: 'stratcox',
  gee: 'gee',
  resampling: 'resampling',
  parametric: 'parametric',
  mixedanova: 'mixedanova',
  mi: 'mi',
  ordinal: 'ordinal',
  lmm: 'lmm',
  countreg: 'countreg',
  agreement: 'agreement',
  tost: 'tost',
  wizard: 'wizard',
};

export const analysisParamsKey = (analysisId: string): keyof ProjectParams | undefined =>
  PARAMS_KEY[analysisId];

/** Parameters actually read by an analysis (a slice of the project params). */
export const analysisParamsOf = (
  analysisId: string,
  params: ProjectParams
): unknown => {
  const key = analysisParamsKey(analysisId);
  return key ? params[key] : undefined;
};

/**
 * Re-run/apply target: current project parameters with only the analysis slot
 * replaced by the saved snapshot. Other procedures keep their live settings.
 */
export const withAnalysisParams = (
  params: ProjectParams,
  analysisId: string,
  value: unknown
): ProjectParams => {
  const key = analysisParamsKey(analysisId);
  if (!key) return params;
  return { ...params, [key]: value } as ProjectParams;
};

/** Stable signature used to mark a card stale when its parameters changed. */
export const analysisParamsSignature = (analysisId: string, params: ProjectParams): string => {
  const value = analysisParamsOf(analysisId, params);
  return value === undefined ? '' : JSON.stringify(value);
};
