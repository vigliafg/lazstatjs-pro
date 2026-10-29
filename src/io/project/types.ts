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

export const PROJECT_APP = 'lazstats';
export const PROJECT_VERSION = 2;
export const PROJECT_STORAGE_KEY = 'lazstats.project.v1';
/** Keep autosave comfortably below the ~5 MB localStorage budget. */
export const MAX_AUTOSAVE_CHARS = 4_000_000;

export type ProjectTab = 'data' | 'analysis' | 'settings' | 'help';

export interface TTestParams {
  type: 'ind' | 'dep' | 'one';
  var1: number;
  var2: number;
  mu: number;
  useNonParam: boolean;
  equalVar: boolean;
}

export interface AnovaParams {
  dep: number;
  grp: number;
  posthoc: string;
  useNonParam: boolean;
  kwPosthoc: 'none' | 'bonferroni' | 'holm' | 'fdr';
}

export interface RegParams {
  dep: number;
  indeps: number[];
  useNonParam: boolean;
  robustEstimator: string;
  robustSE: 'none' | 'HC1' | 'HC3';
}

export interface CorrParams {
  vars: number[];
  method: string;
  showSpearman: boolean;
  showKendall: boolean;
}

export interface ChiSqParams {
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
}

/** Parametri del fit delle distribuzioni. */
export interface DistributionFitParams {
  variable: number;
  selected: DistributionName[];
}

/** Parametri della regressione logistica. */
export interface LogisticParams {
  outcome: number;
  predictors: number[];
  cutoff: number;
  penalized: boolean;
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
export interface ContingencyParams {
  rows: string[];
  cols: string[];
  /** Frequenze come stringhe: il calcolo usa parseInt, come il form. */
  values: string[][];
  exact: boolean;
  monteCarlo: boolean;
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
  model: 'descriptives' | 'linear';
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

export interface ProjectParams {
  descVars: number[];
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
  countreg: CountParams;
  agreement: AgreementParams;
  tost: TostParams;
  wizard: WizardParams;
}

export interface ProjectSettings {
  ciLevel: number;
  activeAnalysis: string;
  activeTab: ProjectTab;
  /** Guided hides the advanced form sections; Expert shows everything. */
  uiMode: 'guided' | 'expert';
  /** Interface language. */
  uiLocale: Locale;
  /** Language of the written report of every new run. */
  reportLocale: Locale;
  /** Language of the help book; `auto` follows the interface. */
  helpLocale: HelpLocale;
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
  ttest: { type: 'ind', var1: 0, var2: 1, mu: 0, useNonParam: true, equalVar: true },
  anova: { dep: 0, grp: 2, posthoc: 'holm', useNonParam: true, kwPosthoc: 'bonferroni' },
  reg: { dep: 1, indeps: [0], useNonParam: true, robustEstimator: 'theilsen', robustSE: 'none' },
  corr: { vars: [0, 1], method: 'pearson', showSpearman: true, showKendall: true },
  chisq: {
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
  },
  distfit: {
    variable: 0,
    selected: ['normal', 'lognormal', 'exponential', 'gamma', 'weibull'],
  },
  logistic: {
    outcome: 0,
    predictors: [1],
    cutoff: 0.5,
    penalized: false,
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
    rows: ['Treatment', 'Control'],
    cols: ['Improved', 'Unchanged', 'Worse'],
    values: [
      ['42', '18', '6'],
      ['21', '34', '11'],
    ],
    exact: true,
    monteCarlo: true,
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
};

export const DEFAULT_SETTINGS: ProjectSettings = {
  ciLevel: 95,
  activeAnalysis: 'wizard',
  activeTab: 'data',
  uiMode: 'guided',
  uiLocale: DEFAULT_LOCALE,
  reportLocale: DEFAULT_REPORT_LOCALE,
  helpLocale: 'auto',
};
