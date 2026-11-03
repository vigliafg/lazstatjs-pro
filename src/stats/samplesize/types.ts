export type SampleSizeDesign =
  | 'twoMeans'
  | 'oneMean'
  | 'paired'
  | 'twoProportions'
  | 'correlation'
  | 'anova'
  | 'tost'
  | 'survival'
  | 'oneProportion'
  | 'variance'
  | 'oneRate'
  | 'regression'
  | 'logistic';

export interface SampleSizeOptions {
  design: SampleSizeDesign;
  alpha: number;
  power: number;
  tails: 1 | 2;
  /** Difference to detect (means / paired differences). */
  delta?: number;
  /** Standard deviation (or SD of the differences for paired designs). */
  sd?: number;
  p1?: number;
  p2?: number;
  r?: number;
  groups?: number;
  f?: number;
  /** Optional precision request: half-width of the confidence interval. */
  margin?: number;
  /** Survival: hazard ratio to detect. */
  hazardRatio?: number;
  /** Survival: proportion of subjects who experience the event. */
  eventRate?: number;
  /** Variance design: σ₁² / σ₀² to detect. */
  ratio?: number;
  /** Regression design: number of predictors. */
  predictors?: number;
  /** Regression design: Cohen's f². */
  f2?: number;
  /** Logistic design: odds ratio to detect. */
  oddsRatio?: number;
}

export interface SampleSizeResult {
  design: SampleSizeDesign;
  nPerGroup: number;
  total: number;
  achievedPower: number;
  critical: number;
  effectSize: number;
  method: string;
}
