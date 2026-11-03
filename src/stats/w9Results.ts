/**
 * Public result shapes of the wave-9 kernels.
 *
 * They live outside `kernels/` so `stats/reports` can format the numbers
 * without importing the computation, exactly like `analysisResults.ts` does
 * for the earlier waves.
 */

export interface SurveyEstimate {
  label: string;
  estimate: number;
  se: number;
  lo: number;
  hi: number;
  df: number;
  deff: number;
  n: number;
  psus: number;
  weightedN: number;
}

export interface SurveyCoefficient {
  term: string;
  estimate: number;
  se: number;
  t: number;
  p: number;
}

export interface SurveyDesignInfo {
  strata: number;
  psus: number;
  clusters: number;
  weightedN: number;
  n: number;
}

export interface SurveyResult {
  mode: 'mean' | 'total' | 'proportion' | 'regression';
  design: SurveyDesignInfo;
  estimates: SurveyEstimate[];
  coefficients: SurveyCoefficient[];
  r2: number | null;
}

export interface MlImportance {
  variable: number;
  reduction: number;
  pct: number;
}

export interface MlResult {
  mode: 'rf' | 'boosting' | 'nnet';
  n: number;
  p: number;
  predictions: number[];
  residuals: number[];
  r2: number;
  rmse: number;
  mae: number;
  oobR2: number | null;
  oobRmse: number | null;
  importance: MlImportance[];
  trees: number;
}

export interface TextTerm {
  term: string;
  count: number;
  documents: number;
  tfidf: number;
}

export interface TextTopic {
  topic: number;
  prevalence: number;
  terms: { term: string; weight: number }[];
}

export interface TextSimilarity {
  first: number;
  second: number;
  value: number;
}

export interface TextResult {
  mode: 'frequency' | 'tfidf' | 'similarity' | 'topics';
  documents: number;
  vocabulary: number;
  totalTokens: number;
  averageLength: number;
  terms: TextTerm[];
  documentTerms: { document: number; terms: { term: string; count: number }[] }[];
  similarity: TextSimilarity[];
  topics: TextTopic[];
  documentTopics: number[][];
  reconstruction: number | null;
  iterations: number;
}

export interface ChoiceCoefficient {
  term: string;
  estimate: number;
  se: number;
  z: number;
  p: number;
}

export interface ChoiceShare {
  alternative: string;
  observed: number;
  predicted: number;
}

export interface ChoiceResult {
  mode: 'choice' | 'maxdiff';
  sets: number;
  rows: number;
  coefficients: ChoiceCoefficient[];
  logLik: number;
  nullLogLik: number;
  r2: number;
  aic: number;
  bic: number;
  shares: ChoiceShare[];
  maxdiff: MaxDiffItem[];
  iterations: number;
}

export interface MaxDiffItem {
  item: string;
  best: number;
  worst: number;
  score: number;
  share: number;
  se: number;
  utility: number;
}

export interface MetaStudyRow {
  label: string;
  effect: number;
  se: number;
  weight: number;
  lo: number;
  hi: number;
  standardizedResidual: number;
}

export interface MetaEstimate {
  estimate: number;
  se: number;
  z: number;
  p: number;
  lo: number;
  hi: number;
}

export interface MetaResult {
  method: 'DL' | 'REML' | 'FE';
  k: number;
  fixed: MetaEstimate;
  random: MetaEstimate | null;
  tau2: number;
  tau: number;
  q: number;
  qDf: number;
  qP: number;
  i2: number;
  h2: number;
  prediction: { lo: number; hi: number } | null;
  egger: { intercept: number; se: number; t: number; p: number } | null;
  studies: MetaStudyRow[];
  leaveOneOut: { label: string; estimate: number }[];
}

export interface BayesParameter {
  term: string;
  mean: number;
  sd: number;
  median: number;
  lo: number;
  hi: number;
  hdiLo: number;
  hdiHi: number;
  rhat: number;
  ess: number;
}

export interface BayesResult {
  mode: 'normal' | 'proportion' | 'rate' | 'regression';
  n: number;
  parameters: BayesParameter[];
  sigma: Omit<BayesParameter, 'term'> | null;
  draws: number;
  burnin: number;
  chains: number;
  rhatMax: number;
  essMin: number;
  /** Post-burn-in draws, one flattened vector per parameter. */
  samples: number[][];
}

export interface SpatialMoran {
  i: number;
  expected: number;
  se: number;
  z: number;
  p: number;
  permutationP: number;
}

export interface SpatialGeary {
  c: number;
  expected: number;
  permutationP: number;
}

export interface SpatialLisa {
  index: number;
  x: number;
  y: number;
  value: number;
  local: number;
  p: number;
  cluster: 'HH' | 'LL' | 'HL' | 'LH' | 'none';
}

export interface SpatialCoefficient {
  term: string;
  estimate: number;
  se: number;
  z: number;
  p: number;
}

export interface SpatialSar {
  rho: number;
  rhoSe: number;
  logLik: number;
  lr: number;
  lrP: number;
  coefficients: SpatialCoefficient[];
}

export interface SpatialResult {
  mode: 'moran' | 'geary' | 'lisa' | 'sar';
  n: number;
  k: number;
  moran: SpatialMoran | null;
  geary: SpatialGeary | null;
  lisa: SpatialLisa[];
  sar: SpatialSar | null;
}
