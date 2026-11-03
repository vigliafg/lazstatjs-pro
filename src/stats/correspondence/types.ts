export interface CorrespondencePoint {
  label: string;
  mass: number;
  coordinate: number;
  inertia: number;
  contribution: number;
  cos2: number;
}

export interface CorrespondenceAxis {
  index: number;
  eigenvalue: number;
  inertiaPct: number;
  cumulativePct: number;
  chi2: number;
  df: number;
  p: number;
}

export interface CorrespondenceResult {
  rows: string[];
  cols: string[];
  observed: number[][];
  expected: number[][];
  residuals: number[][];
  rowMass: number[];
  colMass: number[];
  axes: CorrespondenceAxis[];
  rowCoordinates: CorrespondencePoint[][];
  colCoordinates: CorrespondencePoint[][];
  rowPrincipal: number[][];
  colPrincipal: number[][];
  totalInertia: number;
  chi2: number;
  df: number;
  p: number;
  n: number;
}
