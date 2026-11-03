import { jStat } from '../jstat';
import { parseNum } from '../core';
import type {
  ParametricCoefficient,
  ParametricSurvivalOptions,
  ParametricSurvivalStats,
  SurvivalDistribution,
} from '../parametric/types';

const LOG_2PI = Math.log(2 * Math.PI);

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

interface Prepared {
  times: number[];
  upper: number[];
  exact: number[];
  X: number[][];
  n: number;
  k: number;
}

const isAft = (distribution: SurvivalDistribution): boolean => distribution !== 'gompertz';

const prepare = (options: ParametricSurvivalOptions): Prepared | null => {
  const { rows, timeIdx, eventIdx, indepIdxs, upperIdx } = options;
  if (indepIdxs.length === 0) return null;
  const interval = typeof upperIdx === 'number' && upperIdx >= 0;
  const complete = rows
    .map(row => {
      const time = parseNum(row[timeIdx]);
      const event = parseNum(row[eventIdx]);
      const upper = interval ? parseNum(row[upperIdx!]) : NaN;
      return {
        time,
        upper,
        exact: event === 1 ? 1 : 0,
        xs: indepIdxs.map(index => parseNum(row[index])),
      };
    })
    .filter(entry => {
      if (!(entry.time > 0) || entry.xs.some(value => !Number.isFinite(value))) return false;
      if (!interval) return entry.exact === 0 || entry.exact === 1;
      if (entry.exact === 1) return true;
      return Number.isFinite(entry.upper) && entry.upper > entry.time;
    });
  if (complete.length < indepIdxs.length + 3) return null;
  return {
    times: complete.map(entry => entry.time),
    upper: complete.map(entry => entry.upper),
    exact: complete.map(entry => entry.exact),
    X: complete.map(entry => [...entry.xs]),
    n: complete.length,
    k: indepIdxs.length,
  };
};

/** Linear predictor for a subject. */
const etaOf = (parameters: number[], data: Prepared, row: number, k: number): number => {
  let value = parameters[0];
  for (let column = 0; column < k; column++) value += data.X[row][column] * parameters[column + 1];
  return value;
};

/** log survival for the AFT families; `z` is the standardised log time. */
const aftLogSurvival = (distribution: SurvivalDistribution, z: number): number => {
  if (distribution === 'weibull' || distribution === 'exponential') {
    return -Math.exp(Math.min(50, z));
  }
  if (distribution === 'lognormal') {
    return Math.log(Math.max(1e-300, 1 - jStat.normal.cdf(z, 0, 1)));
  }
  return -Math.log(1 + Math.exp(Math.min(50, z)));
};

const logLik = (
  parameters: number[],
  data: Prepared,
  distribution: SurvivalDistribution
): number => {
  const { times, upper, exact, n, k } = data;
  if (!isAft(distribution)) {
    const gamma = Math.max(1e-12, parameters[k + 1]);
    let total = 0;
    for (let i = 0; i < n; i++) {
      const eta = etaOf(parameters, data, i, k);
      const hazardIntegral = (time: number): number => {
        const growth = Math.exp(Math.min(30, gamma * time)) - 1;
        return (Math.exp(eta) / gamma) * growth;
      };
      if (exact[i] === 1) {
        total += eta + gamma * times[i] - hazardIntegral(times[i]);
      } else if (Number.isFinite(upper[i]) && upper[i] > times[i]) {
        const cumulative = hazardIntegral(times[i]) - hazardIntegral(upper[i]);
        total += Math.log(Math.max(1e-300, 1 - Math.exp(-cumulative)));
      } else {
        total -= hazardIntegral(times[i]);
      }
    }
    return total;
  }

  const logSigma = distribution === 'exponential' ? 0 : parameters[k + 1];
  const sigma = Math.exp(logSigma);
  let total = 0;
  for (let i = 0; i < n; i++) {
    const eta = etaOf(parameters, data, i, k);
    const logTime = Math.log(times[i]);
    const z = (logTime - eta) / sigma;
    const densityLog = (time: number): number => {
      const value = (Math.log(time) - eta) / sigma;
      if (distribution === 'weibull' || distribution === 'exponential') {
        return -logSigma - Math.log(time) + value - Math.exp(Math.min(50, value));
      }
      if (distribution === 'lognormal') {
        return -logSigma - Math.log(time) - 0.5 * LOG_2PI - 0.5 * value * value;
      }
      return value - logSigma - Math.log(time) - 2 * Math.log(1 + Math.exp(Math.min(50, value)));
    };
    if (exact[i] === 1) {
      total += densityLog(times[i]);
    } else if (Number.isFinite(upper[i]) && upper[i] > times[i]) {
      const survivalLower = aftLogSurvival(distribution, z);
      const survivalUpper = aftLogSurvival(
        distribution,
        (Math.log(upper[i]) - eta) / sigma
      );
      const probability = Math.exp(survivalLower) - Math.exp(survivalUpper);
      total += Math.log(Math.max(1e-300, probability));
    } else {
      total += aftLogSurvival(distribution, z);
    }
  }
  return total;
};

const numericGradient = (
  parameters: number[],
  data: Prepared,
  distribution: SurvivalDistribution
): number[] => {
  const step = 1e-5;
  return parameters.map((_, index) => {
    const plus = [...parameters];
    const minus = [...parameters];
    plus[index] += step;
    minus[index] -= step;
    return (logLik(plus, data, distribution) - logLik(minus, data, distribution)) / (2 * step);
  });
};

const numericHessian = (
  parameters: number[],
  data: Prepared,
  distribution: SurvivalDistribution
): number[][] => {
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
        (logLik(pp, data, distribution) - logLik(pm, data, distribution) -
          logLik(mp, data, distribution) + logLik(mm, data, distribution)) /
        (4 * step * step);
      hessian[i][j] = value;
      hessian[j][i] = value;
    }
  }
  return hessian;
};

const initialValues = (
  data: Prepared,
  distribution: SurvivalDistribution
): number[] => {
  const { n, k, times } = data;
  if (!isAft(distribution)) {
    const totalTime = times.reduce((sum, value) => sum + value, 0);
    const events = data.exact.reduce((sum, value) => sum + value, 0);
    const rate = Math.max(1e-6, events / Math.max(1, totalTime));
    const sorted = times.slice().sort((left, right) => left - right);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 1;
    // The growth rate is optimised on its natural scale: a log parameter has
    // a stationary point at zero that traps the optimiser in the exponential
    // sub-model.
    return [Math.log(rate), ...new Array<number>(k).fill(0), 1 / Math.max(1, median)];
  }
  const logTimes = times.map(value => Math.log(value));
  const mean = logTimes.reduce((sum, value) => sum + value, 0) / n;
  const variance =
    logTimes.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / Math.max(1, n - 1);
  const logSigma = Math.log(Math.max(1e-3, Math.sqrt(variance)));
  return [
    mean,
    ...new Array<number>(k).fill(0),
    ...(distribution === 'exponential' ? [] : [logSigma]),
  ];
};

/** Maximum likelihood for AFT families and Gompertz proportional hazards. */
export const parametricSurvivalStats = (
  options: ParametricSurvivalOptions
): ParametricSurvivalStats | null => {
  const prepared = prepare(options);
  if (!prepared) return null;
  const { n, k, exact } = prepared;
  // Standardise the design so the optimiser is not dominated by the scale of
  // age-like covariates; coefficients are transformed back at the end.
  const means = Array.from({ length: k }, (_, column) =>
    prepared.X.reduce((sum, row) => sum + row[column], 0) / Math.max(1, prepared.n)
  );
  const scales = Array.from({ length: k }, (_, column) => {
    const variance =
      prepared.X.reduce((sum, row) => sum + Math.pow(row[column] - means[column], 2), 0) /
      Math.max(1, prepared.n - 1);
    const sd = Math.sqrt(variance);
    return sd > 1e-12 ? sd : 1;
  });
  const data: Prepared = {
    ...prepared,
    X: prepared.X.map(row => row.map((value, column) => (value - means[column]) / scales[column])),
  };
  const distribution = options.distribution;
  const aft = isAft(distribution);
  const parameterCount = k + (aft ? (distribution === 'exponential' ? 1 : 2) : 2);
  let parameters = initialValues(data, distribution);
  let current = logLik(parameters, data, distribution);
  const size = parameters.length;

  for (let iteration = 0; iteration < 150; iteration++) {
    const gradient = numericGradient(parameters, data, distribution);
    if (Math.sqrt(gradient.reduce((sum, value) => sum + value * value, 0)) < 1e-7) break;

    // Damped Newton step: invert the negative Hessian, adding a ridge when it
    // is not positive definite. This is more stable than BFGS when covariates
    // differ in scale or the likelihood is nearly flat.
    const hessian = numericHessian(parameters, data, distribution);
    let ridge = 1e-8;
    let inverse: number[][] | null = null;
    for (let attempt = 0; attempt < 8; attempt++) {
      inverse = invert(
        hessian.map((row, i) =>
          row.map((value, j) => -value + (i === j ? ridge : 0))
        )
      );
      if (inverse) break;
      ridge *= 10;
    }
    let direction = inverse
      ? inverse.map(row => row.reduce((sum, value, index) => sum + value * gradient[index], 0))
      : gradient.slice();
    if (direction.reduce((sum, value, index) => sum + value * gradient[index], 0) <= 0) {
      direction = gradient.slice();
    }
    const directionNorm = Math.sqrt(direction.reduce((sum, value) => sum + value * value, 0));
    if (directionNorm > 2) direction = direction.map(value => (value / directionNorm) * 2);

    let scale = 1;
    let next = parameters.map((value, index) => value + scale * direction[index]);
    let nextLogLik = logLik(next, data, distribution);
    while (
      (!Number.isFinite(nextLogLik) ||
        nextLogLik <
          current + 1e-4 * scale * gradient.reduce((sum, value, index) => sum + value * direction[index], 0)) &&
      scale > 1e-10
    ) {
      scale /= 2;
      next = parameters.map((value, index) => value + scale * direction[index]);
      nextLogLik = logLik(next, data, distribution);
    }
    if (!Number.isFinite(nextLogLik) || nextLogLik < current) break;

    const change = Math.max(...next.map((value, index) => Math.abs(value - parameters[index])));
    parameters = next;
    current = nextLogLik;
    if (change < 1e-10) break;
  }

  const hessian = numericHessian(parameters, data, distribution);
  const covariance = invert(
    hessian.map((row, i) => row.map((value, j) => -value + (i === j ? 1e-8 : 0)))
  );
  if (!covariance) return null;
  const se = covariance.map((row, index) => Math.sqrt(Math.max(0, row[index])));
  const crit = jStat.normal.inv(1 - (1 - options.level / 100) / 2, 0, 1);
  const beta = Array.from({ length: k }, (_, index) => parameters[index + 1] / scales[index]);
  const betaSe = Array.from({ length: k }, (_, index) => se[index + 1] / scales[index]);
  const intercept = parameters[0] - beta.reduce((sum, value, index) => sum + value * means[index], 0);

  const coefficients: ParametricCoefficient[] = Array.from({ length: k }, (_, index) => {
    const value = beta[index];
    const valueSe = betaSe[index];
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

  const mu = intercept;
  const sigma = aft
    ? distribution === 'exponential'
      ? 1
      : Math.exp(parameters[k + 1])
    : Math.max(1e-12, parameters[k + 1]);

  return {
    distribution,
    parameterization: aft ? 'aft' : 'ph',
    n,
    events: exact.filter(value => value === 1).length,
    k,
    mu,
    sigma,
    logLik: current,
    aic: 2 * parameterCount - 2 * current,
    bic: parameterCount * Math.log(n) - 2 * current,
    coefficients,
  };
};
