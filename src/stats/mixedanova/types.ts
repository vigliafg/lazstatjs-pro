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
  sphericity: {
    w: number;
    chi2: number;
    df: number;
    p: number;
    ggEpsilon: number;
    hfEpsilon: number;
  };
  pGGTime: number;
  pGGInteraction: number;
  contrasts: MixedAnovaContrast[];
}

export interface MixedAnovaContrast {
  source: string;
  a: string;
  b: string;
  diff: number;
  se: number;
  t: number;
  p: number;
  adjusted: number;
  lo: number;
  hi: number;
}
