/** Test performed on the contingency table. Mirrors the persisted parameter. */
export type ContingencyTestMode = 'chi2' | 'mantelHaenszel' | 'trend' | 'exact';

/** One 2×2 stratum used by the Mantel–Haenszel test. */
export interface ContingencyStratumInput {
  label: string;
  observed: number[][];
}

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
  /** Analysis mode; absent means the historical Pearson chi-square path. */
  mode?: ContingencyTestMode;
  /** Strata used by the Mantel–Haenszel mode. */
  strata?: ContingencyStratumInput[];
  /** Row scores used by the Cochran–Armitage trend mode. */
  scores?: number[];
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

/** Per-stratum result of the Mantel–Haenszel test. */
export interface MantelHaenszelStratumResult {
  label: string;
  a: number;
  b: number;
  c: number;
  d: number;
  n: number;
  oddsRatio: number;
  logOddsRatio: number;
  standardError: number;
  lo: number;
  hi: number;
  /** Mantel–Haenszel denominator weight b·c/n. */
  weight: number;
  /** True when 0.5 was added to every cell because one cell was zero. */
  corrected: boolean;
}

export interface MantelHaenszelResult {
  oddsRatio: number;
  logOddsRatio: number;
  standardError: number;
  lo: number;
  hi: number;
  chi2: number;
  df: number;
  p: number;
  strata: MantelHaenszelStratumResult[];
  /** Strata with a positive total that entered the estimate. */
  usedStrata: number;
  /** True when at least one stratum received the zero-cell correction. */
  corrected: boolean;
}

export interface TrendRowResult {
  successes: number;
  total: number;
  proportion: number;
}

export interface TrendResult {
  statistic: number;
  df: number;
  p: number;
  overall: number;
  scores: number[];
  rows: TrendRowResult[];
}

export type ExactMethod = 'fisher' | 'enumeration' | 'monteCarlo' | 'unavailable';

export interface ExactContingencyResult {
  method: ExactMethod;
  statistic: number;
  df: number;
  p: number;
  /** Number of tables enumerated in exact mode. */
  tables?: number;
  /** Number of simulated tables in Monte Carlo mode. */
  simulations?: number;
  /** Explicit reason when the exact p-value cannot be computed. */
  reason?: string;
}
