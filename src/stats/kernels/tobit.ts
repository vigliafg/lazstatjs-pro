/**
 * Tobit type-I censored regression and Heckman two-step sample selection.
 *
 * Both models share the same `SelectionParams` type in the project, so they
 * live in one kernel module: the analysis entry (`src/analyses/selection`)
 * chooses the estimator from the `mode` parameter.
 *
 * Tobit (maximum likelihood)
 * --------------------------
 * Latent model `y* = xb + e`, `e ~ N(0, sigma^2)`, observed
 * `y = lower` when `y* <= lower`, `y = upper` when `y* >= upper`, `y = y*`
 * otherwise. With `u = (y - xb) / sigma`, the log-likelihood is
 *
 *   uncensored:  log phi(u) - log sigma
 *   lower:       log Phi((lower - xb) / sigma)
 *   upper:       log(1 - Phi((upper - xb) / sigma))
 *
 * parameterised as `[beta, log sigma]` so sigma stays positive. BFGS from the
 * OLS start; standard errors from a central-difference numerical Hessian of
 * the negative log-likelihood at the optimum, inverted. Tests and intervals
 * are normal (z).
 *
 * Heckman two-step
 * ----------------
 * 1. Probit of the 0/1 selection indicator on `[1, z]` (shared `glmFit`).
 * 2. Inverse Mills ratio `lambda_i = phi(z_i gamma) / Phi(z_i gamma)`.
 * 3. OLS of the observed outcome on `W = [1, x, lambda]` over the selected
 *    rows; `delta` is the coefficient of lambda, `rho = delta / sigma` with
 *    `sigma^2 = SSR / (nSelected - k)`.
 *
 * First-stage correction (Murphy–Topel / Greene). The outcome score is
 * `g(theta, gamma) = sum_selected w_i (y_i - w_i' theta)`; because `lambda`
 * depends on `gamma`, `theta_hat` inherits the probit uncertainty. With
 * `A = W'W`, `e = y - W theta`, `theta_lambda = delta` and
 * `L_i = d lambda_i / d gamma = -lambda_i (eta_i + lambda_i) z_i` (z includes
 * the intercept),
 *
 *   C       = sum_selected (e_i e_lambda' - theta_lambda w_i) L_i'
 *   I_gamma = Z' diag(phi_i^2 / (Phi_i (1 - Phi_i))) Z      (all rows)
 *   Var(th) = A^-1 [ sigma^2 A + C I_gamma^-1 C' ] A^-1
 *
 * which is the classical two-step correction: the first term is the OLS
 * variance, the second the contribution of the estimated selection equation.
 * If `I_gamma` or `A` cannot be inverted the kernel falls back to the OLS
 * standard errors and sets `seCorrected = false`; the table/report surfaces
 * that flag instead of pretending the correction was applied.
 *
 * The two-step estimator is not maximum likelihood: no joint Heckman
 * likelihood is reported (`logLik = null`), and `rho` is reported even when
 * its point estimate falls outside (-1, 1), which is possible in small or
 * weakly identified samples.
 */

import { jStat } from '../jstat';
import { addIntercept, glmFit } from './glm';
import { invert, multiply, multiplyVector, transpose, type Matrix } from './matrix';
import { bfgs, type VectorFunction, type VectorGradient } from './optimize';
import { chi2SF, zCrit, zTwoSidedP } from './distributions';

export interface TobitCoefficient {
  term: string;
  beta: number;
  se: number;
  z: number;
  p: number;
  lo: number;
  hi: number;
}

export interface TobitInput {
  /** Response, one value per row; censored rows carry the limit value. */
  y: number[];
  /** Regressors, one column per variable, **without** the intercept. */
  x: Matrix;
  /** Lower censoring limit (left censoring). */
  lower: number;
  /** Upper censoring limit (right censoring); `null`/omitted for none. */
  upper?: number | null;
  /** Confidence level in percent (default 95). */
  level?: number;
}

export interface TobitResult {
  coefficients: TobitCoefficient[];
  sigma: number;
  sigmaSe: number;
  logLik: number;
  aic: number;
  n: number;
  nLower: number;
  nUpper: number;
  nUncensored: number;
  /** Latent mean `x b`, one value per row. */
  fitted: number[];
  /** Expected observed value: `x b` for uncensored rows, the truncated mean
   *  `x b ± sigma * lambda` at the censoring limit otherwise. */
  fittedObserved: number[];
  /** `y - fittedObserved`, one value per row. */
  residuals: number[];
  iterations: number;
  converged: boolean;
}

export interface HeckmanCoefficient {
  term: string;
  beta: number;
  se: number;
  z: number;
  p: number;
  lo: number;
  hi: number;
}

export interface HeckmanInput {
  /** Outcome, one value per row; only selected rows are used. */
  y: number[];
  /** Outcome regressors, one column per variable, without the intercept. */
  x: Matrix;
  /** 0/1 selection indicator, one value per row. */
  selected: number[];
  /** Selection regressors, one column per variable, without the intercept. */
  z: Matrix;
  /** Confidence level in percent (default 95). */
  level?: number;
}

export interface HeckmanWald {
  /** Wald statistic `z^2` for H0: delta = 0 (no selection effect). */
  statistic: number;
  p: number;
}

export interface HeckmanResult {
  /** Outcome equation `[1, x, lambda]`, intercept first, lambda last. */
  coefficients: HeckmanCoefficient[];
  /** Selection equation `[1, z]`, intercept first. */
  selectionCoefficients: HeckmanCoefficient[];
  sigma: number;
  /** `delta / sigma`; reported even outside (-1, 1). */
  rho: number;
  /** Coefficient of the inverse Mills ratio. */
  lambda: number;
  lambdaSe: number;
  /** Inverse Mills ratio per row; 0 for non-selected rows. */
  imr: number[];
  n: number;
  nSelected: number;
  wald: HeckmanWald;
  /** Not defined for the two-step estimator: always `null`. */
  logLik: number | null;
  /** `x b + delta * imr` per row (imr = 0 when not selected). */
  fitted: number[];
  /** `y - fitted` for selected rows; `NaN` elsewhere. */
  residuals: number[];
  /** False when the first-stage correction was not computable. */
  seCorrected: boolean;
  iterations: number;
  converged: boolean;
}

const EPS = 1e-12;
const LOG_2PI = Math.log(2 * Math.PI);

const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, value));

const normalPdf = (value: number): number => jStat.normal.pdf(value, 0, 1);
const normalCdf = (value: number): number => jStat.normal.cdf(value, 0, 1);

const finiteMatrix = (matrix: Matrix, rows: number): boolean =>
  matrix.length === rows &&
  matrix.every(row => Array.isArray(row) && row.length > 0 && row.every(Number.isFinite));

/** Design matrix `rows` with an intercept and the supplied columns. */
const withIntercept = (rows: Matrix): Matrix => addIntercept(rows);

const coefficientRow = (
  term: string,
  beta: number,
  se: number,
  level: number
): TobitCoefficient => {
  const critical = zCrit(level);
  const z = se > 0 ? beta / se : Number.NaN;
  return {
    term,
    beta,
    se,
    z,
    p: Number.isFinite(z) ? zTwoSidedP(z) : Number.NaN,
    lo: beta - critical * se,
    hi: beta + critical * se,
  };
};

// ---------------------------------------------------------------------------
// Tobit type-I
// ---------------------------------------------------------------------------

export const fitTobit = (input: TobitInput): TobitResult | null => {
  const { y, x, lower } = input;
  const upper = input.upper ?? null;
  const level = input.level ?? 95;
  const n = y.length;

  if (n === 0 || !y.every(Number.isFinite)) return null;
  if (!Number.isFinite(lower)) return null;
  if (upper !== null && (!Number.isFinite(upper) || lower >= upper)) return null;
  if (!finiteMatrix(x, n)) return null;

  const width = x[0].length + 1;
  // Parameter vector: `width` beta coefficients plus log sigma.
  const parameterCount = width + 1;
  if (n <= parameterCount) return null;

  const design = withIntercept(x);
  const isLower = (value: number): boolean => value <= lower;
  const isUpper = (value: number): boolean => upper !== null && value >= upper;
  const nLower = y.filter(isLower).length;
  const nUpper = y.filter(isUpper).length;
  const nUncensored = n - nLower - nUpper;

  // A Tobit model with no censoring is plain OLS and with full censoring the
  // likelihood is flat: both are refused instead of returning misleading SEs.
  if (nLower + nUpper === 0 || nUncensored === 0) return null;

  // OLS start on the latent regression.
  const xt = transpose(design);
  const xtxInverse = invert(multiply(xt, design));
  if (!xtxInverse) return null;
  const startBeta = multiplyVector(xtxInverse, multiplyVector(xt, y));
  const startFitted = multiplyVector(design, startBeta);
  const startSsr = y.reduce((sum, value, index) => sum + (value - startFitted[index]) ** 2, 0);
  // Residual standard deviation of the OLS start (as `lm` reports it).
  const startSigma = Math.sqrt(startSsr / (n - width));
  if (!startBeta.every(Number.isFinite) || !(startSigma > 0)) return null;

  /** Negative log-likelihood; `theta = [beta..., log sigma]`. */
  const objective: VectorFunction = theta => {
    const logSigma = theta[width];
    const sigma = Math.exp(logSigma);
    if (!Number.isFinite(sigma) || sigma <= 0) return Number.POSITIVE_INFINITY;

    let total = 0;
    for (let i = 0; i < n; i += 1) {
      const linear = design[i].reduce((sum, value, j) => sum + value * theta[j], 0);
      if (isLower(y[i])) {
        const probability = normalCdf((lower - linear) / sigma);
        if (!(probability > 0) || !Number.isFinite(probability)) return Number.POSITIVE_INFINITY;
        total += Math.log(probability);
      } else if (isUpper(y[i])) {
        const probability = 1 - normalCdf((upper! - linear) / sigma);
        if (!(probability > 0) || !Number.isFinite(probability)) return Number.POSITIVE_INFINITY;
        total += Math.log(probability);
      } else {
        const u = (y[i] - linear) / sigma;
        total += -0.5 * u * u - logSigma - 0.5 * LOG_2PI;
      }
    }
    return -total;
  };

  /** Analytic gradient: uncensored score plus the Mills-ratio terms. */
  const gradient: VectorGradient = theta => {
    const logSigma = theta[width];
    const sigma = Math.exp(logSigma);
    if (!Number.isFinite(sigma) || sigma <= 0) return new Array(parameterCount).fill(0);

    const result = new Array(parameterCount).fill(0);
    for (let i = 0; i < n; i += 1) {
      const row = design[i];
      const linear = row.reduce((sum, value, j) => sum + value * theta[j], 0);
      if (isLower(y[i])) {
        const a = (lower - linear) / sigma;
        const probability = clamp(normalCdf(a), EPS, 1);
        const mills = normalPdf(a) / probability;
        for (let j = 0; j < width; j += 1) {
          result[j] += -mills * (row[j] / sigma);
        }
        result[width] += -mills * a;
      } else if (isUpper(y[i])) {
        const a = (upper! - linear) / sigma;
        const survival = Math.max(EPS, 1 - normalCdf(a));
        const mills = normalPdf(a) / survival;
        for (let j = 0; j < width; j += 1) {
          result[j] += mills * (row[j] / sigma);
        }
        result[width] += mills * a;
      } else {
        const u = (y[i] - linear) / sigma;
        for (let j = 0; j < width; j += 1) {
          result[j] += (row[j] / sigma) * u;
        }
        result[width] += u * u - 1;
      }
    }
    // The loop accumulates the score of the log-likelihood (the terms above
    // are d logL/d theta); the optimiser minimises the negative likelihood.
    return result.map(value => -value);
  };

  const start = [...startBeta, Math.log(startSigma)];
  const optimum = bfgs(objective, gradient, start, {
    maxIterations: 1000,
    tolerance: 1e-10,
    stepTolerance: 1e-12,
  });
  const theta = optimum.x;
  if (!theta.every(Number.isFinite)) return null;

  const logSigma = theta[width];
  const sigma = Math.exp(logSigma);
  if (!(sigma > 0) || !Number.isFinite(sigma)) return null;
  const beta = theta.slice(0, width);

  // Central-difference Hessian of the negative log-likelihood.
  const hessian: Matrix = Array.from({ length: parameterCount }, () =>
    new Array<number>(parameterCount).fill(0)
  );
  const steps = theta.map(value => 1e-4 * Math.max(1, Math.abs(value)));
  for (let i = 0; i < parameterCount; i += 1) {
    for (let j = i; j < parameterCount; j += 1) {
      const plusI = [...theta];
      const minusI = [...theta];
      const plusJ = [...theta];
      const minusJ = [...theta];
      plusI[i] += steps[i];
      minusI[i] -= steps[i];
      plusJ[j] += steps[j];
      minusJ[j] -= steps[j];
      let value: number;
      if (i === j) {
        value = (objective(plusI) - 2 * objective(theta) + objective(minusI)) / (steps[i] * steps[i]);
      } else {
        const plusPlus = [...theta];
        const plusMinus = [...theta];
        const minusPlus = [...theta];
        const minusMinus = [...theta];
        plusPlus[i] += steps[i];
        plusPlus[j] += steps[j];
        plusMinus[i] += steps[i];
        plusMinus[j] -= steps[j];
        minusPlus[i] -= steps[i];
        minusPlus[j] += steps[j];
        minusMinus[i] -= steps[i];
        minusMinus[j] -= steps[j];
        value =
          (objective(plusPlus) -
            objective(plusMinus) -
            objective(minusPlus) +
            objective(minusMinus)) /
          (4 * steps[i] * steps[j]);
      }
      hessian[i][j] = value;
      hessian[j][i] = value;
    }
  }
  const covariance = invert(hessian);
  if (!covariance) return null;
  if (covariance.some(row => row.some(value => !Number.isFinite(value)))) return null;

  const logLik = -objective(theta);
  if (!Number.isFinite(logLik)) return null;

  const terms = ['(Intercept)', ...Array.from({ length: width - 1 }, (_, index) => `x${index + 1}`)];
  const coefficients = beta.map((value, index) =>
    coefficientRow(terms[index], value, Math.sqrt(Math.max(0, covariance[index][index])), level)
  );
  const sigmaSe = Math.sqrt(Math.max(0, covariance[width][width] * sigma * sigma));

  const fitted = design.map(row => row.reduce((sum, value, index) => sum + value * beta[index], 0));
  const fittedObserved = fitted.map((linear, index) => {
    if (isLower(y[index])) {
      const a = (lower - linear) / sigma;
      return linear - sigma * (normalPdf(a) / Math.max(EPS, normalCdf(a)));
    }
    if (isUpper(y[index])) {
      const a = (upper! - linear) / sigma;
      return linear + sigma * (normalPdf(a) / Math.max(EPS, 1 - normalCdf(a)));
    }
    return linear;
  });

  return {
    coefficients,
    sigma,
    sigmaSe,
    logLik,
    aic: -2 * logLik + 2 * parameterCount,
    n,
    nLower,
    nUpper,
    nUncensored,
    fitted,
    fittedObserved,
    residuals: y.map((value, index) => value - fittedObserved[index]),
    iterations: optimum.iterations,
    converged: optimum.converged,
  };
};

// ---------------------------------------------------------------------------
// Heckman two-step
// ---------------------------------------------------------------------------

/** Inverse Mills ratio with a guard against a degenerate probit fit. */
const millsRatio = (eta: number): number => {
  const probability = clamp(normalCdf(eta), EPS, 1 - 1e-16);
  return normalPdf(eta) / probability;
};

export const fitHeckman = (input: HeckmanInput): HeckmanResult | null => {
  const { y, x, selected, z } = input;
  const level = input.level ?? 95;
  const n = y.length;

  if (n === 0 || !y.every(Number.isFinite)) return null;
  if (!finiteMatrix(x, n) || !finiteMatrix(z, n)) return null;
  if (selected.length !== n || !selected.every(value => value === 0 || value === 1)) return null;

  const selectedIndex: number[] = [];
  for (let i = 0; i < n; i += 1) if (selected[i] === 1) selectedIndex.push(i);
  const nSelected = selectedIndex.length;
  if (nSelected === 0 || nSelected === n) return null;

  const xWidth = x[0].length;
  const zWidth = z[0].length;
  // Outcome design [1, x, lambda].
  const k = 1 + xWidth + 1;
  if (nSelected <= k) return null;

  const zDesign = withIntercept(z);
  const probit = glmFit({
    y: selected,
    x: zDesign,
    family: 'binomial',
    link: 'probit',
    maxIterations: 200,
    tolerance: 1e-12,
  });
  if (!probit) return null;

  const eta = probit.linearPredictor;
  const imrAll = eta.map(millsRatio);
  if (!imrAll.every(Number.isFinite)) return null;

  // Outcome OLS on the selected rows with W = [1, x, lambda].
  const w: Matrix = selectedIndex.map(index => [1, ...x[index], imrAll[index]]);
  const ySelected = selectedIndex.map(index => y[index]);
  const wt = transpose(w);
  const a = multiply(wt, w);
  const aInverse = invert(a);
  if (!aInverse) return null;
  const beta = multiplyVector(aInverse, multiplyVector(wt, ySelected));
  if (!beta.every(Number.isFinite)) return null;

  const residualsSelected = ySelected.map(
    (value, index) => value - w[index].reduce((sum, cell, j) => sum + cell * beta[j], 0)
  );
  const ssr = residualsSelected.reduce((sum, value) => sum + value * value, 0);
  const sigma2 = ssr / (nSelected - k);
  if (!(sigma2 > 0)) return null;
  const sigma = Math.sqrt(sigma2);
  const lambda = beta[k - 1];
  const rho = lambda / sigma;

  // First-stage information (all rows) and score derivative C (selected rows).
  const information: Matrix = Array.from({ length: zWidth + 1 }, () =>
    new Array<number>(zWidth + 1).fill(0)
  );
  const derivativeLambda = eta.map((value, index) => {
    const ratio = imrAll[index];
    return -ratio * (value + ratio);
  });
  for (let i = 0; i < n; i += 1) {
    const probability = clamp(normalCdf(eta[i]), EPS, 1 - EPS);
    const weight = (normalPdf(eta[i]) ** 2) / (probability * (1 - probability));
    const row = zDesign[i];
    for (let p = 0; p < row.length; p += 1) {
      for (let q = 0; q < row.length; q += 1) {
        information[p][q] += weight * row[p] * row[q];
      }
    }
  }
  const informationInverse = invert(information);

  let covariance: Matrix | null = null;
  if (informationInverse) {
    const c: Matrix = Array.from({ length: k }, () => new Array<number>(zWidth + 1).fill(0));
    for (let s = 0; s < nSelected; s += 1) {
      const index = selectedIndex[s];
      const score = w[s].map((value, position) =>
        position === k - 1 ? residualsSelected[s] - lambda * value : -lambda * value
      );
      const row = zDesign[index];
      for (let p = 0; p < k; p += 1) {
        for (let q = 0; q < row.length; q += 1) {
          c[p][q] += score[p] * derivativeLambda[index] * row[q];
        }
      }
    }
    const cPrime = transpose(c);
    const correction = multiply(multiply(c, informationInverse), cPrime);
    covariance = multiply(multiply(aInverse, correction), aInverse);
    // Var(theta) = sigma^2 A^-1 + A^-1 (C I_gamma^-1 C') A^-1.
    covariance = covariance.map((row, i) =>
      row.map((value, j) => value + sigma2 * aInverse[i][j])
    );
    // A non-finite entry means the two matrix products drifted: fall back to
    // the OLS standard errors rather than reporting NaN.
    if (covariance.some(row => row.some(value => !Number.isFinite(value)))) covariance = null;
  }

  const seCorrected = covariance !== null;
  const outcomeTerms = [
    '(Intercept)',
    ...Array.from({ length: xWidth }, (_, index) => `x${index + 1}`),
    'lambda',
  ];
  const outcomeCovariance = covariance ?? aInverse.map(row => row.map(value => value * sigma2));
  const coefficients = beta.map((value, index) =>
    coefficientRow(
      outcomeTerms[index],
      value,
      Math.sqrt(Math.max(0, outcomeCovariance[index][index])),
      level
    )
  );

  const selectionCovariance =
    informationInverse ?? probit.coefficients.map((_, row) =>
      probit.coefficients.map((__, column) => (row === column ? probit.coefficients[row].se ** 2 : 0))
    );
  const selectionTerms = [
    '(Intercept)',
    ...Array.from({ length: zWidth }, (_, index) => `z${index + 1}`),
  ];
  const selectionCoefficients = probit.coefficients.map((value, index) =>
    coefficientRow(
      selectionTerms[index],
      value.beta,
      Math.sqrt(Math.max(0, selectionCovariance[index][index])),
      level
    )
  );

  const lambdaSe = coefficients[k - 1].se;
  const waldZ = lambdaSe > 0 ? lambda / lambdaSe : Number.NaN;

  const imr = selected.map((value, index) => (value === 1 ? imrAll[index] : 0));

  const fitted = x.map((row, index) => {
    const linear = row.reduce((sum, value, position) => sum + value * beta[position + 1], 0) + beta[0];
    return linear + lambda * (selected[index] === 1 ? imrAll[index] : 0);
  });
  const residuals = y.map((value, index) =>
    selected[index] === 1 ? value - fitted[index] : Number.NaN
  );

  return {
    coefficients,
    selectionCoefficients,
    sigma,
    rho,
    lambda,
    lambdaSe,
    imr,
    n,
    nSelected,
    wald: {
      statistic: Number.isFinite(waldZ) ? waldZ * waldZ : Number.NaN,
      p: Number.isFinite(waldZ) ? chi2SF(waldZ * waldZ, 1) : Number.NaN,
    },
    logLik: null,
    fitted,
    residuals,
    seCorrected,
    iterations: probit.iterations + 1,
    converged: probit.converged,
  };
};
