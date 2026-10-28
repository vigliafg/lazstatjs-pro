export type SampleSizeDesign =
  | 'twoMeans'
  | 'oneMean'
  | 'paired'
  | 'twoProportions'
  | 'correlation'
  | 'anova';

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
