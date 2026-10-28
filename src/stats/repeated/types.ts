export interface FriedmanResult {
  n: number;
  k: number;
  chi2: number;
  df: number;
  p: number;
  w: number;
  rankSums: number[];
  meanRanks: number[];
  tieCorrection: number;
}

export interface NemenyiPair {
  a: number;
  b: number;
  diff: number;
  q: number;
  p: number;
  significant: boolean;
}

export interface NemenyiResult {
  se: number;
  qCritical: number;
  criticalDifference: number;
  pairs: NemenyiPair[];
}

export interface McNemarResult {
  a: number;
  b: number;
  c: number;
  d: number;
  n: number;
  exactP: number;
  chi2Yates: number;
  pYates: number;
  oddsRatio: number;
}

export interface CochranResult {
  n: number;
  k: number;
  q: number;
  df: number;
  p: number;
  successes: number[];
  totals: number[];
}

export interface JonckheereResult {
  n: number;
  k: number;
  groupSizes: number[];
  u: number;
  expected: number;
  variance: number;
  z: number;
  p: number;
  effect: number;
}
