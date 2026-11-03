export interface CompetingCovariate {
  name: string;
  values: number[];
}

export interface CompetingOptions {
  time: number[];
  /** 0 = censored, 1..K = cause of the event. */
  event: number[];
  covariates: CompetingCovariate[];
  /** Cause of interest. */
  cause: number;
  level?: number;
}

export interface CompetingCoefficient {
  term: string;
  beta: number;
  se: number;
  z: number;
  p: number;
  hr: number;
  lo: number;
  hi: number;
}

export interface CompetingCifPoint {
  time: number;
  cif: number;
}

export interface CompetingFit {
  n: number;
  events: number;
  censored: number;
  competing: number;
  causes: number;
  cause: number;
  k: number;
  coefficients: CompetingCoefficient[];
  logLik: number;
  aic: number;
  lr: number;
  lrP: number;
  iterations: number;
  converged: boolean;
  /** Cumulative incidence for the mean covariate profile. */
  cif: CompetingCifPoint[];
  /** Cumulative incidence at the last observed time. */
  cifFinal: number;
  warnings: string[];
}
