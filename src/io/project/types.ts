import type { GridData } from '../../grid/types';
import type { IoPreferences } from '../prefs';
import {
  DEFAULT_LOCALE,
  DEFAULT_REPORT_LOCALE,
  type HelpLocale,
  type Locale,
} from '../../i18n/locales';
import type { StoredOutput } from '../outputs';
import type { SampleSizeDesign } from '../../stats/samplesize';
import type { DistributionName } from '../../stats/distfit';
import type { WizardGoal } from '../../stats/wizard';
import type { ChartOutputGroup } from '../../charts/outputs';
import { DEFAULT_CHART_DEFAULTS, type ChartDefaults } from '../../charts/defaults';
import type { ChartPreset } from '../../charts/presets';
import type { UserChartStyle } from '../../charts/styles';
import type { ChartKind } from '../../stats/charts';
import { DEFAULT_THEME_ID } from '../../theme/themes';
import type { CustomTheme } from '../../theme/custom';
import {
  DEFAULT_OUTPUT_APPEARANCE,
  type OutputAppearance,
} from '../../theme/outputAppearance';

export const PROJECT_APP = 'lazstats';
export const PROJECT_VERSION = 3;
export const PROJECT_STORAGE_KEY = 'lazstats.project.v1';
/** Keep autosave comfortably below the ~5 MB localStorage budget. */
export const MAX_AUTOSAVE_CHARS = 4_000_000;

export type ProjectTab = 'data' | 'analysis' | 'settings' | 'help';

export interface TTestParams {
  type: 'ind' | 'dep' | 'one' | 'sign';
  var1: number;
  var2: number;
  mu: number;
  useNonParam: boolean;
  equalVar: boolean;
}

export interface AnovaParams {
  /** One-way ANOVA/Kruskal–Wallis, Mood median, nested ANOVA or ANOM. */
  mode: 'oneway' | 'median' | 'nested' | 'anom';
  dep: number;
  grp: number;
  posthoc: string;
  useNonParam: boolean;
  kwPosthoc: 'none' | 'bonferroni' | 'holm' | 'fdr';
  /** Inner factor for the nested mode; -1 when unused. */
  inner?: number;
  /** Significance level for the ANOM decision lines. */
  alpha?: number;
}

/** Generalized linear model with an explicit family and link. */
export interface GlmParams {
  dep: number;
  indeps: number[];
  family: 'gaussian' | 'binomial' | 'poisson' | 'gamma';
  link: 'identity' | 'log' | 'logit' | 'probit' | 'inverse';
}

/** Quantile regression at a single target quantile. */
export interface QuantileParams {
  dep: number;
  indeps: number[];
  tau: number;
}

export type NonlinearModelType = 'exponential' | 'logistic' | 'gompertz' | 'power' | 'michaelis';

/** Nonlinear least squares with a named growth/decay model. */
export interface NonlinearParams {
  dep: number;
  predictor: number;
  model: NonlinearModelType;
}

/** Multinomial logistic regression for a categorical outcome. */
export interface MultinomialParams {
  outcome: number;
  predictors: number[];
}

export type RegressionMode = 'linear' | 'selection' | 'polynomial' | 'penalized';
export type SelectionDirection = 'forward' | 'backward' | 'both';
export type SelectionCriterion = 'aic' | 'bic' | 'adjR2' | 'r2' | 'cp' | 'p';

export interface RegParams {
  dep: number;
  indeps: number[];
  useNonParam: boolean;
  robustEstimator: string;
  robustSE: 'none' | 'HC1' | 'HC3';
  /** Linear OLS (default), variable selection, polynomial curve or penalized fit. */
  mode?: RegressionMode;
  /** Polynomial degree for the polynomial mode. */
  degree?: number;
  /** Search direction for the selection mode. */
  selectionDirection?: SelectionDirection;
  /** Optimality criterion for the selection mode. */
  selectionCriterion?: SelectionCriterion;
  /** Penalty for the penalized mode. */
  penalty?: 'ridge' | 'lasso' | 'elasticnet';
  /** Penalization strength for the penalized mode (glmnet scale). */
  lambda?: number;
  /** Elastic-net mixing: 0 = ridge, 1 = LASSO. */
  penaltyAlpha?: number;
}

export interface CorrParams {
  vars: number[];
  method: string;
  showSpearman: boolean;
  showKendall: boolean;
}

export type ChiSqMode = 'table' | 'gof';

export interface ChiSqParams {
  mode: ChiSqMode;
  /** Categorical variable for the goodness-of-fit mode. */
  gofVariable: number;
  /** Comma-separated expected proportions; empty means equal shares. */
  gofExpected: string;
  row1col1: number;
  row1col2: number;
  row2col1: number;
  row2col2: number;
  row1Label: string;
  row2Label: string;
  col1Label: string;
  col2Label: string;
  runFisherExact: boolean;
}

/** Parametri del calcolatore di numerosità campionaria. */
export interface SampleSizeParams {
  design: SampleSizeDesign;
  alpha: number;
  power: number;
  /** Differenza da rilevare (medie o differenze appaiate). */
  delta: number;
  sd: number;
  p1: number;
  p2: number;
  r: number;
  groups: number;
  f: number;
  /** Semi-ampiezza dell'intervallo di confidenza (0 = non richiesta). */
  margin: number;
  hazardRatio: number;
  eventRate: number;
  /** Rapporto tra varianze da rilevare (disegno 'variance'). */
  ratio: number;
}

/** Parametri del fit delle distribuzioni. */
export interface DistributionFitParams {
  mode: 'fit' | 'ks';
  variable: number;
  /** Group column for the two-sample KS mode; -1 otherwise. */
  group: number;
  selected: DistributionName[];
}

/** Parametri della regressione logistica. */
export interface LogisticParams {
  outcome: number;
  predictors: number[];
  cutoff: number;
  penalized: boolean;
  /** Link for the binary model: logit (odds) or probit (normal latent scale). */
  link?: 'logit' | 'probit';
}

/** Parametri del modello di Cox. */
export interface CoxParams {
  timeVariable: number;
  eventVariable: number;
  covariates: number[];
}

/** Parametri della sopravvivenza (Kaplan–Meier). */
export interface SurvivalParams {
  timeVariable: number;
  eventVariable: number;
  /** -1 = nessun raggruppamento. */
  groupVariable: number;
}

export type TimeSeriesDifferenceMode = 'auto' | '0' | '1' | '2';
export type TimeSeriesSeasonalDifferenceMode = 'auto' | '0' | '1';

/** Parametri della serie temporale (ARIMA/SARIMA + modelli semplici). */
export interface TimeSeriesParams {
  variable: number;
  period: number;
  horizon: number;
  differenceMode: TimeSeriesDifferenceMode;
  seasonalDifferenceMode: TimeSeriesSeasonalDifferenceMode;
}

/** Parametri della tabella di contingenza R×C. */
export type ContingencyMode = 'chi2' | 'mantelHaenszel' | 'trend' | 'exact';

/** One 2×2 stratum of the Mantel–Haenszel test (counts as strings). */
export interface ContingencyStratum {
  label: string;
  values: string[][];
}

export interface ContingencyParams {
  /** Test performed on the table(s). */
  mode: ContingencyMode;
  rows: string[];
  cols: string[];
  /** Frequenze come stringhe: il calcolo usa parseInt, come il form. */
  values: string[][];
  exact: boolean;
  monteCarlo: boolean;
  /** 2×2 tables used by the Mantel–Haenszel mode. */
  strata: ContingencyStratum[];
  /** Row scores used by the Cochran–Armitage trend mode (default 1..R). */
  scores: string[];
}

/** Poisson log-linear model for a two-way table. */
export type LoglinearModel = 'independence' | 'saturated';

export interface LoglinearParams {
  rows: string[];
  cols: string[];
  /** Frequenze come stringhe, come nella tabella di contingenza. */
  values: string[][];
  model: LoglinearModel;
}

/** Parametri dell'ANCOVA. */
export interface AncovaParams {
  response: number;
  factor: number;
  covariates: number[];
}

/** Parametri dell'ANOVA fattoriale a due fattori. */
export interface FactorialParams {
  response: number;
  factorA: number;
  factorB: number;
  interaction: boolean;
}

/** Parametri dell'ANOVA per misure ripetute. */
export interface RepeatedAnovaParams {
  selected: number[];
}

export type MultivariateMode = 'pca' | 'alpha' | 'efa';

/** Parametri di PCA / Cronbach alpha. */
export interface MultivariateParams {
  mode: MultivariateMode;
  standardize: boolean;
  selected: number[];
  factors: number;
  rotation: 'none' | 'varimax';
}

export type NonParamMode = 'friedman' | 'mcnemar' | 'cochran' | 'jonckheere';

/** Parametri dei test non parametrici per misure ripetute. */
export interface NonParamParams {
  mode: NonParamMode;
  selected: number[];
  left: number;
  right: number;
  outcome: number;
  group: number;
}

/** Parametri del Cox con covariate tempo-dipendenti (start-stop). */
export interface TdCoxParams {
  start: number;
  stop: number;
  event: number;
  covariates: number[];
}

/** Parametri del Cox stratificato. */
export interface StratifiedCoxParams {
  time: number;
  event: number;
  covariates: number[];
  /** -1 = nessuno strato. */
  stratum: number;
}

/** Parametri GEE. */
export interface GeeParams {
  dep: number;
  indeps: number[];
  cluster: number;
  family: 'gaussian' | 'binomial';
  correlation: 'independence' | 'exchangeable';
}

/** Parametri di permutazione/bootstrap a due gruppi. */
export interface ResamplingParams {
  outcome: number;
  group: number;
  statistic: 'mean' | 'median';
  permutations: number;
  bootstrap: number;
}

/** Parametri della sopravvivenza parametrica. */
export interface ParametricSurvivalParams {
  time: number;
  event: number;
  predictors: number[];
  distribution: 'weibull' | 'exponential';
}

/** Parametri dell'ANOVA mista between-within. */
export interface MixedAnovaParams {
  group: number;
  conditions: number[];
}

/** Parametri dell'imputazione multipla. */
export interface MiParams {
  variables: number[];
  imputations: number;
  iterations: number;
  model: 'descriptives' | 'linear' | 'categorical';
  outcome: number;
  predictors: number[];
}

/** Parametri della regressione logistica ordinale. */
export interface OrdinalParams {
  dep: number;
  indeps: number[];
}

/** Parametri del modello lineare misto a intercetta casuale. */
export interface LmmParams {
  dep: number;
  indeps: number[];
  group: number;
  /** Add a random slope for the first fixed predictor (default false). */
  randomSlope?: boolean;
}

/** Generalized linear mixed model with random intercept and optional slope. */
export interface GlmmParams {
  dep: number;
  indeps: number[];
  group: number;
  family: 'gaussian' | 'binomial' | 'poisson';
  link: 'identity' | 'logit' | 'log';
  /** Column used as random slope; -1 keeps a random intercept only. */
  slope: number;
}

/** Partial least squares regression (PLS1). */
export interface PlsParams {
  dep: number;
  indeps: number[];
  /** Number of latent components, 1..p. */
  components: number;
  /** Cross-validation folds; 0 disables the Q² estimate. */
  cvFolds: number;
}

/** Multivariate adaptive regression splines (MARS). */
export interface MarsParams {
  dep: number;
  indeps: number[];
  /** Maximum interaction degree: 1 additive, 2 with two-way products. */
  degree: number;
  /** Maximum number of basis functions, intercept included. */
  maxTerms: number;
  /** GCV penalty per effective parameter (earth's `penalty`). */
  penalty: number;
  prune: boolean;
}

/** Two-stage least squares with excluded instruments. */
export interface IvParams {
  dep: number;
  /** Endogenous regressors instrumented by `instruments`. */
  endog: number[];
  /** Excluded instruments. */
  instruments: number[];
  /** Included exogenous regressors (their own instruments). */
  exog: number[];
  /** HC1 heteroskedasticity-robust standard errors. */
  robust: boolean;
}

/** Panel fixed-effects / random-effects model. */
export interface PanelParams {
  dep: number;
  indeps: number[];
  entity: number;
  time: number;
  model: 'fe' | 're' | 'both';
}

/** Tobit type-I censored regression and Heckman two-step selection. */
export interface SelectionParams {
  mode: 'tobit' | 'heckman';
  dep: number;
  indeps: number[];
  lower: number;
  /** `null` means no upper censoring. */
  upper: number | null;
  /** 0/1 selection indicator (Heckman only). */
  selection: number;
  selectIndeps: number[];
}

/** Baron–Kenny mediation with Sobel/delta and percentile bootstrap. */
export interface MediationParams {
  outcome: number;
  predictor: number;
  mediator: number;
  covariates: number[];
  /** Bootstrap replications; 0 disables the bootstrap interval. */
  bootstrap: number;
  seed: number;
}

/** Propensity-score matching and inverse-probability weighting. */
export interface PropensityParams {
  /** 0/1 treatment indicator. */
  treatment: number;
  outcome: number;
  covariates: number[];
  method: 'nearest' | 'ipw';
  /** Caliper in SD of the logit propensity score; 0 = no caliper. */
  caliper: number;
  /** 1:k nearest-neighbour ratio. */
  ratio: number;
}

/** Parametri della regressione per conteggi. */
export interface CountParams {
  dep: number;
  indeps: number[];
  family: 'poisson' | 'negbin';
}

/** Parametri delle procedure di accordo. */
export interface AgreementParams {
  mode: 'icc' | 'bland' | 'kappa';
  columns: number[];
  weight: 'none' | 'linear' | 'quadratic';
}

/** Parametri del test di equivalenza TOST. */
export interface TostParams {
  design: 'one' | 'paired' | 'ind';
  var1: number;
  var2: number;
  mu: number;
  margin: number;
  equalVar: boolean;
}

/** Parametri del wizard (selezione corrente e raccomandazione). */
export interface WizardParams {
  goal: WizardGoal;
  /** -1 = non selezionata. */
  outcome: number;
  /** -1 = nessun gruppo. */
  group: number;
  /** -1 = nessuna seconda variabile. */
  second: number;
  paired: boolean;
}

/** Parametri dell'albero di regressione (Partition). */
export interface PartitionParams {
  response: number;
  predictors: number[];
  maxDepth: number;
  minSplit: number;
}

export type QualityMode =
  | 'control'
  | 'capability'
  | 'pareto'
  | 'variability'
  | 'tolerance'
  | 'cusum';

/** Parametri della piattaforma qualità. */
export interface QualityParams {
  mode: QualityMode;
  /** Variabile numerica per controllo, capacità, variabilità e tolleranza. */
  variable: number;
  /** Variabile categorica per il Pareto. */
  category: number;
  /** -1 = nessun raggruppamento (variabilità). */
  group: number;
  chart: 'xbar' | 'individuals' | 'ewma';
  subgroup: number;
  lsl: number;
  usl: number;
  target: number;
  /** Quota di popolazione coperta dall’intervallo di tolleranza (0–1). */
  toleranceP: number;
}

export type ClusterMethod = 'average' | 'complete' | 'single' | 'ward';

/** Parametri del clustering gerarchico. */
export interface ClusterParams {
  selected: number[];
  method: ClusterMethod;
  /** Numero di cluster da tagliare; 0 = lascia il dendrogramma intero. */
  clusters: number;
  standardize: boolean;
}

/** Parametri dell'analisi discriminante (con MANOVA a un fattore). */
export interface DiscriminantParams {
  /** Classic discriminant analysis or MANCOVA (predictors are outcomes). */
  mode?: 'classic' | 'mancova';
  group: number;
  predictors: number[];
  /** Continuous covariates for the MANCOVA mode. */
  covariates?: number[];
}

/** Parametri della superficie di risposta (DOE). */
export interface DoeParams {
  response: number;
  factorA: number;
  factorB: number;
  model: 'linear' | 'quadratic';
}

/**
 * Descriptive views: the classic per-variable summary, a frequency tally,
 * outlier tests (Grubbs/Dixon) and the runs test.
 */
export type DescriptiveMode = 'summary' | 'frequency' | 'outliers' | 'runs';

/** One- and two-sample tests for proportions and Poisson rates. */
export type ProportionMode = 'oneProp' | 'twoProp' | 'oneRate' | 'twoRate';

export type VarianceMode = 'one' | 'two';

export interface VarianceParams {
  mode: VarianceMode;
  /** Numeric variable whose variance is tested. */
  variable: number;
  /** Group column for the two-sample modes; -1 for one sample. */
  group: number;
  /** Null variance for the one-sample test. */
  nullVariance: number;
}

export interface ProportionParams {
  mode: ProportionMode;
  /** Binary outcome (proportions) or count column (rates). */
  variable: number;
  /** Group column for the two-sample modes; -1 for one sample. */
  group: number;
  /** Level counted as a success in the proportion modes. */
  successLevel: string;
  /** Null proportion (oneProp) or null rate (oneRate). */
  nullP: number;
  nullRate: number;
  /** Exposure per row for the rate modes (default 1). */
  exposure: number;
}

export const DESCRIPTIVE_MODES: readonly DescriptiveMode[] = [
  'summary',
  'frequency',
  'outliers',
  'runs',
];

export interface ProjectParams {
  descVars: number[];
  /** Which view of the Descriptive procedure the form and runner use. */
  descMode: DescriptiveMode;
  glm: GlmParams;
  quantile: QuantileParams;
  nonlinear: NonlinearParams;
  multinomial: MultinomialParams;
  proportions: ProportionParams;
  variances: VarianceParams;
  ttest: TTestParams;
  anova: AnovaParams;
  reg: RegParams;
  corr: CorrParams;
  chisq: ChiSqParams;
  samplesize: SampleSizeParams;
  distfit: DistributionFitParams;
  logistic: LogisticParams;
  cox: CoxParams;
  survival: SurvivalParams;
  timeseries: TimeSeriesParams;
  contingency: ContingencyParams;
  loglinear: LoglinearParams;
  ancova: AncovaParams;
  factorial: FactorialParams;
  repeatedanova: RepeatedAnovaParams;
  multivariate: MultivariateParams;
  nonparamrm: NonParamParams;
  tdcox: TdCoxParams;
  stratcox: StratifiedCoxParams;
  gee: GeeParams;
  resampling: ResamplingParams;
  parametric: ParametricSurvivalParams;
  mixedanova: MixedAnovaParams;
  mi: MiParams;
  ordinal: OrdinalParams;
  lmm: LmmParams;
  glmm: GlmmParams;
  pls: PlsParams;
  mars: MarsParams;
  iv: IvParams;
  panel: PanelParams;
  selection: SelectionParams;
  mediation: MediationParams;
  propensity: PropensityParams;
  countreg: CountParams;
  agreement: AgreementParams;
  tost: TostParams;
  wizard: WizardParams;
  partition: PartitionParams;
  quality: QualityParams;
  cluster: ClusterParams;
  discriminant: DiscriminantParams;
  doe: DoeParams;
}

export interface ProjectSettings {
  ciLevel: number;
  activeAnalysis: string;
  activeTab: ProjectTab;
  /** Guided hides the advanced form sections; Expert shows everything. */
  uiMode: 'guided' | 'expert';
  /** Active interface theme: a built-in id or a custom theme id. */
  theme: string;
  /** User-created themes saved with this project. */
  customThemes?: CustomTheme[];
  /** Interface language. */
  uiLocale: Locale;
  /** Language of the written report of every new run. */
  reportLocale: Locale;
  /** Language of the help book; `auto` follows the interface. */
  helpLocale: HelpLocale;
  /** Factory defaults for new charts (never applied retroactively). */
  chartDefaults: ChartDefaults;
  /** Named style presets saved with this project; optional for old projects. */
  chartPresets?: ChartPreset[];
  /** Per-kind styles saved by the user in the chart editor. */
  chartStyles?: UserChartStyle[];
  /** Style used by new charts of each kind, unless the procedure overrides it. */
  chartStyleDefaults?: Partial<Record<ChartKind, string>>;
  /** Per-procedure style overrides, keyed by analysis id then chart kind. */
  chartStyleOverrides?: Record<string, Partial<Record<ChartKind, string>>>;
  /** Optional chart groups hidden per procedure; absent means every group. */
  hiddenChartGroups?: Record<string, ChartOutputGroup[]>;
  /** Optional overrides for the output/report window only. */
  outputAppearance: OutputAppearance;
}

export interface ProjectSnapshot {
  app: typeof PROJECT_APP;
  version: number;
  savedAt: string;
  /** Stable identity of the dataset; optional for legacy projects. */
  datasetId?: string;
  /** Grid revision at save time; optional for legacy projects. */
  dataRevision?: number;
  grid: GridData;
  prefs: IoPreferences;
  settings: ProjectSettings;
  params: ProjectParams;
  /** Static snapshots of the output console, oldest first. */
  outputs: StoredOutput[];
}

export interface ProjectInput {
  datasetId?: string;
  dataRevision?: number;
  grid: GridData;
  prefs: IoPreferences;
  settings: ProjectSettings;
  params: ProjectParams;
  outputs?: StoredOutput[];
}

export const DEFAULT_PARAMS: ProjectParams = {
  descVars: [0, 1],
  descMode: 'summary',
  glm: {
    dep: 1,
    indeps: [0],
    family: 'gamma',
    link: 'log',
  },
  quantile: {
    dep: 1,
    indeps: [0],
    tau: 0.5,
  },
  nonlinear: {
    dep: 1,
    predictor: 0,
    model: 'logistic',
  },
  multinomial: {
    outcome: 2,
    predictors: [0, 1],
  },
  variances: {
    mode: 'one',
    variable: 0,
    group: -1,
    nullVariance: 1,
  },
  proportions: {
    mode: 'oneProp',
    variable: 0,
    group: -1,
    successLevel: '',
    nullP: 0.5,
    nullRate: 1,
    exposure: 1,
  },
  ttest: { type: 'ind', var1: 0, var2: 1, mu: 0, useNonParam: true, equalVar: true },
  anova: {
    mode: 'oneway',
    dep: 0,
    grp: 2,
    posthoc: 'holm',
    useNonParam: true,
    kwPosthoc: 'bonferroni',
    inner: -1,
    alpha: 0.05,
  },
  reg: {
    dep: 1,
    indeps: [0],
    useNonParam: true,
    robustEstimator: 'theilsen',
    robustSE: 'none',
    mode: 'linear',
    degree: 2,
    selectionDirection: 'both',
    selectionCriterion: 'bic',
    penalty: 'lasso',
    lambda: 0.1,
    penaltyAlpha: 0.5,
  },
  corr: { vars: [0, 1], method: 'pearson', showSpearman: true, showKendall: true },
  chisq: {
    mode: 'table',
    gofVariable: 0,
    gofExpected: '',
    row1col1: 30,
    row1col2: 20,
    row2col1: 15,
    row2col2: 35,
    row1Label: 'Group A',
    row2Label: 'Group B',
    col1Label: 'Success',
    col2Label: 'Failure',
    runFisherExact: true,
  },
  samplesize: {
    design: 'twoMeans',
    alpha: 0.05,
    power: 0.8,
    delta: 5,
    sd: 10,
    p1: 0.5,
    p2: 0.3,
    r: 0.3,
    groups: 3,
    f: 0.25,
    margin: 0,
    hazardRatio: 0.7,
    eventRate: 0.5,
    ratio: 2,
  },
  distfit: {
    mode: 'fit',
    variable: 0,
    group: -1,
    selected: ['normal', 'lognormal', 'exponential', 'gamma', 'weibull'],
  },
  logistic: {
    outcome: 0,
    predictors: [1],
    cutoff: 0.5,
    penalized: false,
    link: 'logit',
  },
  cox: {
    timeVariable: 0,
    eventVariable: 1,
    covariates: [],
  },
  survival: {
    timeVariable: 0,
    eventVariable: 1,
    groupVariable: -1,
  },
  timeseries: {
    variable: 0,
    period: 0,
    horizon: 12,
    differenceMode: 'auto',
    seasonalDifferenceMode: 'auto',
  },
  contingency: {
    mode: 'chi2',
    rows: ['Treatment', 'Control'],
    cols: ['Improved', 'Unchanged', 'Worse'],
    values: [
      ['42', '18', '6'],
      ['21', '34', '11'],
    ],
    exact: true,
    monteCarlo: true,
    strata: [
      {
        label: 'Stratum 1',
        values: [
          ['12', '20'],
          ['18', '9'],
        ],
      },
      {
        label: 'Stratum 2',
        values: [
          ['7', '15'],
          ['19', '11'],
        ],
      },
    ],
    scores: ['1', '2'],
  },
  loglinear: {
    rows: ['Low', 'Medium', 'High'],
    cols: ['Yes', 'No'],
    values: [
      ['20', '80'],
      ['35', '65'],
      ['50', '50'],
    ],
    model: 'independence',
  },
  ancova: {
    response: 0,
    factor: 1,
    covariates: [],
  },
  factorial: {
    response: 0,
    factorA: 1,
    factorB: 2,
    interaction: false,
  },
  repeatedanova: {
    selected: [0, 1, 2],
  },
  multivariate: {
    mode: 'pca',
    standardize: true,
    selected: [0, 1, 2],
    factors: 0,
    rotation: 'varimax',
  },
  nonparamrm: {
    mode: 'friedman',
    selected: [0, 1, 2],
    left: 0,
    right: 1,
    outcome: 0,
    group: 1,
  },
  tdcox: {
    start: 0,
    stop: 1,
    event: 2,
    covariates: [],
  },
  stratcox: {
    time: 0,
    event: 2,
    covariates: [1],
    stratum: -1,
  },
  gee: {
    dep: 0,
    indeps: [1],
    cluster: 2,
    family: 'gaussian',
    correlation: 'exchangeable',
  },
  resampling: {
    outcome: 0,
    group: 2,
    statistic: 'mean',
    permutations: 2000,
    bootstrap: 2000,
  },
  parametric: {
    time: 0,
    event: 2,
    predictors: [1],
    distribution: 'weibull',
  },
  mixedanova: {
    group: 2,
    conditions: [0, 1],
  },
  mi: {
    variables: [0, 1],
    imputations: 5,
    iterations: 10,
    model: 'descriptives',
    outcome: 0,
    predictors: [1],
  },
  ordinal: {
    dep: 0,
    indeps: [1],
  },
  lmm: {
    dep: 0,
    indeps: [1],
    group: 2,
    randomSlope: false,
  },
  glmm: {
    dep: 0,
    indeps: [1],
    group: 2,
    family: 'gaussian',
    link: 'identity',
    slope: -1,
  },
  pls: {
    dep: 0,
    indeps: [1, 2],
    components: 2,
    cvFolds: 5,
  },
  mars: {
    dep: 0,
    indeps: [1, 2],
    degree: 1,
    maxTerms: 21,
    penalty: 2,
    prune: true,
  },
  iv: {
    dep: 0,
    endog: [1],
    instruments: [2],
    exog: [],
    robust: false,
  },
  panel: {
    dep: 0,
    indeps: [],
    entity: 2,
    time: 1,
    model: 'both',
  },
  selection: {
    mode: 'tobit',
    dep: 0,
    indeps: [1],
    lower: 0,
    upper: null,
    selection: -1,
    selectIndeps: [],
  },
  mediation: {
    outcome: 0,
    predictor: 1,
    mediator: 2,
    covariates: [],
    bootstrap: 1000,
    seed: 20261103,
  },
  propensity: {
    treatment: 0,
    outcome: 1,
    covariates: [2],
    method: 'nearest',
    caliper: 0.2,
    ratio: 1,
  },
  countreg: {
    dep: 0,
    indeps: [1],
    family: 'poisson',
  },
  agreement: {
    mode: 'icc',
    columns: [0, 1],
    weight: 'none',
  },
  tost: {
    design: 'one',
    var1: 0,
    var2: 1,
    mu: 0,
    margin: 1,
    equalVar: true,
  },
  wizard: {
    goal: 'compare',
    outcome: -1,
    group: -1,
    second: -1,
    paired: false,
  },
  partition: {
    response: 0,
    predictors: [1, 2],
    maxDepth: 3,
    minSplit: 10,
  },
  quality: {
    mode: 'control',
    variable: 0,
    category: 1,
    group: -1,
    chart: 'xbar',
    subgroup: 5,
    lsl: 0,
    usl: 10,
    target: 5,
    toleranceP: 0.95,
  },
  cluster: {
    selected: [0, 1],
    method: 'average',
    clusters: 3,
    standardize: true,
  },
  discriminant: {
    mode: 'classic',
    group: 2,
    predictors: [0, 1],
    covariates: [],
  },
  doe: {
    response: 0,
    factorA: 1,
    factorB: 2,
    model: 'quadratic',
  },
};

export const DEFAULT_SETTINGS: ProjectSettings = {
  ciLevel: 95,
  activeAnalysis: 'wizard',
  activeTab: 'data',
  uiMode: 'guided',
  theme: DEFAULT_THEME_ID,
  customThemes: [],
  uiLocale: DEFAULT_LOCALE,
  reportLocale: DEFAULT_REPORT_LOCALE,
  helpLocale: 'auto',
  chartDefaults: DEFAULT_CHART_DEFAULTS,
  chartPresets: [],
  chartStyles: [],
  chartStyleDefaults: {},
  chartStyleOverrides: {},
  hiddenChartGroups: {},
  outputAppearance: DEFAULT_OUTPUT_APPEARANCE,
};
