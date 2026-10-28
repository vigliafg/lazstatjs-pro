import { jStat } from '../jstat';
import { chi2SF } from '../distributions';
import { fmtEst } from '../format';
import type { AcfPoint, TimeSeriesOptions } from '../timeseries/types';

export const mean = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;

export const variance = (values: number[]): number => {
  const mu = mean(values);
  return values.reduce((sum, value) => sum + Math.pow(value - mu, 2), 0) / (values.length - 1);
};

const normalTwoSided = (z: number): number => 2 * jStat.normal.cdf(-Math.abs(z), 0, 1);

export const autocorrelation = (values: number[], maxLag: number): number[] => {
  const n = values.length;
  const mu = mean(values);
  const denominator = values.reduce((sum, value) => sum + Math.pow(value - mu, 2), 0);
  if (!(denominator > 0)) return new Array(maxLag + 1).fill(NaN);
  const result = [1];
  for (let lag = 1; lag <= maxLag; lag++) {
    let numerator = 0;
    for (let index = 0; index + lag < n; index++) {
      numerator += (values[index] - mu) * (values[index + lag] - mu);
    }
    result.push(numerator / denominator);
  }
  return result;
};

/** Partial autocorrelation via the Durbin–Levinson recursion. */
export const partialAutocorrelation = (acf: number[], maxLag: number): number[] => {
  const pacf = [1];
  const coefficients: number[][] = [];
  for (let lag = 1; lag <= maxLag; lag++) {
    const previous = coefficients[lag - 1] ?? [];
    let numerator = acf[lag];
    for (let j = 1; j < lag; j++) numerator -= (previous[j - 1] ?? 0) * acf[lag - j];
    let denominator = 1;
    for (let j = 1; j < lag; j++) denominator -= (previous[j - 1] ?? 0) * acf[j];
    const next = Math.abs(denominator) < 1e-12 ? 0 : numerator / denominator;
    const current = new Array<number>(lag);
    for (let j = 1; j < lag; j++) {
      current[j - 1] = (previous[j - 1] ?? 0) - next * (previous[lag - j - 1] ?? 0);
    }
    current[lag - 1] = next;
    coefficients[lag] = current;
    pacf.push(next);
  }
  return pacf;
};

export const acfTable = (values: number[], maxLag: number): AcfPoint[] => {
  const acf = autocorrelation(values, maxLag);
  const pacf = partialAutocorrelation(acf, maxLag);
  return Array.from({ length: maxLag + 1 }, (_, lag) => ({ lag, acf: acf[lag], pacf: pacf[lag] }));
};

export const mannKendall = (values: number[]): { s: number; tau: number; z: number; p: number } => {
  const n = values.length;
  if (n < 4) return { s: NaN, tau: NaN, z: NaN, p: NaN };
  let s = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      s += Math.sign(values[j] - values[i]);
    }
  }

  const counts = new Map<number, number>();
  values.forEach(value => counts.set(value, (counts.get(value) ?? 0) + 1));
  let tieCorrection = 0;
  counts.forEach(count => {
    if (count > 1) tieCorrection += count * (count - 1) * (2 * count + 5);
  });

  const varianceS = (n * (n - 1) * (2 * n + 5) - tieCorrection) / 18;
  const z = varianceS > 0 ? s > 0 ? (s - 1) / Math.sqrt(varianceS) : s < 0 ? (s + 1) / Math.sqrt(varianceS) : 0 : NaN;
  return {
    s,
    tau: s / (n * (n - 1) / 2),
    z,
    p: Number.isFinite(z) ? normalTwoSided(z) : NaN,
  };
};

/** Sen's slope: median of all pairwise slopes, robust to outliers. */
export const senSlope = (values: number[]): number => {
  const slopes: number[] = [];
  for (let i = 0; i < values.length - 1; i++) {
    for (let j = i + 1; j < values.length; j++) {
      slopes.push((values[j] - values[i]) / (j - i));
    }
  }
  return slopes.length > 0 ? jStat.median(slopes) : NaN;
};

/** Wald–Wolfowitz runs test around the median. */
export const runsTest = (values: number[]): { runs: number; n1: number; n2: number; z: number; p: number } => {
  const median = jStat.median(values);
  const signs = values
    .map(value => (value > median ? 1 : value < median ? 0 : null))
    .filter((value): value is 0 | 1 => value !== null);
  const n1 = signs.filter(value => value === 1).length;
  const n2 = signs.length - n1;
  if (n1 < 2 || n2 < 2) return { runs: NaN, n1, n2, z: NaN, p: NaN };

  let runs = 1;
  for (let index = 1; index < signs.length; index++) {
    if (signs[index] !== signs[index - 1]) runs += 1;
  }

  const n = n1 + n2;
  const expected = (2 * n1 * n2) / n + 1;
  const varianceRuns = (2 * n1 * n2 * (2 * n1 * n2 - n)) / (n * n * (n - 1));
  const z = varianceRuns > 0 ? (runs - expected + (runs > expected ? -0.5 : 0.5)) / Math.sqrt(varianceRuns) : NaN;
  return { runs, n1, n2, z, p: Number.isFinite(z) ? normalTwoSided(z) : NaN };
};

export const ljungBox = (values: number[], lags: number): { q: number; df: number; p: number } => {
  const n = values.length;
  const acf = autocorrelation(values, lags);
  let q = 0;
  for (let lag = 1; lag <= lags; lag++) {
    if (Number.isFinite(acf[lag])) q += (acf[lag] * acf[lag]) / (n - lag);
  }
  q *= n * (n + 2);
  return { q, df: lags, p: chi2SF(q, lags) };
};

/** Centred moving average; even windows use the 2xMA weighting. */
export const centeredMovingAverage = (values: number[], window: number): number[] => {
  const n = values.length;
  const result = new Array<number>(n).fill(NaN);
  if (window < 2 || window > n) return result;

  if (window % 2 === 1) {
    const half = (window - 1) / 2;
    for (let index = half; index < n - half; index++) {
      let sum = 0;
      for (let offset = -half; offset <= half; offset++) sum += values[index + offset];
      result[index] = sum / window;
    }
    return result;
  }

  // Even window (2xMA): weights 0.5, 1, ..., 1, 0.5 on the m values from
  // index - half to index + half - 1, divided by m.
  const half = window / 2;
  for (let index = half; index < n - half; index++) {
    let sum = 0.5 * values[index - half] + 0.5 * values[index + half - 1];
    for (let offset = -half + 1; offset <= half - 2; offset++) sum += values[index + offset];
    result[index] = sum / window;
  }
  return result;
};

export interface SeasonalDecomposition {
  trend: number[];
  seasonal: number[];
  remainder: number[];
  indices: number[];
  strength: number;
}

export const decomposeSeasonal = (values: number[], period: number): SeasonalDecomposition | null => {
  if (period < 2 || values.length < period * 2) return null;
  const trend = centeredMovingAverage(values, period);
  const detrended: number[][] = Array.from({ length: period }, () => []);

  values.forEach((value, index) => {
    if (Number.isFinite(trend[index])) detrended[index % period].push(value - trend[index]);
  });

  const raw = detrended.map(group => (group.length > 0 ? mean(group) : 0));
  const center = mean(raw);
  const indices = raw.map(value => value - center);

  const seasonal = values.map((_, index) => indices[index % period]);
  const remainder = values.map((value, index) =>
    Number.isFinite(trend[index]) ? value - trend[index] - seasonal[index] : NaN
  );

  const valid = remainder.map((value, index) => ({ value, index })).filter(item => Number.isFinite(item.value));
  const detrendedValid = valid.map(item => values[item.index] - trend[item.index]);
  const residualVariance = valid.length > 1 ? variance(valid.map(item => item.value)) : NaN;
  const detrendedVariance = detrendedValid.length > 1 ? variance(detrendedValid) : NaN;
  const strength =
    Number.isFinite(residualVariance) && detrendedVariance > 0 ? Math.max(0, 1 - residualVariance / detrendedVariance) : NaN;

  return { trend, seasonal, remainder, indices, strength };
};

// ---------------------------------------------------------------------------
// Forecasting
// ---------------------------------------------------------------------------

export interface ForecastModel {
  name: string;
  forecast: number[];
  rmse: number;
  mae: number;
  mape: number;
  note: string;
}

const sesFit = (values: number[]): { alpha: number; level: number; sse: number } => {
  let best = { alpha: 0.5, level: values[values.length - 1], sse: Infinity };
  for (let step = 1; step <= 19; step++) {
    const alpha = step / 20;
    let level = values[0];
    let sse = 0;
    for (let index = 1; index < values.length; index++) {
      const error = values[index] - level;
      sse += error * error;
      level += alpha * error;
    }
    if (sse < best.sse) best = { alpha, level, sse };
  }
  return best;
};

const linearFit = (values: number[]): { intercept: number; slope: number } => {
  const n = values.length;
  const xs = Array.from({ length: n }, (_, index) => index + 1);
  const meanX = mean(xs);
  const meanY = mean(values);
  let numerator = 0;
  let denominator = 0;
  for (let index = 0; index < n; index++) {
    numerator += (xs[index] - meanX) * (values[index] - meanY);
    denominator += Math.pow(xs[index] - meanX, 2);
  }
  const slope = denominator > 0 ? numerator / denominator : 0;
  return { intercept: meanY - slope * meanX, slope };
};

const metrics = (actual: number[], predicted: number[]): { rmse: number; mae: number; mape: number } => {
  const errors = actual.map((value, index) => value - predicted[index]);
  const mse = mean(errors.map(error => error * error));
  const mae = mean(errors.map(error => Math.abs(error)));
  const percentage = actual
    .map((value, index) => (value !== 0 ? Math.abs(errors[index] / value) : NaN))
    .filter(value => Number.isFinite(value));
  return {
    rmse: Math.sqrt(mse),
    mae,
    mape: percentage.length > 0 ? mean(percentage) * 100 : NaN,
  };
};

export const forecastModels = (values: number[], period: number, horizon: number): ForecastModel[] => {
  const n = values.length;
  const holdout = Math.max(1, Math.min(horizon, Math.floor(n * 0.2)));
  const train = values.slice(0, n - holdout);
  const test = values.slice(n - holdout);
  const models: ForecastModel[] = [];

  if (train.length >= 4) {
    const ses = sesFit(train);
    models.push({
      name: 'Exponential smoothing (SES)',
      forecast: new Array(holdout).fill(ses.level),
      ...metrics(test, new Array(holdout).fill(ses.level)),
      note: `alpha ottimale = ${fmtEst(ses.alpha, 2)}`,
    });

    const line = linearFit(train);
    const linearForecast = Array.from(
      { length: holdout },
      (_, index) => line.intercept + line.slope * (train.length + index + 1)
    );
    models.push({
      name: 'Linear trend',
      forecast: linearForecast,
      ...metrics(test, linearForecast),
      note: `pendenza = ${fmtEst(line.slope, 4)} per passo`,
    });

    if (period >= 2 && train.length > period) {
      const seasonalForecast = Array.from(
        { length: holdout },
        (_, index) => train[train.length - period + (index % period)]
      );
      models.push({
        name: 'Seasonal naive',
        forecast: seasonalForecast,
        ...metrics(test, seasonalForecast),
        note: `ripete l’ultimo ciclo di ${period} periodi`,
      });
    }
  }

  const finalForecasts = (model: ForecastModel): number[] => {
    if (model.name.startsWith('Exponential')) {
      const ses = sesFit(values);
      return new Array(horizon).fill(ses.level);
    }
    if (model.name.startsWith('Linear')) {
      const line = linearFit(values);
      return Array.from({ length: horizon }, (_, index) => line.intercept + line.slope * (n + index + 1));
    }
    if (period >= 2) {
      return Array.from({ length: horizon }, (_, index) => values[n - period + (index % period)]);
    }
    return new Array(horizon).fill(values[n - 1]);
  };

  return models
    .map(model => ({ ...model, forecast: finalForecasts(model) }))
    .sort((left, right) => left.rmse - right.rmse);
};
