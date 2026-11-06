export interface LmmOptions {
  rows: readonly (readonly string[])[];
  depIdx: number;
  indepIdxs: number[];
  groupIdx: number;
  level: number;
}

export interface LmmCoefficient {
  term: string;
  beta: number;
  se: number;
  t: number;
  p: number;
  lo: number;
  hi: number;
}

/** Variance component with its standard error and likelihood-profile interval. */
export interface LmmVarianceComponent {
  component: 'intercept' | 'residual';
  estimate: number;
  se: number;
  lo: number;
  hi: number;
}

export interface LmmStats {
  varianceComponents: LmmVarianceComponent[];
  n: number;
  groups: number;
  groupLabels: string[];
  groupMeans: number[];
  /** Best linear unbiased predictors of the random intercepts. */
  randomEffects: number[];
  randomEffectsSe: number[];
  observed: number[];
  fitted: number[];
  residuals: number[];
  k: number;
  df: number;
  sigmaU2: number;
  sigmaE2: number;
  icc: number;
  remlLogLik: number;
  lambda: number;
  coefficients: LmmCoefficient[];
}
