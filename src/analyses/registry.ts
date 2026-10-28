/**
 * Single registry for every analysis.
 *
 * It is the source of truth for ids, labels, navigation metadata and the
 * search index used by the analysis library. Adding an analysis means adding
 * one entry here, its form and its runner: no duplicated lists in JSX.
 */

export type AnalysisFamilyId =
  | 'guided'
  | 'descriptive'
  | 'compare'
  | 'regression'
  | 'multivariate'
  | 'categorical'
  | 'survival'
  | 'timeseries'
  | 'missing'
  | 'design';

export interface AnalysisFamily {
  id: AnalysisFamilyId;
  label: string;
  description: string;
}

export interface AnalysisMeta {
  id: string;
  label: string;
  family: AnalysisFamilyId;
  description: string;
  keywords: readonly string[];
  /** `heavy` procedures are better run explicitly, never on every keystroke. */
  cost: 'instant' | 'heavy';
}

export const ANALYSIS_FAMILIES: readonly AnalysisFamily[] = [
  { id: 'guided', label: 'Guided', description: 'Start from the question' },
  { id: 'descriptive', label: 'Descriptive', description: 'Summaries and distributions' },
  { id: 'compare', label: 'Compare groups', description: 'Differences between groups and measurements' },
  { id: 'regression', label: 'Regression', description: 'Relationships, outcomes and models' },
  { id: 'multivariate', label: 'Multivariate', description: 'Several variables at once' },
  { id: 'categorical', label: 'Categorical', description: 'Tables, association and agreement' },
  { id: 'survival', label: 'Survival', description: 'Time to an event' },
  { id: 'timeseries', label: 'Time series', description: 'Trend, seasonality and forecasts' },
  { id: 'missing', label: 'Missing data', description: 'Imputation and pooling' },
  { id: 'design', label: 'Design & power', description: 'Sample size, power and resampling' },
];

const ANALYSIS_DEFINITIONS = [
  {
    id: 'wizard',
    label: 'Wizard',
    family: 'guided',
    description: 'Start from your goal and let the data shape suggest the right procedure.',
    keywords: ['guide', 'choose', 'recommend', 'goal', 'help me'],
    cost: 'instant',
  },
  {
    id: 'descriptive',
    label: 'Descriptive',
    family: 'descriptive',
    description: 'Means, spread, quantiles and per-variable summaries.',
    keywords: ['summary', 'mean', 'median', 'sd', 'skewness', 'kurtosis'],
    cost: 'instant',
  },
  {
    id: 'distfit',
    label: 'Distribution Fit',
    family: 'descriptive',
    description: 'Compare an observed distribution with theoretical families.',
    keywords: ['normal', 'weibull', 'gamma', 'fit', 'ks', 'anderson'],
    cost: 'instant',
  },
  {
    id: 'ttest',
    label: 'T-Test',
    family: 'compare',
    description: 'Compare two means or paired measurements.',
    keywords: ['mean', 'paired', 'independent', 'wilcoxon', 'sign test'],
    cost: 'instant',
  },
  {
    id: 'anova',
    label: 'ANOVA',
    family: 'compare',
    description: 'Compare means across groups with post-hoc tests.',
    keywords: ['mean', 'groups', 'tukey', 'bonferroni', 'kruskal', 'post hoc'],
    cost: 'instant',
  },
  {
    id: 'factorial',
    label: 'Factorial ANOVA',
    family: 'compare',
    description: 'Two between-subject factors and their interaction.',
    keywords: ['two way', 'interaction', 'factors', 'between'],
    cost: 'instant',
  },
  {
    id: 'ancova',
    label: 'ANCOVA',
    family: 'compare',
    description: 'Compare groups while adjusting for continuous covariates.',
    keywords: ['covariate', 'adjusted means', 'between'],
    cost: 'instant',
  },
  {
    id: 'repeatedanova',
    label: 'Repeated ANOVA',
    family: 'compare',
    description: 'Repeated measurements on the same subjects.',
    keywords: ['within', 'repeated measures', 'sphericity'],
    cost: 'instant',
  },
  {
    id: 'mixedanova',
    label: 'Mixed ANOVA',
    family: 'compare',
    description: 'One between-subject factor and within-subject conditions.',
    keywords: ['split plot', 'between', 'within', 'emmeans', 'sphericity'],
    cost: 'instant',
  },
  {
    id: 'nonparamrm',
    label: 'Non-parametric RM',
    family: 'compare',
    description: 'Friedman, McNemar, Cochran Q and Jonckheere.',
    keywords: ['friedman', 'mcnemar', 'cochran', 'jonckheere', 'rank', 'nonparametric'],
    cost: 'instant',
  },
  {
    id: 'tost',
    label: 'Equivalence (TOST)',
    family: 'compare',
    description: 'Test equivalence or non-inferiority with TOST.',
    keywords: ['equivalence', 'non inferiority', 'margin', 'two one sided'],
    cost: 'instant',
  },
  {
    id: 'regression',
    label: 'Regression',
    family: 'regression',
    description: 'Ordinary least squares with robust options.',
    keywords: ['ols', 'linear', 'predictors', 'hc1', 'hc3', 'robust'],
    cost: 'instant',
  },
  {
    id: 'correlation',
    label: 'Correlation',
    family: 'regression',
    description: 'Pearson, Spearman and Kendall associations between variables.',
    keywords: ['pearson', 'spearman', 'kendall', 'association', 'scatter'],
    cost: 'instant',
  },
  {
    id: 'logistic',
    label: 'Logistic Regression',
    family: 'regression',
    description: 'Binary outcome with odds ratios and cutoff analysis.',
    keywords: ['binary', 'odds ratio', 'logit', 'classification'],
    cost: 'instant',
  },
  {
    id: 'countreg',
    label: 'Count Regression',
    family: 'regression',
    description: 'Poisson and negative binomial models for counts.',
    keywords: ['poisson', 'negative binomial', 'rate', 'counts'],
    cost: 'instant',
  },
  {
    id: 'ordinal',
    label: 'Ordinal Logistic',
    family: 'regression',
    description: 'Cumulative logit for ordered outcomes.',
    keywords: ['ordinal', 'cumulative logit', 'proportional odds'],
    cost: 'instant',
  },
  {
    id: 'lmm',
    label: 'Mixed Model (LMM)',
    family: 'regression',
    description: 'Linear mixed model with a random intercept.',
    keywords: ['mixed', 'random intercept', 'multilevel', 'icc', 'reml'],
    cost: 'heavy',
  },
  {
    id: 'gee',
    label: 'GEE',
    family: 'regression',
    description: 'Marginal effects with cluster-robust standard errors.',
    keywords: ['generalized estimating equations', 'cluster', 'longitudinal', 'population averaged'],
    cost: 'heavy',
  },
  {
    id: 'multivariate',
    label: 'Multivariate',
    family: 'multivariate',
    description: "PCA, Cronbach's alpha and exploratory factor analysis.",
    keywords: ['pca', 'factor analysis', 'efa', 'alpha', 'reliability', 'dimension reduction'],
    cost: 'instant',
  },
  {
    id: 'chisquare',
    label: 'Chi-Square (χ²)',
    family: 'categorical',
    description: '2×2 association with exact Fisher test.',
    keywords: ['chi square', 'fisher', 'association', '2x2', 'contingency'],
    cost: 'instant',
  },
  {
    id: 'contingency',
    label: 'Contingency (R×C)',
    family: 'categorical',
    description: 'R×C tables with association measures.',
    keywords: ['contingency', 'table', 'cramer', 'association', 'rxc'],
    cost: 'instant',
  },
  {
    id: 'agreement',
    label: 'Agreement',
    family: 'categorical',
    description: 'ICC, Bland–Altman and Cohen’s kappa.',
    keywords: ['icc', 'bland altman', 'kappa', 'reliability', 'agreement'],
    cost: 'instant',
  },
  {
    id: 'survival',
    label: 'Survival (KM)',
    family: 'survival',
    description: 'Kaplan–Meier curves and log-rank tests.',
    keywords: ['kaplan meier', 'log rank', 'survival', 'censoring'],
    cost: 'instant',
  },
  {
    id: 'cox',
    label: 'Cox (PH)',
    family: 'survival',
    description: 'Proportional hazards model and hazard ratios.',
    keywords: ['cox', 'hazard ratio', 'proportional hazards'],
    cost: 'heavy',
  },
  {
    id: 'stratcox',
    label: 'Stratified Cox',
    family: 'survival',
    description: 'Cox model with a separate baseline per stratum.',
    keywords: ['cox', 'strata', 'stratified', 'baseline hazard'],
    cost: 'heavy',
  },
  {
    id: 'tdcox',
    label: 'Time-Dependent Cox',
    family: 'survival',
    description: 'Time-varying covariates in start-stop format.',
    keywords: ['cox', 'time dependent', 'start stop', 'time varying'],
    cost: 'heavy',
  },
  {
    id: 'parametric',
    label: 'Parametric Survival',
    family: 'survival',
    description: 'Weibull and exponential accelerated failure time.',
    keywords: ['weibull', 'exponential', 'aft', 'survival'],
    cost: 'heavy',
  },
  {
    id: 'timeseries',
    label: 'Time Series',
    family: 'timeseries',
    description: 'ARIMA/SARIMA, trend and forecasting.',
    keywords: ['arima', 'sarima', 'forecast', 'seasonality', 'autocorrelation'],
    cost: 'heavy',
  },
  {
    id: 'mi',
    label: 'Missing Data (MI)',
    family: 'missing',
    description: 'Multiple imputation with Rubin pooling.',
    keywords: ['missing', 'imputation', 'mice', 'rubin', 'pooling'],
    cost: 'heavy',
  },
  {
    id: 'samplesize',
    label: 'Sample Size / Power',
    family: 'design',
    description: 'Sample size and power for common designs.',
    keywords: ['power', 'sample size', 'precision', 'design'],
    cost: 'instant',
  },
  {
    id: 'resampling',
    label: 'Resampling',
    family: 'design',
    description: 'Permutation and bootstrap inference.',
    keywords: ['bootstrap', 'permutation', 'randomization', 'confidence interval'],
    cost: 'heavy',
  },
] as const satisfies readonly AnalysisMeta[];

export type AnalysisId = (typeof ANALYSIS_DEFINITIONS)[number]['id'];

export const ANALYSIS_TABS: readonly AnalysisMeta[] = ANALYSIS_DEFINITIONS;

export const ANALYSIS_IDS: readonly string[] = ANALYSIS_TABS.map(tab => tab.id);

/** Human-readable label for an analysis id, with an id fallback. */
export const analysisLabel = (id: string): string =>
  ANALYSIS_TABS.find(tab => tab.id === id)?.label ?? id;

/** Full metadata for an analysis id. */
export const analysisMeta = (id: string): AnalysisMeta | undefined =>
  ANALYSIS_TABS.find(tab => tab.id === id);

/** Family metadata for an analysis id. */
export const familyOf = (id: string): AnalysisFamily | undefined => {
  const meta = analysisMeta(id);
  return meta ? ANALYSIS_FAMILIES.find(family => family.id === meta.family) : undefined;
};

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const normalizeWords = (value: string): string =>
  normalize(value).replace(/[^a-z0-9]+/g, ' ');

/** Relevance of one analysis for one query term (higher is better). */
const termScore = (meta: AnalysisMeta, term: string): number => {
  const family = ANALYSIS_FAMILIES.find(item => item.id === meta.family);
  const label = normalizeWords(meta.label);
  if (label === term) return 100;
  if (label.split(' ').some(word => word === term)) return 80;
  if (label.startsWith(term)) return 60;
  if (label.includes(term)) return 40;
  const keywords = meta.keywords.flatMap(normalizeWords);
  if (keywords.some(word => word === term)) return 25;
  if (normalizeWords(meta.description).includes(term)) return 12;
  if (normalizeWords(family?.label ?? '').includes(term)) return 8;
  return 0;
};

/**
 * Search the library by label, description, keywords and family label.
 * Every whitespace-separated term must match; results are ranked by label
 * exactness, then keyword, then description, preserving registry order for
 * ties (so "cox" still lists Cox, Stratified Cox, Time-Dependent Cox).
 */
export const filterAnalyses = (query: string): AnalysisMeta[] => {
  const terms = normalizeWords(query.trim()).split(' ').filter(Boolean);
  if (terms.length === 0) return [...ANALYSIS_TABS];
  return ANALYSIS_TABS.map((meta, index) => {
    const family = ANALYSIS_FAMILIES.find(item => item.id === meta.family);
    const words = normalizeWords(
      [meta.label, meta.description, family?.label ?? '', ...meta.keywords].join(' ')
    );
    const haystack = ` ${words} `;
    if (!terms.every(term => haystack.includes(` ${term}`))) return null;
    const score = terms.reduce((sum, term) => sum + termScore(meta, term), 0);
    return { meta, index, score };
  })
    .filter((entry): entry is { meta: AnalysisMeta; index: number; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(entry => entry.meta);
};

/** Flat alphabetical index used by the library's A–Z mode. */
export const alphabeticalAnalyses = (analyses: readonly AnalysisMeta[] = ANALYSIS_TABS): AnalysisMeta[] =>
  [...analyses].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));

/** Group a list of analyses by family, preserving the family order. */
export const groupByFamily = (
  analyses: readonly AnalysisMeta[] = ANALYSIS_TABS
): { family: AnalysisFamily; analyses: AnalysisMeta[] }[] =>
  ANALYSIS_FAMILIES.map(family => ({
    family,
    analyses: analyses.filter(meta => meta.family === family.id),
  })).filter(group => group.analyses.length > 0);
