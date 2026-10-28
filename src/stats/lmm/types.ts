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

export interface LmmStats {
  n: number;
  groups: number;
  k: number;
  df: number;
  sigmaU2: number;
  sigmaE2: number;
  icc: number;
  remlLogLik: number;
  lambda: number;
  coefficients: LmmCoefficient[];
}
