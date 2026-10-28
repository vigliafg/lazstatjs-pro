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
