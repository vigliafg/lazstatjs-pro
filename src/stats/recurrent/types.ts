export type RecurrentModel = 'ag' | 'wlw';

export interface RecurrentOptions {
  /** Subject identifier, repeated across the rows of the same subject. */
  id: number[];
  start: number[];
  stop: number[];
  event: number[];
  covariates: { name: string; values: number[] }[];
  model: RecurrentModel;
  level?: number;
}

export interface RecurrentCoefficient {
  term: string;
  beta: number;
  /** Cluster-robust standard error. */
  se: number;
  z: number;
  p: number;
  hr: number;
  lo: number;
  hi: number;
}

export interface RecurrentFit {
  n: number;
  subjects: number;
  episodes: number;
  events: number;
  k: number;
  model: RecurrentModel;
  coefficients: RecurrentCoefficient[];
  logLik: number;
  aic: number;
  lr: number;
  lrP: number;
  wald: number;
  waldP: number;
  iterations: number;
  converged: boolean;
  warnings: string[];
}
