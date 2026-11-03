/**
 * Generalized linear mixed models (GLMM) with one grouping factor.
 *
 * `eta_i = X_i beta + Z_i b_{g(i)}`, `b_g ~ N(0, D)` (D 1x1 intercept-only or
 * 2x2 with slope and covariance). The marginal likelihood uses Laplace's
 * method: per group the conditional mode is found with damped Newton, then
 *
 *   logLik = sum_g [ log f(y_g | b_g) - 0.5 b_g' D^-1 b_g
 *                    - 0.5 log|D| - 0.5 log|H_g| ],   H_g = Z_g' W_g Z_g + D^-1
 *
 * `beta` and the variance components are maximised with BFGS (numerical
 * gradient) plus a short Newton polish; standard deviations use `exp`, the
 * correlation `tanh`. Fixed-effect SEs come from the numerical Hessian of the
 * Laplace log-likelihood with respect to `beta`, re-solving the group modes at
 * every perturbed `beta` (the profile-over-b Hessian, equal to the conditional
 * `(X'V^-1 X)^-1` used by lme4). BLUP SEs use `diag(H_g^-1)`.
 *
 * Declared approximations: binomial ICC uses `pi^2 / 3` as the observation
 * variance; Poisson ICC uses `log(1 + 1 / mean(y))` (lognormal).
 */

import { jStat } from '../jstat';
import { invert, pseudoInverse, rank, type Matrix } from './matrix';
import { bfgs } from './optimize';
import { zCrit, zTwoSidedP } from './distributions';

export type GlmmFamily = 'gaussian' | 'binomial' | 'poisson';
export type GlmmLink = 'identity' | 'logit' | 'log';

export interface GlmmInput {
  /** Risposta per riga; binomiale richiede 0/1. */
  y: number[];
  /** Matrice di design a effetti fissi CON la colonna intercetta già prima. */
  x: Matrix;
  /** Predittore della pendenza casuale, scala originale. */
  slope?: number[];
  /** Etichetta di gruppo per riga. */
  groups: string[];
  family: GlmmFamily;
  link: GlmmLink;
  /** Pendenza casuale oltre all'intercetta (default false). */
  randomSlope?: boolean;
  level?: number;
  maxIterations?: number;
  tolerance?: number;
}

export interface GlmmCoefficient {
  term: string; beta: number; se: number; z: number; p: number; lo: number; hi: number;
}

export interface GlmmRandomEffect {
  group: string; n: number;
  intercept: number; interceptSe: number;
  slope: number; slopeSe: number;
}

export interface GlmmResult {
  family: GlmmFamily;
  link: GlmmLink;
  randomSlope: boolean;
  n: number;
  groups: number;
  /** Parametri liberi: coefficienti fissi + componenti di varianza. */
  k: number;
  df: number;
  coefficients: GlmmCoefficient[];
  random: {
    interceptVariance: number; slopeVariance: number; covariance: number; correlation: number;
    /** Solo gaussiana; NaN per binomiale/Poisson. */
    residualVariance: number;
  };
  randomEffects: GlmmRandomEffect[];
  fitted: number[];
  linearPredictor: number[];
  residuals: number[];
  logLik: number;
  aic: number;
  bic: number;
  icc: number;
  iterations: number;
  converged: boolean;
  level: number;
}

/** Link ammessi per famiglia. */
export const GLMM_LINKS: Record<GlmmFamily, GlmmLink[]> = {
  gaussian: ['identity'],
  binomial: ['logit'],
  poisson: ['log'],
};

const EPS = 1e-12;
const MAX_EXPONENT = 15;
/** Variance ratio below which the estimate is flagged as a boundary solution. */
const BOUNDARY_RATIO = 1e-4;

const clamp = (value: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, value));

const maxAbs = (values: readonly number[]): number =>
  values.reduce((best, value) => Math.max(best, Math.abs(value)), 0);

const mean = (values: readonly number[]): number =>
  values.length === 0 ? Number.NaN : values.reduce((sum, value) => sum + value, 0) / values.length;

const sampleVariance = (values: readonly number[]): number => {
  if (values.length < 2) return Number.NaN;
  const center = mean(values);
  return values.reduce((sum, value) => sum + (value - center) ** 2, 0) / (values.length - 1);
};

const stableLogistic = (eta: number): number => {
  if (eta >= 0) return 1 / (1 + Math.exp(-eta));
  const exponential = Math.exp(eta);
  return exponential / (1 + exponential);
};

/** Response-scale mean, conditional score `d log f / d eta` and weight `-d^2 log f / d eta^2`. */
interface ObservationPoint { mu: number; score: number; weight: number }

const observationPoint = (family: GlmmFamily, y: number, eta: number, sigma2: number): ObservationPoint => {
  if (family === 'gaussian') return { mu: eta, score: (y - eta) / sigma2, weight: 1 / sigma2 };
  if (family === 'binomial') {
    const mu = clamp(stableLogistic(eta), EPS, 1 - EPS);
    return { mu, score: y - mu, weight: Math.max(mu * (1 - mu), EPS) };
  }
  const mu = Math.exp(clamp(eta, -200, 200));
  return { mu, score: y - mu, weight: Math.max(mu, EPS) };
};

/** Conditional log-density of one observation, constants independent of the model dropped. */
const conditionalLogDensity = (family: GlmmFamily, y: number, eta: number, sigma2: number): number => {
  if (family === 'gaussian') return -0.5 * (Math.log(2 * Math.PI * sigma2) + (y - eta) ** 2 / sigma2);
  if (family === 'binomial') {
    const mu = clamp(stableLogistic(eta), EPS, 1 - EPS);
    return y * Math.log(mu) + (1 - y) * Math.log1p(-mu);
  }
  return y * eta - Math.exp(clamp(eta, -200, 200)) - jStat.gammaln(y + 1);
};

/** Inverse of a 1x1 or 2x2 matrix with a closed form. */
const invertSmall = (matrix: Matrix): Matrix | null => {
  if (matrix.length === 1) {
    const value = matrix[0][0];
    return Number.isFinite(value) && Math.abs(value) > 1e-14 ? [[1 / value]] : null;
  }
  const [[a, b], [c, d]] = matrix;
  const determinant = a * d - b * c;
  if (!Number.isFinite(determinant) || Math.abs(determinant) <= 1e-14) return null;
  return [[d / determinant, -b / determinant], [-c / determinant, a / determinant]];
};

const solveSmall = (matrix: Matrix, vector: number[]): number[] | null => {
  const inverse = invertSmall(matrix);
  return inverse ? inverse.map(row => row[0] * vector[0] + (row[1] ?? 0) * (vector[1] ?? 0)) : null;
};

interface GroupData {
  label: string;
  indices: number[];
  /** `[1]` or `[1, slope_i]` per row, original scale. */
  z: number[][];
}

interface Prepared {
  y: number[];
  x: Matrix;
  family: GlmmFamily;
  link: GlmmLink;
  randomSlope: boolean;
  n: number;
  p: number;
  groups: GroupData[];
}

/** Validate the input and freeze the group layout. `null` means "cannot fit". */
const prepare = (input: GlmmInput): Prepared | null => {
  const { y, x, groups, family, link } = input;
  if (!GLMM_LINKS[family] || !GLMM_LINKS[family].includes(link)) return null;
  const n = y.length;
  if (n < 2 || x.length !== n || groups.length !== n) return null;
  const p = x[0]?.length ?? 0;
  if (p < 1 || p >= n) return null;
  if (x.some(row => row.length !== p || row.some(value => !Number.isFinite(value)))) return null;
  if (y.some(value => !Number.isFinite(value))) return null;
  if (family === 'binomial' && y.some(value => value !== 0 && value !== 1)) return null;
  if (family === 'poisson' && y.some(value => value < 0)) return null;

  const randomSlope = input.randomSlope === true;
  // Leave at least one residual degree of freedom.
  const parameterCount = p + (randomSlope ? 3 : 1) + (family === 'gaussian' ? 1 : 0);
  if (parameterCount >= n) return null;
  const slope = input.slope;
  if (randomSlope && (!slope || slope.length !== n || slope.some(value => !Number.isFinite(value)))) return null;

  const index = new Map<string, number>();
  const blocks: GroupData[] = [];
  for (let row = 0; row < n; row += 1) {
    const label = String(groups[row] ?? '').trim();
    if (label === '') return null;
    let position = index.get(label);
    if (position === undefined) {
      position = blocks.length;
      index.set(label, position);
      blocks.push({ label, indices: [], z: [] });
    }
    blocks[position].indices.push(row);
  }
  if (blocks.length < 2) return null;
  if (blocks.some(group => group.indices.length < (randomSlope ? 3 : 2))) return null;
  for (const group of blocks) {
    group.z = group.indices.map(row => (randomSlope ? [1, (slope as number[])[row]] : [1]));
  }
  if (rank(x) !== p) return null;
  return { y, x, family, link, randomSlope, n, p, groups: blocks };
};

interface VarianceParameters {
  beta: number[];
  sigmaE: number;
  sigmaU: number;
  sigmaV: number;
  rho: number;
  dInv: Matrix;
  logDetD: number;
}

/** Map the unconstrained parameter vector to the model parameters. */
const unpack = (theta: number[], p: number, family: GlmmFamily, randomSlope: boolean): VarianceParameters | null => {
  const count = randomSlope ? 3 : 1;
  if (theta.length !== p + count + (family === 'gaussian' ? 1 : 0)) return null;
  const beta = theta.slice(0, p);
  if (beta.some(value => !Number.isFinite(value))) return null;
  const sigmaE = family === 'gaussian' ? Math.exp(clamp(theta[p + count], -MAX_EXPONENT, MAX_EXPONENT)) : 1;
  const sigmaU = Math.exp(clamp(theta[p], -MAX_EXPONENT, MAX_EXPONENT)) * sigmaE;
  const sigmaV = randomSlope ? Math.exp(clamp(theta[p + 1], -MAX_EXPONENT, MAX_EXPONENT)) * sigmaE : 0;
  const rho = randomSlope ? clamp(Math.tanh(theta[p + 2]), -0.999, 0.999) : 0;
  if (![sigmaE, sigmaU, sigmaV, rho].every(value => Number.isFinite(value)) || !(sigmaU > 0)) return null;
  if (!randomSlope) {
    return { beta, sigmaE, sigmaU, sigmaV, rho, dInv: [[1 / (sigmaU * sigmaU)]], logDetD: 2 * Math.log(sigmaU) };
  }
  const covariance = rho * sigmaU * sigmaV;
  const determinant = sigmaU * sigmaU * sigmaV * sigmaV * (1 - rho * rho);
  if (!(determinant > 0) || !Number.isFinite(determinant)) return null;
  const dInv: Matrix = [
    [(sigmaV * sigmaV) / determinant, -covariance / determinant],
    [-covariance / determinant, (sigmaU * sigmaU) / determinant],
  ];
  return { beta, sigmaE, sigmaU, sigmaV, rho, dInv, logDetD: Math.log(determinant) };
};

interface WorkingState {
  logLik: number; quadratic: number; h: Matrix;
  score: number[]; mu: number[]; eta: number[];
}

interface GroupMode {
  b: number[];
  /** `H_g = Z_g' W_g Z_g + D^-1` and its inverse. */
  hInv: Matrix;
  logDetH: number; logLik: number;
  /** `b' D^-1 b` at the mode. */
  quadratic: number; mu: number[]; eta: number[];
}

const workingState = (
  prepared: Prepared, group: GroupData, beta: number[], b: number[], sigma2: number, dInv: Matrix
): WorkingState | null => {
  const { family, x, y, randomSlope } = prepared;
  const size = group.indices.length;
  const dimension = randomSlope ? 2 : 1;
  const eta = new Array<number>(size);
  const mu = new Array<number>(size);
  const score = new Array<number>(size);
  const h: Matrix = dimension === 1 ? [[0]] : [[0, 0], [0, 0]];
  let logLik = 0;
  let quadratic = 0;
  for (let position = 0; position < size; position += 1) {
    const row = group.indices[position];
    const z = group.z[position];
    let linear = 0;
    for (let j = 0; j < beta.length; j += 1) linear += x[row][j] * beta[j];
    for (let j = 0; j < dimension; j += 1) linear += z[j] * b[j];
    if (!Number.isFinite(linear)) return null;
    const point = observationPoint(family, y[row], linear, sigma2);
    if (!Number.isFinite(point.mu) || !Number.isFinite(point.score) || !Number.isFinite(point.weight)) return null;
    eta[position] = linear;
    mu[position] = point.mu;
    score[position] = point.score;
    logLik += conditionalLogDensity(family, y[row], linear, sigma2);
    for (let a = 0; a < dimension; a += 1) {
      for (let c = 0; c < dimension; c += 1) h[a][c] += point.weight * z[a] * z[c];
    }
  }
  for (let a = 0; a < dimension; a += 1) {
    for (let c = 0; c < dimension; c += 1) h[a][c] += dInv[a][c];
    quadratic += b[a] * (dInv[a][0] * b[0] + (dimension > 1 ? dInv[a][1] * b[1] : 0));
  }
  if (!Number.isFinite(logLik) || !Number.isFinite(quadratic)) return null;
  return { logLik, quadratic, h, score, mu, eta };
};

/** Damped Newton for the conditional mode of one group. */
const groupMode = (
  prepared: Prepared, group: GroupData, beta: number[], dInv: Matrix, sigma2: number
): GroupMode | null => {
  const dimension = prepared.randomSlope ? 2 : 1;
  let b = new Array<number>(dimension).fill(0);
  let state = workingState(prepared, group, beta, b, sigma2, dInv);
  if (!state) return null;
  let penalised = state.logLik - 0.5 * state.quadratic;
  let converged = false;
  for (let iteration = 0; iteration < 100; iteration += 1) {
    const gradient = new Array<number>(dimension).fill(0);
    for (let position = 0; position < group.indices.length; position += 1) {
      const z = group.z[position];
      for (let a = 0; a < dimension; a += 1) gradient[a] += state.score[position] * z[a];
    }
    for (let a = 0; a < dimension; a += 1) {
      gradient[a] -= dInv[a][0] * b[0] + (dimension > 1 ? dInv[a][1] * b[1] : 0);
    }
    if (maxAbs(gradient) < 1e-10) { converged = true; break; }
    const direction = solveSmall(state.h, gradient);
    if (!direction || direction.some(value => !Number.isFinite(value))) return null;
    let step = 1;
    let accepted = false;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const candidate = b.map((value, index) => value + step * direction[index]);
      const nextState = workingState(prepared, group, beta, candidate, sigma2, dInv);
      if (nextState) {
        const nextPenalised = nextState.logLik - 0.5 * nextState.quadratic;
        if (nextPenalised >= penalised - 1e-12 * Math.max(1, Math.abs(penalised))) {
          accepted = true;
          b = candidate;
          penalised = nextPenalised;
          state = nextState;
          break;
        }
      }
      step *= 0.5;
    }
    if (!accepted) return null;
    if (step * maxAbs(direction) < 1e-12) { converged = true; break; }
  }
  if (!converged) return null;

  const finalState = workingState(prepared, group, beta, b, sigma2, dInv);
  if (!finalState) return null;
  const hInv = invertSmall(finalState.h);
  if (!hInv) return null;
  const determinant = dimension === 1
    ? finalState.h[0][0]
    : finalState.h[0][0] * finalState.h[1][1] - finalState.h[0][1] * finalState.h[1][0];
  if (!(determinant > 0) || !Number.isFinite(determinant)) return null;
  return {
    b, hInv, logDetH: Math.log(determinant), logLik: finalState.logLik,
    quadratic: finalState.quadratic, mu: finalState.mu, eta: finalState.eta,
  };
};

/** Laplace log-likelihood for fixed `beta` and variance parameters. */
const laplaceLogLik = (prepared: Prepared, parameters: VarianceParameters): number | null => {
  const sigma2 = parameters.sigmaE * parameters.sigmaE;
  let total = 0;
  for (const group of prepared.groups) {
    const mode = groupMode(prepared, group, parameters.beta, parameters.dInv, sigma2);
    if (!mode) return null;
    total += mode.logLik - 0.5 * mode.quadratic - 0.5 * parameters.logDetD - 0.5 * mode.logDetH;
  }
  return Number.isFinite(total) ? total : null;
};

const solveLinearMatrix = (matrix: Matrix, vector: number[]): number[] | null => {
  const inverse = invert(matrix);
  return inverse ? inverse.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0)) : null;
};

/** Least-squares slope and intercept for a small group. */
const simpleRegression = (values: number[], predictors: number[]): { intercept: number; slope: number } | null => {
  const meanX = mean(predictors);
  const meanY = mean(values);
  let sxx = 0;
  let sxy = 0;
  for (let index = 0; index < values.length; index += 1) {
    const dx = predictors[index] - meanX;
    sxx += dx * dx;
    sxy += dx * (values[index] - meanY);
  }
  if (!(sxx > 0) || !Number.isFinite(sxx)) return null;
  const slope = sxy / sxx;
  return { intercept: meanY - slope * meanX, slope };
};

/** Fixed-effects GLM / OLS, used only for starting values. */
const fitFixedEffects = (
  y: number[], x: Matrix, family: GlmmFamily
): { beta: number[]; dispersion: number } | null => {
  const p = x[0].length;
  const n = y.length;
  if (family === 'gaussian') {
    const xtx: Matrix = Array.from({ length: p }, () => new Array<number>(p).fill(0));
    const xty = new Array<number>(p).fill(0);
    for (let row = 0; row < n; row += 1) {
      for (let a = 0; a < p; a += 1) {
        xty[a] += x[row][a] * y[row];
        for (let b = 0; b < p; b += 1) xtx[a][b] += x[row][a] * x[row][b];
      }
    }
    const inverse = invert(xtx);
    if (!inverse) return null;
    const beta = inverse.map(row => row.reduce((sum, value, index) => sum + value * xty[index], 0));
    let rss = 0;
    for (let row = 0; row < n; row += 1) {
      let fitted = 0;
      for (let j = 0; j < p; j += 1) fitted += x[row][j] * beta[j];
      rss += (y[row] - fitted) ** 2;
    }
    const dispersion = rss / Math.max(1, n - p);
    return dispersion > 0 ? { beta, dispersion } : null;
  }

  // IRLS, canonical links only (binomial logit, Poisson log).
  let beta = new Array<number>(p).fill(0);
  let eta = new Array<number>(n).fill(0);
  for (let iteration = 0; iteration < 100; iteration += 1) {
    const information: Matrix = Array.from({ length: p }, () => new Array<number>(p).fill(0));
    const gradient = new Array<number>(p).fill(0);
    for (let row = 0; row < n; row += 1) {
      const point = observationPoint(family, y[row], eta[row], 1);
      const weight = Math.max(point.weight, 1e-10);
      for (let a = 0; a < p; a += 1) {
        gradient[a] += x[row][a] * point.score;
        for (let b = 0; b < p; b += 1) information[a][b] += x[row][a] * weight * x[row][b];
      }
    }
    const step = solveLinearMatrix(information, gradient);
    if (!step) return null;
    beta = beta.map((value, index) => value + step[index]);
    eta = x.map(row => row.reduce((sum, value, index) => sum + value * beta[index], 0));
    if (maxAbs(step) < 1e-10) return { beta, dispersion: 1 };
  }
  return null;
};

const initialParameters = (prepared: Prepared): number[] | null => {
  const { y, x, family, p, groups, randomSlope, n } = prepared;
  const glm = fitFixedEffects(y, x, family);
  if (!glm) return null;
  const beta = glm.beta;
  const sigmaE = family === 'gaussian' ? Math.sqrt(Math.max(glm.dispersion, 1e-8)) : 1;

  const working = new Array<number>(n);
  for (let row = 0; row < n; row += 1) {
    let eta = 0;
    for (let j = 0; j < p; j += 1) eta += x[row][j] * beta[j];
    const point = observationPoint(family, y[row], eta, sigmaE * sigmaE);
    if (family === 'gaussian') working[row] = y[row];
    else if (family === 'binomial') {
      working[row] = eta + (y[row] - point.mu) / Math.max(point.mu * (1 - point.mu), 1e-8);
    } else working[row] = eta + (y[row] - point.mu) / Math.max(point.mu, 1e-8);
    if (!Number.isFinite(working[row])) return null;
  }

  // Per-group intercepts and (optionally) slopes drive the starting variances.
  const intercepts: number[] = [];
  const slopes: number[] = [];
  for (const group of groups) {
    const values = group.indices.map(row => working[row]);
    const fit = randomSlope ? simpleRegression(values, group.z.map(z => z[1])) : null;
    intercepts.push(fit ? fit.intercept : mean(values));
    slopes.push(fit ? fit.slope : 0);
  }
  const varianceIntercept = sampleVariance(intercepts);
  const varianceSlope = sampleVariance(slopes);
  const sigmaU = Math.max(1e-2, Math.sqrt(Number.isFinite(varianceIntercept) ? Math.max(varianceIntercept, 0) : 0));
  const sigmaV = Math.max(1e-2, Math.sqrt(Number.isFinite(varianceSlope) ? Math.max(varianceSlope, 0) : 0));
  let rho = 0;
  if (randomSlope && intercepts.length >= 3) {
    const centerI = mean(intercepts);
    const centerS = mean(slopes);
    let covariance = 0;
    let sumI = 0;
    let sumS = 0;
    for (let index = 0; index < intercepts.length; index += 1) {
      const di = intercepts[index] - centerI;
      const ds = slopes[index] - centerS;
      covariance += di * ds;
      sumI += di * di;
      sumS += ds * ds;
    }
    if (sumI > 0 && sumS > 0) rho = clamp(covariance / Math.sqrt(sumI * sumS), -0.5, 0.5);
  }

  const scale = family === 'gaussian' ? Math.max(sigmaE, 1e-8) : 1;
  const theta = [...beta, Math.log(clamp(sigmaU / scale, 1e-6, 1e6))];
  if (randomSlope) theta.push(Math.log(clamp(sigmaV / scale, 1e-6, 1e6)), Math.atanh(clamp(rho, -0.999, 0.999)));
  if (family === 'gaussian') theta.push(Math.log(scale));
  return theta.every(value => Number.isFinite(value)) ? theta : null;
};

/** Central-difference gradient with a one-sided fallback at the edge of the feasible region. */
const numericalGradient = (objective: (values: number[]) => number, x: number[]): number[] => {
  const base = objective(x);
  return x.map((value, index) => {
    const step = 1e-5 * Math.max(1, Math.abs(value));
    const plus = [...x];
    plus[index] += step;
    const minus = [...x];
    minus[index] -= step;
    const up = objective(plus);
    const down = objective(minus);
    if (Number.isFinite(up) && Number.isFinite(down)) return (up - down) / (2 * step);
    if (Number.isFinite(up) && Number.isFinite(base)) return (up - base) / step;
    if (Number.isFinite(down) && Number.isFinite(base)) return (base - down) / step;
    return 0;
  });
};

const numericalHessian = (objective: (values: number[]) => number, x: number[]): Matrix => {
  const size = x.length;
  const hessian: Matrix = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  const steps = x.map(value => 1e-4 * Math.max(1, Math.abs(value)));
  const shifted = (i: number, si: number, j: number, sj: number): number[] => {
    const values = [...x];
    values[i] += si * steps[i];
    values[j] += sj * steps[j];
    return values;
  };
  for (let i = 0; i < size; i += 1) {
    for (let j = i; j < size; j += 1) {
      const value =
        (objective(shifted(i, 1, j, 1)) - objective(shifted(i, 1, j, -1)) -
          objective(shifted(i, -1, j, 1)) + objective(shifted(i, -1, j, -1))) /
        (4 * steps[i] * steps[j]);
      hessian[i][j] = value;
      hessian[j][i] = value;
    }
  }
  return hessian;
};

/** A few safeguarded Newton steps on top of BFGS (BFGS alone stalls on noisy gradients). */
const newtonPolish = (
  objective: (values: number[]) => number, x: number[], maxSteps = 3
): { x: number[]; steps: number } => {
  let current = [...x];
  let value = objective(current);
  let steps = 0;
  for (let iteration = 0; iteration < maxSteps; iteration += 1) {
    const gradient = numericalGradient(objective, current);
    if (!Number.isFinite(maxAbs(gradient)) || maxAbs(gradient) < 1e-9) break;
    const direction = solveLinearMatrix(numericalHessian(objective, current), gradient.map(item => -item));
    if (!direction || direction.some(item => !Number.isFinite(item))) break;
    let step = 1;
    let accepted = false;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidate = current.map((item, index) => item + step * direction[index]);
      const candidateValue = objective(candidate);
      if (Number.isFinite(candidateValue) && candidateValue < value) {
        current = candidate;
        value = candidateValue;
        steps += 1;
        accepted = true;
        break;
      }
      step *= 0.5;
    }
    if (!accepted || step * maxAbs(direction) < 1e-9) break;
  }
  return { x: current, steps };
};

export const fitGlmm = (input: GlmmInput): GlmmResult | null => {
  const prepared = prepare(input);
  if (!prepared) return null;
  const { n, p, family, link, randomSlope } = prepared;

  const start = initialParameters(prepared);
  if (!start) return null;

  const objective = (theta: number[]): number => {
    const parameters = unpack(theta, p, family, randomSlope);
    if (!parameters) return Number.POSITIVE_INFINITY;
    const logLik = laplaceLogLik(prepared, parameters);
    return logLik === null ? Number.POSITIVE_INFINITY : -logLik;
  };

  const maxIterations = input.maxIterations ?? 150;
  const tolerance = input.tolerance ?? 1e-6;
  const gradient = (theta: number[]): number[] => numericalGradient(objective, theta);
  const optimisation = bfgs(objective, gradient, start, {
    maxIterations, tolerance, stepTolerance: 1e-10, maxLineSearch: 40,
  });
  if (optimisation.iterations >= maxIterations) return null;

  const polished = newtonPolish(objective, optimisation.x);
  const theta = polished.x;
  const value = objective(theta);
  if (!Number.isFinite(value)) return null;
  const parameters = unpack(theta, p, family, randomSlope);
  if (!parameters) return null;

  const gradientNorm = maxAbs(gradient(theta));
  let converged = Number.isFinite(gradientNorm) && gradientNorm < Math.max(tolerance, 1e-4);
  // Variance estimated at the boundary: report the fit but not convergence.
  const scale = family === 'gaussian' ? Math.max(parameters.sigmaE, 1e-300) : 1;
  if (parameters.sigmaU / scale < BOUNDARY_RATIO ||
    (randomSlope && parameters.sigmaV / scale < BOUNDARY_RATIO)) converged = false;

  // Hessian with respect to beta at the optimum (group modes re-solved at each
  // perturbation), then invert; fall back to the pseudo-inverse.
  const betaBlock = numericalHessian(objective, theta).slice(0, p).map(row => row.slice(0, p));
  let covariance = invert(betaBlock);
  if (!covariance) {
    const pseudo = pseudoInverse(betaBlock);
    covariance = pseudo.length === p ? pseudo : null;
  }
  if (!covariance) return null;

  const sigma2 = parameters.sigmaE * parameters.sigmaE;
  const modes: GroupMode[] = [];
  for (const group of prepared.groups) {
    const mode = groupMode(prepared, group, parameters.beta, parameters.dInv, sigma2);
    if (!mode) return null;
    modes.push(mode);
  }

  const fitted = new Array<number>(n);
  const linearPredictor = new Array<number>(n);
  prepared.groups.forEach((group, groupIndex) => {
    const mode = modes[groupIndex];
    group.indices.forEach((row, position) => {
      fitted[row] = mode.mu[position];
      linearPredictor[row] = mode.eta[position];
    });
  });
  const residuals = prepared.y.map((value, index) => value - fitted[index]);

  const requested = input.level as number;
  const level = Number.isFinite(requested) && requested > 0 && requested < 100 ? requested : 95;
  const critical = zCrit(level);
  const coefficients: GlmmCoefficient[] = parameters.beta.map((beta, index) => {
    const variance = covariance[index][index];
    const se = variance > 0 ? Math.sqrt(variance) : Number.NaN;
    const z = se > 0 ? beta / se : Number.NaN;
    return {
      term: index === 0 ? '(Intercept)' : `X${index}`,
      beta, se, z,
      p: Number.isFinite(z) ? zTwoSidedP(z) : Number.NaN,
      lo: beta - critical * se,
      hi: beta + critical * se,
    };
  });
  if (coefficients.some(coefficient => !Number.isFinite(coefficient.se))) return null;

  const random: GlmmResult['random'] = {
    interceptVariance: parameters.sigmaU * parameters.sigmaU,
    slopeVariance: randomSlope ? parameters.sigmaV * parameters.sigmaV : 0,
    covariance: randomSlope ? parameters.rho * parameters.sigmaU * parameters.sigmaV : 0,
    correlation: randomSlope ? parameters.rho : 0,
    residualVariance: family === 'gaussian' ? sigma2 : Number.NaN,
  };

  const randomEffects: GlmmRandomEffect[] = prepared.groups.map((group, index) => ({
    group: group.label, n: group.indices.length,
    intercept: modes[index].b[0],
    interceptSe: Math.sqrt(Math.max(0, modes[index].hInv[0][0])),
    slope: randomSlope ? modes[index].b[1] : 0,
    slopeSe: randomSlope ? Math.sqrt(Math.max(0, modes[index].hInv[1][1])) : 0,
  }));

  const logLik = -value;
  const k = p + (randomSlope ? 3 : 1) + (family === 'gaussian' ? 1 : 0);
  let icc: number;
  if (family === 'gaussian') {
    const numerator = random.interceptVariance + (randomSlope ? random.slopeVariance : 0);
    icc = numerator / (numerator + sigma2);
  } else if (family === 'binomial') {
    const observationVariance = (Math.PI * Math.PI) / 3;
    icc = random.interceptVariance / (random.interceptVariance + observationVariance);
  } else {
    // Poisson: lognormal approximation of the observation-level variance.
    const center = mean(prepared.y);
    const observationVariance = center > 0 ? Math.log(1 + 1 / center) : Number.NaN;
    icc = observationVariance > 0
      ? random.interceptVariance / (random.interceptVariance + observationVariance)
      : Number.NaN;
  }

  return {
    family, link, randomSlope, n, groups: prepared.groups.length, k, df: n - k,
    coefficients, random, randomEffects, fitted, linearPredictor, residuals, logLik,
    aic: -2 * logLik + 2 * k, bic: -2 * logLik + k * Math.log(n),
    icc, iterations: optimisation.iterations + polished.steps, converged, level,
  };
};
