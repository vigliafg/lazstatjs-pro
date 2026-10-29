export interface OrdinalOptions {
  rows: readonly (readonly string[])[];
  depIdx: number;
  indepIdxs: number[];
  level: number;
}

export interface OrdinalCoefficient {
  term: string;
  beta: number;
  se: number;
  z: number;
  p: number;
  or: number;
  lo: number;
  hi: number;
}

export interface OrdinalThreshold {
  index: number;
  alpha: number;
  se: number;
  lo: number;
  hi: number;
}

export interface OrdinalProfilePoint {
  x: number;
  /** Probability of each category at this predictor value (0–1). */
  probabilities: number[];
}

export interface OrdinalStats {
  n: number;
  categories: string[];
  /** 40-point profile of the first predictor, other predictors at their mean. */
  profile: OrdinalProfilePoint[];
  k: number;
  logLik: number;
  logLikNull: number;
  lr: number;
  lrP: number;
  aic: number;
  bic: number;
  mcfadden: number;
  coefficients: OrdinalCoefficient[];
  thresholds: OrdinalThreshold[];
}
