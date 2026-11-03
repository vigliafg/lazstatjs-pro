export interface SemLoading {
  variable: string;
  factor: string;
  loading: number;
  se: number;
  z: number;
  p: number;
  standardized: number;
  r2: number;
}

export interface SemUniqueness {
  variable: string;
  uniqueness: number;
  se: number;
}

export interface SemFactor {
  name: string;
  variance: number;
  correlations: { factor: string; correlation: number; se: number }[];
}

export interface SemFit {
  chi2: number;
  df: number;
  p: number;
  cfi: number;
  tli: number;
  rmsea: number;
  srmr: number;
  aic: number;
  bic: number;
  logLik: number;
  n: number;
  parameters: number;
  iterations: number;
  converged: boolean;
}

export interface SemResult {
  variables: string[];
  factors: SemFactor[];
  loadings: SemLoading[];
  uniqueness: SemUniqueness[];
  fit: SemFit;
  implied: number[][];
  observed: number[][];
  residuals: number[][];
  structural: boolean;
  path: { from: string; to: string; beta: number; se: number; z: number; p: number } | null;
}
