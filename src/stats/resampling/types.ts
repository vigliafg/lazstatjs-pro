export interface ResamplingOptions {
  rows: readonly (readonly string[])[];
  outcomeIdx: number;
  groupIdx: number;
  statistic: 'mean' | 'median';
  permutations: number;
  bootstrap: number;
  level: number;
}

export interface ResamplingStats {
  groups: [string, string];
  n1: number;
  n2: number;
  stat1: number;
  stat2: number;
  difference: number;
  pPermutation: number;
  ciLo: number;
  ciHi: number;
  permutations: number;
  bootstrap: number;
  statistic: 'mean' | 'median';
  /** Permutation null distribution and bootstrap distribution (for charts). */
  permutationStatistics: number[];
  bootstrapDifferences: number[];
}
