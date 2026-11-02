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

// ---------------------------------------------------------------------------
// W1 procedures: descriptive modes, proportions/rates, variances, sign test,
// two-sample KS, Mood median and goodness of fit.
// ---------------------------------------------------------------------------

export interface FrequencyRow {
  value: string;
  count: number;
  percent: number;
  cumCount: number;
  cumPercent: number;
  ciLo: number;
  ciHi: number;
}

export interface FrequencyResult {
  total: number;
  missing: number;
  distinct: number;
  mode: string | null;
  rows: FrequencyRow[];
}

export interface GrubbsResult {
  n: number;
  statistic: number;
  critical: number;
  p: number;
  outlier: number | null;
  side: 'low' | 'high' | null;
  mean: number;
  sd: number;
}

export type DixonType = 'r10' | 'r11' | 'r21' | 'r22';

export interface DixonResult {
  n: number;
  type: DixonType;
  statistic: number;
  critical: number;
  p: number;
  outlier: number | null;
  side: 'low' | 'high' | null;
  beta: { a: number; b: number };
}

export interface RunsResult {
  n: number;
  above: number;
  below: number;
  cut: number;
  runs: number;
  expected: number;
  sd: number;
  z: number;
  p: number;
  exactP: number | null;
  firstSide: 0 | 1;
}

export interface ToleranceInterval {
  n: number;
  mean: number;
  sd: number;
  proportion: number;
  confidence: number;
  k: number;
  lo: number;
  hi: number;
  method: string;
}

export interface CusumPoint {
  index: number;
  value: number;
  cplus: number;
  cminus: number;
  signal: 'high' | 'low' | null;
}

export interface CusumResult {
  center: number;
  sigma: number;
  k: number;
  h: number;
  upper: number;
  lower: number;
  points: CusumPoint[];
  firstHigh: number | null;
  firstLow: number | null;
}

export interface ProportionInterval {
  estimate: number;
  wilsonLo: number;
  wilsonHi: number;
  clopperLo: number;
  clopperHi: number;
}

export interface OneProportionResult {
  successes: number;
  trials: number;
  estimate: number;
  nullValue: number;
  exactP: number;
  chi2: number;
  asymptoticP: number;
  level: number;
  interval: ProportionInterval;
}

export interface TwoProportionsResult {
  first: { successes: number; trials: number; estimate: number };
  second: { successes: number; trials: number; estimate: number };
  difference: number;
  standardError: number;
  lo: number;
  hi: number;
  chi2: number;
  pValue: number;
  riskRatio: number;
  oddsRatio: number;
  level: number;
}

export interface PoissonRateResult {
  events: number;
  exposure: number;
  rate: number;
  nullRate: number;
  exactP: number;
  lo: number;
  hi: number;
  level: number;
}

export interface TwoPoissonResult {
  first: { events: number; exposure: number; rate: number };
  second: { events: number; exposure: number; rate: number };
  ratio: number;
  exactP: number;
  lo: number;
  hi: number;
  level: number;
}

export interface OneVarianceResult {
  n: number;
  variance: number;
  sd: number;
  nullVariance: number;
  chi2: number;
  df: number;
  p: number;
  lo: number;
  hi: number;
  level: number;
}

export interface VarianceGroupSummary {
  name: string;
  n: number;
  variance: number;
  sd: number;
}

export interface TwoVarianceResult {
  groups: VarianceGroupSummary[];
  ratio: number;
  df1: number;
  df2: number;
  fP: number;
  fLo: number;
  fHi: number;
  bartlett: { statistic: number; df: number; p: number };
  levene: { statistic: number; df1: number; df2: number; p: number };
  level: number;
}

export interface SignTestResult {
  n: number;
  zeros: number;
  positive: number;
  negative: number;
  exactP: number;
  z: number;
  asymptoticP: number;
  median: number;
}

export interface TwoSampleKsResult {
  n1: number;
  n2: number;
  d: number;
  p: number;
  method: 'exact' | 'asymptotic';
}

export interface MoodGroupCount {
  name: string;
  n: number;
  above: number;
  below: number;
}

export interface MoodResult {
  median: number;
  above: number;
  below: number;
  groups: MoodGroupCount[];
  chi2: number;
  df: number;
  p: number;
}

export interface GofResult {
  labels: string[];
  observed: number[];
  expected: number[];
  proportions: number[];
  total: number;
  chi2: number;
  df: number;
  p: number;
}
