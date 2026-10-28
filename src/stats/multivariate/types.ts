export interface PcaResult {
  n: number;
  variables: string[];
  standardize: boolean;
  eigenvalues: number[];
  variancePct: number[];
  cumulativePct: number[];
  /** loadings[i][j] = loading of variable i on component j. */
  loadings: number[][];
  communalities: number[];
  retained: number;
  /** scores[i][j] = score of case i on component j (first two are plotted). */
  scores: number[][];
  bartlettChi2: number;
  bartlettDf: number;
  bartlettP: number;
  kmo: number;
  kmoItems: number[];
  determinant: number;
}

export interface AlphaItemStat {
  item: string;
  mean: number;
  sd: number;
  itemTotal: number;
  alphaIfDeleted: number;
}

export interface AlphaResult {
  n: number;
  k: number;
  alpha: number;
  standardizedAlpha: number;
  meanInterItem: number;
  items: AlphaItemStat[];
  correlations: number[][];
  totalMean: number;
  totalSd: number;
}
