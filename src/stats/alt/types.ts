export type AltModel = 'arrhenius' | 'inversePower' | 'exponential';

export interface AltOptions {
  time: number[];
  event: number[];
  stress: number[];
  covariates: { name: string; values: number[] }[];
  model: AltModel;
  useStress: number;
  level?: number;
}

export interface AltCoefficient {
  term: string;
  beta: number;
  se: number;
  z: number;
  p: number;
  timeRatio: number;
  lo: number;
  hi: number;
}

export interface AltFit {
  n: number;
  events: number;
  k: number;
  model: AltModel;
  transformedName: string;
  mu: number;
  sigma: number;
  logLik: number;
  aic: number;
  coefficients: AltCoefficient[];
  /** Time ratio at the use stress relative to the lowest observed stress. */
  accelerationFactor: number;
  useStress: number;
  referenceStress: number;
  warnings: string[];
}
