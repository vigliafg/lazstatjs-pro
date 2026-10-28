export interface MiOptions {
  rows: readonly (readonly string[])[];
  variables: number[];
  imputations: number;
  iterations: number;
  level: number;
}

export interface MiVariable {
  name: string;
  observed: number;
  missing: number;
  mean: number;
  sd: number;
  se: number;
  lo: number;
  hi: number;
  df: number;
  fmi: number;
}

export interface MiStats {
  n: number;
  imputations: number;
  iterations: number;
  variables: MiVariable[];
}
