import { jStat } from '../jstat';
import { parseNum } from '../core';
import { tCrit } from '../distributions';
import type { GeeCoefficient, GeeOptions, GeeStats } from '../gee/types';

type Matrix = number[][];

const invert = (matrix: Matrix): Matrix | null => {
  const n = matrix.length;
  const work = matrix.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let column = 0; column < n; column++) {
    let pivot = column;
    for (let row = column + 1; row < n; row++) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
    }
    if (Math.abs(work[pivot][column]) < 1e-12) return null;
    [work[column], work[pivot]] = [work[pivot], work[column]];
    const divisor = work[column][column];
    for (let j = 0; j < 2 * n; j++) work[column][j] /= divisor;
    for (let row = 0; row < n; row++) {
      if (row === column) continue;
      const factor = work[row][column];
      for (let j = 0; j < 2 * n; j++) work[row][j] -= factor * work[column][j];
    }
  }
  return work.map(row => row.slice(n));
};

const solve = (matrix: Matrix, vector: number[]): number[] | null => {
  const inverse = invert(matrix);
  return inverse ? inverse.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0)) : null;
};

const multiply = (a: Matrix, b: Matrix): Matrix =>
  a.map(row => b[0].map((_, column) => row.reduce((sum, value, i) => sum + value * b[i][column], 0)));

const transpose = (matrix: Matrix): Matrix =>
  matrix[0].map((_, column) => matrix.map(row => row[column]));

const sigmoid = (value: number): number => 1 / (1 + Math.exp(-value));

const link = (eta: number, family: GeeOptions['family']): number =>
  family === 'gaussian' ? eta : sigmoid(eta);

const variance = (mu: number, family: GeeOptions['family']): number =>
  family === 'gaussian' ? 1 : Math.max(1e-10, mu * (1 - mu));

const derivative = (mu: number, family: GeeOptions['family']): number =>
  family === 'gaussian' ? 1 : Math.max(1e-10, mu * (1 - mu));

interface Prepared {
  X: Matrix;
  y: number[];
  clusters: number[][];
  n: number;
  p: number;
}

const prepare = (options: GeeOptions): Prepared | null => {
  const { rows, depIdx, indepIdxs, clusterIdx } = options;
  if (indepIdxs.length === 0) return null;
  const complete = rows
    .map(row => ({
      y: parseNum(row[depIdx]),
      xs: indepIdxs.map(index => parseNum(row[index])),
      cluster: String(row[clusterIdx] ?? '').trim(),
    }))
    .filter(entry => Number.isFinite(entry.y) && entry.xs.every(value => Number.isFinite(value)) && entry.cluster !== '');
  if (complete.length <= indepIdxs.length + 1) return null;
  const labels = Array.from(new Set(complete.map(entry => entry.cluster)));
  if (labels.length < 2) return null;
  const clusters = labels.map(label =>
    complete
      .map((entry, index) => ({ entry, index }))
      .filter(item => item.entry.cluster === label)
      .map(item => item.index)
  );
  return {
    X: complete.map(entry => [1, ...entry.xs]),
    y: complete.map(entry => entry.y),
    clusters,
    n: complete.length,
    p: indepIdxs.length + 1,
  };
};

const initialBeta = (data: Prepared, family: GeeOptions['family']): number[] | null => {
  if (family === 'gaussian') {
    const xtx = multiply(transpose(data.X), data.X);
    const xty = data.X[0].map((_, j) => data.X.reduce((sum, row, i) => sum + row[j] * data.y[i], 0));
    return solve(xtx, xty);
  }
  let beta = new Array<number>(data.p).fill(0);
  for (let iteration = 0; iteration < 50; iteration++) {
    const xtwx = Array.from({ length: data.p }, () => new Array<number>(data.p).fill(0));
    const xtwz = new Array<number>(data.p).fill(0);
    for (let i = 0; i < data.n; i++) {
      const eta = data.X[i].reduce((sum, value, j) => sum + value * beta[j], 0);
      const mu = sigmoid(eta);
      const weight = Math.max(1e-10, mu * (1 - mu));
      const z = eta + (data.y[i] - mu) / weight;
      for (let j = 0; j < data.p; j++) {
        xtwz[j] += data.X[i][j] * weight * z;
        for (let l = 0; l < data.p; l++) xtwx[j][l] += data.X[i][j] * weight * data.X[i][l];
      }
    }
    const next = solve(xtwx, xtwz);
    if (!next) return null;
    const change = Math.max(...next.map((value, index) => Math.abs(value - beta[index])));
    beta = next;
    if (change < 1e-8) break;
  }
  return beta;
};

const withinCorrelation = (
  data: Prepared,
  beta: number[],
  family: GeeOptions['family'],
  correlation: GeeOptions['correlation']
): { alpha: number; phi: number; fitted: number[]; residuals: number[] } => {
  const fitted = data.X.map(row => link(row.reduce((sum, value, j) => sum + value * beta[j], 0), family));
  const residuals = data.y.map((value, index) => value - fitted[index]);
  const pearson = data.y.map((value, index) => residuals[index] / Math.sqrt(variance(fitted[index], family)));
  const phi = family === 'gaussian'
    ? pearson.reduce((sum, value) => sum + value * value, 0) / Math.max(1, data.n - data.p)
    : 1;
  if (correlation === 'independence') return { alpha: 0, phi, fitted, residuals };

  let numerator = 0;
  let denominator = 0;
  for (const cluster of data.clusters) {
    for (let i = 0; i < cluster.length; i++) {
      for (let j = 0; j < cluster.length; j++) {
        if (i === j) continue;
        numerator += pearson[cluster[i]] * pearson[cluster[j]];
        denominator += 1;
      }
    }
  }
  const alpha = denominator > 0 ? Math.max(-0.2, Math.min(0.8, numerator / denominator / phi)) : 0;
  return { alpha, phi, fitted, residuals };
};

/** GEE con correlazione di lavoro independence o exchangeable. */
export const geeStats = (options: GeeOptions): GeeStats | null => {
  const data = prepare(options);
  if (!data) return null;
  let beta = initialBeta(data, options.family);
  if (!beta) return null;
  let alpha = 0;
  let phi = 1;
  let iterations = 0;

  for (let iteration = 0; iteration < 30; iteration++) {
    iterations = iteration + 1;
    const state = withinCorrelation(data, beta, options.family, options.correlation);
    alpha = state.alpha;
    phi = state.phi;

    const bread = Array.from({ length: data.p }, () => new Array<number>(data.p).fill(0));
    const score = new Array<number>(data.p).fill(0);
    for (const cluster of data.clusters) {
      const size = cluster.length;
      const a = cluster.map(index => Math.sqrt(variance(state.fitted[index], options.family)));
      const working = Array.from({ length: size }, (_, i) =>
        Array.from({ length: size }, (_, j) =>
          phi * a[i] * a[j] * (i === j ? 1 : alpha)
        )
      );
      const inverse = invert(working);
      if (!inverse) return null;
      const d = cluster.map(index => {
        const scale = derivative(state.fitted[index], options.family);
        return data.X[index].map(value => value * scale);
      });
      const workingResponse = cluster.map(index => {
        const derivativeValue = derivative(state.fitted[index], options.family);
        return (data.y[index] - state.fitted[index]) + derivativeValue *
          data.X[index].reduce((sum, value, j) => sum + value * beta[j], 0);
      });

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          for (let aIndex = 0; aIndex < data.p; aIndex++) {
            score[aIndex] += d[i][aIndex] * inverse[i][j] * workingResponse[j];
            for (let bIndex = 0; bIndex < data.p; bIndex++) {
              bread[aIndex][bIndex] += d[i][aIndex] * inverse[i][j] * d[j][bIndex];
            }
          }
        }
      }
    }

    const next = solve(bread, score);
    if (!next) return null;
    const change = Math.max(...next.map((value, index) => Math.abs(value - beta[index])));
    beta = next;
    if (change < 1e-8) break;
  }

  const state = withinCorrelation(data, beta, options.family, options.correlation);
  alpha = state.alpha;
  phi = state.phi;
  const bread = Array.from({ length: data.p }, () => new Array<number>(data.p).fill(0));
  const meat = Array.from({ length: data.p }, () => new Array<number>(data.p).fill(0));

  for (const cluster of data.clusters) {
    const size = cluster.length;
    const a = cluster.map(index => Math.sqrt(variance(state.fitted[index], options.family)));
    const working = Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => phi * a[i] * a[j] * (i === j ? 1 : alpha))
    );
    const inverse = invert(working);
    if (!inverse) return null;
    const d = cluster.map(index => {
      const scale = derivative(state.fitted[index], options.family);
      return data.X[index].map(value => value * scale);
    });
    const residual = cluster.map(index => data.y[index] - state.fitted[index]);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        for (let aIndex = 0; aIndex < data.p; aIndex++) {
          for (let bIndex = 0; bIndex < data.p; bIndex++) {
            bread[aIndex][bIndex] += d[i][aIndex] * inverse[i][j] * d[j][bIndex];
          }
        }
      }
    }
    // Cluster score = Σ D_i' V^-1 r_i
    const clusterScore = new Array<number>(data.p).fill(0);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        for (let aIndex = 0; aIndex < data.p; aIndex++) {
          clusterScore[aIndex] += d[i][aIndex] * inverse[i][j] * residual[j];
        }
      }
    }
    for (let aIndex = 0; aIndex < data.p; aIndex++) {
      for (let bIndex = 0; bIndex < data.p; bIndex++) {
        meat[aIndex][bIndex] += clusterScore[aIndex] * clusterScore[bIndex];
      }
    }
  }

  const breadInverse = invert(bread);
  if (!breadInverse) return null;
  const covariance = multiply(multiply(breadInverse, meat), breadInverse);
  const se = covariance.map((row, index) => Math.sqrt(Math.max(0, row[index])));
  const crit = tCrit(options.level, Math.max(1, data.n - data.p));
  const coefficients: GeeCoefficient[] = beta.map((value, index) => {
    const valueSe = se[index];
    const z = valueSe > 0 ? value / valueSe : NaN;
    return {
      term: index === 0 ? '(Intercept)' : `X${index}`,
      beta: value,
      se: valueSe,
      z,
      p: Number.isFinite(z) ? 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1)) : NaN,
      or: Math.exp(value),
      lo: Math.exp(value - crit * valueSe),
      hi: Math.exp(value + crit * valueSe),
    };
  });

  return {
    family: options.family,
    correlation: options.correlation,
    n: data.n,
    clusters: data.clusters.length,
    maxCluster: Math.max(...data.clusters.map(cluster => cluster.length)),
    phi,
    alpha,
    iterations,
    coefficients,
  };
};
