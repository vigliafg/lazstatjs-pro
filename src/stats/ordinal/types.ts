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

export interface OrdinalStats {
  n: number;
  categories: string[];
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
