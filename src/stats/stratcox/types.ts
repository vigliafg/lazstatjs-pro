export interface StratifiedCoxOptions {
  time: number[];
  event: number[];
  covariates: { name: string; values: number[] }[];
  strata: string[];
  level?: number;
}
