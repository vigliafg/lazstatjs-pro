/**
 * Multivariate analysis of covariance (MANCOVA).
 *
 * Tests the effect of a grouping factor on several dependent variables while
 * adjusting for one or more continuous covariates. The hypothesis matrix is
 * the difference between the residual SSCP of the reduced model (covariates
 * only) and the full model (covariates + group). Wilks' lambda is summarised
 * with Rao's F approximation; each dependent variable also gets a univariate
 * ANCOVA F test.
 */
import { fSF } from './distributions';
import { invert, multiply, transpose, type Matrix } from './matrix';

export interface MancovaInput {
  /** n × p dependent variables. */
  ys: Matrix;
  /** One group label per row. */
  labels: string[];
  /** n × q covariates. */
  covariates: Matrix;
  variableNames: string[];
  covariateNames: string[];
}

export interface MancovaUnivariate {
  variable: string;
  f: number;
  df1: number;
  df2: number;
  p: number;
  /** Adjusted group means. */
  adjusted: { group: string; mean: number }[];
}

export interface MancovaResult {
  groups: string[];
  n: number;
  p: number;
  q: number;
  wilks: { lambda: number; f: number; df1: number; df2: number; p: number };
  pillai: number;
  univariate: MancovaUnivariate[];
  covariateNames: string[];
}

const determinant = (matrix: Matrix): number => {
  const n = matrix.length;
  const a = matrix.map(row => [...row]);
  let value = 1;
  for (let column = 0; column < n; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < n; row += 1) {
      if (Math.abs(a[row][column]) > Math.abs(a[pivot][column])) pivot = row;
    }
    if (Math.abs(a[pivot][column]) < 1e-12) return 0;
    if (pivot !== column) {
      [a[column], a[pivot]] = [a[pivot], a[column]];
      value = -value;
    }
    value *= a[column][column];
    const divisor = a[column][column];
    for (let row = column + 1; row < n; row += 1) {
      const factor = a[row][column] / divisor;
      for (let j = column; j < n; j += 1) a[row][j] -= factor * a[column][j];
    }
  }
  return value;
};

interface Fit {
  beta: Matrix;
  residuals: Matrix;
  sscp: Matrix;
}

const fitMultivariate = (Y: Matrix, X: Matrix): Fit | null => {
  const xtx = multiply(transpose(X), X);
  const inverse = invert(xtx);
  if (!inverse) return null;
  const beta = multiply(multiply(inverse, transpose(X)), Y);
  const fitted = multiply(X, beta);
  const residuals = Y.map((row, index) => row.map((value, column) => value - fitted[index][column]));
  const sscp = multiply(transpose(residuals), residuals);
  return { beta, residuals, sscp };
};

const difference = (left: Matrix, right: Matrix): Matrix =>
  left.map((row, i) => row.map((value, j) => value - right[i][j]));

const diagonal = (matrix: Matrix): number[] => matrix.map((row, index) => row[index]);

/** MANCOVA with Wilks' lambda and univariate ANCOVA tests. */
export const mancova = (input: MancovaInput): MancovaResult | null => {
  const { ys, labels, covariates, variableNames, covariateNames } = input;
  const n = ys.length;
  const p = ys[0]?.length ?? 0;
  const q = covariates[0]?.length ?? 0;
  if (n === 0 || p === 0 || q === 0) return null;
  if (labels.length !== n || covariates.length !== n) return null;
  if (ys.some(row => row.length !== p) || covariates.some(row => row.length !== q)) return null;
  if (variableNames.length !== p || covariateNames.length !== q) return null;

  const groups = Array.from(new Set(labels)).sort();
  const g = groups.length;
  if (g < 2 || g > 10) return null;
  if (n <= q + g) return null;
  if (groups.some(group => labels.filter(label => label === group).length < 2)) return null;

  const base = covariates.map(row => [1, ...row]);
  const dummies = labels.map(label => groups.slice(1).map(group => (label === group ? 1 : 0)));
  const full = base.map((row, index) => [...row, ...dummies[index]]);

  const reducedFit = fitMultivariate(ys, base);
  const fullFit = fitMultivariate(ys, full);
  if (!reducedFit || !fullFit) return null;

  const dfError = n - (q + g);
  if (dfError <= 0) return null;

  // Wilks: det(E) / det(E + H) = det(E_full) / det(E_reduced).
  const lambda = Math.min(
    1,
    Math.max(1e-12, determinant(fullFit.sscp) / Math.max(1e-12, determinant(reducedFit.sscp)))
  );
  const dfH = g - 1;
  const s = Math.sqrt((p * p * dfH * dfH - 4) / Math.max(1e-12, p * p + dfH * dfH - 5));
  const m = dfError - (p - dfH + 1) / 2;
  const df1 = p * dfH;
  const df2 = Math.max(1, m * s - (p * dfH - 2) / 2);
  const lambdaRoot = Math.pow(lambda, 1 / Math.max(1e-12, s));
  const f = lambdaRoot > 0 && lambdaRoot < 1
    ? ((1 - lambdaRoot) / lambdaRoot) * (df2 / df1)
    : NaN;
  const wilks = { lambda, f, df1, df2, p: fSF(f, df1, df2) };

  // Pillai's trace is not directly available from SSCP without the canonical
  // roots; report it when the reduced SSCP is invertible.
  const reducedInverse = invert(reducedFit.sscp);
  let pillai = NaN;
  if (reducedInverse) {
    const H = difference(reducedFit.sscp, fullFit.sscp);
    const product = multiply(H, reducedInverse);
    // trace via the eigenvalues of H E^{-1}: use the sum of diagonal entries
    // of a symmetric reparameterisation when possible.
    const symmetric = multiply(reducedInverse, product);
    pillai = diagonal(symmetric).reduce((sum, value) => sum + value, 0);
  }

  const errorDiagonal = diagonal(fullFit.sscp);
  const hypothesisDiagonal = diagonal(difference(reducedFit.sscp, fullFit.sscp));
  const grandCovariates = Array.from({ length: q }, (_, column) =>
    covariates.reduce((sum, row) => sum + row[column], 0) / n
  );
  const groupCovariates = groups.map(group => {
    const rows = covariates.filter((_, index) => labels[index] === group);
    return Array.from({ length: q }, (_, column) =>
      rows.reduce((sum, row) => sum + row[column], 0) / Math.max(1, rows.length)
    );
  });

  const univariate = Array.from({ length: p }, (_, variable) => {
    const hypothesis = Math.max(0, hypothesisDiagonal[variable]);
    const error = Math.max(1e-12, errorDiagonal[variable]);
    const fValue = dfError > 0 ? (hypothesis / dfH) / (error / dfError) : NaN;
    const covariateEffects = covariateNames.map((_, covariate) => {
      const index = covariate + 1;
      return fullFit.beta[index][variable];
    });
    const adjusted = groups.map((group, groupIndex) => {
      const rawMean =
        ys
          .filter((_, index) => labels[index] === group)
          .reduce((sum, row) => sum + row[variable], 0) /
        Math.max(1, labels.filter(label => label === group).length);
      const adjustment = covariateEffects.reduce(
        (sum, effect, covariate) =>
          sum + effect * (groupCovariates[groupIndex][covariate] - grandCovariates[covariate]),
        0
      );
      return { group, mean: rawMean - adjustment };
    });
    return {
      variable: variableNames[variable],
      f: fValue,
      df1: dfH,
      df2: dfError,
      p: fSF(fValue, dfH, dfError),
      adjusted,
    };
  });

  return {
    groups,
    n,
    p,
    q,
    wilks,
    pillai,
    univariate,
    covariateNames,
  };
};
