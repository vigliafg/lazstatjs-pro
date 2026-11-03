/**
 * Generalized linear models (GLM) via iteratively reweighted least squares.
 *
 * The module is deliberately family/link driven: multinomial, ordinal,
 * log-linear and count procedures can reuse the same IRLS core instead of
 * carrying their own Newton loops. Inputs are plain arrays; the caller owns
 * the design matrix and the intercept.
 */

import { jStat } from '../jstat';
import { invert, solveLinear, transpose, type Matrix } from './matrix';

export type GlmFamily = 'gaussian' | 'binomial' | 'poisson' | 'gamma';
export type GlmLink = 'identity' | 'log' | 'logit' | 'probit' | 'cloglog' | 'inverse';

export interface GlmInput {
  /** Response, one value per row. */
  y: number[];
  /** Design matrix, with the intercept column already included. */
  x: Matrix;
  family: GlmFamily;
  link: GlmLink;
  weights?: number[];
  offset?: number[];
  maxIterations?: number;
  tolerance?: number;
}

export interface GlmCoefficient {
  beta: number;
  se: number;
  z: number;
  p: number;
  lo: number;
  hi: number;
}

export interface GlmResult {
  coefficients: GlmCoefficient[];
  fitted: number[];
  linearPredictor: number[];
  deviance: number;
  nullDeviance: number;
  dfResidual: number;
  dfNull: number;
  dispersion: number;
  logLik: number;
  aic: number;
  iterations: number;
  converged: boolean;
}

interface LinkSpec {
  link: (mu: number) => number;
  inverse: (eta: number) => number;
  /** d(eta)/d(mu), used by the IRLS working response and weights. */
  derivative: (mu: number) => number;
}

const EPS = 1e-12;

const links: Record<GlmLink, LinkSpec> = {
  identity: {
    link: mu => mu,
    inverse: eta => eta,
    derivative: () => 1,
  },
  log: {
    link: mu => Math.log(mu),
    inverse: eta => Math.exp(eta),
    derivative: mu => 1 / mu,
  },
  logit: {
    link: mu => Math.log(mu / (1 - mu)),
    inverse: eta => 1 / (1 + Math.exp(-eta)),
    derivative: mu => 1 / (mu * (1 - mu)),
  },
  probit: {
    link: mu => jStat.normal.inv(mu, 0, 1),
    inverse: eta => jStat.normal.cdf(eta, 0, 1),
    derivative: mu => 1 / jStat.normal.pdf(jStat.normal.inv(mu, 0, 1), 0, 1),
  },
  cloglog: {
    link: mu => Math.log(-Math.log(1 - mu)),
    inverse: eta => 1 - Math.exp(-Math.exp(eta)),
    derivative: mu => {
      const tail = -Math.log(1 - mu);
      return 1 / ((1 - mu) * tail);
    },
  },
  inverse: {
    link: mu => 1 / mu,
    inverse: eta => 1 / eta,
    derivative: mu => -1 / (mu * mu),
  },
};

const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, value));

const variance = (family: GlmFamily, mu: number): number => {
  switch (family) {
    case 'gaussian':
      return 1;
    case 'binomial':
      return mu * (1 - mu);
    case 'poisson':
      return mu;
    case 'gamma':
      return mu * mu;
  }
};

const initialMu = (family: GlmFamily, y: number): number => {
  switch (family) {
    case 'gaussian':
      return Number.isFinite(y) ? y : 0;
    case 'binomial':
      return (y + 0.5) / 2;
    case 'poisson':
      return y + 0.1;
    case 'gamma':
      return y > 0 ? y : 1;
  }
};

const devianceResidual = (family: GlmFamily, y: number, mu: number): number => {
  switch (family) {
    case 'gaussian':
      return (y - mu) * (y - mu);
    case 'binomial': {
      const first = y > 0 ? y * Math.log(y / mu) : 0;
      const second = y < 1 ? (1 - y) * Math.log((1 - y) / (1 - mu)) : 0;
      return 2 * (first + second);
    }
    case 'poisson':
      return 2 * ((y > 0 ? y * Math.log(y / mu) : 0) - (y - mu));
    case 'gamma': {
      if (!(y > 0)) return 0;
      return 2 * ((y - mu) / mu - Math.log(y / mu));
    }
  }
};

const deviance = (family: GlmFamily, y: number[], mu: number[]): number =>
  y.reduce((sum, value, index) => sum + devianceResidual(family, value, mu[index]), 0);

const logLikelihood = (
  family: GlmFamily,
  y: number[],
  mu: number[],
  dispersion: number
): number => {
  switch (family) {
    case 'gaussian': {
      const sse = y.reduce((sum, value, index) => sum + (value - mu[index]) ** 2, 0);
      const sigma2 = sse / Math.max(1, y.length);
      return -0.5 * y.length * (Math.log(2 * Math.PI) + Math.log(sigma2) + 1);
    }
    case 'binomial':
      return y.reduce(
        (sum, value, index) => sum + value * Math.log(mu[index]) + (1 - value) * Math.log(1 - mu[index]),
        0
      );
    case 'poisson':
      return y.reduce(
        (sum, value, index) => sum + value * Math.log(mu[index]) - mu[index] - jStat.gammaln(value + 1),
        0
      );
    case 'gamma': {
      const shape = 1 / Math.max(dispersion, EPS);
      return y.reduce((sum, value, index) => {
        const logDensity =
          shape * (Math.log(shape) - Math.log(mu[index]) - value / mu[index]) +
          (shape - 1) * Math.log(value) -
          jStat.gammaln(shape);
        return sum + logDensity;
      }, 0);
    }
  }
};

const nullDeviance = (family: GlmFamily, y: number[]): number => {
  const mean = y.reduce((sum, value) => sum + value, 0) / Math.max(1, y.length);
  const mu = y.map(() => mean);
  return deviance(family, y, mu);
};

const solveWeighted = (x: Matrix, weights: number[], z: number[]): number[] | null => {
  const xt = transpose(x);
  const xtwx: Matrix = Array.from({ length: xt.length }, () => new Array(xt.length).fill(0));
  const xtwz = new Array(xt.length).fill(0);
  for (let i = 0; i < x.length; i += 1) {
    for (let a = 0; a < xt.length; a += 1) {
      xtwz[a] += xt[a][i] * weights[i] * z[i];
      for (let b = 0; b < xt.length; b += 1) xtwx[a][b] += xt[a][i] * weights[i] * x[i][b];
    }
  }
  const solution = solveLinear(xtwx, xtwz);
  if (!solution) return null;
  return solution;
};

/** Add a leading intercept column to a design matrix. */
export const addIntercept = (rows: Matrix): Matrix => rows.map(row => [1, ...row]);

/**
 * Fit a GLM. Returns `null` for invalid inputs, non-positive responses in
 * positive-support families, singular designs or non-convergence.
 */
export const glmFit = (input: GlmInput): GlmResult | null => {
  const { y, x, family, link } = input;
  const n = y.length;
  if (n === 0 || x.length !== n || x.some(row => row.length === 0)) return null;
  if (x[0].length >= n) return null;
  if (family === 'gamma' && y.some(value => !(value > 0))) return null;

  const spec = links[link];
  const weights = input.weights ?? y.map(() => 1);
  const offset = input.offset ?? y.map(() => 0);
  const maxIterations = input.maxIterations ?? 100;
  const tolerance = input.tolerance ?? 1e-12;

  let mu = y.map(value => initialMu(family, value));
  let eta = mu.map(value =>
    spec.link(family === 'binomial' ? clamp(value, EPS, 1 - EPS) : Math.max(EPS, value))
  );
  let previous = Number.POSITIVE_INFINITY;
  let beta: number[] | null = null;
  let iterations = 0;
  let converged = false;

  for (; iterations < maxIterations; iterations += 1) {
    mu = eta.map((value, index) => {
      const raw = spec.inverse(value + offset[index]);
      if (family === 'binomial') return clamp(raw, EPS, 1 - EPS);
      if (family === 'poisson' || family === 'gamma') return Math.max(EPS, raw);
      return raw;
    });

    const current = deviance(family, y, mu);
    if (Number.isFinite(previous) && Math.abs(current - previous) < tolerance * Math.max(1, current)) {
      converged = true;
      previous = current;
      break;
    }
    previous = current;

    const workingWeights = mu.map((value, index) => {
      const derivative = spec.derivative(value);
      const varianceValue = variance(family, value);
      const denominator = varianceValue * derivative * derivative;
      return denominator > EPS ? weights[index] / denominator : 0;
    });
    const workingResponse = y.map(
      (value, index) => eta[index] + (value - mu[index]) * spec.derivative(mu[index])
    );
    const next = solveWeighted(x, workingWeights, workingResponse);
    if (!next || next.some(value => !Number.isFinite(value))) return null;
    beta = next;
    eta = x.map(row => row.reduce((sum, value, index) => sum + value * beta![index], 0));
  }

  if (!beta) return null;
  if (!converged && iterations >= maxIterations) return null;

  mu = eta.map((value, index) => {
    const raw = spec.inverse(value + offset[index]);
    if (family === 'binomial') return clamp(raw, EPS, 1 - EPS);
    if (family === 'poisson' || family === 'gamma') return Math.max(EPS, raw);
    return raw;
  });

  const residualDeviance = deviance(family, y, mu);
  const dfResidual = n - x[0].length;
  const dfNull = n - 1;
  if (dfResidual <= 0) return null;
  const pearson = y.reduce(
    (sum, value, index) =>
      sum + (value - mu[index]) ** 2 / Math.max(EPS, variance(family, mu[index])),
    0
  );
  const dispersion =
    family === 'binomial' || family === 'poisson' ? 1 : pearson / dfResidual;
  if (!(dispersion > 0)) return null;

  const workingWeights = mu.map((value, index) => {
    const derivative = spec.derivative(value);
    const varianceValue = variance(family, value);
    const denominator = varianceValue * derivative * derivative;
    return denominator > EPS ? weights[index] / denominator : 0;
  });
  const xt = transpose(x);
  const xtwx: Matrix = Array.from({ length: xt.length }, () => new Array(xt.length).fill(0));
  for (let i = 0; i < n; i += 1) {
    for (let a = 0; a < xt.length; a += 1) {
      for (let b = 0; b < xt.length; b += 1) xtwx[a][b] += xt[a][i] * workingWeights[i] * x[i][b];
    }
  }
  const covariance = invert(xtwx);
  if (!covariance) return null;

  const logLikDispersion = family === 'gamma' ? residualDeviance / n : dispersion;
  const logLik = logLikelihood(family, y, mu, logLikDispersion);
  const p = x[0].length;
  const parameterCount = p + (family === 'gaussian' || family === 'gamma' ? 1 : 0);
  const coefficients: GlmCoefficient[] = beta.map((value, index) => {
    const se = Math.sqrt(Math.max(0, covariance[index][index] * dispersion));
    const z = se > 0 ? value / se : Number.NaN;
    const probability = Number.isFinite(z) ? 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1)) : Number.NaN;
    return {
      beta: value,
      se,
      z,
      p: probability,
      lo: value - 1.959963984540054 * se,
      hi: value + 1.959963984540054 * se,
    };
  });

  return {
    coefficients,
    fitted: mu,
    linearPredictor: eta,
    deviance: residualDeviance,
    nullDeviance: nullDeviance(family, y),
    dfResidual,
    dfNull,
    dispersion,
    logLik,
    aic: -2 * logLik + 2 * parameterCount,
    iterations,
    converged,
  };
};
