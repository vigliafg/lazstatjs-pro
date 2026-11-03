/**
 * Nonlinear regression via Gauss–Newton with Levenberg–Marquardt damping.
 *
 * Five parameterisations cover the everyday growth/decay/saturation curves:
 *
 *   exponential  y = a * exp(b * x)
 *   logistic     y = L / (1 + exp(-k * (x - x0)))
 *   gompertz     y = a * exp(-b * exp(-c * x))
 *   power        y = a * x^b
 *   michaelis    y = vmax * x / (km + x)
 *
 * The caller supplies plain `x`/`y` arrays; the kernel derives reasonable
 * starting values, fits by least squares, and reports Wald inference (standard
 * errors from the Jacobian, two-sided Student-t p-values, 95% t intervals).
 * `null` means invalid input or a fit that did not converge — never a silent
 * partial answer.
 */

import { jStat } from '../jstat';
import { invert, solveLinear, type Matrix } from './matrix';

export type NonlinearModelType = 'exponential' | 'logistic' | 'gompertz' | 'power' | 'michaelis';

export interface NonlinearInput {
  /** Response, one value per observation. */
  y: number[];
  /** Predictor, one value per observation. */
  x: number[];
  model: NonlinearModelType;
  /** Optional starting values in parameter order; defaults are data-driven. */
  initial?: number[];
  /** Maximum Levenberg–Marquardt iterations (default 100). */
  maxIterations?: number;
  /** Scaled-step convergence tolerance (default 1e-12). */
  tolerance?: number;
}

export interface NonlinearParameter {
  name: string;
  estimate: number;
  se: number;
  t: number;
  p: number;
  ciLo: number;
  ciHi: number;
}

export interface NonlinearResult {
  model: NonlinearModelType;
  parameters: NonlinearParameter[];
  fitted: number[];
  residuals: number[];
  sse: number;
  r2: number;
  adjR2: number;
  rmse: number;
  n: number;
  df: number;
  iterations: number;
  converged: boolean;
}

interface Evaluation {
  fitted: number[];
  residuals: number[];
  jacobian: Matrix;
  sse: number;
}

const EPS = 1e-12;

const PARAMETER_NAMES: Record<NonlinearModelType, readonly string[]> = {
  exponential: ['a', 'b'],
  logistic: ['L', 'k', 'x0'],
  gompertz: ['a', 'b', 'c'],
  power: ['a', 'b'],
  michaelis: ['vmax', 'km'],
};

const MODELS: readonly NonlinearModelType[] = [
  'exponential',
  'logistic',
  'gompertz',
  'power',
  'michaelis',
];

const isModelType = (value: string): value is NonlinearModelType =>
  (MODELS as readonly string[]).includes(value);

/** Overflow-safe logistic function. */
const sigmoid = (u: number): number => {
  if (u >= 0) return 1 / (1 + Math.exp(-u));
  const tail = Math.exp(u);
  return tail / (1 + tail);
};

/** Prediction for one observation. */
const predict = (model: NonlinearModelType, params: readonly number[], x: number): number => {
  switch (model) {
    case 'exponential':
      return params[0] * Math.exp(params[1] * x);
    case 'logistic':
      return params[0] * sigmoid(params[1] * (x - params[2]));
    case 'gompertz':
      return params[0] * Math.exp(-params[1] * Math.exp(-params[2] * x));
    case 'power':
      return params[0] * Math.pow(x, params[1]);
    case 'michaelis':
      return (params[0] * x) / (params[1] + x);
  }
};

/** Analytic partial derivatives in parameter order. */
const derivatives = (model: NonlinearModelType, params: readonly number[], x: number): number[] => {
  switch (model) {
    case 'exponential': {
      const exponential = Math.exp(params[1] * x);
      return [exponential, params[0] * x * exponential];
    }
    case 'logistic': {
      const s = sigmoid(params[1] * (x - params[2]));
      const slope = s * (1 - s);
      return [s, params[0] * slope * (x - params[2]), -params[0] * params[1] * slope];
    }
    case 'gompertz': {
      const decay = Math.exp(-params[2] * x);
      const exponential = Math.exp(-params[1] * decay);
      return [
        exponential,
        -params[0] * decay * exponential,
        params[0] * params[1] * x * decay * exponential,
      ];
    }
    case 'power': {
      const term = Math.pow(x, params[1]);
      return [term, params[0] * term * Math.log(x)];
    }
    case 'michaelis': {
      const denominator = params[1] + x;
      return [x / denominator, -(params[0] * x) / (denominator * denominator)];
    }
  }
};

const mean = (values: readonly number[]): number =>
  values.length === 0 ? Number.NaN : values.reduce((sum, value) => sum + value, 0) / values.length;

const linearFit = (x: readonly number[], y: readonly number[]): { intercept: number; slope: number } => {
  const n = x.length;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i += 1) {
    sx += x[i];
    sy += y[i];
    sxx += x[i] * x[i];
    sxy += x[i] * y[i];
  }
  const denominator = n * sxx - sx * sx;
  if (Math.abs(denominator) < EPS) return { intercept: mean(y), slope: 0 };
  const slope = (n * sxy - sx * sy) / denominator;
  return { intercept: (sy - slope * sx) / n, slope };
};

/** First x where the piecewise-linear interpolation of `y` crosses `target`. */
const crossingX = (x: readonly number[], y: readonly number[], target: number): number => {
  for (let i = 1; i < x.length; i += 1) {
    const previous = y[i - 1] - target;
    const current = y[i] - target;
    if (previous === 0) return x[i - 1];
    if (previous * current <= 0) {
      const weight = previous / (previous - current);
      return x[i - 1] + weight * (x[i] - x[i - 1]);
    }
  }
  return x[Math.floor((x.length - 1) / 2)];
};

const clampOpen = (value: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, value));

/** Data-driven starting values, in the same order as `PARAMETER_NAMES`. */
const initialValues = (model: NonlinearModelType, x: readonly number[], y: readonly number[]): number[] => {
  const n = y.length;
  const yMin = Math.min(...y);
  const yMax = Math.max(...y);
  const span = yMax - yMin;
  const xMin = Math.min(...x);
  const xMax = Math.max(...x);
  const xSpan = xMax - xMin;
  const increasing = linearFit(x, y).slope >= 0;

  switch (model) {
    case 'exponential': {
      if (y.every(value => value > 0)) {
        const line = linearFit(x, y.map(value => Math.log(value)));
        if (Number.isFinite(line.intercept) && Number.isFinite(line.slope)) {
          return [Math.exp(line.intercept), line.slope];
        }
      }
      // Fallback: anchor the scale on the largest magnitude and derive a rough
      // log-ratio slope from the endpoints.
      const a = Math.max(Math.abs(yMin), Math.abs(yMax), 1);
      let b = 0.1;
      if (xSpan > EPS && y[0] > 0 && y[n - 1] > 0) b = Math.log(y[n - 1] / y[0]) / xSpan;
      return [a, b];
    }
    case 'logistic': {
      const margin = 0.05 * Math.max(span, Math.abs(yMax) * 0.01, EPS);
      const L = increasing ? yMax + margin : yMin - margin;
      const target = yMin + span / 2;
      const x0 = crossingX(x, y, target);
      const k = (increasing ? 1 : -1) * (xSpan > EPS ? 4 / xSpan : 1);
      return [L, k, x0];
    }
    case 'gompertz': {
      const margin = 0.05 * Math.max(span, Math.abs(yMax) * 0.01, EPS);
      if (increasing) {
        const a = yMax + margin;
        const c = xSpan > EPS ? 1 / xSpan : 1;
        const ratio = clampOpen(y[0] / a, 1e-6, 1 - 1e-6);
        const b = -Math.log(ratio) / Math.exp(-c * x[0]);
        return [a, Number.isFinite(b) && b > 0 ? b : 1, c];
      }
      // Decreasing growth: same curve with b < 0 and c < 0 so the low
      // asymptote is 0 and the high one is `a`.
      const a = yMax + margin;
      const c = xSpan > EPS ? -1 / xSpan : -1;
      const ratio = clampOpen(y[n - 1] / a, 1e-6, 1 - 1e-6);
      const b = -Math.log(ratio) / Math.exp(-c * x[n - 1]);
      return [a, Number.isFinite(b) ? b : -1, c];
    }
    case 'power': {
      if (x.every(value => value > 0) && y.every(value => value > 0)) {
        const line = linearFit(
          x.map(value => Math.log(value)),
          y.map(value => Math.log(value))
        );
        if (Number.isFinite(line.intercept) && Number.isFinite(line.slope)) {
          return [Math.exp(line.intercept), line.slope];
        }
      }
      const anchor = x.findIndex(value => value > 0);
      const a = anchor >= 0 ? y[anchor] / x[anchor] : Math.max(Math.abs(yMax), 1);
      return [a, 1];
    }
    case 'michaelis': {
      if (x.every(value => value > 0) && y.every(value => value > 0)) {
        // Lineweaver–Burk: 1/y = (km/vmax) * (1/x) + 1/vmax.
        const line = linearFit(
          x.map(value => 1 / value),
          y.map(value => 1 / value)
        );
        if (line.intercept > EPS && line.slope > EPS) {
          const vmax = 1 / line.intercept;
          const km = line.slope * vmax;
          if (Number.isFinite(vmax) && Number.isFinite(km) && km > 0) return [vmax, km];
        }
      }
      const vmax = Math.max(Math.abs(yMin), Math.abs(yMax), 1) * 1.05;
      const km = Math.max(Math.abs(crossingX(x, y, yMax / 2)), EPS);
      return [vmax, km];
    }
  }
};

const evaluate = (
  model: NonlinearModelType,
  params: readonly number[],
  x: readonly number[],
  y: readonly number[]
): Evaluation | null => {
  const fitted = new Array<number>(y.length);
  const residuals = new Array<number>(y.length);
  const jacobian: Matrix = new Array(y.length);
  let sse = 0;

  for (let i = 0; i < y.length; i += 1) {
    const value = predict(model, params, x[i]);
    if (!Number.isFinite(value)) return null;
    const row = derivatives(model, params, x[i]);
    if (row.length !== params.length || row.some(item => !Number.isFinite(item))) return null;
    fitted[i] = value;
    residuals[i] = y[i] - value;
    sse += residuals[i] * residuals[i];
    jacobian[i] = row;
  }

  if (!Number.isFinite(sse)) return null;
  return { fitted, residuals, jacobian, sse };
};

/** Normal equations `J'J` and `J'r` for the current residuals. */
const normalEquations = (jacobian: Matrix, residuals: readonly number[]): { jtj: Matrix; jtr: number[] } => {
  const p = jacobian[0].length;
  const jtj: Matrix = Array.from({ length: p }, () => new Array<number>(p).fill(0));
  const jtr = new Array<number>(p).fill(0);
  for (let i = 0; i < jacobian.length; i += 1) {
    const row = jacobian[i];
    for (let a = 0; a < p; a += 1) {
      jtr[a] += row[a] * residuals[i];
      for (let b = 0; b < p; b += 1) jtj[a][b] += row[a] * row[b];
    }
  }
  return { jtj, jtr };
};

const norm = (values: readonly number[]): number =>
  Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));

/**
 * Fit a nonlinear model. Returns `null` for invalid inputs (length mismatch,
 * non-finite values, power model with non-positive x, too few observations),
 * singular normal equations or non-convergence.
 */
export const fitNonlinear = (input: NonlinearInput): NonlinearResult | null => {
  const { y, x, model } = input;
  if (!isModelType(model)) return null;

  const names = PARAMETER_NAMES[model];
  const p = names.length;
  const n = y.length;
  if (n !== x.length || n <= p) return null;
  if (x.some(value => !Number.isFinite(value)) || y.some(value => !Number.isFinite(value))) return null;
  if (model === 'power' && x.some(value => !(value > 0))) return null;

  const maxIterations = input.maxIterations ?? 100;
  const tolerance = input.tolerance ?? 1e-12;
  if (!(maxIterations > 0) || !(tolerance > 0)) return null;

  let params: number[];
  if (input.initial) {
    if (input.initial.length !== p || input.initial.some(value => !Number.isFinite(value))) return null;
    params = [...input.initial];
  } else {
    params = initialValues(model, x, y);
    if (params.length !== p || params.some(value => !Number.isFinite(value))) return null;
  }

  let current = evaluate(model, params, x, y);
  if (!current) return null;

  let lambda = 1e-3;
  let iterations = 0;
  let converged = false;

  for (; iterations < maxIterations; iterations += 1) {
    const { jtj, jtr } = normalEquations(current.jacobian, current.residuals);
    let accepted = false;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      // Marquardt scaling keeps the damping meaningful across parameters with
      // very different units (e.g. vmax ~ 200 and km ~ 0.06).
      const damped = jtj.map((row, a) =>
        row.map((cell, b) => (a === b ? cell + lambda * Math.max(Math.abs(jtj[a][a]), EPS) : cell))
      );
      const step = solveLinear(damped, jtr);
      if (!step || step.some(value => !Number.isFinite(value))) {
        lambda *= 10;
        continue;
      }

      const candidate = params.map((value, index) => value + step[index]);
      const next = evaluate(model, candidate, x, y);
      if (next && next.sse < current.sse) {
        const stepNorm = norm(step);
        const parameterNorm = norm(candidate);
        params = candidate;
        current = next;
        lambda = Math.max(lambda / 10, 1e-12);
        accepted = true;
        // Converge on the scaled Gauss–Newton step, not on the relative SSE:
        // near the optimum the surface can be very flat, so a tiny SSE change
        // still hides a parameter offset that matters for the reported SEs.
        if (stepNorm <= tolerance * (1 + parameterNorm)) converged = true;
        break;
      }

      lambda *= 10;
    }

    if (!accepted) {
      // No damping level improves the SSE any more: this is a local minimum at
      // machine precision, which is exactly where a converged fit lives.
      converged = true;
      break;
    }
    if (converged) break;
  }

  if (!converged) return null;

  const df = n - p;
  if (df <= 0) return null;

  const { jtj } = normalEquations(current.jacobian, current.residuals);
  const covariance = invert(jtj);
  if (!covariance) return null;

  const sigma2 = current.sse / df;
  const critical = jStat.studentt.inv(0.975, df);
  if (!Number.isFinite(critical)) return null;

  const parameters: NonlinearParameter[] = names.map((name, index) => {
    const variance = Math.max(0, covariance[index][index] * sigma2);
    const se = Math.sqrt(variance);
    const estimate = params[index];
    const t = se > 0 ? estimate / se : Number.NaN;
    const probability = Number.isFinite(t) ? 2 * (1 - jStat.studentt.cdf(Math.abs(t), df)) : Number.NaN;
    return {
      name,
      estimate,
      se,
      t,
      p: probability,
      ciLo: estimate - critical * se,
      ciHi: estimate + critical * se,
    };
  });

  const yBar = mean(y);
  const total = y.reduce((sum, value) => {
    const deviation = value - yBar;
    return sum + deviation * deviation;
  }, 0);
  const r2 = total > EPS ? 1 - current.sse / total : current.sse <= EPS ? 1 : Number.NaN;
  const adjR2 = Number.isFinite(r2) ? 1 - ((1 - r2) * (n - 1)) / df : Number.NaN;

  return {
    model,
    parameters,
    fitted: current.fitted,
    residuals: current.residuals,
    sse: current.sse,
    r2,
    adjR2,
    rmse: Math.sqrt(current.sse / df),
    n,
    df,
    iterations: iterations + 1,
    converged: true,
  };
};

/** Evaluate one model at a single point. `NaN` for an invalid parameter vector. */
export const nonlinearModelValue = (model: NonlinearModelType, params: number[], x: number): number => {
  if (!isModelType(model)) return Number.NaN;
  if (!Array.isArray(params) || params.length !== PARAMETER_NAMES[model].length) return Number.NaN;
  if (params.some(value => !Number.isFinite(value)) || !Number.isFinite(x)) return Number.NaN;
  if (model === 'power' && !(x > 0)) return Number.NaN;
  if (model === 'michaelis' && Math.abs(params[1] + x) < EPS) return Number.NaN;
  const value = predict(model, params, x);
  return Number.isFinite(value) ? value : Number.NaN;
};
