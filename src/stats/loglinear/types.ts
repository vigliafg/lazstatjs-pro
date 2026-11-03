/** Two-way log-linear specifications.
 *
 * Structurally identical to the public `LoglinearModel` in
 * `src/io/project/types.ts`; duplicated here so the statistics layer never
 * imports from `io/` (see .dependency-cruiser.cjs).
 */
export type LoglinearModel = 'independence' | 'saturated';

/** Observed two-way table and the log-linear model to estimate. */
export interface LoglinearOptions {
  /** Counts, one row per row category. */
  observed: number[][];
  rowLabels: string[];
  colLabels: string[];
  model: LoglinearModel;
  /** Confidence level in percent (90, 95, 99). */
  level: number;
}

/** One estimated log-linear parameter. */
export interface LoglinearCoefficient {
  /** Model term in the treatment-coding parameterisation. */
  term: string;
  beta: number;
  se: number;
  z: number;
  p: number;
  /** Multiplicative effect on the expected count, exp(beta). */
  expBeta: number;
  /** Confidence bounds on the log scale. */
  lo: number;
  hi: number;
  /** Confidence bounds on the multiplicative scale. */
  expLo: number;
  expHi: number;
}

/** One cell of the fitted table. */
export interface LoglinearCell {
  row: string;
  col: string;
  rowIndex: number;
  colIndex: number;
  observed: number;
  expected: number;
  /** (O − E) / √E. */
  residual: number;
  /** Contribution of the cell to G²: 2·O·log(O/E). */
  contribution: number;
}

/** Odds ratio for a 2×2 saturated model (exp of the interaction). */
export interface LoglinearOddsRatio {
  oddsRatio: number;
  lo: number;
  hi: number;
}

export interface LoglinearStats {
  model: LoglinearModel;
  rows: number;
  cols: number;
  /** Total number of observations (sum of the table). */
  n: number;
  /** Number of cells, i.e. residual degrees of freedom + parameters. */
  cells: number;
  coefficients: LoglinearCoefficient[];
  /** Likelihood-ratio statistic G² = 2 Σ O log(O/E). */
  deviance: number;
  dfResidual: number;
  p: number;
  /** Deviance of the intercept-only (all cells equal) model. */
  nullDeviance: number;
  dfNull: number;
  logLik: number;
  aic: number;
  expected: number[][];
  /** (O − E) / √E, row-major. */
  standardized: number[][];
  cellsTable: LoglinearCell[];
  oddsRatio?: LoglinearOddsRatio;
}
