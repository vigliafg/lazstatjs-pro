export interface LatentClassItem {
  variable: string;
  levels: string[];
  probabilities: number[][];
}

export interface LatentClassResult {
  classes: number;
  n: number;
  items: LatentClassItem[];
  proportions: number[];
  posterior: number[][];
  predicted: number[];
  logLik: number;
  parameters: number;
  aic: number;
  bic: number;
  entropy: number;
  iterations: number;
  converged: boolean;
  counts: number[];
}
