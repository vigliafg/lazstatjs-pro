/**
 * Multinomial logistic regression (softmax regression) by maximum likelihood.
 *
 * The model uses treatment coding: the **first class (index 0) is always the
 * reference/baseline class**, whose linear predictor is fixed at zero. The
 * estimated coefficients therefore describe classes `1..K-1` relative to the
 * reference, which is the same parameterisation used by `nnet::multinom()` in
 * R and by most regression textbooks.
 *
 * For observation `i` the predicted probability of class `k` is
 *
 *   P_ik = exp(x_i' b_k) / (1 + sum_j exp(x_i' b_j)),  b_0 = 0
 *
 * with `k = 1..K-1` in the denominator sum. Fitting minimises the negative
 * log-likelihood with a damped Newton (IRLS-style) step; the observed
 * information matrix of the final iteration provides the covariance of the
 * estimates, so the standard errors are the usual `sqrt(diag(H^-1))`.
 *
 * Inputs are plain arrays. The caller owns the design matrix and must include
 * the intercept column explicitly.
 */

import { jStat } from '../jstat';
import { invert, type Matrix } from './matrix';
import { lrTest, type LrEffect } from './effects';

const EPS = 1e-12;

export interface MultinomialInput {
  /** Class labels as integers 0..K-1, one per row. */
  y: number[];
  /** Design matrix with the intercept column already included. */
  x: Matrix;
  /** Optional class labels; defaults to "0".."K-1". */
  classes?: string[];
  maxIterations?: number;
  tolerance?: number;
}

export interface MultinomialResult {
  classes: string[];
  /** Index of the baseline (reference) class. Always 0. */
  referenceClass: number;
  /** (K-1) x p coefficient matrix for the non-reference classes, in class order. */
  coefficients: Matrix;
  standardErrors: Matrix;
  z: Matrix;
  pValues: Matrix;
  logLik: number;
  deviance: number;
  aic: number;
  n: number;
  /** Number of design columns, intercept included. */
  p: number;
  /** n x K predicted probabilities. */
  fitted: Matrix;
  /** Predicted class index per row. */
  predicted: number[];
  accuracy: number;
  iterations: number;
  converged: boolean;
}

const dot = (row: number[], beta: number[]): number =>
  row.reduce((sum, value, index) => sum + value * (beta[index] ?? 0), 0);

interface Evaluation {
  probabilities: Matrix;
  negativeLogLik: number;
}

/**
 * Softmax probabilities for every observation. The first column is the
 * reference class and its linear predictor is identically zero.
 */
const evaluate = (x: Matrix, y: number[], beta: Matrix): Evaluation => {
  const probabilities: Matrix = new Array<number[]>(x.length);
  let negativeLogLik = 0;

  for (let i = 0; i < x.length; i += 1) {
    const row = x[i];
    const eta = new Array<number>(beta.length + 1);
    eta[0] = 0;
    for (let k = 0; k < beta.length; k += 1) eta[k + 1] = dot(row, beta[k]);

    let maximum = 0;
    for (let k = 1; k < eta.length; k += 1) {
      if (eta[k] > maximum) maximum = eta[k];
    }
    const exponentials = eta.map(value => Math.exp(value - maximum));
    const total = exponentials.reduce((sum, value) => sum + value, 0);
    const rowProbabilities = exponentials.map(value => value / total);
    probabilities[i] = rowProbabilities;
    negativeLogLik -= Math.log(Math.max(EPS, rowProbabilities[y[i]]));
  }

  return { probabilities, negativeLogLik };
};

/** Negative log-likelihood gradient with respect to the flattened coefficients. */
const gradient = (x: Matrix, y: number[], probabilities: Matrix): number[] => {
  const classes = probabilities[0].length;
  const width = x[0].length;
  const result = new Array<number>((classes - 1) * width).fill(0);
  for (let i = 0; i < x.length; i += 1) {
    const row = x[i];
    for (let k = 1; k < classes; k += 1) {
      const residual = probabilities[i][k] - (y[i] === k ? 1 : 0);
      const offset = (k - 1) * width;
      for (let j = 0; j < width; j += 1) result[offset + j] += row[j] * residual;
    }
  }
  return result;
};

/** Observed information (Hessian of the negative log-likelihood). */
const information = (x: Matrix, probabilities: Matrix): Matrix => {
  const classes = probabilities[0].length;
  const width = x[0].length;
  const size = (classes - 1) * width;
  const result: Matrix = Array.from({ length: size }, () => new Array<number>(size).fill(0));

  for (let i = 0; i < x.length; i += 1) {
    const row = x[i];
    const probability = probabilities[i];
    for (let k = 1; k < classes; k += 1) {
      for (let l = 1; l < classes; l += 1) {
        const factor = probability[k] * ((k === l ? 1 : 0) - probability[l]);
        if (factor === 0) continue;
        const left = (k - 1) * width;
        const right = (l - 1) * width;
        for (let j = 0; j < width; j += 1) {
          const leftValue = row[j] * factor;
          if (leftValue === 0) continue;
          for (let m = 0; m < width; m += 1) {
            result[left + j][right + m] += leftValue * row[m];
          }
        }
      }
    }
  }

  return result;
};

/** Solve `matrix * x = vector` with Gauss-Jordan elimination. `null` if singular. */
const solve = (matrix: Matrix, vector: number[]): number[] | null => {
  const size = matrix.length;
  const work = matrix.map((row, index) => [...row, vector[index]]);

  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
    }
    if (Math.abs(work[pivot][column]) < 1e-12) return null;
    [work[column], work[pivot]] = [work[pivot], work[column]];
    const divisor = work[column][column];
    for (let j = column; j <= size; j += 1) work[column][j] /= divisor;
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = work[row][column];
      if (factor === 0) continue;
      for (let j = column; j <= size; j += 1) work[row][j] -= factor * work[column][j];
    }
  }

  return work.map(row => row[size]);
};

const flatten = (beta: Matrix): number[] => beta.reduce<number[]>((all, row) => [...all, ...row], []);

const unflatten = (parameters: number[], rows: number, width: number): Matrix =>
  Array.from({ length: rows }, (_, row) =>
    parameters.slice(row * width, (row + 1) * width)
  );

const validity = (input: MultinomialInput): { classes: number; width: number } | null => {
  const { y, x } = input;
  const n = y.length;
  if (n === 0 || x.length !== n) return null;
  const width = x[0]?.length ?? 0;
  if (width === 0) return null;
  if (x.some(row => row.length !== width || row.some(value => !Number.isFinite(value)))) return null;
  if (y.some(value => !Number.isInteger(value) || value < 0)) return null;

  const classes = Math.max(...y) + 1;
  if (classes < 3) return null;
  // Every label in 0..K-1 must occur; an empty class makes the reference
  // contrast non-identifiable.
  for (let k = 0; k < classes; k += 1) {
    if (!y.includes(k)) return null;
  }
  if (input.classes && input.classes.length !== classes) return null;
  // The covariance needs at least one residual degree of freedom.
  if (n <= (classes - 1) * width) return null;
  return { classes, width };
};

/**
 * Fit a multinomial logistic regression.
 *
 * Returns `null` for invalid inputs (empty/mismatched data, fewer than three
 * classes, non-finite values, too few observations, wrong `classes` length),
 * singular information matrices or non-convergence.
 */
export const fitMultinomial = (input: MultinomialInput): MultinomialResult | null => {
  const shape = validity(input);
  if (!shape) return null;
  const { classes, width } = shape;
  const { y, x } = input;
  const parameters = (classes - 1) * width;
  const maxIterations = input.maxIterations ?? 100;
  const tolerance = input.tolerance ?? 1e-8;
  if (!(maxIterations > 0) || !(tolerance > 0)) return null;

  let beta: Matrix = Array.from({ length: classes - 1 }, () => new Array<number>(width).fill(0));
  let current = evaluate(x, y, beta);
  if (!Number.isFinite(current.negativeLogLik)) return null;

  let iterations = 0;
  let converged = false;

  for (; iterations < maxIterations; iterations += 1) {
    const score = gradient(x, y, current.probabilities);
    const hessian = information(x, current.probabilities);
    const direction = solve(
      hessian,
      score.map(value => -value)
    );
    if (!direction || direction.some(value => !Number.isFinite(value))) return null;

    let step = 1;
    let accepted = false;
    let next: Evaluation = current;
    let nextBeta: Matrix = beta;
    while (step > 1e-12) {
      nextBeta = unflatten(
        flatten(beta).map((value, index) => value + step * direction[index]),
        classes - 1,
        width
      );
      next = evaluate(x, y, nextBeta);
      if (Number.isFinite(next.negativeLogLik) && next.negativeLogLik <= current.negativeLogLik) {
        accepted = true;
        break;
      }
      step *= 0.5;
    }
    if (!accepted) return null;

    const change = step * Math.max(...direction.map(value => Math.abs(value)));
    beta = nextBeta;
    current = next;

    // A vanishing Newton step means the gradient vanished too: the likelihood
    // is stationary. Do not use the log-likelihood change alone, which would
    // declare convergence along a flat separating direction.
    if (change < tolerance) {
      converged = true;
      iterations += 1;
      break;
    }
  }

  if (!converged) return null;

  const covariance = invert(information(x, current.probabilities));
  if (!covariance) return null;

  const coefficients = beta;
  const standardErrors: Matrix = Array.from({ length: classes - 1 }, () => new Array<number>(width).fill(0));
  const z: Matrix = Array.from({ length: classes - 1 }, () => new Array<number>(width).fill(0));
  const pValues: Matrix = Array.from({ length: classes - 1 }, () => new Array<number>(width).fill(0));

  for (let k = 0; k < classes - 1; k += 1) {
    for (let j = 0; j < width; j += 1) {
      const index = k * width + j;
      const error = Math.sqrt(Math.max(0, covariance[index][index]));
      const statistic = error > 0 ? coefficients[k][j] / error : Number.NaN;
      standardErrors[k][j] = error;
      z[k][j] = statistic;
      pValues[k][j] = Number.isFinite(statistic)
        ? 2 * (1 - jStat.normal.cdf(Math.abs(statistic), 0, 1))
        : Number.NaN;
    }
  }

  const fitted = current.probabilities;
  const predicted = fitted.map(row => row.indexOf(Math.max(...row)));
  const accuracy = predicted.reduce((sum, value, index) => sum + (value === y[index] ? 1 : 0), 0) / y.length;
  const logLik = -current.negativeLogLik;
  const parameterCount = (classes - 1) * width;

  return {
    classes: input.classes ? [...input.classes] : Array.from({ length: classes }, (_, index) => String(index)),
    referenceClass: 0,
    coefficients,
    standardErrors,
    z,
    pValues,
    logLik,
    deviance: -2 * logLik,
    aic: -2 * logLik + 2 * parameterCount,
    n: x.length,
    p: width,
    fitted,
    predicted,
    accuracy,
    iterations,
    converged,
  };
};

/** Test LR per termine del modello multinomiale (una colonna di design per volta). */
export const multinomialEffects = (
  input: MultinomialInput,
  predictorNames: string[]
): LrEffect[] => {
  const full = fitMultinomial(input);
  if (!full) return [];
  const width = input.x[0]?.length ?? 0;
  const effects: LrEffect[] = [];
  // Each non-reference class loses one coefficient, so a dropped column costs
  // K - 1 parameters, not one.
  const parameters = (full.classes.length - 1) * full.p;
  for (let column = 1; column < width; column += 1) {
    const x = input.x.map(row => row.filter((_, position) => position !== column));
    const reduced = fitMultinomial({ ...input, x });
    if (!reduced) continue;
    const test = lrTest(predictorNames[column - 1] ?? `X${column}`, full.logLik, parameters, {
      logLik: reduced.logLik,
      df: (reduced.classes.length - 1) * reduced.p,
    });
    if (test) effects.push(test);
  }
  return effects;
};
