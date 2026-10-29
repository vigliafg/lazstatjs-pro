export interface MiOptions {
  rows: readonly (readonly string[])[];
  variables: number[];
  imputations: number;
  iterations: number;
  level: number;
  /** 'descriptives' = solo medie/SD; 'linear' = pooled OLS. */
  model?: 'descriptives' | 'linear';
  outcome?: number;
  predictors?: number[];
}

export interface MiVariable {
  name: string;
  observed: number;
  missing: number;
  mean: number;
  sd: number;
  se: number;
  lo: number;
  hi: number;
  df: number;
  fmi: number;
}

export interface MiCoefficient {
  term: string;
  beta: number;
  se: number;
  t: number;
  p: number;
  lo: number;
  hi: number;
  df: number;
  fmi: number;
}

export interface MiRegression {
  n: number;
  r2: number;
  coefficients: MiCoefficient[];
}

export interface MiStats {
  n: number;
  imputations: number;
  iterations: number;
  variables: MiVariable[];
  /** Observed values and values after the last imputation, per variable. */
  observedValues: number[][];
  imputedValues: number[][];
  regression: MiRegression | null;
}
