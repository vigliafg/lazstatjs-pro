export type SurvivalDistribution = 'weibull' | 'exponential';

export interface ParametricSurvivalOptions {
  rows: readonly (readonly string[])[];
  timeIdx: number;
  eventIdx: number;
  indepIdxs: number[];
  distribution: SurvivalDistribution;
  level: number;
}

export interface ParametricCoefficient {
  term: string;
  beta: number;
  se: number;
  z: number;
  p: number;
  timeRatio: number;
  lo: number;
  hi: number;
}

export interface ParametricSurvivalStats {
  distribution: SurvivalDistribution;
  n: number;
  events: number;
  k: number;
  mu: number;
  sigma: number;
  logLik: number;
  aic: number;
  bic: number;
  coefficients: ParametricCoefficient[];
}
