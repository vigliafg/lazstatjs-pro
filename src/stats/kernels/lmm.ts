import { jStat } from '../jstat';
import { parseNum } from '../core';
import { tCrit, twoSidedTP } from '../distributions';
import type { LmmCoefficient, LmmOptions, LmmStats, LmmVarianceComponent } from '../lmm/types';

type Matrix = number[][];

const multiply = (a: Matrix, b: Matrix): Matrix =>
  a.map(row => b[0].map((_, column) => row.reduce((sum, value, i) => sum + value * b[i][column], 0)));

const transpose = (matrix: Matrix): Matrix =>
  matrix[0].map((_, column) => matrix.map(row => row[column]));

const invert = (matrix: Matrix): Matrix | null => {
  const n = matrix.length;
  const augmented = matrix.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let column = 0; column < n; column++) {
    let pivot = column;
    for (let row = column + 1; row < n; row++) {
      if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
    }
    if (Math.abs(augmented[pivot][column]) < 1e-12) return null;
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
    const divisor = augmented[column][column];
    for (let j = 0; j < 2 * n; j++) augmented[column][j] /= divisor;
    for (let row = 0; row < n; row++) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let j = 0; j < 2 * n; j++) augmented[row][j] -= factor * augmented[column][j];
    }
  }
  return augmented.map(row => row.slice(n));
};

const solve = (matrix: Matrix, vector: number[]): number[] | null => {
  const inverse = invert(matrix);
  return inverse ? inverse.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0)) : null;
};

interface Prepared {
  X: Matrix;
  y: number[];
  groupIndex: number[];
  groupSizes: number[];
  groupLabels: string[];
  n: number;
  p: number;
}

const prepare = (options: LmmOptions): Prepared | null => {
  const { rows, depIdx, indepIdxs, groupIdx } = options;
  if (indepIdxs.length === 0) return null;
  const complete = rows
    .map(row => ({
      y: parseNum(row[depIdx]),
      xs: indepIdxs.map(index => parseNum(row[index])),
      group: String(row[groupIdx] ?? '').trim(),
    }))
    .filter(entry => Number.isFinite(entry.y) && entry.xs.every(value => Number.isFinite(value)) && entry.group !== '');
  if (complete.length < 3) return null;
  const labels = Array.from(new Set(complete.map(entry => entry.group)));
  if (labels.length < 2) return null;
  const groupIndex = complete.map(entry => labels.indexOf(entry.group));
  const groupSizes = labels.map((_, index) => groupIndex.filter(value => value === index).length);
  const X: Matrix = complete.map(entry => [1, ...entry.xs]);
  if (complete.length <= X[0].length) return null;
  return {
    X,
    y: complete.map(entry => entry.y),
    groupIndex,
    groupSizes,
    groupLabels: labels,
    n: complete.length,
    p: X[0].length,
  };
};

const reml = (prepared: Prepared, lambda: number): { logLik: number; beta: number[]; vcov: Matrix; sigma2: number; rss: number } | null => {
  const { X, y, groupIndex, groupSizes, n, p } = prepared;
  const groupSumsX: number[][] = groupSizes.map(() => new Array<number>(p).fill(0));
  const groupSumsY = new Array<number>(groupSizes.length).fill(0);
  X.forEach((row, i) => {
    const g = groupIndex[i];
    groupSumsY[g] += y[i];
    row.forEach((value, j) => {
      groupSumsX[g][j] += value;
    });
  });
  const xtx = multiply(transpose(X), X);
  const xty = X[0].map((_, j) => X.reduce((sum, row, i) => sum + row[j] * y[i], 0));
  const yty = y.reduce((sum, value) => sum + value * value, 0);

  const xtvix = xtx.map(row => [...row]);
  const xtviy = [...xty];
  let ytviy = yty;
  let logdet = 0;
  groupSizes.forEach((size, g) => {
    const c = lambda / (1 + lambda * size);
    logdet += Math.log(1 + lambda * size);
    const sx = groupSumsX[g];
    const sy = groupSumsY[g];
    for (let i = 0; i < p; i++) {
      for (let j = 0; j < p; j++) {
        xtvix[i][j] -= c * sx[i] * sx[j];
      }
      xtviy[i] -= c * sx[i] * sy;
    }
    ytviy -= c * sy * sy;
  });

  const beta = solve(xtvix, xtviy);
  if (!beta) return null;
  const rss = ytviy - 2 * beta.reduce((sum, value, i) => sum + value * xtviy[i], 0) +
    beta.reduce((sum, value, i) => sum + value * xtvix[i].reduce((inner, entry, j) => inner + entry * beta[j], 0), 0);
  const sigma2 = rss / (n - p);
  if (!(sigma2 > 0)) return null;
  const sign = Math.sign(det(xtvix)) || 1;
  const logdetX = Math.log(Math.abs(det(xtvix))) || 0;
  const logLik = -0.5 * ((n - p) * Math.log(sigma2) + logdet + logdetX);
  const vcov = invert(xtvix);
  return vcov ? { logLik, beta, vcov, sigma2, rss } : null;
};

const CHI2_95_DF1 = 3.841458820694124;

/** Chi-square quantile with one degree of freedom (normal quantile squared). */
const chiSquareQuantile1 = (level: number): number => {
  if (level === 0.95) return CHI2_95_DF1;
  const target = 0.5 + level / 2;
  const erf = (z: number): number => {
    const t = 1 / (1 + 0.3275911 * Math.abs(z));
    const poly = (((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592;
    const value = 1 - poly * t * Math.exp(-z * z);
    return z >= 0 ? value : -value;
  };
  let lo = 0;
  let hi = 6;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (0.5 * (1 + erf(mid / Math.SQRT2)) < target) lo = mid;
    else hi = mid;
  }
  const z = (lo + hi) / 2;
  return z * z;
};

/**
 * Variance components with their standard error and likelihood-profile interval.
 *
 * The parameters are profiled over the relative variance lambda, so the
 * interval endpoints are the lambda where the REML deviance rises by the
 * chi-square quantile: no symmetry or normality assumption on the variance.
 */
const varianceComponentsOf = (
  prepared: Prepared,
  lambda: number,
  logLik: number,
  level: number
): LmmVarianceComponent[] => {
  const chi2 = chiSquareQuantile1(level);
  const target = -2 * logLik + chi2;
  const deviance = (candidate: number): number | null => {
    const fit = reml(prepared, candidate);
    return fit ? -2 * fit.logLik : null;
  };
  const root = (outside: number, inside: number): number | null => {
    let lo = outside;
    let hi = inside;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      const value = deviance(mid);
      if (value === null) return null;
      if (value < target) hi = mid;
      else lo = mid;
    }
    return (lo + hi) / 2;
  };
  const lower = (): number => {
    const far = 1e-10;
    const farDeviance = deviance(far);
    if (farDeviance === null || farDeviance < target) return far;
    let step = lambda * 0.5;
    let outside = Math.max(lambda - step, far);
    while (outside > far && (deviance(outside) ?? 0) < target) {
      step *= 2;
      outside = Math.max(lambda - step, far);
    }
    return root(outside, lambda) ?? far;
  };
  const upper = (): number => {
    let step = lambda * 0.5;
    let outside = lambda + step;
    while ((deviance(outside) ?? Infinity) < target && outside < 1e8) {
      step *= 2;
      outside = lambda + step;
    }
    return root(outside, lambda) ?? outside;
  };
  const lo = lower();
  const hi = upper();
  const atLo = reml(prepared, lo);
  const atHi = reml(prepared, hi);
  const best = reml(prepared, lambda);
  if (!atLo || !atHi || !best) return [];
  const zValue = Math.sqrt(chi2);
  const entry = (component: 'intercept' | 'residual', estimate: number, low: number, high: number): LmmVarianceComponent => ({
    component,
    estimate,
    se: low > 0 && high > 0 ? (estimate * Math.log(high / low)) / (2 * zValue) : NaN,
    lo: low,
    hi: high,
  });
  return [
    entry('intercept', lambda * best.sigma2, lo * atLo.sigma2, hi * atHi.sigma2),
    entry('residual', best.sigma2, atHi.sigma2, atLo.sigma2),
  ];
};

const det = (matrix: Matrix): number => {
  const n = matrix.length;
  const a = matrix.map(row => [...row]);
  let value = 1;
  for (let column = 0; column < n; column++) {
    let pivot = column;
    for (let row = column + 1; row < n; row++) {
      if (Math.abs(a[row][column]) > Math.abs(a[pivot][column])) pivot = row;
    }
    if (Math.abs(a[pivot][column]) < 1e-12) return 0;
    if (pivot !== column) {
      [a[column], a[pivot]] = [a[pivot], a[column]];
      value *= -1;
    }
    value *= a[column][column];
    const divisor = a[column][column];
    for (let j = column; j < n; j++) a[column][j] /= divisor;
    for (let row = column + 1; row < n; row++) {
      const factor = a[row][column];
      for (let j = column; j < n; j++) a[row][j] -= factor * a[column][j];
    }
  }
  return value;
};

/** Modello lineare misto con solo intercetta casuale, stimato via REML. */
export const lmmStats = (options: LmmOptions): LmmStats | null => {
  const prepared = prepare(options);
  if (!prepared) return null;
  const { n, p, groupSizes } = prepared;

  const evaluate = (logLambda: number) => reml(prepared, Math.exp(logLambda));
  let left = -12;
  let right = 8;
  const golden = (Math.sqrt(5) - 1) / 2;
  let c = right - golden * (right - left);
  let d = left + golden * (right - left);
  let fc = evaluate(c);
  let fd = evaluate(d);
  for (let iteration = 0; iteration < 80; iteration++) {
    const fl = fc?.logLik ?? -Infinity;
    const fr = fd?.logLik ?? -Infinity;
    if (fl < fr) {
      left = c;
      c = d;
      fc = fd;
      d = left + golden * (right - left);
      fd = evaluate(d);
    } else {
      right = d;
      d = c;
      fd = fc;
      c = right - golden * (right - left);
      fc = evaluate(c);
    }
  }
  const bestPair = (fc?.logLik ?? -Infinity) >= (fd?.logLik ?? -Infinity) ? { lambda: Math.exp(c), fit: fc } : { lambda: Math.exp(d), fit: fd };
  if (!bestPair.fit) return null;
  const { beta, vcov, sigma2, logLik } = bestPair.fit;
  const lambda = bestPair.lambda;
  const varianceComponents = varianceComponentsOf(prepared, lambda, logLik, options.level);
  const sigmaU2 = lambda * sigma2;
  const crit = tCrit(options.level, n - p);
  const coefficients: LmmCoefficient[] = beta.map((value, index) => {
    const se = Math.sqrt(Math.max(0, vcov[index][index] * sigma2));
    const t = se > 0 ? value / se : NaN;
    return {
      term: index === 0 ? '(Intercept)' : `X${index}`,
      beta: value,
      se,
      t,
      p: twoSidedTP(t, n - p),
      lo: value - crit * se,
      hi: value + crit * se,
    };
  });

  const fitted = prepared.X.map(row => row.reduce((sum, value, index) => sum + value * beta[index], 0));
  const observed = prepared.y;
  const groupMeans = prepared.groupLabels.map((_, group) => {
    const values = observed.filter((__, index) => prepared.groupIndex[index] === group);
    return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
  });
  const residuals = observed.map((value, index) => value - fitted[index]);
  const randomEffects: number[] = [];
  const randomEffectsSe: number[] = [];
  prepared.groupSizes.forEach((size, group) => {
    const groupResiduals = residuals.filter((__, index) => prepared.groupIndex[index] === group);
    const meanResidual = groupResiduals.reduce((sum, value) => sum + value, 0) / Math.max(1, size);
    const denominator = size * sigmaU2 + sigma2;
    randomEffects.push(denominator > 0 ? (size * sigmaU2 * meanResidual) / denominator : 0);
    randomEffectsSe.push(denominator > 0 ? Math.sqrt((sigmaU2 * sigma2) / denominator) : NaN);
  });

  return {
    n,
    groups: groupSizes.length,
    groupLabels: prepared.groupLabels,
    groupMeans,
    randomEffects,
    randomEffectsSe,
    observed,
    fitted,
    residuals,
    k: p - 1,
    df: n - p,
    sigmaU2,
    sigmaE2: sigma2,
    varianceComponents,
    icc: sigmaU2 + sigma2 > 0 ? sigmaU2 / (sigmaU2 + sigma2) : NaN,
    remlLogLik: logLik,
    lambda,
    coefficients,
  };
};
