export type MdsMetric = 'classical' | 'nonmetric';

export interface MdsPoint {
  row: number;
  label: string;
  coordinates: number[];
}

export interface MdsPair {
  i: number;
  j: number;
  dissimilarity: number;
  distance: number;
  disparity: number;
}

export interface MdsResult {
  metric: MdsMetric;
  dimensions: number;
  labels: string[];
  coordinates: number[][];
  points: MdsPoint[];
  eigenvalues: number[];
  stress: number;
  pairs: MdsPair[];
  iterations: number;
}
