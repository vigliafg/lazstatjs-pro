import { zCrit, chi2SF } from '../distributions';
import { minimize } from './minimize';

/**
 * State-space models: a Gaussian local level/linear trend estimated with the
 * Kalman filter and RTS smoother, and a two-regime Markov-switching AR(1)
 * estimated with the Hamilton filter and Kim smoother.
 */

export type StateSpaceMode = 'local' | 'markov';

export interface StateSpaceOptions {
  values: number[];
  mode?: StateSpaceMode;
  horizon?: number;
  level?: number;
  /** Local model: include a stochastic trend component. */
  trend?: boolean;
}

export interface KalmanPoint {
  t: number;
  observed: number;
  level: number;
  trend: number;
  filteredLevel: number;
  smoothedLevel: number;
  residual: number;
}

export interface StateSpaceForecast {
  step: number;
  mean: number;
  se: number;
  lo: number;
  hi: number;
}

export interface LocalStateSpaceFit {
  mode: 'local';
  trend: boolean;
  n: number;
  observationVariance: number;
  levelVariance: number;
  trendVariance: number;
  logLik: number;
  aic: number;
  bic: number;
  points: KalmanPoint[];
  forecast: StateSpaceForecast[];
  residuals: number[];
  standardized: number[];
  ljungBox: { q: number; df: number; p: number };
  converged: boolean;
}

export interface MarkovStateSpaceFit {
  mode: 'markov';
  n: number;
  means: [number, number];
  variances: [number, number];
  autoregressive: number;
  transition: [[number, number], [number, number]];
  stationary: [number, number];
  expectedDuration: [number, number];
  logLik: number;
  aic: number;
  bic: number;
  filtered: number[][];
  smoothed: number[][];
  classification: number[];
  forecast: StateSpaceForecast[];
  residuals: number[];
  ljungBox: { q: number; df: number; p: number };
  converged: boolean;
}

export type StateSpaceFit = LocalStateSpaceFit | MarkovStateSpaceFit;

// ---------------------------------------------------------------------------
// Small matrix helpers (dimension 1 or 2)
// ---------------------------------------------------------------------------

type Matrix = number[][];

const multiply = (left: Matrix, right: Matrix): Matrix => {
  const rows = left.length;
  const inner = right.length;
  const columns = right[0]?.length ?? 0;
  const out = Array.from({ length: rows }, () => new Array<number>(columns).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      let sum = 0;
      for (let k = 0; k < inner; k++) sum += left[i][k] * right[k][j];
      out[i][j] = sum;
    }
  }
  return out;
};

const transpose = (matrix: Matrix): Matrix => matrix[0].map((_, column) => matrix.map(row => row[column]));

const inverse2 = (matrix: Matrix): Matrix | null => {
  if (matrix.length === 1) return matrix[0][0] > 0 ? [[1 / matrix[0][0]]] : null;
  const determinant = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  if (Math.abs(determinant) < 1e-18) return null;
  return [
    [matrix[1][1] / determinant, -matrix[0][1] / determinant],
    [-matrix[1][0] / determinant, matrix[0][0] / determinant],
  ];
};

const add = (left: Matrix, right: Matrix): Matrix =>
  left.map((row, i) => row.map((value, j) => value + right[i][j]));

const subtract = (left: Matrix, right: Matrix): Matrix =>
  left.map((row, i) => row.map((value, j) => value - right[i][j]));

const identity = (size: number): Matrix =>
  Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, j) => (i === j ? 1 : 0)));

// ---------------------------------------------------------------------------
// Local level / linear trend
// ---------------------------------------------------------------------------

interface LocalParameters {
  observation: number;
  level: number;
  trend: number;
}

interface LocalFilterResult {
  logLik: number;
  filtered: { a: number[]; P: Matrix }[];
  predicted: Matrix[];
  residuals: number[];
  variances: number[];
}

const transitionMatrix = (trend: boolean): Matrix =>
  trend
    ? [
        [1, 1],
        [0, 1],
      ]
    : [[1]];

const stateVariance = (parameters: LocalParameters, trend: boolean): Matrix =>
  trend
    ? [
        [parameters.level, 0],
        [0, parameters.trend],
      ]
    : [[parameters.level]];

const localFilter = (
  values: number[],
  parameters: LocalParameters,
  trend: boolean
): LocalFilterResult | null => {
  const dimension = trend ? 2 : 1;
  const T = transitionMatrix(trend);
  const Q = stateVariance(parameters, trend);
  const Z = trend ? [[1, 0]] : [[1]];
  const H = [[parameters.observation]];
  let a = trend ? [values[0], 0] : [values[0]];
  let P = identity(dimension).map(row => row.map(value => value * parameters.observation * 1e3));
  const filtered: { a: number[]; P: Matrix }[] = [];
  const predicted: Matrix[] = [];
  const residuals: number[] = [];
  const variances: number[] = [];
  let logLik = 0;

  for (let index = 0; index < values.length; index++) {
    if (index > 0) {
      a = multiply(T, a.map(value => [value])).map(row => row[0]);
      P = add(multiply(multiply(T, P), transpose(T)), Q);
    }
    predicted.push(P.map(row => row.slice()));
    const forecast = multiply(Z, a.map(value => [value]))[0][0];
    const F = multiply(multiply(Z, P), transpose(Z))[0][0] + H[0][0];
    const residual = values[index] - forecast;
    if (!(F > 0) || !Number.isFinite(F)) return null;
    residuals.push(residual);
    variances.push(F);
    if (index > 0) logLik += -0.5 * (Math.log(2 * Math.PI) + Math.log(F) + (residual * residual) / F);
    const PZT = multiply(P, transpose(Z));
    const gain = PZT.map(row => row.map(value => value / F));
    a = a.map((value, i) => value + gain[i][0] * residual);
    P = subtract(P, multiply(gain, multiply(Z, P)));
    filtered.push({ a: a.slice(), P: P.map(row => row.slice()) });
  }
  return { logLik, filtered, predicted, residuals, variances };
};

const localSmoother = (
  filtered: { a: number[]; P: Matrix }[],
  predicted: Matrix[],
  trend: boolean
): { a: Matrix; P: Matrix[] } => {
  const T = transitionMatrix(trend);
  const n = filtered.length;
  const a = Array.from({ length: n }, () => new Array<number>(trend ? 2 : 1).fill(0));
  const P = Array.from({ length: n }, () => identity(trend ? 2 : 1));
  a[n - 1] = filtered[n - 1].a.slice();
  P[n - 1] = filtered[n - 1].P.map(row => row.slice());
  for (let index = n - 2; index >= 0; index--) {
    const nextPredicted = predicted[index + 1];
    const inverse = inverse2(nextPredicted);
    if (!inverse) {
      a[index] = filtered[index].a.slice();
      P[index] = filtered[index].P.map(row => row.slice());
      continue;
    }
    const J = multiply(multiply(filtered[index].P, transpose(T)), inverse);
    const difference = a[index + 1].map((value, i) => value - multiply(T, filtered[index].a.map(v => [v]))[i][0]);
    a[index] = filtered[index].a.map((value, i) => value + multiply(J, difference.map(v => [v]))[i][0]);
    P[index] = add(filtered[index].P, multiply(multiply(J, subtract(P[index + 1], nextPredicted)), transpose(J)));
  }
  return { a, P };
};

/** Exposed for the reference test: log likelihood at fixed variance parameters. */
export const localStateSpaceLogLik = (
  values: number[],
  observation: number,
  level: number,
  trend: number,
  withTrend = true
): number => {
  const result = localFilter(values, { observation, level, trend }, withTrend);
  return result && Number.isFinite(result.logLik) ? result.logLik : NaN;
};

export const fitLocalStateSpace = (options: StateSpaceOptions): LocalStateSpaceFit | null => {
  const values = options.values.filter(value => Number.isFinite(value));
  const n = values.length;
  if (n < 10) return null;
  const trend = options.trend ?? true;
  const sampleVariance = values.reduce((sum, value) => {
    const mean = values.reduce((s, v) => s + v, 0) / n;
    return sum + (value - mean) * (value - mean);
  }, 0) / (n - 1);
  if (!(sampleVariance > 0)) return null;

  const decode = (parameters: number[]): LocalParameters => ({
    observation: Math.exp(parameters[0]),
    level: Math.exp(parameters[1]),
    trend: trend ? Math.exp(parameters[2]) : 0,
  });
  const negativeLogLik = (parameters: number[]): number => {
    if (parameters.some(value => !Number.isFinite(value) || value > 30)) return 1e15;
    const result = localFilter(values, decode(parameters), trend);
    return result && Number.isFinite(result.logLik) ? -result.logLik : 1e15;
  };

  const starts = [
    [Math.log(sampleVariance * 0.2), Math.log(sampleVariance * 0.01), Math.log(sampleVariance * 0.001)],
    [Math.log(sampleVariance * 0.5), Math.log(sampleVariance * 0.05), Math.log(sampleVariance * 0.005)],
  ];
  const best = minimize(negativeLogLik, starts, 600);
  const parameters = decode(best.x);
  const filtered = localFilter(values, parameters, trend);
  if (!filtered) return null;
  const smoothed = localSmoother(filtered.filtered, filtered.predicted, trend);

  const points: KalmanPoint[] = values.map((value, index) => ({
    t: index + 1,
    observed: value,
    level: smoothed.a[index][0],
    trend: trend ? smoothed.a[index][1] : 0,
    filteredLevel: filtered.filtered[index].a[0],
    smoothedLevel: smoothed.a[index][0],
    residual: filtered.residuals[index],
  }));

  const critical = zCrit(options.level ?? 95);
  const horizon = Math.max(1, Math.min(40, Math.floor(options.horizon ?? 10)));
  const T = transitionMatrix(trend);
  const Q = stateVariance(parameters, trend);
  const Z = trend ? [[1, 0]] : [[1]];
  let a = smoothed.a[n - 1].slice();
  let P = smoothed.P[n - 1].map(row => row.slice());
  const forecast: StateSpaceForecast[] = [];
  for (let step = 1; step <= horizon; step++) {
    a = multiply(T, a.map(value => [value])).map(row => row[0]);
    P = add(multiply(multiply(T, P), transpose(T)), Q);
    const mean = multiply(Z, a.map(value => [value]))[0][0];
    const variance = multiply(multiply(Z, P), transpose(Z))[0][0] + parameters.observation;
    const se = Math.sqrt(Math.max(variance, 0));
    forecast.push({
      step: n + step,
      mean,
      se,
      lo: mean - critical * se,
      hi: mean + critical * se,
    });
  }

  const residuals = filtered.residuals.slice(1);
  const standardized = residuals.map((value, index) => value / Math.sqrt(filtered.variances[index + 1]));
  const k = trend ? 4 : 3;
  const logLik = filtered.logLik;
  const aic = -2 * logLik + 2 * k;
  const bic = -2 * logLik + Math.log(n) * k;
  return {
    mode: 'local',
    trend,
    n,
    observationVariance: parameters.observation,
    levelVariance: parameters.level,
    trendVariance: parameters.trend,
    logLik,
    aic,
    bic,
    points,
    forecast,
    residuals,
    standardized,
    ljungBox: ljungBoxTest(standardized),
    converged: best.converged,
  };
};

// ---------------------------------------------------------------------------
// Markov switching AR(1)
// ---------------------------------------------------------------------------

interface MarkovParameters {
  means: [number, number];
  variances: [number, number];
  phi: number;
  transition: [[number, number], [number, number]];
}

const stationaryDistribution = (transition: [[number, number], [number, number]]): [number, number] => {
  const p11 = transition[0][0];
  const p22 = transition[1][1];
  const denominator = 2 - p11 - p22;
  const first = denominator > 0 ? (1 - p22) / denominator : 0.5;
  return [first, 1 - first];
};

interface MarkovFilterResult {
  logLik: number;
  filtered: number[][];
  predicted: number[][];
  transition: [[number, number], [number, number]];
}

const normalDensity = (value: number, mean: number, variance: number): number =>
  variance > 0 ? Math.exp(-0.5 * ((value - mean) * (value - mean)) / variance) / Math.sqrt(2 * Math.PI * variance) : 0;

const markovFilter = (values: number[], parameters: MarkovParameters): MarkovFilterResult | null => {
  const n = values.length;
  if (n < 3) return null;
  const transition = parameters.transition;
  let state = stationaryDistribution(transition);
  const filtered: number[][] = [];
  const predicted: number[][] = [];
  const contributions: number[] = [];
  let logLik = 0;
  for (let index = 1; index < n; index++) {
    const forecastMean = [parameters.means[0] + parameters.phi * values[index - 1], parameters.means[1] + parameters.phi * values[index - 1]];
    const predictedState: [number, number] = [
      state[0] * transition[0][0] + state[1] * transition[1][0],
      state[0] * transition[0][1] + state[1] * transition[1][1],
    ];
    const density = [0, 1].map(regime =>
      normalDensity(values[index], forecastMean[regime], parameters.variances[regime])
    );
    const joint = [predictedState[0] * density[0], predictedState[1] * density[1]];
    const total = joint[0] + joint[1];
    if (!(total > 0) || !Number.isFinite(total)) return null;
    logLik += Math.log(total);
    predicted.push([...predictedState]);
    state = [joint[0] / total, joint[1] / total];
    filtered.push([...state]);
    contributions.push(total);
  }
  void contributions;
  return { logLik, filtered, predicted, transition };
};

const kimSmoother = (filtered: number[][], predicted: number[][], transition: [[number, number], [number, number]]): number[][] => {
  const n = filtered.length;
  const smoothed: number[][] = Array.from({ length: n }, () => [0, 0]);
  smoothed[n - 1] = filtered[n - 1].slice();
  for (let index = n - 2; index >= 0; index--) {
    for (let regime = 0; regime < 2; regime++) {
      let sum = 0;
      for (let next = 0; next < 2; next++) {
        const predictedNext = predicted[index + 1][next];
        if (predictedNext > 0) sum += transition[regime][next] * smoothed[index + 1][next] / predictedNext;
      }
      smoothed[index][regime] = filtered[index][regime] * sum;
    }
    const total = smoothed[index][0] + smoothed[index][1];
    if (total > 0) smoothed[index] = smoothed[index].map(value => value / total);
  }
  return smoothed;
};

export const fitMarkovStateSpace = (options: StateSpaceOptions): MarkovStateSpaceFit | null => {
  const values = options.values.filter(value => Number.isFinite(value));
  const n = values.length;
  if (n < 20) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  const variance = values.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) / (n - 1);
  if (!(variance > 0)) return null;

  const decode = (parameters: number[]): MarkovParameters => ({
    means: [parameters[0], parameters[1]],
    phi: Math.tanh(parameters[2]),
    variances: [Math.exp(parameters[3]), Math.exp(parameters[4])],
    transition: [
      [1 / (1 + Math.exp(-parameters[5])), 1 - 1 / (1 + Math.exp(-parameters[5]))],
      [1 - 1 / (1 + Math.exp(-parameters[6])), 1 / (1 + Math.exp(-parameters[6]))],
    ],
  });
  const negativeLogLik = (parameters: number[]): number => {
    if (parameters.some(value => !Number.isFinite(value) || Math.abs(value) > 30)) return 1e15;
    const result = markovFilter(values, decode(parameters));
    return result && Number.isFinite(result.logLik) ? -result.logLik : 1e15;
  };

  const low = mean - Math.sqrt(variance) * 0.5;
  const high = mean + Math.sqrt(variance) * 0.5;
  const starts = [
    [low, high, 0.3, Math.log(variance * 0.5), Math.log(variance * 1.5), 2.2, 2.2],
    [high, low, 0.1, Math.log(variance * 1.5), Math.log(variance * 0.5), 1.5, 2.5],
    [mean - Math.sqrt(variance), mean + Math.sqrt(variance), 0.5, Math.log(variance * 0.3), Math.log(variance * 2), 2.5, 1.5],
  ];
  const best = minimize(negativeLogLik, starts, 2000);
  const parameters = decode(best.x);
  const filtered = markovFilter(values, parameters);
  if (!filtered) return null;
  const smoothed = kimSmoother(filtered.filtered, filtered.predicted, filtered.transition);
  const classification = smoothed.map(probabilities => (probabilities[0] >= probabilities[1] ? 0 : 1));

  const critical = zCrit(options.level ?? 95);
  const horizon = Math.max(1, Math.min(40, Math.floor(options.horizon ?? 10)));
  const stationary = stationaryDistribution(parameters.transition);
  const forecast: StateSpaceForecast[] = [];
  let state: [number, number] = [
    smoothed[smoothed.length - 1][0],
    smoothed[smoothed.length - 1][1],
  ];
  let previous = values[n - 1];
  for (let step = 1; step <= horizon; step++) {
    const nextState: [number, number] = [
      state[0] * parameters.transition[0][0] + state[1] * parameters.transition[1][0],
      state[0] * parameters.transition[0][1] + state[1] * parameters.transition[1][1],
    ];
    const expected = nextState[0] * (parameters.means[0] + parameters.phi * previous) + nextState[1] * (parameters.means[1] + parameters.phi * previous);
    const conditionalVariance =
      nextState[0] * (parameters.variances[0] + Math.pow(parameters.means[0] + parameters.phi * previous - expected, 2)) +
      nextState[1] * (parameters.variances[1] + Math.pow(parameters.means[1] + parameters.phi * previous - expected, 2));
    const se = Math.sqrt(Math.max(conditionalVariance, 0));
    forecast.push({ step: n + step, mean: expected, se, lo: expected - critical * se, hi: expected + critical * se });
    state = nextState;
    previous = expected;
  }

  const residuals: number[] = [];
  for (let index = 1; index < n; index++) {
    const regime = classification[index - 1] ?? 0;
    residuals.push(values[index] - (parameters.means[regime] + parameters.phi * values[index - 1]));
  }
  const df = 7;
  const logLik = filtered.logLik;
  return {
    mode: 'markov',
    n,
    means: parameters.means,
    variances: parameters.variances,
    autoregressive: parameters.phi,
    transition: parameters.transition,
    stationary,
    expectedDuration: [
      1 / Math.max(1e-9, 1 - parameters.transition[0][0]),
      1 / Math.max(1e-9, 1 - parameters.transition[1][1]),
    ],
    logLik,
    aic: -2 * logLik + 2 * df,
    bic: -2 * logLik + Math.log(n) * df,
    filtered: filtered.filtered,
    smoothed,
    classification,
    forecast,
    residuals,
    ljungBox: ljungBoxTest(residuals),
    converged: best.converged,
  };
};

const ljungBoxTest = (values: number[]): { q: number; df: number; p: number } => {
  const n = values.length;
  if (n < 8) return { q: NaN, df: 0, p: NaN };
  const lags = Math.min(12, Math.max(1, Math.floor(n / 4)));
  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  const denominator = values.reduce((sum, value) => sum + (value - mean) * (value - mean), 0);
  let q = 0;
  for (let lag = 1; lag <= lags; lag++) {
    let numerator = 0;
    for (let index = lag; index < n; index++) numerator += (values[index] - mean) * (values[index - lag] - mean);
    const correlation = denominator > 0 ? numerator / denominator : 0;
    q += (correlation * correlation) / (n - lag);
  }
  q *= n * (n + 2);
  return { q, df: lags, p: chi2SF(q, lags) };
};

/** Dispatch on the requested mode. */
export const fitStateSpace = (options: StateSpaceOptions): StateSpaceFit | null =>
  options.mode === 'markov' ? fitMarkovStateSpace(options) : fitLocalStateSpace(options);
