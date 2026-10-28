import { jStat } from '../jstat';
import { parseNum } from '../core';
import { tCrit, twoSidedTP } from '../distributions';
import { eigenSymmetric } from '../linalg';
import { mulberry32 } from './distributions';
import type { MiCoefficient, MiOptions, MiRegression, MiStats, MiVariable } from '../mi/types';

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

const multiply = (a: Matrix, b: Matrix): Matrix =>
  a.map(row => b[0].map((_, column) => row.reduce((sum, value, i) => sum + value * b[i][column], 0)));

const transpose = (matrix: Matrix): Matrix =>
  matrix[0].map((_, column) => matrix.map(row => row[column]));

const normal = (rng: () => number): number => {
  const u = Math.max(1e-12, rng());
  const v = Math.max(1e-12, rng());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const normalVector = (size: number, rng: () => number): number[] =>
  Array.from({ length: size }, () => normal(rng));

const chiSquare = (df: number, rng: () => number): number => {
  let value = 0;
  for (let index = 0; index < Math.max(1, Math.round(df)); index++) {
    const draw = normal(rng);
    value += draw * draw;
  }
  return Math.max(1e-9, value);
};

interface Draw {
  beta: number[];
  variance: number;
}

const regressionDraw = (X: Matrix, y: number[], rng: () => number): Draw | null => {
  const n = y.length;
  const p = X[0].length;
  if (n <= p) return null;
  const xtx = multiply(transpose(X), X);
  const xty = X[0].map((_, j) => X.reduce((sum, row, i) => sum + row[j] * y[i], 0));
  const inverse = invert(xtx);
  if (!inverse) return null;
  const beta = inverse.map(row => row.reduce((sum, value, index) => sum + value * xty[index], 0));
  const residuals = y.map((value, i) => value - X[i].reduce((sum, entry, j) => sum + entry * beta[j], 0));
  const sse = residuals.reduce((sum, value) => sum + value * value, 0);
  const df = n - p;
  if (df <= 0) return null;
  const variance = sse / chiSquare(df, rng);
  const covariance = inverse.map(row => row.map(value => value * variance));
  const eig = eigenSymmetric(covariance);
  const z = normalVector(p, rng);
  const drawn = beta.map((value, i) =>
    value + eig.vectors[i].reduce(
      (sum, loading, j) => sum + loading * Math.sqrt(Math.max(0, eig.values[j])) * z[j],
      0
    )
  );
  return { beta: drawn, variance };
};

const imputeColumn = (
  data: (number | null)[][],
  column: number,
  variables: number[],
  rng: () => number
): void => {
  const rows = data.map((row, index) => ({ row, index })).filter(entry => entry.row[column] !== null);
  const predictors = variables.filter(index => index !== column);
  if (rows.length < predictors.length + 2) return;
  const X = rows.map(entry => [1, ...predictors.map(index => entry.row[index] as number)]);
  const y = rows.map(entry => entry.row[column] as number);
  const draw = regressionDraw(X, y, rng);
  if (!draw) return;
  data.forEach(row => {
    if (row[column] !== null) return;
    const eta = draw.beta[0] + predictors.reduce(
      (sum, index, position) => sum + draw.beta[position + 1] * (row[index] as number),
      0
    );
    row[column] = eta + normal(rng) * Math.sqrt(Math.max(1e-12, draw.variance));
  });
};

const pool = (estimates: number[], variances: number[], sampleVariances: number[], level: number): Omit<MiVariable, 'name' | 'observed' | 'missing'> => {
  const m = estimates.length;
  const mean = estimates.reduce((sum, value) => sum + value, 0) / m;
  const within = variances.reduce((sum, value) => sum + value, 0) / m;
  const between = estimates.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / Math.max(1, m - 1);
  const total = within + (1 + 1 / m) * between;
  const se = Math.sqrt(Math.max(0, total));
  const df = between > 1e-12
    ? Math.pow((within + (1 + 1 / m) * between), 2) /
      (Math.pow(within / m, 2) / Math.max(1, m - 1) + Math.pow((1 + 1 / m) * between, 2) / Math.max(1, m - 1))
    : m * 1000;
  const crit = tCrit(level, Math.max(1, df));
  const meanSampleVariance = sampleVariances.reduce((sum, value) => sum + value, 0) / m;
  const betweenSampleVariance = sampleVariances.reduce(
    (sum, value) => sum + Math.pow(value - meanSampleVariance, 2),
    0
  ) / Math.max(1, m - 1);
  const pooledVariance = meanSampleVariance + (1 + 1 / m) * betweenSampleVariance;
  return {
    mean,
    sd: Math.sqrt(Math.max(0, pooledVariance)),
    se,
    lo: mean - crit * se,
    hi: mean + crit * se,
    df,
    fmi: total > 0 ? (between + between / m) / total : 0,
  };
};

interface OlsFit {
  beta: number[];
  cov: number[][];
  r2: number;
}

const fitOls = (X: number[][], y: number[]): OlsFit | null => {
  const n = y.length;
  const p = X[0].length;
  if (n <= p) return null;
  const xtx = multiply(transpose(X), X);
  const xty = X[0].map((_, j) => X.reduce((sum, row, i) => sum + row[j] * y[i], 0));
  const inverse = invert(xtx);
  if (!inverse) return null;
  const beta = inverse.map(row => row.reduce((sum, value, index) => sum + value * xty[index], 0));
  const residuals = y.map((value, i) => value - X[i].reduce((sum, entry, j) => sum + entry * beta[j], 0));
  const sse = residuals.reduce((sum, value) => sum + value * value, 0);
  const meanY = y.reduce((sum, value) => sum + value, 0) / n;
  const sst = y.reduce((sum, value) => sum + Math.pow(value - meanY, 2), 0);
  const sigma2 = sse / (n - p);
  return {
    beta,
    cov: inverse.map(row => row.map(value => value * sigma2)),
    r2: sst > 0 ? 1 - sse / sst : NaN,
  };
};

const poolCoefficients = (
  estimates: number[][],
  variances: number[][],
  level: number
): MiCoefficient[] => {
  const m = estimates.length;
  const p = estimates[0]?.length ?? 0;
  return Array.from({ length: p }, (_, index) => {
    const values = estimates.map(row => row[index]);
    const mean = values.reduce((sum, value) => sum + value, 0) / m;
    const within = variances.reduce((sum, row) => sum + row[index], 0) / m;
    const between = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / Math.max(1, m - 1);
    const total = within + (1 + 1 / m) * between;
    const se = Math.sqrt(Math.max(0, total));
    const df = between > 1e-12
      ? Math.pow(total, 2) /
        (Math.pow(within / m, 2) / Math.max(1, m - 1) + Math.pow((1 + 1 / m) * between, 2) / Math.max(1, m - 1))
      : m * 1000;
    const t = se > 0 ? mean / se : NaN;
    const crit = tCrit(level, Math.max(1, df));
    return {
      term: index === 0 ? '(Intercept)' : `X${index}`,
      beta: mean,
      se,
      t,
      p: twoSidedTP(t, Math.max(1, df)),
      lo: mean - crit * se,
      hi: mean + crit * se,
      df,
      fmi: total > 0 ? (between + between / m) / total : 0,
    };
  });
};

/** Imputazione multipla (MICE numerica) con pooling di Rubin per media e SD. */
export const miStats = (options: MiOptions): MiStats | null => {
  const { rows, variables, level } = options;
  if (variables.length === 0) return null;
  const imputations = Math.max(2, Math.min(50, Math.round(options.imputations)));
  const iterations = Math.max(1, Math.min(50, Math.round(options.iterations)));
  const observed: (number | null)[][] = rows.map(row =>
    variables.map(index => {
      const value = parseNum(row[index]);
      return Number.isFinite(value) ? value : null;
    })
  );
  const observedCounts = variables.map((_, j) => observed.filter(row => row[j] !== null).length);
  if (observedCounts.some(count => count < 2)) return null;
  const missingCounts = variables.map((_, j) => rows.length - observedCounts[j]);
  const means = variables.map((_, j) => {
    const values = observed.map(row => row[j]).filter((value): value is number => value !== null);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  });

  const rng = mulberry32(20261028);
  const estimates: number[][] = variables.map(() => []);
  const variances: number[][] = variables.map(() => []);
  const sampleVariances: number[][] = variables.map(() => []);
  const regressionEstimates: number[][] = [];
  const regressionVariances: number[][] = [];
  const r2Values: number[] = [];
  const outcomePosition = options.model === 'linear' ? variables.indexOf(options.outcome) : -1;
  const predictorPositions = options.model === 'linear'
    ? options.predictors.map(index => variables.indexOf(index)).filter(index => index >= 0)
    : [];
  const withRegression = options.model === 'linear' && outcomePosition >= 0 && predictorPositions.length > 0;
  if (options.model === 'linear' && !withRegression) return null;

  for (let imputation = 0; imputation < imputations; imputation++) {
    const data = observed.map(row => row.map((value, j) => (value === null ? means[j] : value)));
    for (let iteration = 0; iteration < iterations; iteration++) {
      variables.forEach((_, j) => {
        if (missingCounts[j] > 0) imputeColumn(data, j, variables.map((__, index) => index), rng);
      });
    }
    variables.forEach((_, j) => {
      const values = data.map(row => row[j] as number);
      const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
      const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / Math.max(1, values.length - 1);
      estimates[j].push(mean);
      variances[j].push(variance / values.length);
      sampleVariances[j].push(variance);
    });

    if (withRegression) {
      const X = data.map(row => [1, ...predictorPositions.map(position => row[position] as number)]);
      const y = data.map(row => row[outcomePosition] as number);
      const fit = fitOls(X, y);
      if (fit) {
        regressionEstimates.push(fit.beta);
        regressionVariances.push(fit.cov.map((row, index) => row[index]));
        r2Values.push(fit.r2);
      }
    }
  }

  const variableRows: MiVariable[] = variables.map((index, j) => ({
    name: `V${index + 1}`,
    observed: observedCounts[j],
    missing: missingCounts[j],
    ...pool(estimates[j], variances[j], sampleVariances[j], level),
  }));

  const regression: MiRegression | null = withRegression && regressionEstimates.length > 0
    ? {
        n: rows.length,
        r2: r2Values.reduce((sum, value) => sum + value, 0) / r2Values.length,
        coefficients: poolCoefficients(regressionEstimates, regressionVariances, level),
      }
    : null;

  return { n: rows.length, imputations, iterations, variables: variableRows, regression };
};
