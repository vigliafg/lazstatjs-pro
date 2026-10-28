export interface TimeDependentCoxOptions {
  start: number[];
  stop: number[];
  event: number[];
  covariates: { name: string; values: number[] }[];
  level?: number;
}
