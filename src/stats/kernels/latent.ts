/**
 * Shared numerical helpers for latent-variable procedures (SEM/CFA, latent
 * class analysis and IRT).
 *
 * These are intentionally small and pure: they do not fit a model by
 * themselves, but give the three kernels the same standardisation, entropy,
 * information criteria, Gaussian quadrature and finite-difference gradient.
 */

import { eigenSymmetric } from '../linalg';
import { bfgs, type OptimizeOptions, type OptimizeResult } from './optimize';

export interface StandardizedData {
  data: number[][];
  means: number[];
  sds: number[];
}

/** Column-wise mean/SD standardisation; `null` when a column is constant. */
export const standardizeColumns = (data: number[][]): StandardizedData | null => {
  const n = data.length;
  const p = data[0]?.length ?? 0;
  if (n < 2 || p < 1 || data.some(row => row.length !== p)) return null;
  const means = Array.from({ length: p }, (_, column) =>
    data.reduce((sum, row) => sum + row[column], 0) / n
  );
  const sds = Array.from({ length: p }, (_, column) =>
    Math.sqrt(
      data.reduce((sum, row) => sum + Math.pow(row[column] - means[column], 2), 0) /
        (n - 1)
    )
  );
  if (sds.some(value => !(value > 0))) return null;
  return {
    means,
    sds,
    data: data.map(row => row.map((value, column) => (value - means[column]) / sds[column])),
  };
}

/** Model-selection criteria on the same log-likelihood scale as R. */
export const informationCriteria = (
  logLik: number,
  parameters: number,
  n: number
): { aic: number; bic: number; aicc: number } => ({
  aic: -2 * logLik + 2 * parameters,
  bic: -2 * logLik + parameters * Math.log(Math.max(1, n)),
  aicc:
    -2 * logLik +
    2 * parameters +
    (2 * parameters * (parameters + 1)) / Math.max(1, n - parameters - 1),
});

/** Classification entropy of posterior probabilities, scaled to 0–1. */
export const classificationEntropy = (posterior: number[][]): number => {
  const n = posterior.length;
  if (n === 0) return 0;
  const classes = posterior[0]?.length ?? 0;
  if (classes <= 1) return 0;
  const total = posterior.reduce(
    (sum, row) =>
      sum +
      row.reduce((inner, value) => {
        const p = Math.min(1, Math.max(0, value));
        return inner - (p > 0 ? p * Math.log(p) : 0);
      }, 0),
    0
  );
  return Math.max(0, Math.min(1, 1 - total / (n * Math.log(classes))));
};

/** Vectorised log-sum-exp, stable for very small category probabilities. */
export const logSumExp = (values: number[]): number => {
  if (values.length === 0) return -Infinity;
  const max = Math.max(...values);
  if (!Number.isFinite(max)) return max;
  return max + Math.log(values.reduce((sum, value) => sum + Math.exp(value - max), 0));
};

/** Normalise rows that may contain only zeros; returns the fallback row. */
export const normalizeRows = (rows: number[][], fallback: number[]): number[][] =>
  rows.map(row => {
    const total = row.reduce((sum, value) => sum + Math.max(0, value), 0);
    if (!(total > 0)) return [...fallback];
    return row.map(value => Math.max(0, value) / total);
  });

export interface QuadratureRule {
  nodes: number[];
  weights: number[];
}

/**
 * Gauss–Hermite quadrature for the standard normal distribution.
 *
 * `points` is rounded to an odd number so the middle node is exactly zero,
 * which keeps EAP scores symmetric for a balanced response pattern.
 */
export const normalQuadrature = (points = 21): QuadratureRule => {
  const count = Math.max(3, Math.min(61, points % 2 === 0 ? points + 1 : points));
  // Golub–Welsch: eigenvalues of the symmetric tridiagonal Jacobi matrix.
  const diagonal = Array.from({ length: count }, () => 0);
  const offDiagonal = Array.from({ length: count - 1 }, (_, index) =>
    Math.sqrt((index + 1) / 2)
  );
  const matrix = diagonal.map((value, row) =>
    diagonal.map((__, column) => {
      if (row === column) return value;
      if (Math.abs(row - column) === 1) return offDiagonal[Math.min(row, column)];
      return 0;
    })
  );
  const eigen = eigenSymmetric(matrix);
  const nodes = eigen.values.map(value => value * Math.SQRT2);
  const weights = eigen.vectors[0].map(value => value * value);
  // The eigenvector sign is arbitrary; centre the nodes for stability.
  const centre = nodes.reduce((sum, value) => sum + value, 0) / Math.max(1, nodes.length);
  return { nodes: nodes.map(value => value - centre), weights };
};

/** Central finite-difference gradient, used by BFGS for covariance models. */
export const numericalGradient = (
  objective: (x: number[]) => number,
  x: number[],
  step = 1e-5
): number[] => {
  const base = objective(x);
  return x.map((value, index) => {
    const delta = step * Math.max(1, Math.abs(value));
    const plus = [...x];
    const minus = [...x];
    plus[index] = value + delta;
    minus[index] = value - delta;
    const high = objective(plus);
    const low = objective(minus);
    if (Number.isFinite(high) && Number.isFinite(low)) return (high - low) / (2 * delta);
    // One-sided fallback near a boundary.
    if (Number.isFinite(high)) return (high - base) / delta;
    if (Number.isFinite(low)) return (base - low) / delta;
    return 0;
  });
};

/** BFGS on a scalar objective with a numerical gradient. */
export const maximize = (
  objective: (x: number[]) => number,
  start: number[],
  options: OptimizeOptions = {}
): OptimizeResult =>
  bfgs(
    values => -objective(values),
    values => numericalGradient(value => -objective(value), values),
    start,
    { maxIterations: 200, tolerance: 1e-7, ...options }
  );
