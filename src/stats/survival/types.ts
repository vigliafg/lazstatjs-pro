/**
 * Survival analysis: Kaplan-Meier curves with Greenwood log-log confidence
 * intervals, median survival, restricted mean survival time, life tables and
 * the log-rank test for two or more groups.
 */

export interface KMPoint {
  time: number;
  nRisk: number;
  events: number;
  censored: number;
  survival: number;
  lo: number;
  hi: number;
}

export interface KMResult {
  points: KMPoint[];
  median: number;
  medianLo: number;
  medianHi: number;
  rmst: number;
  maxTime: number;
  n: number;
  events: number;
  censored: number;
}

export interface SurvivalGroup {
  name: string;
  time: number[];
  event: number[];
}

/** One interval of an actuarial life table. */
export interface LifeTableRow {
  start: number;
  end: number;
  atRisk: number;
  events: number;
  censored: number;
  /** People effectively exposed in the interval (censoring removed at half weight). */
  effective: number;
  /** Conditional probability of the event inside the interval. */
  q: number;
  /** Conditional probability of surviving the interval. */
  p: number;
  survival: number;
  /** Greenwood standard error of the cumulative survival. */
  se: number;
}

/** One point of the Turnbull non-parametric maximum-likelihood estimate. */
export interface TurnbullPoint {
  time: number;
  survival: number;
  /** Probability mass assigned to the Turnbull interval ending at `time`. */
  mass: number;
}

export interface TurnbullResult {
  points: TurnbullPoint[];
  n: number;
  iterations: number;
  converged: boolean;
}

/** One interval of a Turnbull estimate, in the original (lower, upper] scale. */
export interface TurnbullInterval {
  lower: number;
  upper: number;
  /** Filled by the estimator; input intervals do not need it. */
  mass?: number;
}

