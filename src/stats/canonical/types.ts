/** Canonical correlation analysis result. */
export interface CanonicalCoefficient {
  variable: string;
  coefficient: number;
  structure: number;
}

export interface CanonicalFunction {
  index: number;
  correlation: number;
  eigenvalue: number;
  wilks: number;
  chi2: number;
  df: number;
  p: number;
  xCoefficients: CanonicalCoefficient[];
  yCoefficients: CanonicalCoefficient[];
  redundancyX: number;
  redundancyY: number;
}

export interface CanonicalResult {
  n: number;
  xNames: string[];
  yNames: string[];
  functions: CanonicalFunction[];
  xScores: number[][];
  yScores: number[][];
}
