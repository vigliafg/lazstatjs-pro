import { zCrit } from '../distributions';

/**
 * Holt–Winters exponential smoothing (additive or multiplicative seasonality).
 *
 * The recursion and its start values mirror `stats::HoltWinters`: the first
 * two periods give the trend through a centred moving average, the level and
 * trend start from a regression on that trend, and the seasonal figures come
 * from the detrended observations. The smoothing constants are then chosen by
 * minimising the one-step sum of squares.
 */

export type HoltWintersSeasonal = 'additive' | 'multiplicative' | 'none';

export interface HoltWintersOptions {
  values: number[];
  period: number;
  horizon: number;
  seasonal?: HoltWintersSeasonal;
  level?: number;
}

export interface HoltWintersPoint {
  step: number;
  mean: number;
  se: number;
  lo: number;
  hi: number;
}

export interface HoltWintersFit {
  seasonal: HoltWintersSeasonal;
  period: number;
  alpha: number;
  beta: number;
  gamma: number;
  sse: number;
  sigma2: number;
  logLik: number;
  aic: number;
  bic: number;
  level0: number;
  trend0: number;
  seasonal0: number[];
  level: number;
  trend: number;
  seasonalFinal: number[];
  fitted: number[];
  residuals: number[];
  forecast: HoltWintersPoint[];
  converged: boolean;
}

const mean = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;

/** R-style centred moving average: even windows use 0.5 at both ends. */
const centeredMovingAverage = (values: number[], window: number): number[] => {
  const n = values.length;
  const result = new Array<number>(n).fill(NaN);
  const half = Math.floor(window / 2);
  if (window < 2 || window > n) return result;
  if (window % 2 === 1) {
    for (let index = half; index < n - half; index++) {
      let sum = 0;
      for (let offset = -half; offset <= half; offset++) sum += values[index + offset];
      result[index] = sum / window;
    }
    return result;
  }
  for (let index = half; index < n - half; index++) {
    let sum = 0.5 * values[index - half] + 0.5 * values[index + half];
    for (let offset = -half + 1; offset <= half - 1; offset++) sum += values[index + offset];
    result[index] = sum / window;
  }
  return result;
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export interface StartValues {
  level: number;
  trend: number;
  seasonal: number[];
  start: number;
}

const seasonalStart = (values: number[], period: number, seasonal: HoltWintersSeasonal): number[] => {
  const window = 2 * period;
  const trend = centeredMovingAverage(values.slice(0, window), period);
  const points: { t: number; y: number }[] = [];
  for (let index = 0; index < window; index++) {
    if (Number.isFinite(trend[index])) points.push({ t: points.length + 1, y: trend[index] });
  }
  const raw: number[] = [];
  for (let position = 0; position < period; position++) {
    const valuesAtPosition: number[] = [];
    for (let index = 0; index < window; index++) {
      if (!Number.isFinite(trend[index]) || index % period !== position) continue;
      valuesAtPosition.push(
        seasonal === 'multiplicative' ? values[index] / trend[index] : values[index] - trend[index]
      );
    }
    raw.push(valuesAtPosition.length > 0 ? mean(valuesAtPosition) : 0);
  }
  if (seasonal === 'multiplicative') {
    const total = raw.reduce((sum, value) => sum + value, 0);
    return total > 0 ? raw.map(value => (value * period) / total) : raw.map(() => 1);
  }
  const center = mean(raw);
  return raw.map(value => value - center);
};

const startValues = (values: number[], period: number, seasonal: HoltWintersSeasonal): StartValues => {
  if (seasonal === 'none' || period < 2 || values.length < 2 * period) {
    return {
      level: values[0],
      trend: values.length > 1 ? values[1] - values[0] : 0,
      seasonal: [],
      start: 1,
    };
  }
  const window = 2 * period;
  const trend = centeredMovingAverage(values.slice(0, window), period);
  const points: { t: number; y: number }[] = [];
  for (let index = 0; index < window; index++) {
    if (Number.isFinite(trend[index])) points.push({ t: points.length + 1, y: trend[index] });
  }
  let level = mean(values.slice(0, period));
  let slope = 0;
  if (points.length >= 2) {
    const meanT = mean(points.map(point => point.t));
    const meanY = mean(points.map(point => point.y));
    let numerator = 0;
    let denominator = 0;
    points.forEach(point => {
      numerator += (point.t - meanT) * (point.y - meanY);
      denominator += Math.pow(point.t - meanT, 2);
    });
    slope = denominator > 0 ? numerator / denominator : 0;
    level = meanY - slope * meanT;
  }
  return {
    level,
    trend: slope,
    seasonal: seasonalStart(values, period, seasonal),
    start: period,
  };
};

interface RecursionResult {
  sse: number;
  fitted: number[];
  residuals: number[];
  level: number;
  trend: number;
  seasonal: number[];
}

const run = (
  values: number[],
  start: StartValues,
  seasonal: HoltWintersSeasonal,
  alpha: number,
  beta: number,
  gamma: number
): RecursionResult | null => {
  const period = start.seasonal.length;
  const multiplicative = seasonal === 'multiplicative';
  if (multiplicative && values.some(value => value === 0)) return null;

  let level = start.level;
  let trend = start.trend;
  const indices = start.seasonal.slice();
  const fitted: number[] = [];
  const residuals: number[] = [];
  let sse = 0;

  for (let index = start.start; index < values.length; index++) {
    const position = period > 0 ? index % period : 0;
    const oldSeasonal = indices[position] ?? 0;
    const predicted = multiplicative ? (level + trend) * oldSeasonal : level + trend + oldSeasonal;
    if (!Number.isFinite(predicted)) return null;
    const error = values[index] - predicted;
    fitted.push(predicted);
    residuals.push(error);
    sse += error * error;

    const newLevel = multiplicative
      ? alpha * (values[index] / oldSeasonal) + (1 - alpha) * (level + trend)
      : alpha * (values[index] - oldSeasonal) + (1 - alpha) * (level + trend);
    const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
    if (period > 0) {
      indices[position] = multiplicative
        ? gamma * (values[index] / newLevel) + (1 - gamma) * oldSeasonal
        : gamma * (values[index] - newLevel) + (1 - gamma) * oldSeasonal;
    }
    level = newLevel;
    trend = newTrend;
  }

  if (!Number.isFinite(sse) || fitted.length === 0) return null;
  return { sse, fitted, residuals, level, trend, seasonal: indices };
};

/** Deterministic pattern search over the three smoothing constants in [0,1]. */
const optimize = (
  values: number[],
  start: StartValues,
  seasonal: HoltWintersSeasonal
): { alpha: number; beta: number; gamma: number; sse: number; converged: boolean } => {
  const objective = (parameters: number[]): number => {
    const alpha = clamp01(parameters[0]);
    const beta = clamp01(parameters[1]);
    const gamma = clamp01(parameters[2]);
    const result = run(values, start, seasonal, alpha, beta, gamma);
    return result ? result.sse : Infinity;
  };

  const starts = [
    [0.3, 0.1, 0.1],
    [0.5, 0.2, 0.4],
    [0.15, 0.03, 0.8],
    [0.8, 0.05, 0.3],
  ];
  let best = starts[0].slice();
  let bestValue = objective(best);
  starts.slice(1).forEach(candidate => {
    const value = objective(candidate);
    if (value < bestValue) {
      best = candidate.slice();
      bestValue = value;
    }
  });

  let step = 0.2;
  let converged = false;
  for (let iteration = 0; iteration < 400; iteration++) {
    let improved = false;
    for (let dimension = 0; dimension < 3; dimension++) {
      for (const direction of [-1, 1]) {
        const candidate = best.slice();
        candidate[dimension] = clamp01(candidate[dimension] + direction * step);
        const value = objective(candidate);
        if (value < bestValue - 1e-12 * (1 + bestValue)) {
          best = candidate;
          bestValue = value;
          improved = true;
        }
      }
    }
    if (!improved) {
      step *= 0.5;
      if (step < 1e-7) {
        converged = true;
        break;
      }
    }
  }

  return { alpha: best[0], beta: best[1], gamma: best[2], sse: bestValue, converged };
};

export const fitHoltWinters = (options: HoltWintersOptions): HoltWintersFit | null => {
  const values = options.values;
  const period = Math.floor(options.period);
  const seasonal: HoltWintersSeasonal =
    options.seasonal ??
    (period >= 2 && values.length >= 2 * period ? 'additive' : 'none');
  if (values.length < 4 || values.some(value => !Number.isFinite(value))) return null;
  if (seasonal !== 'none' && period < 2) return null;
  if (seasonal === 'multiplicative' && values.some(value => value <= 0)) return null;
  if (seasonal !== 'none' && values.length < 2 * period) return null;

  const start = startValues(values, period, seasonal);
  const optimized = optimize(values, start, seasonal);
  const fittedResult = run(values, start, seasonal, optimized.alpha, optimized.beta, optimized.gamma);
  if (!fittedResult) return null;

  const nEff = fittedResult.fitted.length;
  const sigma2 = nEff > 1 ? fittedResult.sse / (nEff - 1) : fittedResult.sse;
  const logLik = nEff > 0 ? -0.5 * nEff * (Math.log(2 * Math.PI * sigma2) + 1) : NaN;
  const k = seasonal === 'none' ? 3 : 3 + period;
  const aic = -2 * logLik + 2 * k;
  const bic = -2 * logLik + Math.log(Math.max(1, nEff)) * k;

  const horizon = Math.max(1, Math.min(120, Math.floor(options.horizon)));
  const critical = zCrit(options.level ?? 95);
  const relative = seasonal === 'multiplicative';
  const relativeErrors = fittedResult.residuals
    .map((error, index) => (fittedResult.fitted[index] !== 0 ? error / fittedResult.fitted[index] : NaN))
    .filter(value => Number.isFinite(value));
  const residualScale = relative
    ? Math.sqrt(mean(relativeErrors.map(value => value * value)))
    : Math.sqrt(sigma2);

  const forecast: HoltWintersPoint[] = [];
  for (let step = 1; step <= horizon; step++) {
    const position = (values.length + step - 1) % Math.max(1, period);
    const seasonalValue = period > 0 ? fittedResult.seasonal[position] ?? 0 : 0;
    const central = fittedResult.level + step * fittedResult.trend;
    const estimate = relative ? central * seasonalValue : central + seasonalValue;
    const se = relative
      ? Math.abs(estimate) * residualScale * Math.sqrt(step)
      : residualScale * Math.sqrt(step);
    forecast.push({
      step: values.length + step,
      mean: estimate,
      se,
      lo: estimate - critical * se,
      hi: estimate + critical * se,
    });
  }

  return {
    seasonal,
    period: seasonal === 'none' ? 0 : period,
    alpha: optimized.alpha,
    beta: optimized.beta,
    gamma: seasonal === 'none' ? 0 : optimized.gamma,
    sse: fittedResult.sse,
    sigma2,
    logLik,
    aic,
    bic,
    level0: start.level,
    trend0: start.trend,
    seasonal0: start.seasonal,
    level: fittedResult.level,
    trend: fittedResult.trend,
    seasonalFinal: fittedResult.seasonal,
    fitted: fittedResult.fitted,
    residuals: fittedResult.residuals,
    forecast,
    converged: optimized.converged,
  };
};

/** Exposed for the initial-state tests: the same centred average R uses. */
export const holtWintersStart = (values: number[], period: number, seasonal: HoltWintersSeasonal): StartValues =>
  startValues(values, period, seasonal);
