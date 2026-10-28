export interface MixedAnovaOptions {
  rows: readonly (readonly string[])[];
  groupIdx: number;
  conditionIdxs: number[];
  level: number;
}

export interface MixedAnovaEffect {
  source: string;
  ss: number;
  df: number;
  ms: number;
  f: number;
  p: number;
  eta2: number;
}

export interface MixedAnovaStats {
  n: number;
  groups: string[];
  conditions: number[];
  groupSizes: number[];
  groupMeans: number[];
  conditionMeans: number[];
  cellMeans: number[][];
  effects: MixedAnovaEffect[];
}
