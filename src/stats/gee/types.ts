export type GeeFamily = 'gaussian' | 'binomial';
export type GeeCorrelation = 'independence' | 'exchangeable';

export interface GeeOptions {
  rows: readonly (readonly string[])[];
  depIdx: number;
  indepIdxs: number[];
  clusterIdx: number;
  family: GeeFamily;
  correlation: GeeCorrelation;
  level: number;
}

export interface GeeCoefficient {
  term: string;
  beta: number;
  se: number;
  z: number;
  p: number;
  or: number;
  lo: number;
  hi: number;
}

export interface GeeStats {
  family: GeeFamily;
  correlation: GeeCorrelation;
  n: number;
  clusters: number;
  maxCluster: number;
  phi: number;
  alpha: number;
  iterations: number;
  coefficients: GeeCoefficient[];
}
