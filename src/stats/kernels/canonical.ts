/**
 * Canonical correlation analysis.
 *
 * Two blocks X (n×p) and Y (n×q) are centred, their covariance matrices are
 * whitened and the singular value decomposition of
 * `Sxx^-1/2 Sxy Syy^-1/2` gives the canonical correlations. The reported
 * coefficients are scaled so both canonical variates have unit variance,
 * which is the convention used by R's `cancor`.
 */

import { chi2SF } from '../distributions';
import { eigenSymmetric } from '../linalg';
import { columnMeans, multiply, svd, symmetricPower, type Matrix } from './matrix';
import type { CanonicalFunction, CanonicalResult } from '../canonical/types';

export interface CanonicalInput {
  x: number[][];
  y: number[][];
  xNames: string[];
  yNames: string[];
}

const covariance = (x: Matrix, y: Matrix): Matrix => {
  const rows = x.length;
  const cols = y[0]?.length ?? 0;
  const result = Array.from({ length: x[0]?.length ?? 0 }, () =>
    new Array<number>(cols).fill(0)
  );
  for (let i = 0; i < rows; i += 1) {
    for (let a = 0; a < result.length; a += 1) {
      for (let b = 0; b < cols; b += 1) result[a][b] += x[i][a] * y[i][b];
    }
  }
  const scale = Math.max(1, rows - 1);
  return result.map(row => row.map(value => value / scale));
};

const center = (data: Matrix): Matrix => {
  const means = columnMeans(data);
  return data.map(row => row.map((value, column) => value - means[column]));
};

const varianceOfScore = (data: Matrix, coefficients: number[]): number => {
  const scores = data.map(row =>
    row.reduce((sum, value, index) => sum + value * (coefficients[index] ?? 0), 0)
  );
  const mean = scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length);
  return scores.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / Math.max(1, scores.length - 1);
};

const correlation = (a: number[], b: number[]): number => {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const meanA = a.slice(0, n).reduce((sum, value) => sum + value, 0) / n;
  const meanB = b.slice(0, n).reduce((sum, value) => sum + value, 0) / n;
  let numerator = 0;
  let sumA = 0;
  let sumB = 0;
  for (let i = 0; i < n; i += 1) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    numerator += da * db;
    sumA += da * da;
    sumB += db * db;
  }
  return Math.sqrt(sumA * sumB) > 0 ? numerator / Math.sqrt(sumA * sumB) : 0;
};

export const canonicalCorrelation = (input: CanonicalInput): CanonicalResult | null => {
  const n = input.x.length;
  const p = input.x[0]?.length ?? 0;
  const q = input.y[0]?.length ?? 0;
  if (n < Math.max(p, q) + 2 || p < 1 || q < 1) return null;
  if (input.y.length !== n || input.xNames.length !== p || input.yNames.length !== q) return null;
  if (input.x.some(row => row.length !== p) || input.y.some(row => row.length !== q)) return null;

  const x = center(input.x);
  const y = center(input.y);
  const sxx = covariance(x, x);
  const syy = covariance(y, y);
  const sxy = covariance(x, y);
  const ex = eigenSymmetric(sxx);
  const ey = eigenSymmetric(syy);
  if (ex.values.some(value => !(value > 1e-12)) || ey.values.some(value => !(value > 1e-12))) {
    return null;
  }
  const invSqrtX = symmetricPower(sxx, ex.values, ex.vectors, -0.5);
  const invSqrtY = symmetricPower(syy, ey.values, ey.vectors, -0.5);
  const whitened = multiply(multiply(invSqrtX, sxy), invSqrtY);
  const decomposition = svd(whitened);
  const rank = Math.min(p, q);
  const functions: CanonicalFunction[] = [];
  const xScores: number[][] = [];
  const yScores: number[][] = [];

  for (let index = 0; index < rank; index += 1) {
    const r = Math.max(0, Math.min(1, decomposition.s[index] ?? 0));
    if (!(r > 1e-10)) break;
    const u = Array.from({ length: p }, (_, row) => decomposition.u[row]?.[index] ?? 0);
    const v = Array.from({ length: q }, (_, row) => decomposition.v[row]?.[index] ?? 0);
    const rawX = invSqrtX.map(row => row.reduce((sum, value, column) => sum + value * u[column], 0));
    const rawY = invSqrtY.map(row => row.reduce((sum, value, column) => sum + value * v[column], 0));
    const varianceX = varianceOfScore(x, rawX);
    const varianceY = varianceOfScore(y, rawY);
    const scaleX = varianceX > 0 ? 1 / Math.sqrt(varianceX) : 0;
    const scaleY = varianceY > 0 ? 1 / Math.sqrt(varianceY) : 0;
    const xCoef = rawX.map(value => value * scaleX);
    const yCoef = rawY.map(value => value * scaleY);
    const xScore = x.map(row => row.reduce((sum, value, column) => sum + value * xCoef[column], 0));
    const yScore = y.map(row => row.reduce((sum, value, column) => sum + value * yCoef[column], 0));
    xScores.push(xScore);
    yScores.push(yScore);

    const structureX = Array.from({ length: p }, (_, column) =>
      correlation(x.map(row => row[column]), xScore)
    );
    const structureY = Array.from({ length: q }, (_, column) =>
      correlation(y.map(row => row[column]), yScore)
    );
    const wilks = functions.length === 0
      ? decomposition.s.slice(0, rank).reduce((product, value) => product * (1 - Math.min(1, value * value)), 1)
      : 0;
    const chi2 = wilks > 0 ? -(n - 1 - (p + q + 1) / 2) * Math.log(wilks) : 0;
    const df = p * q;
    const redundancyX =
      structureX.reduce((sum, value) => sum + value * value, 0) / Math.max(1, p) * r * r;
    const redundancyY =
      structureY.reduce((sum, value) => sum + value * value, 0) / Math.max(1, q) * r * r;

    functions.push({
      index: index + 1,
      correlation: r,
      eigenvalue: r * r,
      wilks,
      chi2,
      df,
      p: chi2SF(chi2, df),
      xCoefficients: xCoef.map((coefficient, column) => ({
        variable: input.xNames[column] ?? `X${column + 1}`,
        coefficient,
        structure: structureX[column] ?? 0,
      })),
      yCoefficients: yCoef.map((coefficient, column) => ({
        variable: input.yNames[column] ?? `Y${column + 1}`,
        coefficient,
        structure: structureY[column] ?? 0,
      })),
      redundancyX,
      redundancyY,
    });
  }

  if (functions.length === 0) return null;

  // The first function's Wilks value is the test of all canonical roots
  // together; subsequent functions test the remaining roots. Their chi-square
  // statistics use the matching residual degrees of freedom.
  functions.forEach((fn, index) => {
    const remaining = decomposition.s.slice(index, rank).reduce(
      (product, value) => product * (1 - Math.min(1, value * value)),
      1
    );
    const df = (p - index) * (q - index);
    const chi2 = remaining > 0 ? -(n - 1 - (p + q + 1) / 2) * Math.log(remaining) : 0;
    fn.wilks = remaining;
    fn.df = df;
    fn.chi2 = chi2;
    fn.p = chi2SF(chi2, df);
  });

  return {
    n,
    xNames: input.xNames,
    yNames: input.yNames,
    functions,
    xScores,
    yScores,
  };
};
