export interface AncovaOptions {
  response: number[];
  factor: string[];
  covariates: number[][];
  responseName: string;
  factorName: string;
  covariateNames: string[];
  level: number;
  /** Declared level order (labels), reference level first. */
  levels?: string[];
}
