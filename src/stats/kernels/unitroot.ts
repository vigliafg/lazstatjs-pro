import { adfTest } from './arima';

/**
 * Unit-root and stationarity tests.
 *
 * ADF comes from the ARIMA kernel (constant and AIC-selected lag length).
 * KPSS follows `tseries::kpss.test`: residuals from the level or trend
 * regression, cumulative sums, and a Bartlett long-run variance with the same
 * truncation lag. Phillips–Perron follows `urca::ur.pp` (Z-tau, constant):
 * Newey–West correction of the OLS t statistic of the lagged level.
 */

export interface AdfResult {
  stat: number;
  p: number;
  lags: number;
  cv5: number;
}

export type KpssType = 'level' | 'trend';

export interface KpssResult {
  stat: number;
  p: number;
  lags: number;
  cv5: number;
  type: KpssType;
}

export interface PhillipsPerronResult {
  stat: number;
  p: number;
  lags: number;
  cv5: number;
}

export interface UnitRootResult {
  adf: AdfResult;
  kpss: { level: KpssResult; trend: KpssResult };
  pp: PhillipsPerronResult;
}

const mean = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;

const olsResiduals = (values: number[], withTrend: boolean): number[] | null => {
  const n = values.length;
  if (n < 4) return null;
  const meanT = (n + 1) / 2;
  const meanY = mean(values);
  let slope = 0;
  if (withTrend) {
    let numerator = 0;
    let denominator = 0;
    for (let index = 0; index < n; index++) {
      numerator += (index + 1 - meanT) * (values[index] - meanY);
      denominator += Math.pow(index + 1 - meanT, 2);
    }
    slope = denominator > 0 ? numerator / denominator : 0;
  }
  const intercept = meanY - slope * meanT;
  return values.map((value, index) => value - intercept - slope * (index + 1));
};

const longRunVariance = (residuals: number[], lags: number): number => {
  const n = residuals.length;
  if (n === 0) return NaN;
  let value = residuals.reduce((sum, residual) => sum + residual * residual, 0) / n;
  for (let lag = 1; lag <= lags; lag++) {
    let cross = 0;
    for (let index = lag; index < n; index++) cross += residuals[index] * residuals[index - lag];
    value += (2 / n) * (1 - lag / (lags + 1)) * cross;
  }
  return value;
};

const kpssCritical = (type: KpssType): number[] =>
  type === 'trend' ? [0.216, 0.176, 0.146, 0.119] : [0.739, 0.574, 0.463, 0.347];

const kpssPValue = (stat: number, type: KpssType): number => {
  const critical = kpssCritical(type);
  const probabilities = [0.01, 0.025, 0.05, 0.1];
  // R stores the critical values from the 1% to the 10% level (descending).
  const table = critical
    .map((value, index) => ({ value, p: probabilities[index] }))
    .sort((left, right) => left.value - right.value);
  if (!Number.isFinite(stat)) return NaN;
  if (stat <= table[0].value) return table[0].p;
  if (stat >= table[table.length - 1].value) return table[table.length - 1].p;
  for (let index = 0; index < table.length - 1; index++) {
    if (stat >= table[index].value && stat <= table[index + 1].value) {
      const ratio = (stat - table[index].value) / (table[index + 1].value - table[index].value);
      return table[index].p + ratio * (table[index + 1].p - table[index].p);
    }
  }
  return NaN;
};

/** Kwiatkowski–Phillips–Schmidt–Shin test (null: stationarity). */
export const kpssTest = (values: number[], type: KpssType = 'level', longLags = false): KpssResult => {
  const n = values.length;
  const critical = kpssCritical(type);
  if (n < 8) return { stat: NaN, p: NaN, lags: 0, cv5: critical[2], type };
  const residuals = olsResiduals(values, type === 'trend');
  if (!residuals) return { stat: NaN, p: NaN, lags: 0, cv5: critical[2], type };

  const cumulative: number[] = [];
  let running = 0;
  residuals.forEach(residual => {
    running += residual;
    cumulative.push(running);
  });
  const eta = cumulative.reduce((sum, value) => sum + value * value, 0) / (n * n);
  const lags = Math.trunc((longLags ? 12 : 4) * Math.pow(n / 100, 0.25));
  const variance = longRunVariance(residuals, lags);
  if (!(variance > 0)) return { stat: NaN, p: NaN, lags, cv5: critical[2], type };
  const stat = eta / variance;
  return { stat, p: kpssPValue(stat, type), lags, cv5: critical[2], type };
};

interface OlsFit {
  beta: number;
  se: number;
  residuals: number[];
}

const simpleRegression = (y: number[], x: number[]): OlsFit | null => {
  const n = y.length;
  if (n < 3) return null;
  const meanX = mean(x);
  const meanY = mean(y);
  let sxx = 0;
  let sxy = 0;
  for (let index = 0; index < n; index++) {
    sxx += Math.pow(x[index] - meanX, 2);
    sxy += (x[index] - meanX) * (y[index] - meanY);
  }
  if (!(sxx > 0)) return null;
  const beta = sxy / sxx;
  const intercept = meanY - beta * meanX;
  const residuals = y.map((value, index) => value - intercept - beta * x[index]);
  const sse = residuals.reduce((sum, value) => sum + value * value, 0);
  const sigma2 = sse / (n - 2);
  const se = Math.sqrt(sigma2 / sxx);
  return { beta, se, residuals };
};

const ppCritical = (n: number): { cv1: number; cv5: number; cv10: number } => ({
  cv1: -3.4335 - 5.999 / n - 29.25 / (n * n),
  cv5: -2.8621 - 2.738 / n - 8.36 / (n * n),
  cv10: -2.5671 - 1.438 / n - 4.48 / (n * n),
});

/** Phillips–Perron Z-tau with a constant (urca::ur.pp convention). */
export const phillipsPerronTest = (values: number[], longLags = false): PhillipsPerronResult => {
  const original = values.filter(value => Number.isFinite(value));
  if (original.length < 8) return { stat: NaN, p: NaN, lags: 0, cv5: NaN };
  const n = original.length - 1;
  const y = original.slice(1);
  const lagged = original.slice(0, n);
  const fit = simpleRegression(y, lagged);
  if (!fit || !(fit.se > 0)) return { stat: NaN, p: NaN, lags: 0, cv5: NaN };

  const residuals = fit.residuals;
  const s = residuals.reduce((sum, value) => sum + value * value, 0) / n;
  const meanY = mean(y);
  const meanLagged = mean(lagged);
  let myybar = 0;
  let myy = 0;
  for (let index = 0; index < n; index++) {
    myybar += Math.pow(y[index] - meanY, 2);
    myy += y[index] * y[index];
  }
  myybar /= n * n;
  myy /= n * n;
  const my = y.reduce((sum, value) => sum + value, 0) / Math.pow(n, 1.5);
  void meanLagged;

  const lags = Math.trunc((longLags ? 12 : 4) * Math.pow(n / 100, 0.25));
  let covariance = 0;
  for (let lag = 1; lag <= lags; lag++) {
    let cross = 0;
    for (let index = lag; index < n; index++) cross += residuals[index] * residuals[index - lag];
    covariance += (1 - lag / (lags + 1)) * cross;
  }
  const sigma = s + (2 / n) * covariance;
  if (!(sigma > 0) || !(myybar > 0)) return { stat: NaN, p: NaN, lags, cv5: ppCritical(n).cv5 };
  const lambda = 0.5 * (sigma - s);
  const lambdaPrime = lambda / sigma;
  const tStat = (fit.beta - 1) / fit.se;
  const stat = Math.sqrt(s / sigma) * tStat - lambdaPrime * Math.sqrt(sigma) / Math.sqrt(myybar);
  const { cv1, cv5, cv10 } = ppCritical(n);
  const p = stat <= cv1 ? 0.01 : stat <= cv5 ? 0.05 : stat <= cv10 ? 0.1 : 0.5;
  return { stat, p, lags, cv5 };
};

/** All three unit-root/stationarity tests on one series. */
export const unitRootTests = (values: number[]): UnitRootResult => ({
  adf: adfTest(values),
  kpss: { level: kpssTest(values, 'level'), trend: kpssTest(values, 'trend') },
  pp: phillipsPerronTest(values),
});
