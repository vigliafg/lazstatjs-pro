export interface CoxCovariate {
  name: string;
  values: number[];
}

export interface CoxOptions {
  time: number[];
  event: number[];
  covariates: CoxCovariate[];
  level?: number;
}

export interface CoxCoefficient {
  term: string;
  beta: number;
  se: number;
  z: number;
  p: number;
  hr: number;
  lo: number;
  hi: number;
}

export interface CoxBaselineRow {
  time: number;
  risk: number;
  events: number;
  hazard: number;
  survival: number;
}

export interface CoxSchoenfeldRow {
  term: string;
  time: number;
  residual: number;
}

export interface CoxPhRow {
  term: string;
  chi2: number;
  df: number;
  p: number;
}

/** One group-level frailty effect. */
export interface FrailtyEffect {
  group: string;
  subjects: number;
  events: number;
  /** Empirical Bayes estimate of the multiplicative frailty. */
  mean: number;
}

/** Shared gamma frailty Cox model. */
export interface FrailtyFit {
  n: number;
  groups: number;
  events: number;
  censored: number;
  k: number;
  coefficients: CoxCoefficient[];
  /** Gamma frailty variance (theta = 0 is no heterogeneity). */
  theta: number;
  /** Approximate standard error of theta. */
  thetaSe: number;
  /** Weighted partial log-likelihood at the final estimates. */
  logLik: number;
  aic: number;
  lr: number;
  lrP: number;
  iterations: number;
  converged: boolean;
  effects: FrailtyEffect[];
  warnings: string[];
}

export interface CoxFit {
  n: number;
  events: number;
  censored: number;
  k: number;
  coefficients: CoxCoefficient[];
  logLik: number;
  logLikNull: number;
  aic: number;
  lr: number;
  lrP: number;
  wald: number;
  waldP: number;
  score: number;
  scoreP: number;
  df: number;
  concordance: number;
  iterations: number;
  converged: boolean;
  separation: boolean;
  baseline: CoxBaselineRow[];
  schoenfeld: CoxSchoenfeldRow[];
  ph: CoxPhRow[];
  phGlobal: { chi2: number; df: number; p: number };
  warnings: string[];
}
