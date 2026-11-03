import type { ProjectParams } from '../io/project';

/** Project-parameter slot owned by each analysis. */
const PARAMS_KEY: Record<string, keyof ProjectParams> = {
  descriptive: 'descVars',
  proportions: 'proportions',
  variances: 'variances',
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
  loglinear: 'loglinear',
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
  pls: 'pls',
  mars: 'mars',
  iv: 'iv',
  panel: 'panel',
  selection: 'selection',
  mediation: 'mediation',
  propensity: 'propensity',
  countreg: 'countreg',
  agreement: 'agreement',
  tost: 'tost',
  wizard: 'wizard',
  partition: 'partition',
  quality: 'quality',
  cluster: 'cluster',
  discriminant: 'discriminant',
  doe: 'doe',
};

export const analysisParamsKey = (analysisId: string): keyof ProjectParams | undefined =>
  PARAMS_KEY[analysisId];

/** Snapshot shape of Descriptive: the summary used `descVars` alone. */
interface DescriptiveSnapshot {
  vars: number[];
  mode: ProjectParams['descMode'];
}

const descriptiveSnapshot = (params: ProjectParams): DescriptiveSnapshot => ({
  vars: params.descVars,
  mode: params.descMode,
});

/** Parameters actually read by an analysis (a slice of the project params). */
export const analysisParamsOf = (
  analysisId: string,
  params: ProjectParams
): unknown => {
  if (analysisId === 'descriptive') return descriptiveSnapshot(params);
  const key = analysisParamsKey(analysisId);
  return key ? params[key] : undefined;
};

/**
 * Re-run/apply target: current project parameters with only the analysis slot
 * replaced by the saved snapshot. Other procedures keep their live settings.
 *
 * A snapshot stored before the Descriptive modes existed is a plain array of
 * column indices; it still applies, and only the variables are restored.
 */
export const withAnalysisParams = (
  params: ProjectParams,
  analysisId: string,
  value: unknown
): ProjectParams => {
  if (analysisId === 'descriptive') {
    if (Array.isArray(value)) return { ...params, descVars: value as number[] };
    const snapshot = value as Partial<DescriptiveSnapshot> | null;
    return {
      ...params,
      descVars: snapshot?.vars ?? params.descVars,
      descMode: snapshot?.mode ?? params.descMode,
    };
  }
  const key = analysisParamsKey(analysisId);
  if (!key) return params;
  return { ...params, [key]: value } as ProjectParams;
};

/** Stable signature used to mark a card stale when its parameters changed. */
export const analysisParamsSignature = (analysisId: string, params: ProjectParams): string => {
  const value = analysisParamsOf(analysisId, params);
  return value === undefined ? '' : JSON.stringify(value);
};
