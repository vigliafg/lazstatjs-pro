import { jStat } from '../jstat';
import { parseNum } from '../core';
import type {
  ParametricCoefficient,
  ParametricSurvivalOptions,
  ParametricSurvivalStats,
} from '../parametric/types';

const EPS = 1e-12;

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

interface Prepared {
  times: number[];
  events: number[];
  X: number[][];
  n: number;
  k: number;
}

const prepare = (options: ParametricSurvivalOptions): Prepared | null => {
  const { rows, timeIdx, eventIdx, indepIdxs } = options;
  if (indepIdxs.length === 0) return null;
  const complete = rows
    .map(row => ({
      time: parseNum(row[timeIdx]),
      event: parseNum(row[eventIdx]),
      xs: indepIdxs.map(index => parseNum(row[index])),
    }))
    .filter(entry => entry.time > 0 && (entry.event === 0 || entry.event === 1) && entry.xs.every(value => Number.isFinite(value)));
  if (complete.length < indepIdxs.length + 3) return null;
  return {
    times: complete.map(entry => entry.time),
    events: complete.map(entry => entry.event),
    X: complete.map(entry => [...entry.xs]),
    n: complete.length,
    k: indepIdxs.length,
  };
};

const logLik = (
  parameters: number[],
  data: Prepared,
  weibull: boolean
): number => {
  const { times, events, X, n, k } = data;
  const mu = parameters[0];
  const beta = parameters.slice(1, k + 1);
  const logSigma = weibull ? parameters[k + 1] : 0;
  const sigma = Math.exp(logSigma);
  let total = 0;
  for (let i = 0; i < n; i++) {
    const eta = mu + X[i].reduce((sum, value, j) => sum + value * beta[j], 0);
    const logTime = Math.log(times[i]);
    const z = (logTime - eta) / sigma;
    const expZ = Math.exp(Math.min(50, z));
    total += events[i] === 1 ? -logSigma - logTime + z - expZ : -expZ;
  }
  return total;
};

const numericGradient = (parameters: number[], data: Prepared, weibull: boolean): number[] => {
  const step = 1e-5;
  return parameters.map((value, index) => {
    const plus = [...parameters];
    const minus = [...parameters];
    plus[index] += step;
    minus[index] -= step;
    return (logLik(plus, data, weibull) - logLik(minus, data, weibull)) / (2 * step);
  });
};

const numericHessian = (parameters: number[], data: Prepared, weibull: boolean): number[][] => {
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
      const value =
        (logLik(pp, data, weibull) - logLik(pm, data, weibull) - logLik(mp, data, weibull) + logLik(mm, data, weibull)) /
        (4 * step * step);
      hessian[i][j] = value;
      hessian[j][i] = value;
    }
  }
  return hessian;
};

/** Sopravvivenza parametrica Weibull o esponenziale (AFT). */
export const parametricSurvivalStats = (options: ParametricSurvivalOptions): ParametricSurvivalStats | null => {
  const data = prepare(options);
  if (!data) return null;
  const { n, k, events, times } = data;
  const weibull = options.distribution === 'weibull';
  const logTimes = times.map(value => Math.log(value));
  const meanLogTime = logTimes.reduce((sum, value) => sum + value, 0) / n;
  let parameters = [meanLogTime, ...new Array<number>(k).fill(0), ...(weibull ? [0] : [])];
  let current = logLik(parameters, data, weibull);
  const size = parameters.length;
  let inverseHessian: number[][] = Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );

  for (let iteration = 0; iteration < 200; iteration++) {
    const gradient = numericGradient(parameters, data, weibull);
    let direction = inverseHessian.map(row =>
      row.reduce((sum, value, index) => sum + value * gradient[index], 0)
    );
    if (direction.reduce((sum, value, index) => sum + value * gradient[index], 0) <= 0) {
      inverseHessian = Array.from({ length: size }, (_, i) =>
        Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
      );
      direction = gradient;
    }

    let scale = 1;
    let next = parameters.map((value, index) => value + scale * direction[index]);
    let nextLogLik = logLik(next, data, weibull);
    while (nextLogLik < current + 1e-4 * scale * gradient.reduce((sum, value, index) => sum + value * direction[index], 0) && scale > 1e-8) {
      scale /= 2;
      next = parameters.map((value, index) => value + scale * direction[index]);
      nextLogLik = logLik(next, data, weibull);
    }
    if (!Number.isFinite(nextLogLik) || nextLogLik < current) break;

    const s = next.map((value, index) => value - parameters[index]);
    const nextGradient = numericGradient(next, data, weibull);
    const y = nextGradient.map((value, index) => value - gradient[index]);
    const sy = s.reduce((sum, value, index) => sum + value * y[index], 0);
    if (sy > 1e-10) {
      const rho = 1 / sy;
      const identityMinus = (matrix: number[][]) =>
        matrix.map((row, i) =>
          row.map((value, j) => (i === j ? 1 : 0) - rho * s[i] * y[j])
        );
      const left = identityMinus(inverseHessian);
      const right = inverseHessian.map((row, i) =>
        row.map((value, j) => (i === j ? 1 : 0) - rho * y[i] * s[j])
      );
      const first = left.map(row =>
        row.reduce<number[]>((accumulator, value, index) => {
          const target = inverseHessian[index];
          return accumulator.map((entry, column) => entry + value * target[column]);
        }, new Array<number>(size).fill(0))
      );
      const updated = first.map((row, i) =>
        row.map((value, j) => value + rho * s[i] * s[j])
      );
      inverseHessian = updated;
    }

    const change = Math.max(...s.map(value => Math.abs(value)));
    parameters = next;
    current = nextLogLik;
    if (change < 1e-8) break;
  }

  const hessian = numericHessian(parameters, data, weibull);
  const covariance = invert(hessian.map((row, i) => row.map((value, j) => -value + (i === j ? 1e-8 : 0))));
  if (!covariance) return null;
  const se = covariance.map((row, index) => Math.sqrt(Math.max(0, row[index])));
  const mu = parameters[0];
  const beta = parameters.slice(1, k + 1);
  const sigma = weibull ? Math.exp(parameters[k + 1]) : 1;
  const crit = jStat.normal.inv(1 - (1 - options.level / 100) / 2, 0, 1);

  const coefficients: ParametricCoefficient[] = beta.map((value, index) => {
    const valueSe = se[index + 1];
    const z = valueSe > 0 ? value / valueSe : NaN;
    return {
      term: `X${index + 1}`,
      beta: value,
      se: valueSe,
      z,
      p: Number.isFinite(z) ? 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1)) : NaN,
      timeRatio: Math.exp(value),
      lo: Math.exp(value - crit * valueSe),
      hi: Math.exp(value + crit * valueSe),
    };
  });

  return {
    distribution: options.distribution,
    n,
    events: events.filter(value => value === 1).length,
    k,
    mu,
    sigma,
    logLik: current,
    aic: 2 * size - 2 * current,
    bic: size * Math.log(n) - 2 * current,
    coefficients,
  };
};
