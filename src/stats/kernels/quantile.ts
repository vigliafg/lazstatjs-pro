/**
 * Quantile regression (Koenker's `rq`) solved as a linear program.
 *
 * The estimator minimizes the asymmetric absolute loss
 *
 *   sum_i rho_tau(y_i - x_i' beta),  rho_tau(r) = r (tau - I[r < 0]),
 *
 * which is a linear program in `beta`:
 *
 *   primal: min tau 1'u + (1 - tau) 1'v  s.t.  X b + u - v = y,  u, v >= 0
 *   dual:   max y'a                       s.t.  X'a = 0,  tau - 1 <= a_i <= tau
 *
 * The kernel solves the dual exactly with the Barrodale–Roberts bounded
 * simplex: a basis is a set of `p` observations (their residuals are zero at
 * the current vertex), the remaining dual variables sit on a bound, and each
 * pivot moves one basic `a_k` back into `[tau - 1, tau]`. The departing
 * variable is the largest bound violation and the entering one comes from the
 * dual ratio test, both with deterministic tie-breaks; a pivot budget bounds
 * the loop. This is the algorithm of `quantreg::rq` (method "br"), so the
 * coefficients match R to machine precision instead of the accuracy of an
 * IRLS iteration.
 *
 * Standard errors use quantreg's `summary.rq(se = "nid")`: Powell's kernel
 * sparsity estimated from the finite-difference of the fits at `tau +- h`,
 * with the Hall–Sheather bandwidth. When that estimate is unavailable (for
 * example because the design is too small) the kernel falls back to the
 * `se = "ker"` Gaussian-kernel sparsity. p-values and intervals are two-sided
 * normal, matching the rest of the kernels.
 */

import { jStat } from '../jstat';
import { invert, multiply, transpose, type Matrix } from './matrix';

export interface QuantileInput {
  y: number[];
  /** Design matrix with the intercept column already included. */
  x: Matrix;
  /** Target quantile in (0, 1). */
  tau: number;
  /** Pivot budget; defaults to `max(1000, 4 n)`. */
  maxIterations?: number;
  /** Dual bound-feasibility tolerance for the simplex, default `1e-10`. */
  tolerance?: number;
}

export interface QuantileCoefficient {
  beta: number;
  se: number;
  t: number;
  p: number;
  ciLo: number;
  ciHi: number;
}

export interface QuantileResult {
  tau: number;
  coefficients: QuantileCoefficient[];
  fitted: number[];
  residuals: number[];
  /** Minimum of sum rho_tau(residual). */
  objective: number;
  n: number;
  p: number;
  iterations: number;
  converged: boolean;
}

/** Pivot budget floor; the fit scales it with `n` (see `maxIterations` below). */
const MIN_ITERATIONS = 1000;
/** Pivots allowed per observation before the fit is declared non-converged. */
const ITERATIONS_PER_OBSERVATION = 4;
const DEFAULT_TOLERANCE = 1e-10;
/** Two-sided 95% normal quantile. */
const Z_975 = 1.959963984540054;
/** `.Machine$double.eps^(1/2)`, as used by summary.rq(se = "nid"). */
const R_EPS = Math.sqrt(Number.EPSILON);

interface CoreFit {
  beta: number[];
  residuals: number[];
  objective: number;
  iterations: number;
  converged: boolean;
}

const dot = (a: readonly number[], b: readonly number[]): number => {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += a[i] * (b[i] ?? 0);
  return sum;
};

const rhoTau = (residual: number, tau: number): number =>
  residual >= 0 ? tau * residual : (tau - 1) * residual;

/**
 * Pick `p` observations whose rows are linearly independent.
 *
 * Greedy pivoted Gram–Schmidt on the rows: at every step take the row with the
 * largest component orthogonal to the rows already chosen. This gives a
 * well-conditioned starting basis even when the first rows of the design are
 * collinear (a constant intercept column would defeat a "first p rows" rule
 * only when the data are ordered, but the greedy rule is robust either way).
 */
const selectInitialBasis = (x: Matrix, p: number): number[] | null => {
  const n = x.length;
  let scale = 0;
  for (const row of x) {
    for (const value of row) scale = Math.max(scale, Math.abs(value));
  }
  if (!(scale > 0)) return null;
  const threshold = 1e-11 * scale;

  const orthonormal: number[][] = [];
  const used = new Uint8Array(n);
  const basis: number[] = [];

  for (let step = 0; step < p; step += 1) {
    let bestIndex = -1;
    let bestNorm = 0;
    let bestVector: number[] = [];
    for (let i = 0; i < n; i += 1) {
      if (used[i] === 1) continue;
      const vector = x[i].slice();
      for (const direction of orthonormal) {
        const projection = dot(direction, vector);
        if (projection === 0) continue;
        for (let j = 0; j < p; j += 1) vector[j] -= projection * direction[j];
      }
      const norm = Math.sqrt(dot(vector, vector));
      if (norm > bestNorm) {
        bestNorm = norm;
        bestIndex = i;
        bestVector = vector;
      }
    }
    if (bestIndex < 0 || !(bestNorm > threshold)) return null;
    for (let j = 0; j < p; j += 1) bestVector[j] /= bestNorm;
    orthonormal.push(bestVector);
    used[bestIndex] = 1;
    basis.push(bestIndex);
  }

  return basis;
};

interface BasisState {
  beta: number[];
  residuals: number[];
  /** `X_B^{-1}`, one row per basic observation. */
  inverse: Matrix;
}

/** Solve the interpolation system `X_B beta = y_B` and evaluate the residuals. */
const solveBasis = (x: Matrix, y: number[], basis: number[], p: number): BasisState | null => {
  const square = basis.map(index => x[index].slice(0, p));
  const inverse = invert(square);
  if (!inverse) return null;
  const yb = basis.map(index => y[index]);
  const beta = inverse.map(row => dot(row, yb));
  if (beta.some(value => !Number.isFinite(value))) return null;
  const residuals = y.map((value, i) => value - dot(x[i], beta));
  return { beta, residuals, inverse };
};

/**
 * Barrodale–Roberts bounded dual simplex for `min sum rho_tau(y - X beta)`.
 *
 * Returns `null` for a singular design, an unbounded/infeasible pivot or when
 * `maxIterations` is exhausted.
 */
const solveQuantile = (
  y: number[],
  x: Matrix,
  tau: number,
  maxIterations: number,
  tolerance: number
): CoreFit | null => {
  const n = y.length;
  const p = x[0].length;
  const lower = tau - 1;
  const upper = tau;

  const initial = selectInitialBasis(x, p);
  if (!initial) return null;
  let basis = initial;
  let state = solveBasis(x, y, basis, p);
  if (!state) return null;

  const inBasis = new Uint8Array(n);
  // `atUpper[i] === 1` means the non-basic dual variable sits on `tau`,
  // `0` means it sits on `tau - 1`.
  const atUpper = new Uint8Array(n);
  const dual = new Float64Array(n);

  for (const index of basis) inBasis[index] = 1;
  for (let i = 0; i < n; i += 1) {
    if (inBasis[i] === 1) continue;
    // A positive residual needs `a_i = tau` for dual feasibility.
    const upperBound = state.residuals[i] >= 0;
    atUpper[i] = upperBound ? 1 : 0;
    dual[i] = upperBound ? upper : lower;
  }

  const boundTolerance = Math.max(1e-12, tolerance);
  let iterations = 0;
  let converged = false;

  while (iterations < maxIterations) {
    // a_B = -(X_B')^{-1} sum_{j in N} a_j x_j
    const weight = new Array<number>(p).fill(0);
    for (let i = 0; i < n; i += 1) {
      if (inBasis[i] === 1) continue;
      const value = dual[i];
      if (value === 0) continue;
      for (let j = 0; j < p; j += 1) weight[j] += value * x[i][j];
    }
    const basicValue = new Array<number>(p).fill(0);
    for (let row = 0; row < p; row += 1) {
      for (let column = 0; column < p; column += 1) {
        basicValue[column] -= state.inverse[row][column] * weight[row];
      }
    }

    // Departing variable: the largest bound violation. Dantzig-style pricing
    // keeps the pivot count close to O(n) on data with many tied residuals;
    // ties fall back to the smallest basis position, so the sequence is
    // deterministic.
    let leaving = -1;
    let mustDecrease = false;
    let worst = 0;
    for (let k = 0; k < p; k += 1) {
      const above = basicValue[k] - upper;
      const below = lower - basicValue[k];
      const violation = Math.max(above, below);
      if (violation > boundTolerance && violation > worst) {
        worst = violation;
        leaving = k;
        mustDecrease = above >= below;
      }
    }
    if (leaving < 0) {
      converged = true;
      break;
    }

    // Tableau row of the leaving variable: a_k = -sum_j h_j a_j.
    const leavingIndex = basis[leaving];
    const row = new Float64Array(n);
    for (let i = 0; i < n; i += 1) {
      if (inBasis[i] === 1) continue;
      let value = 0;
      for (let l = 0; l < p; l += 1) value += state.inverse[l][leaving] * x[i][l];
      row[i] = value;
    }

    // Dual ratio test: the entering variable must move the leaving variable in
    // the required direction and must not break the sign of any reduced cost.
    let entering = -1;
    let bestRatio = Number.POSITIVE_INFINITY;
    for (let i = 0; i < n; i += 1) {
      if (inBasis[i] === 1) continue;
      const h = row[i];
      if (h === 0) continue;
      const upperBound = atUpper[i] === 1;
      const usable = mustDecrease ? (upperBound ? h < 0 : h > 0) : upperBound ? h > 0 : h < 0;
      if (!usable) continue;
      const ratio = Math.abs(state.residuals[i]) / Math.abs(h);
      if (ratio < bestRatio) {
        bestRatio = ratio;
        entering = i;
      }
    }
    if (entering < 0) return null;

    inBasis[leavingIndex] = 0;
    inBasis[entering] = 1;
    basis = basis.map((index, position) => (position === leaving ? entering : index));
    // The leaving variable lands exactly on the bound it violated.
    atUpper[leavingIndex] = mustDecrease ? 1 : 0;
    dual[leavingIndex] = mustDecrease ? upper : lower;
    dual[entering] = 0;

    const next = solveBasis(x, y, basis, p);
    if (!next) return null;
    state = next;
    iterations += 1;
  }

  if (!converged) return null;

  const objective = state.residuals.reduce((sum, residual) => sum + rhoTau(residual, tau), 0);
  return {
    beta: state.beta,
    residuals: state.residuals,
    objective,
    iterations,
    converged,
  };
};

/** Hall–Sheather bandwidth of `quantreg::bandwidth.rq(hs = TRUE)`. */
const bandwidth = (tau: number, n: number): number => {
  const x0 = jStat.normal.inv(tau, 0, 1);
  const f0 = jStat.normal.pdf(x0, 0, 1);
  const alpha = 0.05;
  const z = jStat.normal.inv(1 - alpha / 2, 0, 1);
  return (
    Math.pow(n, -1 / 3) *
    Math.pow(z, 2 / 3) *
    Math.pow((1.5 * f0 * f0) / (2 * x0 * x0 + 1), 1 / 3)
  );
};

/** Linear-interpolation quantile (R's default `type = 7`). */
const sampleQuantile = (values: number[], probability: number): number => {
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * probability;
  const low = Math.floor(position);
  const high = Math.ceil(position);
  if (low === high) return sorted[low];
  return sorted[low] + (position - low) * (sorted[high] - sorted[low]);
};

/**
 * Covariance `tau (1 - tau) (X'FX)^{-1} X'X (X'FX)^{-1}` from a sparsity vector,
 * exactly the expression used by `summary.rq` for `se = "nid"` and `"ker"`.
 */
const sparsityCovariance = (x: Matrix, sparsity: number[], tau: number): Matrix | null => {
  const p = x[0].length;
  const xtfx: Matrix = Array.from({ length: p }, () => new Array<number>(p).fill(0));
  for (let i = 0; i < x.length; i += 1) {
    const f = sparsity[i];
    if (!Number.isFinite(f)) return null;
    if (f === 0) continue;
    for (let a = 0; a < p; a += 1) {
      for (let b = 0; b < p; b += 1) xtfx[a][b] += f * x[i][a] * x[i][b];
    }
  }
  const xtfxInverse = invert(xtfx);
  if (!xtfxInverse) return null;
  const xt = transpose(x);
  const xtx = multiply(xt, x);
  const sandwich = multiply(multiply(xtfxInverse, xtx), xtfxInverse);
  return sandwich.map(row => row.map(value => tau * (1 - tau) * value));
};

/**
 * Standard errors of the quantile-regression coefficients.
 *
 * Primary estimate: Powell's kernel density as in `summary.rq(se = "nid")`,
 * computed from the differenced coefficients at `tau +- h`. Fallback when that
 * sparsity is degenerate: the Gaussian-kernel sparsity of `se = "ker"`.
 */
const coefficientStandardErrors = (
  y: number[],
  x: Matrix,
  tau: number,
  residuals: number[],
  solve: (target: number) => CoreFit | null
): number[] => {
  const n = y.length;
  const p = x[0].length;
  let h = bandwidth(tau, n);
  while (tau - h < 0 || tau + h > 1) h /= 2;
  if (!(h > 0) || !Number.isFinite(h)) return new Array(p).fill(Number.NaN);

  const high = solve(tau + h);
  const low = solve(tau - h);
  if (high && low) {
    // Powell: f_i = 2h / (x_i'(b_hi - b_lo)), clipped at zero like pmax(0, ...).
    const difference = high.beta.map((value, index) => value - low.beta[index]);
    const sparsity = x.map(row => {
      const derivative = dot(row, difference);
      const denominator = derivative - R_EPS;
      if (denominator <= 0) return 0;
      const value = (2 * h) / denominator;
      return Number.isFinite(value) ? value : 0;
    });
    const covariance = sparsityCovariance(x, sparsity, tau);
    if (covariance) return covariance.map((row, index) => Math.sqrt(Math.max(0, row[index])));
  }

  // Fallback: Gaussian kernel sparsity (quantreg's se = "ker").
  const deviation = Math.sqrt(
    residuals.reduce((sum, value) => sum + value * value, 0) / Math.max(1, n - 1)
  );
  const interquartile = sampleQuantile(residuals, 0.75) - sampleQuantile(residuals, 0.25);
  const scale = Math.min(deviation, interquartile / 1.34);
  const kernelWidth = (jStat.normal.inv(tau + h, 0, 1) - jStat.normal.inv(tau - h, 0, 1)) * scale;
  if (!(kernelWidth > 0) || !Number.isFinite(kernelWidth)) {
    return new Array(p).fill(Number.NaN);
  }
  const sparsity = residuals.map(value => jStat.normal.pdf(value / kernelWidth, 0, 1) / kernelWidth);
  const covariance = sparsityCovariance(x, sparsity, tau);
  if (!covariance) return new Array(p).fill(Number.NaN);
  return covariance.map((row, index) => Math.sqrt(Math.max(0, row[index])));
};

/**
 * Fit a quantile regression. Returns `null` for invalid inputs, a singular
 * design, a degenerate pivot sequence or a solver that did not converge within
 * `maxIterations`.
 */
export const fitQuantile = (input: QuantileInput): QuantileResult | null => {
  const { y, x, tau } = input;
  const n = y.length;
  const p = x[0]?.length ?? 0;

  if (n === 0 || p === 0 || x.length !== n) return null;
  if (x.some(row => row.length !== p)) return null;
  if (!(tau > 0 && tau < 1)) return null;
  if (y.some(value => !Number.isFinite(value))) return null;
  if (x.some(row => row.some(value => !Number.isFinite(value)))) return null;
  // At least one residual degree of freedom is needed for the sparsity estimate.
  if (n <= p) return null;

  const maxIterations =
    input.maxIterations ?? Math.max(MIN_ITERATIONS, ITERATIONS_PER_OBSERVATION * n);
  const tolerance = input.tolerance ?? DEFAULT_TOLERANCE;
  const solve = (target: number): CoreFit | null =>
    // The finite-difference fits must stay strictly inside (0, 1).
    target > 0 && target < 1 ? solveQuantile(y, x, target, maxIterations, tolerance) : null;

  const core = solve(tau);
  if (!core) return null;

  const standardErrors = coefficientStandardErrors(y, x, tau, core.residuals, solve);
  const coefficients: QuantileCoefficient[] = core.beta.map((beta, index) => {
    const se = standardErrors[index];
    const t = se > 0 ? beta / se : Number.NaN;
    const pValue = Number.isFinite(t) ? 2 * (1 - jStat.normal.cdf(Math.abs(t), 0, 1)) : Number.NaN;
    const halfWidth = Z_975 * se;
    return {
      beta,
      se,
      t,
      p: pValue,
      ciLo: beta - halfWidth,
      ciHi: beta + halfWidth,
    };
  });

  const fitted = x.map(row => dot(row, core.beta));
  return {
    tau,
    coefficients,
    fitted,
    residuals: core.residuals,
    objective: core.objective,
    n,
    p,
    iterations: core.iterations,
    converged: core.converged,
  };
};
