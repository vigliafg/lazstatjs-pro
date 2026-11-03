import { jStat } from '../jstat';
import { mulberry32 } from './distributions';
import {
  gammaDraw,
  mean,
  normalDraw,
  normalVectorDraw,
  summarise,
  type PosteriorSummary,
} from './mcmc';

export interface BayesParameter extends PosteriorSummary {
  term: string;
}

export interface BayesGroup extends PosteriorSummary {
  label: string;
  n: number;
}

export interface BayesResult {
  mode: 'normal' | 'proportion' | 'rate' | 'regression' | 'hierarchical';
  n: number;
  parameters: BayesParameter[];
  sigma: PosteriorSummary | null;
  tau: PosteriorSummary | null;
  groups: BayesGroup[];
  draws: number;
  burnin: number;
  chains: number;
  rhatMax: number;
  essMin: number;
  samples: number[][];
}

export interface BayesOptions {
  mode: BayesResult['mode'];
  priorMean: number;
  priorSd: number;
  iterations: number;
  burnin: number;
  chains: number;
  seed: number;
  variableNames?: readonly string[];
  groupCodes?: readonly number[];
  groupNames?: readonly string[];
}

const invert = (matrix: number[][]): number[][] | null => {
  const inverse = jStat.inv(matrix) as number[][];
  if (!inverse || inverse.some(row => row.some(value => !Number.isFinite(value)))) return null;
  return inverse;
};

const multiplyVector = (matrix: number[][], vector: readonly number[]): number[] =>
  matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));

const normalModel = (
  y: readonly number[],
  options: BayesOptions
): { chains: number[][]; sigma: number[][] } | null => {
  const n = y.length;
  if (n < 3) return null;
  const average = mean(y);
  const chains: number[][] = [];
  const sigmas: number[][] = [];
  for (let chain = 0; chain < options.chains; chain += 1) {
    const rng = mulberry32(options.seed + chain * 7919);
    let sigma2 = Math.max(1e-8, y.reduce((sum, value) => sum + (value - average) ** 2, 0) / n);
    const draws: number[] = [];
    const sigmaDraws: number[] = [];
    for (let iteration = 0; iteration < options.iterations; iteration += 1) {
      const mu = average + Math.sqrt(sigma2 / n) * normalDraw(rng);
      const sse = y.reduce((sum, value) => sum + (value - mu) ** 2, 0);
      sigma2 = sse / 2 / gammaDraw(n / 2, 1, rng);
      if (iteration >= options.burnin) {
        draws.push(mu);
        sigmaDraws.push(Math.sqrt(sigma2));
      }
    }
    chains.push(draws);
    sigmas.push(sigmaDraws);
  }
  return { chains, sigma: sigmas };
};

const proportionModel = (
  y: readonly number[],
  options: BayesOptions
): number[][] | null => {
  const successes = y.filter(value => value === 1).length;
  const n = y.length;
  if (n < 2) return null;
  const chains: number[][] = [];
  for (let chain = 0; chain < options.chains; chain += 1) {
    const rng = mulberry32(options.seed + chain * 104729);
    const draws: number[] = [];
    for (let iteration = 0; iteration < options.iterations; iteration += 1) {
      const a = gammaDraw(1 + successes, 1, rng);
      const b = gammaDraw(1 + n - successes, 1, rng);
      if (iteration >= options.burnin) draws.push(a / (a + b));
    }
    chains.push(draws);
  }
  return chains;
};

const rateModel = (
  y: readonly number[],
  options: BayesOptions
): number[][] | null => {
  if (y.length < 2 || y.some(value => value < 0)) return null;
  const total = y.reduce((sum, value) => sum + value, 0);
  const n = y.length;
  const chains: number[][] = [];
  for (let chain = 0; chain < options.chains; chain += 1) {
    const rng = mulberry32(options.seed + chain * 15485863);
    const draws: number[] = [];
    for (let iteration = 0; iteration < options.iterations; iteration += 1) {
      const draw = gammaDraw(0.5 + total, n, rng);
      if (iteration >= options.burnin) draws.push(draw);
    }
    chains.push(draws);
  }
  return chains;
};

const regressionModel = (
  x: readonly number[][],
  y: readonly number[],
  options: BayesOptions
): { chains: number[][][]; sigma: number[][] } | null => {
  const n = y.length;
  const p = x[0]?.length ?? 0;
  if (n < p + 2 || p === 0) return null;
  const design = x.map(row => [1, ...row]);
  const parameters = p + 1;
  const xtx: number[][] = Array.from({ length: parameters }, () => Array(parameters).fill(0));
  const xty: number[] = Array(parameters).fill(0);
  design.forEach((row, index) => {
    for (let a = 0; a < parameters; a += 1) {
      xty[a] += row[a] * y[index];
      for (let b = 0; b < parameters; b += 1) xtx[a][b] += row[a] * row[b];
    }
  });
  // The improper 1/σ² prior on the variance is proper after the likelihood;
  // the ridge keeps the prior precision finite and the inverse stable.
  const priorPrecision = 1 / Math.max(1e-9, options.priorSd ** 2);
  const chains: number[][][] = Array.from({ length: parameters }, () => []);
  const sigmas: number[][] = [];
  const xtxInverse = invert(xtx);
  const initialBeta = xtxInverse
    ? multiplyVector(xtxInverse, xty)
    : Array(parameters).fill(options.priorMean);
  for (let chain = 0; chain < options.chains; chain += 1) {
    const rng = mulberry32(options.seed + chain * 32452843);
    let beta = [...initialBeta];
    const sigmaDraws: number[] = [];
    const chainDraws: number[][] = Array.from({ length: parameters }, () => []);
    let sigma2 = Math.max(
      1e-8,
      y.reduce((sum, value, index) => {
        const fitted = design[index].reduce((acc, xv, j) => acc + xv * beta[j], 0);
        return sum + (value - fitted) ** 2;
      }, 0) / n
    );
    for (let iteration = 0; iteration < options.iterations; iteration += 1) {
      const covariance = invert(
        xtx.map((row, i) =>
          row.map((value, j) => value / sigma2 + (i === j ? priorPrecision : 0))
        )
      );
      if (!covariance) return null;
      const rhs = xty.map((value, index) => value / sigma2 + priorPrecision * options.priorMean);
      const posteriorMean = multiplyVector(covariance, rhs);
      beta = normalVectorDraw(posteriorMean, covariance, rng);
      const sse = y.reduce((sum, value, index) => {
        const fitted = design[index].reduce((acc, xv, j) => acc + xv * beta[j], 0);
        return sum + (value - fitted) ** 2;
      }, 0);
      sigma2 = sse / 2 / gammaDraw(n / 2, 1, rng);
      if (iteration >= options.burnin) {
        beta.forEach((value, index) => chainDraws[index].push(value));
        sigmaDraws.push(Math.sqrt(sigma2));
      }
    }
    beta.forEach((_, index) => chains[index].push(chainDraws[index]));
    sigmas.push(sigmaDraws);
  }
  return { chains, sigma: sigmas };
};

const hierarchicalModel = (
  y: readonly number[],
  groupCodes: readonly number[],
  options: BayesOptions
): {
  theta: number[][][];
  mu: number[][];
  sigma: number[][];
  tau: number[][];
} | null => {
  if (groupCodes.length !== y.length) return null;
  const groups = Math.max(...groupCodes) + 1;
  if (!Number.isFinite(groups) || groups < 2) return null;
  const indices = Array.from({ length: groups }, () => [] as number[]);
  groupCodes.forEach((group, index) => {
    if (group >= 0 && group < groups) indices[group].push(index);
  });
  if (indices.some(group => group.length === 0)) return null;
  const groupMeans = indices.map(group =>
    group.reduce((sum, index) => sum + y[index], 0) / group.length
  );
  const grandMean = mean(groupMeans);
  const thetaChains: number[][][] = Array.from({ length: groups }, () => []);
  const muChains: number[][] = [];
  const sigmaChains: number[][] = [];
  const tauChains: number[][] = [];
  const a0 = 0.001;
  const b0 = 0.001;
  for (let chain = 0; chain < options.chains; chain += 1) {
    const rng = mulberry32(options.seed + chain * 49979687);
    const theta = [...groupMeans];
    let mu = grandMean;
    let sigma2 = Math.max(
      1e-6,
      indices.reduce(
        (sum, group, index) =>
          sum +
          group.reduce((inner, row) => inner + (y[row] - theta[index]) ** 2, 0),
        0
      ) /
        Math.max(1, y.length - groups)
    );
    let tau2 = Math.max(
      1e-6,
      groupMeans.reduce((sum, value) => sum + (value - grandMean) ** 2, 0) /
        Math.max(1, groups - 1)
    );
    const thetaDraws: number[][] = Array.from({ length: groups }, () => []);
    const muDraws: number[] = [];
    const sigmaDraws: number[] = [];
    const tauDraws: number[] = [];
    for (let iteration = 0; iteration < options.iterations; iteration += 1) {
      const thetaPrecision = tau2 > 0 ? 1 / tau2 : 0;
      indices.forEach((group, index) => {
        const precision = group.length / sigma2 + thetaPrecision;
        const center =
          (group.reduce((sum, row) => sum + y[row], 0) / sigma2 +
            mu * thetaPrecision) /
          precision;
        theta[index] = center + normalDraw(rng) / Math.sqrt(precision);
      });
      const muPrecision = groups / tau2 + 1 / Math.max(1e-9, options.priorSd ** 2);
      const muCenter =
        (groups * mean(theta) / tau2 +
          options.priorMean / Math.max(1e-9, options.priorSd ** 2)) /
        muPrecision;
      mu = muCenter + normalDraw(rng) / Math.sqrt(muPrecision);
      const within = indices.reduce(
        (sum, group, index) =>
          sum + group.reduce((inner, row) => inner + (y[row] - theta[index]) ** 2, 0),
        0
      );
      sigma2 = (b0 + within / 2) / gammaDraw(a0 + y.length / 2, 1, rng);
      const between = theta.reduce((sum, value) => sum + (value - mu) ** 2, 0);
      tau2 = (b0 + between / 2) / gammaDraw(a0 + groups / 2, 1, rng);
      if (iteration >= options.burnin) {
        theta.forEach((value, index) => thetaDraws[index].push(value));
        muDraws.push(mu);
        sigmaDraws.push(Math.sqrt(sigma2));
        tauDraws.push(Math.sqrt(tau2));
      }
    }
    thetaDraws.forEach((draws, index) => thetaChains[index].push(draws));
    muChains.push(muDraws);
    sigmaChains.push(sigmaDraws);
    tauChains.push(tauDraws);
  }
  return { theta: thetaChains, mu: muChains, sigma: sigmaChains, tau: tauChains };
};

export const bayesAnalysis = (
  y: readonly number[],
  x: readonly number[][],
  options: BayesOptions
): BayesResult | null => {
  const level = 0.95;
  if (options.mode === 'normal') {
    const fit = normalModel(y, options);
    if (!fit) return null;
    const parameter = summarise(fit.chains, level);
    const sigma = summarise(fit.sigma, level);
    return {
      mode: 'normal',
      n: y.length,
      parameters: [{ term: 'μ', ...parameter }],
      sigma,
      tau: null,
      groups: [],
      draws: fit.chains[0]?.length ?? 0,
      burnin: options.burnin,
      chains: options.chains,
      rhatMax: parameter.rhat,
      essMin: parameter.ess,
      samples: [fit.chains.flat()],
    };
  }
  if (options.mode === 'proportion') {
    const chains = proportionModel(y, options);
    if (!chains) return null;
    const parameter = summarise(chains, level);
    return {
      mode: 'proportion',
      n: y.length,
      parameters: [{ term: 'p', ...parameter }],
      sigma: null,
      tau: null,
      groups: [],
      draws: chains[0]?.length ?? 0,
      burnin: options.burnin,
      chains: options.chains,
      rhatMax: parameter.rhat,
      essMin: parameter.ess,
      samples: [chains.flat()],
    };
  }
  if (options.mode === 'rate') {
    const chains = rateModel(y, options);
    if (!chains) return null;
    const parameter = summarise(chains, level);
    return {
      mode: 'rate',
      n: y.length,
      parameters: [{ term: 'λ', ...parameter }],
      sigma: null,
      tau: null,
      groups: [],
      draws: chains[0]?.length ?? 0,
      burnin: options.burnin,
      chains: options.chains,
      rhatMax: parameter.rhat,
      essMin: parameter.ess,
      samples: [chains.flat()],
    };
  }
  if (options.mode === 'hierarchical') {
    const fit = hierarchicalModel(y, options.groupCodes ?? [], options);
    if (!fit) return null;
    const mu = summarise(fit.mu, level);
    const sigma = summarise(fit.sigma, level);
    const tau = summarise(fit.tau, level);
    const labels = options.groupNames ?? fit.theta.map((_, index) => `G${index + 1}`);
    const groups = fit.theta.map((chains, index) => ({
      label: labels[index] ?? `G${index + 1}`,
      n: options.groupCodes?.filter(code => code === index).length ?? 0,
      ...summarise(chains, level),
    }));
    return {
      mode: 'hierarchical',
      n: y.length,
      parameters: [{ term: 'μ', ...mu }],
      sigma,
      tau,
      groups,
      draws: fit.mu[0]?.length ?? 0,
      burnin: options.burnin,
      chains: options.chains,
      rhatMax: Math.max(
        mu.rhat,
        sigma.rhat,
        tau.rhat,
        ...groups.map(group => group.rhat)
      ),
      essMin: Math.min(
        mu.ess,
        sigma.ess,
        tau.ess,
        ...groups.map(group => group.ess)
      ),
      samples: [fit.mu.flat(), ...fit.theta.map(chains => chains.flat())],
    };
  }
  const fit = regressionModel(x, y, options);
  if (!fit) return null;
  const names = ['(Intercept)', ...(options.variableNames ?? [])];
  const parameters = fit.chains.map((chain, index) => ({
    term: names[index] ?? `β${index}`,
    ...summarise(chain, level),
  }));
  const sigma = summarise(fit.sigma, level);
  return {
    mode: 'regression',
    n: y.length,
    parameters,
    sigma,
    tau: null,
    groups: [],
    draws: fit.chains[0]?.[0]?.length ?? 0,
    burnin: options.burnin,
    chains: options.chains,
    rhatMax: Math.max(...parameters.map(item => item.rhat), sigma.rhat),
    essMin: Math.min(...parameters.map(item => item.ess), sigma.ess),
    samples: fit.chains.map(chain => chain.flat()),
  };
};
