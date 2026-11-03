import { zCrit, zTwoSidedP, chi2SF } from '../distributions';
import { ljungBox } from './timeseries';
import { minimize } from './minimize';

/**
 * GARCH(1,1) with Gaussian quasi-maximum likelihood.
 *
 *   r_t = μ + ε_t,  ε_t = σ_t z_t,  z_t ~ N(0, 1)
 *   σ²_t = ω + α ε²_{t−1} + β σ²_{t−1}
 *
 * The likelihood is optimised on a transformed scale (log ω, logit α,
 * logit β with α + β < 1) so the recursion stays positive and stationary.
 */

export interface GarchOptions {
  values: number[];
  horizon?: number;
  level?: number;
}

export interface GarchCoefficient {
  term: string;
  estimate: number;
  se: number;
  z: number;
  p: number;
}

export interface GarchForecastPoint {
  step: number;
  mean: number;
  se: number;
  variance: number;
  lo: number;
  hi: number;
}

export interface GarchFit {
  n: number;
  mean: number;
  omega: number;
  alpha: number;
  beta: number;
  persistence: number;
  longRunVariance: number;
  halfLife: number;
  logLik: number;
  aic: number;
  bic: number;
  coefficients: GarchCoefficient[];
  sigma2: number[];
  residuals: number[];
  standardized: number[];
  forecast: GarchForecastPoint[];
  ljungBox: { q: number; df: number; p: number };
  jarqueBera: { stat: number; p: number };
  converged: boolean;
}

const logistic = (value: number): number => 1 / (1 + Math.exp(-value));
const logit = (value: number): number => Math.log(value / (1 - value));

interface Transformed {
  omega: number;
  alpha: number;
  beta: number;
}

const decode = (parameters: number[], variance: number): Transformed | null => {
  const omega = Math.exp(parameters[0]);
  const alpha = logistic(parameters[1]) * 0.999;
  const beta = logistic(parameters[2]) * (0.999 - alpha);
  if (!(omega > 0) || !(alpha >= 0) || !(beta >= 0) || !(alpha + beta < 1)) return null;
  if (!Number.isFinite(variance) || variance <= 0) return null;
  return { omega, alpha, beta };
};

const recursion = (
  residuals: number[],
  model: Transformed,
  backcast: number
): { sigma2: number[]; logLik: number } => {
  const sigma2 = new Array<number>(residuals.length).fill(backcast);
  let logLik = 0;
  for (let index = 0; index < residuals.length; index++) {
    if (index > 0) {
      sigma2[index] =
        model.omega +
        model.alpha * residuals[index - 1] * residuals[index - 1] +
        model.beta * sigma2[index - 1];
    }
    const variance = sigma2[index];
    if (!(variance > 0) || !Number.isFinite(variance)) return { sigma2, logLik: -Infinity };
    logLik += -0.5 * (Math.log(2 * Math.PI) + Math.log(variance) + (residuals[index] * residuals[index]) / variance);
  }
  return { sigma2, logLik };
};

const invert = (matrix: number[][]): number[][] | null => {
  const size = matrix.length;
  const augmented = matrix.map((row, index) => [
    ...row,
    ...Array.from({ length: size }, (_, column) => (column === index ? 1 : 0)),
  ]);
  for (let pivot = 0; pivot < size; pivot++) {
    let best = pivot;
    for (let row = pivot + 1; row < size; row++) {
      if (Math.abs(augmented[row][pivot]) > Math.abs(augmented[best][pivot])) best = row;
    }
    if (Math.abs(augmented[best][pivot]) < 1e-12) return null;
    [augmented[pivot], augmented[best]] = [augmented[best], augmented[pivot]];
    const divisor = augmented[pivot][pivot];
    for (let column = 0; column < 2 * size; column++) augmented[pivot][column] /= divisor;
    for (let row = 0; row < size; row++) {
      if (row === pivot) continue;
      const factor = augmented[row][pivot];
      if (factor === 0) continue;
      for (let column = 0; column < 2 * size; column++) augmented[row][column] -= factor * augmented[pivot][column];
    }
  }
  return augmented.map(row => row.slice(size));
};

const jarqueBera = (values: number[]): { stat: number; p: number } => {
  const n = values.length;
  if (n < 8) return { stat: NaN, p: NaN };
  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  const centered = values.map(value => value - mean);
  const m2 = centered.reduce((sum, value) => sum + value * value, 0) / n;
  if (!(m2 > 0)) return { stat: NaN, p: NaN };
  const m3 = centered.reduce((sum, value) => sum + Math.pow(value, 3), 0) / n;
  const m4 = centered.reduce((sum, value) => sum + Math.pow(value, 4), 0) / n;
  const skew = m3 / Math.pow(m2, 1.5);
  const excess = m4 / (m2 * m2) - 3;
  const stat = (n / 6) * (skew * skew + (excess * excess) / 4);
  return { stat, p: chi2SF(stat, 2) };
};

export const fitGarch = (options: GarchOptions): GarchFit | null => {
  const values = options.values.filter(value => Number.isFinite(value));
  const n = values.length;
  if (n < 30) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  const residuals = values.map(value => value - mean);
  const variance = residuals.reduce((sum, value) => sum + value * value, 0) / (n - 1);
  if (!(variance > 0)) return null;

  const objective = (parameters: number[]): number => {
    const model = decode(parameters, variance);
    if (!model) return 1e15;
    const { logLik } = recursion(residuals, model, variance);
    return Number.isFinite(logLik) ? -logLik : 1e15;
  };

  const starts = [
    [Math.log(0.1 * variance), logit(0.1), logit(0.8)],
    [Math.log(0.05 * variance), logit(0.05), logit(0.9)],
    [Math.log(0.2 * variance), logit(0.2), logit(0.6)],
  ];
  const best = minimize(objective, starts);
  const model = decode(best.x, variance);
  if (!model) return null;
  const { sigma2, logLik } = recursion(residuals, model, variance);
  if (!Number.isFinite(logLik)) return null;

  const k = 4;
  const aic = -2 * logLik + 2 * k;
  const bic = -2 * logLik + Math.log(n) * k;

  // Numerical Hessian of the negative log-likelihood on the transformed scale.
  const hessian = Array.from({ length: 3 }, () => new Array<number>(3).fill(0));
  const step = 1e-4;
  const base = best.x;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const shift = (signI: number, signJ: number): number[] => {
        const point = base.slice();
        point[i] += signI * step;
        point[j] += signJ * step;
        return point;
      };
      const fpp = objective(shift(1, 1));
      const fpm = objective(shift(1, -1));
      const fmp = objective(shift(-1, 1));
      const fmm = objective(shift(-1, -1));
      hessian[i][j] = (fpp - fpm - fmp + fmm) / (4 * step * step);
    }
  }
  const inverse = invert(hessian);
  const standardErrors = [0, 1, 2].map(index => {
    if (!inverse) return NaN;
    const value = inverse[index][index];
    return value >= 0 ? Math.sqrt(value) : NaN;
  });

  const critical = zCrit(options.level ?? 95);
  const persistence = model.alpha + model.beta;
  const longRunVariance = persistence < 1 ? model.omega / (1 - persistence) : NaN;
  const halfLife = persistence > 0 && persistence < 1 ? Math.log(0.5) / Math.log(persistence) : NaN;

  const lastVariance = sigma2[sigma2.length - 1];
  const lastShock = residuals[residuals.length - 1];
  const forecastVariance = (step: number): number => {
    if (!(persistence < 1) || !Number.isFinite(longRunVariance)) {
      const next = model.omega + model.alpha * lastShock * lastShock + model.beta * lastVariance;
      return next;
    }
    const next = model.omega + model.alpha * lastShock * lastShock + model.beta * lastVariance;
    return longRunVariance + Math.pow(persistence, step - 1) * (next - longRunVariance);
  };
  const horizon = Math.max(1, Math.min(40, Math.floor(options.horizon ?? 10)));
  const forecast: GarchForecastPoint[] = Array.from({ length: horizon }, (_, index) => {
    const step = index + 1;
    const conditional = forecastVariance(step);
    const se = Math.sqrt(conditional);
    return {
      step: n + step,
      mean,
      se,
      variance: conditional,
      lo: mean - critical * se,
      hi: mean + critical * se,
    };
  });

  const standardized = residuals.map((value, index) => value / Math.sqrt(sigma2[index]));
  const lags = Math.min(12, Math.max(1, Math.floor(n / 4)));
  const lb = ljungBox(standardized, lags);

  const terms = ['ω', 'α', 'β'];
  const estimates = [model.omega, model.alpha, model.beta];
  const coefficients: GarchCoefficient[] = terms.map((term, index) => {
    const estimate = estimates[index];
    const se = standardErrors[index];
    const z = se > 0 ? estimate / se : NaN;
    return { term, estimate, se, z, p: Number.isFinite(z) ? zTwoSidedP(z) : NaN };
  });

  return {
    n,
    mean,
    omega: model.omega,
    alpha: model.alpha,
    beta: model.beta,
    persistence,
    longRunVariance,
    halfLife,
    logLik,
    aic,
    bic,
    coefficients,
    sigma2,
    residuals,
    standardized,
    forecast,
    ljungBox: { q: lb.q, df: lb.df, p: lb.p },
    jarqueBera: jarqueBera(standardized),
    converged: best.converged,
  };
};
