/**
 * Public result shapes of the L4 kernels.
 *
 * They live outside `kernels/` so `stats/reports` can consume the result type
 * without importing a kernel: reports only format precomputed numbers.
 */

export interface PartitionSplit {
  node: number;
  depth: number;
  variable: number;
  threshold: number;
  n: number;
  improvement: number;
}

export interface PartitionLeaf {
  node: number;
  n: number;
  mean: number;
  sd: number;
  min: number;
  max: number;
  path: string;
}

export interface PartitionNode {
  id: number;
  depth: number;
  indices: number[];
  prediction: number;
  sse: number;
  split?: {
    variable: number;
    threshold: number;
    left: PartitionNode;
    right: PartitionNode;
    improvement: number;
  };
}

export interface PartitionModel {
  root: PartitionNode;
  leaves: PartitionLeaf[];
  splits: PartitionSplit[];
  importance: { variable: number; reduction: number; pct: number }[];
  predictions: number[];
  r2: number;
  rmse: number;
  mae: number;
  n: number;
  depth: number;
  sse: number;
  sst: number;
}

export type ControlChartType = 'xbar' | 'individuals' | 'ewma';

export interface ControlPoint {
  index: number;
  value: number;
  out: boolean;
}

export interface ControlResult {
  chart: ControlChartType;
  points: ControlPoint[];
  center: number;
  sigma: number;
  ucl: number;
  lcl: number;
  limits: { index: number; ucl: number; lcl: number }[];
  outCount: number;
  ranges?: number[];
  rCenter?: number;
  rUcl?: number;
  rLcl?: number;
  subgroup: number;
}

export interface CapabilityResult {
  n: number;
  mean: number;
  sd: number;
  min: number;
  max: number;
  lsl: number;
  usl: number;
  target: number;
  cp: number;
  cpk: number;
  cpu: number;
  cpl: number;
  pp: number;
  ppk: number;
  pctOut: number;
  ppm: number;
}

export interface ParetoResult {
  rows: { category: string; count: number; pct: number; cumulative: number }[];
  total: number;
}

export type ClusterMethod = 'average' | 'complete' | 'single' | 'ward';

export interface ClusterMerge {
  id: number;
  left: number;
  right: number;
  height: number;
  size: number;
}

export interface ClusterResult {
  merges: ClusterMerge[];
  assignment: number[];
  k: number;
  centers: number[][];
  profiles: number[][];
  variableNames: string[];
  leafOrder: number[];
  heights: number[];
  labels: string[];
  links: { x1: number; y1: number; x2: number; y2: number }[];
  leaves: { x: number; label: string }[];
}

export interface DiscriminantResult {
  groups: string[];
  n: number;
  p: number;
  means: number[][];
  priors: number[];
  coefficients: number[][];
  constants: number[];
  accuracy: number;
  confusion: number[][];
  canonicalEigen: number[];
  canonicalVectors: number[][];
  canonicalScores: number[][];
  centroids: { group: string; x: number; y: number }[];
  wilks: { dimension: number; lambda: number; chi2: number; df: number; p: number }[];
  pillai: number;
  univariate: { variable: number; f: number; p: number; between: number; within: number }[];
}

export interface DoeTerm {
  name: string;
  estimate: number;
  se: number;
  t: number;
  p: number;
}

export interface DoeGridPoint {
  a: number;
  b: number;
  z: number;
  x: number;
  y: number;
}

export interface DoeResult {
  terms: DoeTerm[];
  n: number;
  rank: number;
  r2: number;
  adjR2: number;
  rmse: number;
  f: number;
  fP: number;
  aMin: number;
  aMax: number;
  bMin: number;
  bMax: number;
  grid: DoeGridPoint[][];
  mesh: { x1: number; y1: number; x2: number; y2: number; z: number }[];
  points: { x: number; y: number; z: number }[];
  contours: { x1: number; y1: number; x2: number; y2: number; level: number }[];
  levels: number[];
  stationary: {
    a: number;
    b: number;
    z: number;
    kind: 'minimum' | 'maximum' | 'saddle';
  } | null;
}
