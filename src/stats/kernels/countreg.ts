import { jStat } from '../jstat';
import { parseNum } from '../core';
import { chi2SF } from '../distributions';
import type { CountCoefficient, CountFamily, CountOptions, CountStats } from '../countreg/types';

type Matrix = number[][];

const multiply = (a: Matrix, b: Matrix): Matrix =>
  a.map(row => b[0].map((_, column) => row.reduce((sum, value, i) => sum + value * b[i][column], 0)));

const transpose = (matrix: Matrix): Matrix =>
  matrix[0].map((_, column) => matrix.map(row => row[column]));

const zeros = (size: number): number[] => new Array<number>(size).fill(0);

const normalP = (z: number): number =>
  Number.isFinite(z) ? 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1)) : NaN;

const logFactorialValue = (value: number): number => jStat.gammaln(value + 1);

interface Fit {
  beta: number[];
  mu: number[];
  cov: Matrix;
  iterations: number;
}

const irls = (
  X: Matrix,
  y: number[],
  family: CountFamily,
  theta: number,
  start: number[] | null = null
): Fit | null => {
  const n = y.length;
  const p = X[0].length;
  let beta = start ? [...start] : zeros(p);
  let mu = y.map(() => NaN);
  let cov: Matrix | null = null;

  for (let iteration = 0; iteration < 100; iteration++) {
    mu = X.map(row => {
      const eta = row.reduce((sum, value, i) => sum + value * beta[i], 0);
      const value = Math.exp(Math.min(700, Math.max(-700, eta)));
      return Number.isFinite(value) ? value : 1e-12;
    });
    const weights = mu.map(value =>
      family === 'poisson' ? value : value / (1 + value / theta)
    );
    const z = mu.map((value, index) => {
      const eta = X[index].reduce((sum, entry, i) => sum + entry * beta[i], 0);
      return eta + (y[index] - value) / value;
    });

    const xtwx: Matrix = Array.from({ length: p }, () => zeros(p));
    const xtwz = zeros(p);
    for (let i = 0; i < n; i++) {
      const w = weights[i];
      for (let a = 0; a < p; a++) {
        xtwz[a] += w * X[i][a] * z[i];
        for (let b = 0; b < p; b++) {
          xtwx[a][b] += w * X[i][a] * X[i][b];
        }
      }
    }

    const inverse = invert(xtwx);
    const next = inverse
      ? inverse.map(row => row.reduce((sum, value, index) => sum + value * xtwz[index], 0))
      : null;
    if (!next) return null;
    const maxDelta = Math.max(...next.map((value, index) => Math.abs(value - beta[index])));
    beta = next;
    cov = invert(xtwx);
    if (maxDelta < 1e-8) return cov ? { beta, mu, cov, iterations: iteration + 1 } : null;
  }

  return cov ? { beta, mu, cov, iterations: 100 } : null;
};

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

const poissonLogLik = (y: number[], mu: number[]): number =>
  y.reduce(
    (sum, value, index) =>
      sum + (value * Math.log(mu[index]) - mu[index] - logFactorialValue(value)),
    0
  );

const negBinLogLik = (y: number[], mu: number[], theta: number): number =>
  y.reduce((sum, value, index) => {
    const logTheta = jStat.gammaln(value + theta) - jStat.gammaln(theta) - jStat.gammaln(value + 1);
    return sum + logTheta + theta * Math.log(theta / (theta + mu[index])) + value * Math.log(mu[index] / (theta + mu[index]));
  }, 0);

const fitTheta = (X: Matrix, y: number[]): { theta: number; fit: Fit; logLik: number } | null => {
  const evaluate = (logTheta: number) => {
    const theta = Math.exp(logTheta);
    const fit = irls(X, y, 'negbin', theta);
    if (!fit) return { theta, fit: null, logLik: -Infinity };
    return { theta, fit, logLik: negBinLogLik(y, fit.mu, theta) };
  };

  let left = Math.log(0.001);
  let right = Math.log(10000);
  const golden = (Math.sqrt(5) - 1) / 2;
  let c = right - golden * (right - left);
  let d = left + golden * (right - left);
  let fc = evaluate(c);
  let fd = evaluate(d);
  for (let iteration = 0; iteration < 60; iteration++) {
    if (fc.logLik < fd.logLik) {
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
  const best = fc.logLik >= fd.logLik ? fc : fd;
  return best.fit ? { theta: best.theta, fit: best.fit, logLik: best.logLik } : null;
};

/** Regressione di Poisson o binomiale negativa (NB2) via IRLS. */
export const countRegressionStats = (options: CountOptions): CountStats | null => {
  const { family, rows, depIdx, indepIdxs, level } = options;
  if (indepIdxs.length === 0) return null;

  const complete = rows
    .map(row => ({
      y: parseNum(row[depIdx]),
      xs: indepIdxs.map(index => parseNum(row[index])),
    }))
    .filter(entry => Number.isFinite(entry.y) && entry.y >= 0 && entry.xs.every(value => Number.isFinite(value)));
  if (complete.length < indepIdxs.length + 2) return null;

  const y = complete.map(entry => entry.y);
  const X: Matrix = complete.map(entry => [1, ...entry.xs]);
  const k = indepIdxs.length;
  const n = y.length;
  const df = n - k - 1;

  let fit: Fit | null;
  let theta: number | null = null;
  let logLik: number;
  if (family === 'poisson') {
    fit = irls(X, y, 'poisson', 1);
    if (!fit) return null;
    logLik = poissonLogLik(y, fit.mu);
  } else {
    const nb = fitTheta(X, y);
    if (!nb) return null;
    fit = nb.fit;
    theta = nb.theta;
    logLik = nb.logLik;
  }

  const mu = fit.mu;
  const deviance = y.reduce((sum, value, index) => {
    if (family === 'poisson') {
      return sum + 2 * (value > 0 ? value * Math.log(value / mu[index]) : 0) - 2 * (value - mu[index]);
    }
    const t = theta!;
    return sum + 2 * (value > 0 ? value * Math.log(value / mu[index]) : 0) -
      2 * (value + t) * Math.log((value + t) / (mu[index] + t));
  }, 0);
  const pearson = y.reduce(
    (sum, value, index) =>
      sum + Math.pow(value - mu[index], 2) / (family === 'poisson' ? mu[index] : mu[index] + mu[index] * mu[index] / (theta ?? 1)),
    0
  );

  const meanY = y.reduce((sum, value) => sum + value, 0) / n;
  const nullMu = y.map(() => meanY);
  const logLikNull = family === 'poisson'
    ? poissonLogLik(y, nullMu)
    : negBinLogLik(y, nullMu, theta ?? 1);
  const lr = Math.max(0, 2 * (logLik - logLikNull));

  const crit = jStat.normal.inv(1 - (1 - level / 100) / 2, 0, 1);
  const coefficients: CountCoefficient[] = fit.beta.map((beta, index) => {
    const se = Math.sqrt(Math.max(0, fit!.cov[index][index]));
    const z = se > 0 ? beta / se : NaN;
    return {
      term: index === 0 ? '(Intercept)' : `X${index}`,
      beta,
      se,
      z,
      p: normalP(z),
      irr: Math.exp(beta),
      irrLo: Math.exp(beta - crit * se),
      irrHi: Math.exp(beta + crit * se),
    };
  });

  return {
    family,
    n,
    k,
    df,
    theta,
    deviance,
    pearson,
    dispersion: df > 0 ? pearson / df : NaN,
    logLik,
    logLikNull,
    lr,
    lrP: chi2SF(lr, k),
    aic: -2 * logLik + 2 * (k + 1) + (theta !== null ? 2 : 0),
    bic: -2 * logLik + Math.log(n) * ((k + 1) + (theta !== null ? 1 : 0)),
    nonInteger: y.filter(value => !Number.isInteger(value)).length,
    observed: y,
    fitted: mu,
    residuals: y.map((value, index) => value - mu[index]),
    coefficients,
  };
};
