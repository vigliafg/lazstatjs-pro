export type SurvivalDistribution =
  | 'weibull'
  | 'exponential'
  | 'lognormal'
  | 'loglogistic'
  | 'gompertz';

export interface ParametricSurvivalOptions {
  rows: readonly (readonly string[])[];
  timeIdx: number;
  eventIdx: number;
  indepIdxs: number[];
  /** Upper bound for interval censoring; omitted for right-censored data. */
  upperIdx?: number;
  distribution: SurvivalDistribution;
  level: number;
}

export interface ParametricCoefficient {
  term: string;
  beta: number;
  se: number;
  z: number;
  p: number;
  /** Time ratio for AFT models, hazard ratio for the Gompertz model. */
  timeRatio: number;
  lo: number;
  hi: number;
}

export interface ParametricSurvivalStats {
  distribution: SurvivalDistribution;
  parameterization: 'aft' | 'ph';
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
