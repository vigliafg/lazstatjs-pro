export type CountFamily = 'poisson' | 'negbin';

export interface CountOptions {
  family: CountFamily;
  rows: readonly (readonly string[])[];
  depIdx: number;
  indepIdxs: number[];
  level: number;
}

export interface CountCoefficient {
  term: string;
  beta: number;
  se: number;
  z: number;
  p: number;
  irr: number;
  irrLo: number;
  irrHi: number;
}

export interface CountStats {
  family: CountFamily;
  n: number;
  k: number;
  df: number;
  theta: number | null;
  deviance: number;
  pearson: number;
  dispersion: number;
  logLik: number;
  logLikNull: number;
  lr: number;
  lrP: number;
  aic: number;
  bic: number;
  nonInteger: number;
  /** Complete-case observed and fitted counts, for the diagnostic charts. */
  observed: number[];
  fitted: number[];
  residuals: number[];
  coefficients: CountCoefficient[];
}
