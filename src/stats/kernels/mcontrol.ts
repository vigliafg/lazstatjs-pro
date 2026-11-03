/**
 * Hotelling T² control chart for several variables jointly.
 *
 * Phase I limits use the pooled within-subgroup covariance and the exact
 * F quantile, the standard formulation for subgroup size n and p variables:
 *
 *   T²_i = n (x̄_i − x̄̄)' S⁻¹ (x̄_i − x̄̄)
 *   UCL  = p (m − 1)(n − 1) / (m n − m − p + 1) · F(1 − α; p, m n − m − p + 1)
 */
import { jStat } from '../jstat';
import { invert, multiplyVector } from './matrix';
import type { MultiControlOptions, MultiControlResult } from '../analysisResults';

export type {
  MultiControlOptions,
  MultiControlPoint,
  MultiControlResult,
} from '../analysisResults';

export const multiControlChart = (options: MultiControlOptions): MultiControlResult | null => {
  const variables = options.variableNames;
  const p = variables.length;
  if (p < 2) return null;
  const subgroup = Math.max(1, Math.round(options.subgroup));
  const rows = options.rows.filter(row => row.length === p && row.every(Number.isFinite));
  const m = Math.floor(rows.length / subgroup);
  if (m < 2) return null;
  const n = subgroup;
  if (m * n - m - p + 1 <= 0) return null;

  const groups: number[][][] = [];
  for (let g = 0; g < m; g += 1) {
    groups.push(rows.slice(g * n, (g + 1) * n));
  }
  const means = groups.map(group =>
    Array.from({ length: p }, (_, j) => group.reduce((sum, row) => sum + row[j], 0) / n)
  );
  const center = Array.from({ length: p }, (_, j) =>
    means.reduce((sum, row) => sum + row[j], 0) / m
  );

  const covariance = Array.from({ length: p }, () => Array<number>(p).fill(0));
  groups.forEach(group => {
    group.forEach(row => {
      for (let a = 0; a < p; a += 1) {
        for (let b = 0; b < p; b += 1) {
          covariance[a][b] += (row[a] - center[a]) * (row[b] - center[b]);
        }
      }
    });
  });
  const scale = m * (n - 1);
  for (let a = 0; a < p; a += 1) {
    for (let b = 0; b < p; b += 1) covariance[a][b] /= scale;
  }
  const inverse = invert(covariance);
  if (!inverse) return null;

  const df1 = p;
  const df2 = m * n - m - p + 1;
  const factor = (p * (m - 1) * (n - 1)) / df2;
  const critical = jStat.centralF.inv(1 - options.alpha, df1, df2);
  const ucl = factor * critical;

  const points = means.map((mean, index) => {
    const delta = mean.map((value, j) => value - center[j]);
    const projected = multiplyVector(inverse, delta);
    const t2 = n * delta.reduce((sum, value, j) => sum + value * projected[j], 0);
    return { index: index + 1, t2: Math.max(0, t2), out: t2 > ucl };
  });

  return {
    variables,
    subgroup,
    groups: m,
    n: m * n,
    center,
    covariance,
    ucl,
    lcl: 0,
    points,
    outCount: points.filter(point => point.out).length,
    df1,
    df2,
    critical,
  };
};
