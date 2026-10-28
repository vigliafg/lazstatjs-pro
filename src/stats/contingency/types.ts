export interface ContingencyOptions {
  observed: number[][];
  rowLabels: string[];
  colLabels: string[];
  level: number;
  /** Fisher's exact test, only available for 2x2 tables. */
  exact?: boolean;
  /** Monte Carlo p-value for tables where the Cochran rule fails. */
  monteCarlo?: boolean;
  simulations?: number;
  seed?: number;
}

export interface ContingencyTotals {
  rows: number;
  cols: number;
  df: number;
  n: number;
  chi2: number;
  g2: number;
  p: number;
  minExpected: number;
  lowCells: number;
  cramersV: number;
}
