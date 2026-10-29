import { jStat } from '../jstat';
import { parseNum } from '../core';
import { chi2SF } from '../distributions';
import type {
  OrdinalCoefficient,
  OrdinalOptions,
  OrdinalStats,
  OrdinalThreshold,
} from '../ordinal/types';

const EPS = 1e-12;

const sigmoid = (value: number): number => {
  if (value >= 0) {
    const exp = Math.exp(-value);
    return 1 / (1 + exp);
  }
  const exp = Math.exp(value);
  return exp / (1 + exp);
};

const invert = (matrix: number[][]): number[][] | null => {
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

const solve = (matrix: number[][], vector: number[]): number[] | null => {
  const inverse = invert(matrix);
  return inverse ? inverse.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0)) : null;
};

interface Data {
  X: number[][];
  y: number[];
  categories: string[];
  n: number;
  k: number;
}

const prepare = (options: OrdinalOptions): Data | null => {
  const { rows, depIdx, indepIdxs } = options;
  if (indepIdxs.length === 0) return null;
  const complete = rows
    .map(row => ({
      label: String(row[depIdx] ?? '').trim(),
      xs: indepIdxs.map(index => parseNum(row[index])),
    }))
    .filter(entry => entry.label !== '' && entry.xs.every(value => Number.isFinite(value)));
  if (complete.length < 5) return null;
  const categories = Array.from(new Set(complete.map(entry => entry.label))).sort();
  if (categories.length < 3) return null;
  const indexOf = new Map(categories.map((label, index) => [label, index]));
  return {
    X: complete.map(entry => [...entry.xs]),
    y: complete.map(entry => indexOf.get(entry.label)!),
    categories,
    n: complete.length,
    k: indepIdxs.length,
  };
};

const unpack = (parameters: number[], categories: number, k: number) => {
  const beta = parameters.slice(0, k);
  const tau = parameters.slice(k);
  const alpha = [tau[0]];
  for (let index = 1; index < categories - 1; index++) {
    alpha.push(alpha[index - 1] + Math.exp(tau[index]));
  }
  return { beta, alpha };
};

const logLik = (parameters: number[], data: Data): number => {
  const { X, y, categories, n, k } = data;
  const { beta, alpha } = unpack(parameters, categories.length, k);
  let total = 0;
  for (let i = 0; i < n; i++) {
    const eta = X[i].reduce((sum, value, j) => sum + value * beta[j], 0);
    const category = y[i];
    const upper = category === categories.length - 1 ? 1 : sigmoid(alpha[category] - eta);
    const lower = category === 0 ? 0 : sigmoid(alpha[category - 1] - eta);
    const probability = Math.max(EPS, upper - lower);
    total += Math.log(probability);
  }
  return total;
};

const numericGradient = (parameters: number[], data: Data): number[] => {
  const step = 1e-5;
  return parameters.map((value, index) => {
    const plus = [...parameters];
    const minus = [...parameters];
    plus[index] += step;
    minus[index] -= step;
    return (logLik(plus, data) - logLik(minus, data)) / (2 * step);
  });
};

const numericHessian = (parameters: number[], data: Data): number[][] => {
  const step = 1e-4;
  const size = parameters.length;
  const hessian = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  for (let i = 0; i < size; i++) {
    for (let j = i; j < size; j++) {
      const pp = [...parameters];
      const pm = [...parameters];
      const mp = [...parameters];
      const mm = [...parameters];
      pp[i] += step; pp[j] += step;
      pm[i] += step; pm[j] -= step;
      mp[i] -= step; mp[j] += step;
      mm[i] -= step; mm[j] -= step;
      const value = (logLik(pp, data) - logLik(pm, data) - logLik(mp, data) + logLik(mm, data)) / (4 * step * step);
      hessian[i][j] = value;
      hessian[j][i] = value;
    }
  }
  return hessian;
};

/** Regressione logistica ordinale a odds proporzionali (link logit). */
export const ordinalStats = (options: OrdinalOptions): OrdinalStats | null => {
  const data = prepare(options);
  if (!data) return null;
  const { categories, n, k } = data;
  const thresholds = categories.length - 1;

  const counts = new Array<number>(categories.length).fill(0);
  data.y.forEach(value => {
    counts[value] += 1;
  });
  const cumulative: number[] = [];
  let running = 0;
  for (let index = 0; index < thresholds; index++) {
    running += counts[index];
    const proportion = Math.min(1 - 1e-6, Math.max(1e-6, running / n));
    cumulative.push(Math.log(proportion / (1 - proportion)));
  }

  let parameters = [
    ...new Array<number>(k).fill(0),
    cumulative[0],
    ...cumulative.slice(1).map((value, index) => Math.log(Math.max(0.05, value - cumulative[index]))),
  ];
  let current = logLik(parameters, data);
  const size = k + thresholds;

  for (let iteration = 0; iteration < 100; iteration++) {
    const gradient = numericGradient(parameters, data);
    const hessian = numericHessian(parameters, data);
    const negative = hessian.map((row, i) => row.map((value, j) => -value + (i === j ? 1e-8 : 0)));
    const step = solve(negative, gradient);
    if (!step) break;
    let scale = 1;
    let next = parameters.map((value, index) => value + scale * step[index]);
    let nextLogLik = logLik(next, data);
    while (nextLogLik < current && scale > 1e-6) {
      scale /= 2;
      next = parameters.map((value, index) => value + scale * step[index]);
      nextLogLik = logLik(next, data);
    }
    if (!Number.isFinite(nextLogLik) || nextLogLik < current) break;
    const change = Math.max(...next.map((value, index) => Math.abs(value - parameters[index])));
    parameters = next;
    current = nextLogLik;
    if (change < 1e-8) break;
  }

  const hessian = numericHessian(parameters, data);
  const covariance = invert(hessian.map((row, i) => row.map((value, j) => -value + (i === j ? 1e-8 : 0))));
  if (!covariance) return null;
  const se = covariance.map((row, index) => Math.sqrt(Math.max(0, row[index])));
  const { beta, alpha } = unpack(parameters, categories.length, k);
  const categoryProbability = (eta: number, category: number): number => {
    const upper = category === categories.length - 1 ? 1 : sigmoid(alpha[category] - eta);
    const lower = category === 0 ? 0 : sigmoid(alpha[category - 1] - eta);
    return Math.max(0, upper - lower);
  };
  const columnMeans = data.X[0].map((_, column) =>
    data.X.reduce((sum, row) => sum + row[column], 0) / data.X.length
  );
  const firstValues = data.X.map(row => row[0]);
  const firstMin = Math.min(...firstValues);
  const firstMax = Math.max(...firstValues);
  const profile = Array.from({ length: 40 }, (_, index) => {
    const x = firstMax === firstMin ? firstMin : firstMin + ((firstMax - firstMin) * index) / 39;
    const row = columnMeans.map((mean, column) => (column === 0 ? x : mean));
    const eta = row.reduce((sum, value, column) => sum + value * beta[column], 0);
    return {
      x,
      probabilities: categories.map((_, category) => categoryProbability(eta, category)),
    };
  });

  const nullTau = [cumulative[0], ...cumulative.slice(1).map((value, index) => Math.log(Math.max(0.05, value - cumulative[index])) )];
  const logLikNull = logLik([...new Array<number>(k).fill(0), ...nullTau], data);
  const lr = Math.max(0, 2 * (current - logLikNull));
  const crit = jStat.normal.inv(1 - (1 - options.level / 100) / 2, 0, 1);

  const coefficients: OrdinalCoefficient[] = beta.map((value, index) => {
    const valueSe = se[index];
    const z = valueSe > 0 ? value / valueSe : NaN;
    return {
      term: `X${index + 1}`,
      beta: value,
      se: valueSe,
      z,
      p: Number.isFinite(z) ? 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1)) : NaN,
      or: Math.exp(value),
      lo: Math.exp(value - crit * valueSe),
      hi: Math.exp(value + crit * valueSe),
    };
  });

  const tau = parameters.slice(k);
  const thresholdRows: OrdinalThreshold[] = alpha.map((value, index) => {
    const derivative = new Array<number>(size).fill(0);
    derivative[k] = 1;
    for (let increment = 1; increment <= index; increment++) {
      derivative[k + increment] = Math.exp(tau[increment]);
    }
    const variance = derivative.reduce(
      (sum, left, row) =>
        sum + left * derivative.reduce((inner, right, column) => inner + covariance[row][column] * right, 0),
      0
    );
    const valueSe = Math.sqrt(Math.max(0, variance));
    return {
      index: index + 1,
      alpha: value,
      se: valueSe,
      lo: value - crit * valueSe,
      hi: value + crit * valueSe,
    };
  });

  return {
    n,
    categories,
    k,
    logLik: current,
    logLikNull,
    lr,
    lrP: chi2SF(lr, k),
    aic: 2 * size - 2 * current,
    bic: size * Math.log(n) - 2 * current,
    mcfadden: 1 - current / logLikNull,
    coefficients,
    thresholds: thresholdRows,
    profile,
  };
};
