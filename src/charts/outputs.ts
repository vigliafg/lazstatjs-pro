import type { AnalysisChart } from '../stats/charts';

/**
 * Optional chart outputs, grouped so the setup panel can keep the report lean.
 * A chart that matches no group is mandatory: the runner always emits it.
 *
 * Dynamic ids (one card per variable, pair or covariate) are matched by a
 * trailing `*`, so a single choice hides the whole family.
 */
export type ChartOutputGroup = 'recommended' | 'diagnostic';

interface OutputGroups {
  recommended: string[];
  diagnostic: string[];
}

export const OUTPUT_GROUPS: Record<string, OutputGroups> = {
  descriptive: {
    recommended: ['desc-interval', 'desc-dot', 'desc-ecdf', 'desc-hist-*', 'desc-pair-*'],
    diagnostic: ['desc-spread-level', 'desc-qq-*'],
  },
  distfit: {
    recommended: ['distfit-pp', 'distfit-density', 'distfit-criteria'],
    diagnostic: [],
  },
  ttest: {
    recommended: ['ttest-one-mean', 'ttest-ind-means', 'ttest-dep-mean'],
    diagnostic: ['ttest-one-rank', 'ttest-ind-rank', 'ttest-dep-diff'],
  },
  anova: {
    recommended: ['anova-posthoc-forest'],
    diagnostic: ['anova-residual-fitted', 'anova-residual-qq', 'anova-rank-box'],
  },
  factorial: { recommended: [], diagnostic: [] },
  ancova: {
    recommended: ['ancova-profile'],
    diagnostic: ['ancova-residual-fitted', 'ancova-residual-qq'],
  },
  repeatedanova: {
    recommended: ['repeated-trajectories', 'repeated-change'],
    diagnostic: [],
  },
  mixedanova: { recommended: ['mixed-trajectories'], diagnostic: [] },
  nonparamrm: { recommended: [], diagnostic: ['friedman-posthoc'] },
  tost: { recommended: [], diagnostic: [] },
  regression: {
    recommended: ['reg-observed-fitted'],
    diagnostic: [
      'reg-residual-fitted',
      'reg-scale-location',
      'reg-residual-leverage',
      'reg-cooks',
      'reg-partial-*',
      'reg-residual-box',
      'reg-residual-qq',
    ],
  },
  correlation: {
    recommended: ['corr-rank-scatter', 'corr-box', 'corr-pair-*', 'corr-heatmap'],
    diagnostic: [],
  },
  logistic: {
    recommended: [
      'logistic-roc',
      'logistic-calibration',
      'logistic-confusion',
      'logistic-or-forest',
      'logistic-marginal',
    ],
    diagnostic: [],
  },
  countreg: {
    recommended: ['count-irr-forest', 'count-rootogram'],
    diagnostic: ['count-residual-fitted', 'count-residual-qq', 'count-dispersion'],
  },
  ordinal: {
    recommended: ['ordinal-probability-heatmap', 'ordinal-or-forest', 'ordinal-thresholds'],
    diagnostic: [],
  },
  lmm: {
    recommended: ['lmm-group-means', 'lmm-random-effects'],
    diagnostic: ['lmm-residual-fitted', 'lmm-residual-qq'],
  },
  gee: {
    recommended: ['gee-cluster-means', 'gee-coefficient-forest', 'gee-marginal'],
    diagnostic: ['gee-cluster-residuals', 'gee-residual-qq'],
  },
  multivariate: {
    recommended: [
      'pca-loadings',
      'pca-loading-plot',
      'pca-biplot',
      'efa-loadings',
      'efa-parallel',
      'efa-variance',
      'efa-communalities',
      'alpha-if-deleted',
      'alpha-correlations',
    ],
    diagnostic: [],
  },
  chisquare: { recommended: ['chisq-mosaic'], diagnostic: [] },
  contingency: {
    recommended: ['contingency-mosaic', 'contingency-association', 'contingency-ca'],
    diagnostic: ['contingency-ca-inertia'],
  },
  agreement: {
    recommended: [],
    diagnostic: ['agreement-bland-ci', 'agreement-kappa-ci', 'agreement-icc-ci'],
  },
  survival: { recommended: ['survival-risk', 'survival-rmst'], diagnostic: [] },
  cox: {
    recommended: ['cox-predicted-survival'],
    diagnostic: [
      'cox-baseline-hazard',
      'cox-baseline-survival',
      'cox-schoenfeld-*',
      'cox-martingale',
    ],
  },
  stratcox: {
    recommended: ['stratcox-km', 'stratcox-risk'],
    diagnostic: ['stratcox-baseline'],
  },
  tdcox: { recommended: [], diagnostic: [] },
  parametric: {
    recommended: [
      'parametric-hazard',
      'parametric-cumhazard',
      'parametric-density',
      'parametric-coefficients',
      'parametric-median',
    ],
    diagnostic: ['parametric-qq'],
  },
  timeseries: {
    recommended: [
      'ts-pacf-chart',
      'ts-decomposition-*',
      'ts-model-accuracy',
      'ts-spectrum',
      'ts-rolling',
      'ts-arima-chart',
      'ts-simple-chart',
    ],
    diagnostic: ['ts-residual-acf'],
  },
  mi: {
    recommended: [
      'mi-completed-density',
      'mi-missingness',
      'mi-missingness-matrix',
      'mi-patterns',
      'mi-observed-completed',
      'mi-pooled-forest',
    ],
    diagnostic: ['mi-trace', 'mi-strip'],
  },
  samplesize: {
    recommended: ['samplesize-precision', 'samplesize-sensitivity'],
    diagnostic: [],
  },
  resampling: {
    recommended: ['resampling-permutation'],
    diagnostic: ['resampling-bootstrap-qq'],
  },
  wizard: { recommended: [], diagnostic: [] },
};

const matches = (chartId: string, patterns: string[]): boolean =>
  patterns.some(pattern =>
    pattern.endsWith('*') ? chartId.startsWith(pattern.slice(0, -1)) : chartId === pattern
  );

export const outputGroupOf = (
  analysisId: string,
  chartId: string
): ChartOutputGroup | null => {
  const groups = OUTPUT_GROUPS[analysisId];
  if (!groups) return null;
  if (matches(chartId, groups.recommended)) return 'recommended';
  if (matches(chartId, groups.diagnostic)) return 'diagnostic';
  return null;
};

/** Groups that actually contain at least one chart for this procedure. */
export const outputGroupsFor = (analysisId: string): ChartOutputGroup[] => {
  const groups = OUTPUT_GROUPS[analysisId];
  if (!groups) return [];
  return [
    ...(groups.recommended.length > 0 ? (['recommended'] as const) : []),
    ...(groups.diagnostic.length > 0 ? (['diagnostic'] as const) : []),
  ];
};

export const filterChartsByGroups = (
  analysisId: string,
  charts: AnalysisChart[] | undefined,
  hidden: ChartOutputGroup[] | undefined
): AnalysisChart[] | undefined => {
  if (!charts || !hidden || hidden.length === 0) return charts;
  return charts.filter(chart => {
    const group = outputGroupOf(analysisId, chart.id);
    return !group || !hidden.includes(group);
  });
};

export const countChartsByGroups = (
  analysisId: string,
  charts: AnalysisChart[] | undefined,
  hidden: ChartOutputGroup[]
): number => filterChartsByGroups(analysisId, charts, hidden)?.length ?? 0;
