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

export interface CoxPhRow {
  term: string;
  chi2: number;
  df: number;
  p: number;
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
  ph: CoxPhRow[];
  phGlobal: { chi2: number; df: number; p: number };
  warnings: string[];
}
