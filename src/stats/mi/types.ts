export interface MiOptions {
  rows: readonly (readonly string[])[];
  variables: number[];
  imputations: number;
  iterations: number;
  level: number;
  /** 'descriptives' = solo medie/SD; 'linear' = pooled OLS; 'categorical' = MICE categoriale. */
  model?: 'descriptives' | 'linear' | 'categorical';
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

/** Pooled proportion of one observed category after multiple imputation. */
export interface MiCategoryEstimate {
  /** Category code as observed in the data (sorted numerically). */
  category: number;
  /** Rows where the category was observed. */
  observed: number;
  /** Rows assigned to the category in the last completed dataset. */
  completed: number;
  /** Observed count divided by the observed (non-missing) rows. */
  observedProportion: number;
  /** Completed count divided by all rows in the last imputation. */
  completedProportion: number;
  /** Rubin-pooled proportion across imputations. */
  proportion: number;
  /** Mean within-imputation variance of the proportion. */
  within: number;
  /** Between-imputation variance of the proportion. */
  between: number;
  se: number;
  df: number;
  lo: number;
  hi: number;
  fmi: number;
}

/** Categorical summary for one imputed variable. */
export interface MiCategoricalVariable {
  name: string;
  observed: number;
  missing: number;
  /** Observed categories, sorted numerically. */
  categories: number[];
  proportions: MiCategoryEstimate[];
}

export interface MiStats {
  n: number;
  imputations: number;
  iterations: number;
  variables: MiVariable[];
  /** Observed values and values after the last imputation, per variable. */
  observedValues: number[][];
  imputedValues: number[][];
  /** Mean of the completed values at each iteration, averaged over imputations. */
  chainMeans: number[][];
  regression: MiRegression | null;
  /** Present only for the categorical MICE path. */
  categories?: MiCategoricalVariable[];
}
