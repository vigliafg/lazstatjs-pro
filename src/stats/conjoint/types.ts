export interface ConjointLevel {
  attribute: string;
  level: string;
  utility: number;
  se: number;
  t: number;
  p: number;
}

export interface ConjointAttribute {
  attribute: string;
  levels: string[];
  importance: number;
  range: number;
}

export interface ConjointResult {
  n: number;
  attributes: ConjointAttribute[];
  levels: ConjointLevel[];
  coefficients: { term: string; estimate: number; se: number; t: number; p: number }[];
  r2: number;
  adjR2: number;
  rmse: number;
  f: number;
  fP: number;
  intercept: number;
  predictions: number[];
  residuals: number[];
}
