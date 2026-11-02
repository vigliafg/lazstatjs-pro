/**
 * Numerical optimisation helpers shared by the advanced kernels.
 *
 * The GLM/GLMM, SEM, IRT, latent-class and survival modules need the same
 * convergence machinery; keeping it here avoids a private Newton/BFGS loop in
 * every new kernel. All functions are deterministic and side-effect free.
 */

import { solveLinear, type Matrix } from './matrix';

export interface OptimizeOptions {
  maxIterations?: number;
  /** Stop when the gradient norm or the log-likelihood change is below this. */
  tolerance?: number;
  /** Stop when the parameter step is below this. */
  stepTolerance?: number;
  /** Maximum backtracking steps for the line search. */
  maxLineSearch?: number;
}

export interface RootResult {
  x: number;
  fx: number;
  iterations: number;
  converged: boolean;
}

export interface OptimizeResult {
  x: number[];
  value: number;
  gradient: number[];
  iterations: number;
  converged: boolean;
}

export type ScalarFunction = (x: number) => number;
export type ScalarDerivative = (x: number) => number;
export type VectorFunction = (x: number[]) => number;
export type VectorGradient = (x: number[]) => number[];
export type VectorHessian = (x: number[]) => Matrix;

const DEFAULTS: Required<OptimizeOptions> = {
  maxIterations: 100,
  tolerance: 1e-8,
  stepTolerance: 1e-10,
  maxLineSearch: 30,
};

const norm = (values: number[]): number =>
  Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));

const dot = (a: number[], b: number[]): number =>
  a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);

const axpy = (a: number[], x: number[], alpha: number): number[] =>
  a.map((value, index) => value + alpha * (x[index] ?? 0));

/**
 * Scalar Newton–Raphson for root finding (`f(x) = 0`).
 *
 * Used by gamma shape MLE and by link-function inversions when a closed form
 * is not available.
 */
export const newtonRoot = (
  f: ScalarFunction,
  derivative: ScalarDerivative,
  start: number,
  options: OptimizeOptions = {}
): RootResult => {
  const settings = { ...DEFAULTS, ...options };
  let x = start;
  let fx = f(x);
  let converged = false;
  let iterations = 0;

  for (; iterations < settings.maxIterations; iterations += 1) {
    const slope = derivative(x);
    if (!Number.isFinite(slope) || Math.abs(slope) < 1e-14) break;
    const step = fx / slope;
    x -= step;
    fx = f(x);
    if (Math.abs(step) < settings.stepTolerance || Math.abs(fx) < settings.tolerance) {
      converged = true;
      iterations += 1;
      break;
    }
  }

  return { x, fx, iterations, converged };
};

const backtracking = (
  objective: VectorFunction,
  current: number[],
  value: number,
  gradient: number[],
  direction: number[],
  maxSteps: number
): { x: number[]; value: number; accepted: boolean } => {
  const slope = dot(gradient, direction);
  if (slope >= 0) return { x: current, value, accepted: false };
  let step = 1;
  for (let attempt = 0; attempt < maxSteps; attempt += 1) {
    const candidate = axpy(current, direction, step);
    const candidateValue = objective(candidate);
    if (Number.isFinite(candidateValue) && candidateValue <= value + 1e-4 * step * slope) {
      return { x: candidate, value: candidateValue, accepted: true };
    }
    step *= 0.5;
  }
  return { x: current, value, accepted: false };
};

/**
 * Multivariate Newton optimisation with a backtracking line search.
 * Falls back to steepest descent when the Hessian is singular.
 */
export const newtonOptimize = (
  objective: VectorFunction,
  gradient: VectorGradient,
  hessian: VectorHessian,
  start: number[],
  options: OptimizeOptions = {}
): OptimizeResult => {
  const settings = { ...DEFAULTS, ...options };
  let x = [...start];
  let value = objective(x);
  let grad = gradient(x);
  let converged = false;
  let iterations = 0;

  for (; iterations < settings.maxIterations; iterations += 1) {
    if (norm(grad) < settings.tolerance) {
      converged = true;
      break;
    }
    const direction =
      solveLinear(
        hessian(x),
        grad.map(item => -item)
      ) ?? grad.map(item => -item);
    const step = backtracking(objective, x, value, grad, direction, settings.maxLineSearch);
    if (!step.accepted) break;
    x = step.x;
    value = step.value;
    grad = gradient(x);
    if (norm(direction) < settings.stepTolerance) {
      converged = true;
      break;
    }
  }

  return { x, value, gradient: grad, iterations, converged };
};

/**
 * BFGS quasi-Newton optimisation. Keeps an inverse-Hessian approximation so
 * no second derivatives are required; useful for nonlinear regression and
 * custom likelihoods.
 */
export const bfgs = (
  objective: VectorFunction,
  gradient: VectorGradient,
  start: number[],
  options: OptimizeOptions = {}
): OptimizeResult => {
  const settings = { ...DEFAULTS, ...options };
  let x = [...start];
  let value = objective(x);
  let grad = gradient(x);
  let inverse: Matrix = x.map((_, row) => x.map((__, column) => (row === column ? 1 : 0)));
  let converged = false;
  let iterations = 0;

  for (; iterations < settings.maxIterations; iterations += 1) {
    if (norm(grad) < settings.tolerance) {
      converged = true;
      break;
    }
    const direction = inverse.map(row => -row.reduce((sum, cell, index) => sum + cell * grad[index], 0));
    const step = backtracking(objective, x, value, grad, direction, settings.maxLineSearch);
    if (!step.accepted) break;

    const nextX = step.x;
    const nextGrad = gradient(nextX);
    const s = nextX.map((item, index) => item - x[index]);
    const y = nextGrad.map((item, index) => item - grad[index]);
    const ys = dot(y, s);

    if (ys > 1e-12) {
      const rho = 1 / ys;
      const hy = inverse.map(row => row.reduce((sum, cell, index) => sum + cell * y[index], 0));
      const yHy = dot(y, hy);
      const coefficient = (ys + yHy) * rho * rho;
      inverse = inverse.map((row, i) =>
        row.map(
          (cell, j) =>
            cell + coefficient * s[i] * s[j] - rho * (hy[i] * s[j] + s[i] * hy[j])
        )
      );
    }

    x = nextX;
    value = step.value;
    grad = nextGrad;
    if (norm(s) < settings.stepTolerance) {
      converged = true;
      break;
    }
  }

  return { x, value, gradient: grad, iterations, converged };
};

export interface EmResult<T> {
  state: T;
  logLik: number;
  iterations: number;
  converged: boolean;
}

/**
 * Generic Expectation–Maximisation loop.
 *
 * `eStep` returns the state with responsibilities/posteriors filled in,
 * `mStep` updates the parameters and `logLik` scores the updated state.
 */
export const emAlgorithm = <T>(
  initial: T,
  eStep: (state: T) => T,
  mStep: (state: T) => T,
  logLik: (state: T) => number,
  options: OptimizeOptions = {}
): EmResult<T> => {
  const settings = { ...DEFAULTS, ...options };
  let state = eStep(initial);
  let score = logLik(state);
  let converged = false;
  let iterations = 0;

  for (; iterations < settings.maxIterations; iterations += 1) {
    state = mStep(state);
    state = eStep(state);
    const next = logLik(state);
    if (!Number.isFinite(next)) break;
    if (Math.abs(next - score) < settings.tolerance) {
      score = next;
      converged = true;
      iterations += 1;
      break;
    }
    score = next;
  }

  return { state, logLik: score, iterations, converged };
};
