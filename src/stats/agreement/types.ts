export type AgreementMode = 'icc' | 'bland' | 'kappa';
export type KappaWeight = 'none' | 'linear' | 'quadratic';

export interface IccResult {
  n: number;
  k: number;
  icc11: number;
  icc21: number;
  icc31: number;
  msb: number;
  msr: number;
  mse: number;
  f: number;
  p: number;
}


export interface BlandAltmanResult {
  n: number;
  bias: number;
  sd: number;
  loaUpper: number;
  loaLower: number;
  biasLo: number;
  biasHi: number;
  loaUpperLo: number;
  loaUpperHi: number;
  loaLowerLo: number;
  loaLowerHi: number;
  slope: number;
  slopeP: number;
  points: { mean: number; diff: number }[];
}

export interface KappaResult {
  raters: number;
  categories: number;
  categoryLabels: string[];
  /** Agreement matrix between categories (all rater pairs). */
  matrix: number[][];
  n: number;
  po: number;
  pe: number;
  kappa: number;
  se: number;
  z: number;
  p: number;
  lo: number;
  hi: number;
  weighted: KappaWeight;
}

