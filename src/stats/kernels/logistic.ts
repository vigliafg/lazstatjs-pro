import { jStat } from '../jstat';
import type { LogisticModel, LogisticPredictor } from '../logistic/types';

const EPS = 1e-10;

const sigmoid = (value: number): number => 1 / (1 + Math.exp(-value));

const invert = (matrix: number[][]): number[][] | null => {
  const size = matrix.length;
  const work = matrix.map((row, index) => [
    ...row,
    ...Array.from({ length: size }, (_, j) => (j === index ? 1 : 0)),
  ]);

  for (let column = 0; column < size; column++) {
    let pivotRow = column;
    for (let row = column + 1; row < size; row++) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivotRow][column])) pivotRow = row;
    }
    if (Math.abs(work[pivotRow][column]) < 1e-12) return null;
    [work[column], work[pivotRow]] = [work[pivotRow], work[column]];

    const pivot = work[column][column];
    for (let j = 0; j < 2 * size; j++) work[column][j] /= pivot;

    for (let row = 0; row < size; row++) {
      if (row === column) continue;
      const factor = work[row][column];
      if (factor === 0) continue;
      for (let j = 0; j < 2 * size; j++) work[row][j] -= factor * work[column][j];
    }
  }

  return work.map(row => row.slice(size));
};

const devianceOf = (beta: number[], X: number[][], y: number[]): number => {
  let deviance = 0;
  for (let i = 0; i < y.length; i++) {
    const eta = X[i].reduce((sum, value, j) => sum + value * beta[j], 0);
    const p = Math.min(1 - 1e-12, Math.max(1e-12, sigmoid(eta)));
    deviance -= 2 * (y[i] === 1 ? Math.log(p) : Math.log(1 - p));
  }
  return deviance;
};

const logDet = (matrix: number[][]): number => {
  const n = matrix.length;
  const a = matrix.map(row => [...row]);
  let value = 0;
  for (let column = 0; column < n; column++) {
    let pivot = column;
    for (let row = column + 1; row < n; row++) {
      if (Math.abs(a[row][column]) > Math.abs(a[pivot][column])) pivot = row;
    }
    if (Math.abs(a[pivot][column]) < 1e-12) return -Infinity;
    if (pivot !== column) [a[column], a[pivot]] = [a[pivot], a[column]];
    value += Math.log(Math.abs(a[column][column]));
    const divisor = a[column][column];
    for (let j = column; j < n; j++) a[column][j] /= divisor;
    for (let row = column + 1; row < n; row++) {
      const factor = a[row][column];
      for (let j = column; j < n; j++) a[row][j] -= factor * a[column][j];
    }
  }
  return value;
};

export const fitLogistic = (
  y: number[],
  predictors: LogisticPredictor[],
  level = 95,
  cutoff = 0.5,
  penalized = false
): LogisticModel | null => {
  const n = y.length;
  if (n < 3 || predictors.length === 0) return null;
  if (predictors.some(predictor => predictor.values.length !== n)) return null;

  const events = y.filter(value => value === 1).length;
  const nonEvents = n - events;
  if (events === 0 || nonEvents === 0) return null;

  const X = y.map((_, i) => [1, ...predictors.map(predictor => predictor.values[i])]);
  const k = X[0].length;
  if (n <= k) return null;

  let beta = new Array<number>(k).fill(0);
  beta[0] = Math.log(events / nonEvents);
  let deviance = devianceOf(beta, X, y);

  for (let iteration = 0; iteration < 100; iteration++) {
    const xtwx = Array.from({ length: k }, () => new Array<number>(k).fill(0));
    for (let i = 0; i < n; i++) {
      const eta = X[i].reduce((sum, value, j) => sum + value * beta[j], 0);
      const p = sigmoid(eta);
      const weight = Math.max(EPS, p * (1 - p));
      for (let j = 0; j < k; j++) {
        for (let l = 0; l <= j; l++) xtwx[j][l] += X[i][j] * weight * X[i][l];
      }
    }
    for (let j = 0; j < k; j++) {
      for (let l = 0; l < j; l++) xtwx[l][j] = xtwx[j][l];
    }

    const inverse = invert(xtwx);
    if (!inverse) return null;

    const xtwz = new Array<number>(k).fill(0);
    for (let i = 0; i < n; i++) {
      const eta = X[i].reduce((sum, value, j) => sum + value * beta[j], 0);
      const p = sigmoid(eta);
      const weight = Math.max(EPS, p * (1 - p));
      const leverage = penalized
        ? weight * X[i].reduce(
            (sum, value, j) =>
              sum + value * inverse[j].reduce((inner, entry, l) => inner + entry * X[i][l], 0),
            0
          )
        : 0;
      const adjustment = penalized ? leverage * (0.5 - p) : 0;
      const z = eta + (y[i] - p + adjustment) / weight;
      for (let j = 0; j < k; j++) xtwz[j] += X[i][j] * weight * z;
    }

    const candidate = Array.from({ length: k }, (_, j) =>
      xtwz.reduce((sum, value, l) => sum + inverse[j][l] * value, 0)
    );

    // Step halving keeps the deviance monotone, which matters near separation.
    let step = 1;
    let next = candidate;
    let nextDeviance = devianceOf(next, X, y);
    while (nextDeviance > deviance + 1e-12 && step > 1e-6) {
      step /= 2;
      next = beta.map((value, j) => value + step * (candidate[j] - value));
      nextDeviance = devianceOf(next, X, y);
    }

    const change = Math.abs(deviance - nextDeviance);
    beta = next;
    deviance = nextDeviance;
    if (change < 1e-10) break;
  }

  const fitted = X.map(row => sigmoid(row.reduce((sum, value, j) => sum + value * beta[j], 0)));
  const logLik = fitted.reduce(
    (sum, p, i) => sum + (y[i] === 1 ? Math.log(Math.max(EPS, p)) : Math.log(Math.max(EPS, 1 - p))),
    0
  );
  const nullP = events / n;
  const logLikNull = events * Math.log(nullP) + nonEvents * Math.log(1 - nullP);

  // Standard errors from the inverse of the information matrix at convergence.
  const xtwx = Array.from({ length: k }, () => new Array<number>(k).fill(0));
  X.forEach((row, i) => {
    const weight = Math.max(EPS, fitted[i] * (1 - fitted[i]));
    for (let j = 0; j < k; j++) {
      for (let l = 0; l <= j; l++) xtwx[j][l] += row[j] * weight * row[l];
    }
  });
  for (let j = 0; j < k; j++) {
    for (let l = 0; l < j; l++) xtwx[l][j] = xtwx[j][l];
  }
  const covariance = invert(xtwx);
  if (!covariance) return null;
  const se = Array.from({ length: k }, (_, j) => Math.sqrt(Math.max(0, covariance[j][j])));

  const lr = 2 * (logLik - logLikNull);
  const df = k - 1;
  const p = 1 - jStat.chisquare.cdf(Math.max(0, lr), df);

  const positives = y
    .map((value, index) => ({ value, fitted: fitted[index] }))
    .filter(item => item.value === 1)
    .map(item => item.fitted);
  const negatives = y
    .map((value, index) => ({ value, fitted: fitted[index] }))
    .filter(item => item.value === 0)
    .map(item => item.fitted);
  let aucPairs = 0;
  positives.forEach(pos => {
    negatives.forEach(neg => {
      aucPairs += pos > neg ? 1 : pos === neg ? 0.5 : 0;
    });
  });
  const auc = positives.length > 0 && negatives.length > 0 ? aucPairs / (positives.length * negatives.length) : NaN;

  let truePositive = 0;
  let trueNegative = 0;
  y.forEach((value, index) => {
    const predicted = fitted[index] >= cutoff ? 1 : 0;
    if (value === 1 && predicted === 1) truePositive += 1;
    if (value === 0 && predicted === 0) trueNegative += 1;
  });

  const mcfadden = 1 - logLik / logLikNull;
  const coxSnell = 1 - Math.exp((2 / n) * (logLikNull - logLik));
  const nagelkerke = coxSnell / (1 - Math.exp((2 / n) * logLikNull));

  return {
    names: ['(Intercept)', ...predictors.map(predictor => predictor.name)],
    beta,
    se,
    n,
    events,
    logLik,
    logLikNull,
    lr,
    df,
    p,
    mcfadden,
    coxSnell,
    nagelkerke,
    aic: 2 * k - 2 * logLik,
    bic: k * Math.log(n) - 2 * logLik,
    fitted,
    auc,
    accuracy: (truePositive + trueNegative) / n,
    sensitivity: events > 0 ? truePositive / events : NaN,
    specificity: nonEvents > 0 ? trueNegative / nonEvents : NaN,
    separation: beta.some(value => Math.abs(value) > 20),
    penalized,
    penalizedLogLik: penalized ? logLik + 0.5 * logDet(xtwx) : undefined,
  };
};


/** Probability curve for a single-predictor model (for the chart). */
/**
 * Probability profile for the first predictor while keeping the other
 * predictors at their means. For a single-predictor model it is identical to
 * `logisticCurve`.
 */
export const logisticProfileCurve = (
  model: LogisticModel,
  predictorValues: number[],
  otherMeans: number[],
  points = 40
): { x: number; y: number }[] => {
  const min = Math.min(...predictorValues);
  const max = Math.max(...predictorValues);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return [];
  const step = (max - min) / (points - 1);
  return Array.from({ length: points }, (_, index) => {
    const x = min + step * index;
    const eta =
      model.beta[0] +
      model.beta[1] * x +
      otherMeans.reduce((sum, value, offset) => sum + model.beta[offset + 2] * value, 0);
    return { x, y: sigmoid(eta) * 100 };
  });
};

export const logisticCurve = (
  model: LogisticModel,
  predictorValues: number[],
  points = 40
): { x: number; y: number }[] => {
  const min = Math.min(...predictorValues);
  const max = Math.max(...predictorValues);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return [];
  const step = (max - min) / (points - 1);
  return Array.from({ length: points }, (_, index) => {
    const x = min + step * index;
    const eta = model.beta[0] + model.beta[1] * x;
    return { x, y: sigmoid(eta) * 100 };
  });
};
