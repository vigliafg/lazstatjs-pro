/**
 * Propensity-score analysis: nearest-neighbour matching and IPW.
 *
 * The propensity score is the fitted probability of a binomial-logit GLM on
 * the covariates. Matching uses the probability scale (not the logit): the
 * caliper is expressed in standard deviations of the estimated score, like
 * `MatchIt::matchit(..., std.caliper = TRUE)`.
 *
 * Matching is 1:k with replacement. Every treated unit independently takes the
 * `ratio` closest controls inside the caliper; controls can therefore be reused
 * and treated units without a control are dropped and counted. The ATT is the
 * mean of the per-treated differences (treated outcome minus the mean of its
 * matched controls); its standard error is the standard error of those paired
 * differences.
 *
 * IPW uses the ATT weights (treated = 1, control = e / (1 - e)); the ATT and
 * its standard error come from the weighted least-squares regression of the
 * outcome on the treatment indicator.
 */

import { zCrit, zTwoSidedP } from './distributions';
import { invert, transpose, type Matrix } from './matrix';
import { addIntercept, glmFit } from './glm';

export type PropensityMethod = 'nearest' | 'ipw';

export interface PropensityInput {
  /** 0/1 treatment indicator, one value per row. */
  treatment: number[];
  /** Observed outcome, one value per row. */
  outcome: number[];
  /** Covariate matrix without the intercept, one row per observation. */
  covariates: Matrix;
  method: PropensityMethod;
  /** Caliper in SD of the propensity score; 0 disables it. */
  caliper: number;
  /** Maximum number of controls per treated unit. */
  ratio: number;
  /** Confidence level in percent (default 95). */
  level?: number;
  /** Optional covariate labels; defaults to X1, X2, ... */
  names?: string[];
}

export interface PropensityCoefficient {
  term: string;
  beta: number;
  se: number;
  z: number;
  p: number;
  lo: number;
  hi: number;
}

export interface PropensityBalanceRow {
  covariate: string;
  /** Mean among the analysed treated units (matched units for nearest). */
  meanTreated: number;
  /** Mean among all controls before matching/weighting. */
  meanControlBefore: number;
  /** Mean among matched controls (nearest) or weighted controls (IPW). */
  meanControlAfter: number;
  smdBefore: number;
  smdAfter: number;
}

export interface PropensityAtt {
  estimate: number;
  se: number;
  z: number;
  p: number;
  lo: number;
  hi: number;
}

export interface PropensityResult {
  ps: {
    coefficients: PropensityCoefficient[];
    fitted: number[];
  };
  balance: PropensityBalanceRow[];
  att: PropensityAtt;
  nTreated: number;
  nControl: number;
  /** Number of treated units retained in the matched/weighted sample. */
  matchedTreated: number;
  /** Number of control matches (with replacement); equal to nControl for IPW. */
  matchedControls: number;
  droppedTreated: number;
  /** Effective sample size of the weighted controls (Kish). */
  effectiveSampleSize: number;
  /** Overlap of the treated and control propensity-score ranges. */
  commonSupport: { lo: number; hi: number };
  method: PropensityMethod;
  caliper: number;
  ratio: number;
}

const EPS = 1e-12;
const MAX_RATIO = 10;

const mean = (values: number[]): number =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : NaN;

/** Sample variance with the n - 1 denominator, as in R's `var()`. */
const variance = (values: number[]): number => {
  const n = values.length;
  if (n < 2) return NaN;
  const center = mean(values);
  return values.reduce((sum, value) => sum + (value - center) ** 2, 0) / (n - 1);
};

const weightedMean = (values: number[], weights: number[]): number => {
  let numerator = 0;
  let denominator = 0;
  values.forEach((value, index) => {
    numerator += weights[index] * value;
    denominator += weights[index];
  });
  return denominator > 0 ? numerator / denominator : NaN;
};

const smd = (meanTreated: number, meanControl: number, pooledSd: number): number =>
  pooledSd > EPS ? (meanTreated - meanControl) / pooledSd : 0;

const normalInterval = (
  estimate: number,
  se: number,
  level: number
): { z: number; p: number; lo: number; hi: number } => {
  const z = se > 0 ? estimate / se : Number.NaN;
  const crit = zCrit(level);
  return {
    z,
    p: Number.isFinite(z) ? zTwoSidedP(z) : Number.NaN,
    lo: Number.isFinite(se) ? estimate - crit * se : Number.NaN,
    hi: Number.isFinite(se) ? estimate + crit * se : Number.NaN,
  };
};

/** Weighted least squares; returns the coefficient vector and its covariance. */
const fitWls = (
  y: number[],
  x: Matrix,
  weights: number[]
): { beta: number[]; se: number[] } | null => {
  const n = y.length;
  const p = x[0]?.length ?? 0;
  if (n === 0 || x.length !== n || p === 0 || weights.length !== n) return null;
  const xt = transpose(x);
  const xtwx: Matrix = Array.from({ length: p }, () => new Array(p).fill(0));
  const xtwy = new Array(p).fill(0);
  for (let i = 0; i < n; i += 1) {
    for (let a = 0; a < p; a += 1) {
      xtwy[a] += xt[a][i] * weights[i] * y[i];
      for (let b = 0; b < p; b += 1) xtwx[a][b] += xt[a][i] * weights[i] * x[i][b];
    }
  }
  const covariance = invert(xtwx);
  if (!covariance) return null;
  const beta = covariance.map(row => row.reduce((sum, value, index) => sum + value * xtwy[index], 0));
  const residual = y.map((value, index) =>
    value - x[index].reduce((sum, entry, column) => sum + entry * beta[column], 0)
  );
  const df = n - p;
  if (df <= 0) return null;
  const sigma2 =
    residual.reduce((sum, value, index) => sum + weights[index] * value * value, 0) / df;
  if (!(sigma2 > 0)) return null;
  return { beta, se: covariance.map((row, index) => Math.sqrt(Math.max(0, row[index] * sigma2))) };
};

interface MatchedPair {
  treated: number;
  controls: number[];
  difference: number;
}

/**
 * Fit the propensity model and estimate the ATT.
 *
 * Returns `null` for malformed inputs, non-binary treatment, a missing group,
 * collinear covariates, out-of-range caliper/ratio, too few observations or a
 * propensity model that cannot be estimated.
 */
export const fitPropensity = (input: PropensityInput): PropensityResult | null => {
  const {
    treatment,
    outcome,
    covariates,
    method,
    caliper,
    ratio,
    level = 95,
    names,
  } = input;
  const n = treatment.length;
  const covariateNames = covariates[0]?.length
    ? covariates[0].map((_, index) => names?.[index] ?? `X${index + 1}`)
    : [];

  if (
    n === 0 ||
    outcome.length !== n ||
    covariates.length !== n ||
    covariates.some(row => row.length !== covariateNames.length) ||
    !Number.isFinite(level) ||
    level <= 0 ||
    level >= 100
  ) {
    return null;
  }
  if (treatment.some(value => value !== 0 && value !== 1)) return null;
  if (!Number.isFinite(caliper) || caliper < 0) return null;
  if (!Number.isInteger(ratio) || ratio < 1 || ratio > MAX_RATIO) return null;
  if (!covariateNames.length) return null;

  const treatedIndexes = treatment
    .map((value, index) => (value === 1 ? index : -1))
    .filter(index => index >= 0);
  const controlIndexes = treatment
    .map((value, index) => (value === 0 ? index : -1))
    .filter(index => index >= 0);
  const nTreated = treatedIndexes.length;
  const nControl = controlIndexes.length;
  if (nTreated < 2 || nControl < 2) return null;
  if (n <= covariateNames.length + 1) return null;
  if (
    treatment.some(value => !Number.isFinite(value)) ||
    outcome.some(value => !Number.isFinite(value)) ||
    covariates.some(row => row.some(value => !Number.isFinite(value)))
  ) {
    return null;
  }

  const model = glmFit({
    y: treatment,
    x: addIntercept(covariates),
    family: 'binomial',
    link: 'logit',
  });
  if (!model || !model.converged) return null;

  const fitted = model.fitted;
  if (fitted.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) return null;

  const coefficients: PropensityCoefficient[] = model.coefficients.map((coefficient, index) => ({
    term: index === 0 ? '(Intercept)' : covariateNames[index - 1],
    beta: coefficient.beta,
    se: coefficient.se,
    z: coefficient.z,
    p: coefficient.p,
    lo: coefficient.lo,
    hi: coefficient.hi,
  }));

  const psTreated = treatedIndexes.map(index => fitted[index]);
  const psControl = controlIndexes.map(index => fitted[index]);
  const commonSupport = {
    lo: Math.max(Math.min(...psTreated), Math.min(...psControl)),
    hi: Math.min(Math.max(...psTreated), Math.max(...psControl)),
  };

  const balance: PropensityBalanceRow[] = [];
  let att: PropensityAtt;
  let matchedTreated: number;
  let matchedControls: number;
  let droppedTreated: number;
  let effectiveSampleSize: number;

  // Pooled SD of each covariate on the whole sample before matching, used for
  // both the before and after standardized differences.
  const pooledSd = Array.from({ length: covariateNames.length }, (_, column) => {
    const treatedValues = treatedIndexes.map(index => covariates[index][column]);
    const controlValues = controlIndexes.map(index => covariates[index][column]);
    const pooled = (variance(treatedValues) + variance(controlValues)) / 2;
    return Number.isFinite(pooled) && pooled > 0 ? Math.sqrt(pooled) : 0;
  });

  if (method === 'nearest') {
    const scoreSd = Math.sqrt(variance(fitted));
    const width = caliper > 0 && Number.isFinite(scoreSd) ? caliper * scoreSd : Infinity;
    const controlWeights = new Array(n).fill(0);
    const pairs: MatchedPair[] = [];

    treatedIndexes.forEach(treated => {
      const candidates = controlIndexes
        .map(control => ({
          index: control,
          distance: Math.abs(fitted[treated] - fitted[control]),
        }))
        .filter(candidate => candidate.distance <= width)
        .sort((left, right) => left.distance - right.distance || left.index - right.index)
        .slice(0, ratio);
      if (candidates.length === 0) return;
      const weight = 1 / candidates.length;
      candidates.forEach(candidate => {
        controlWeights[candidate.index] += weight;
      });
      const controlMean = mean(candidates.map(candidate => outcome[candidate.index]));
      pairs.push({
        treated,
        controls: candidates.map(candidate => candidate.index),
        difference: outcome[treated] - controlMean,
      });
    });

    if (pairs.length < 2) return null;
    const differences = pairs.map(pair => pair.difference);
    const estimate = mean(differences);
    const se = Math.sqrt(variance(differences) / differences.length);
    const interval = normalInterval(estimate, se, level);
    att = { estimate, se, ...interval };

    matchedTreated = pairs.length;
    matchedControls = pairs.reduce((sum, pair) => sum + pair.controls.length, 0);
    droppedTreated = nTreated - matchedTreated;

    const sumWeights = controlWeights.reduce((sum, value) => sum + value, 0);
    const sumSquares = controlWeights.reduce((sum, value) => sum + value * value, 0);
    effectiveSampleSize = sumSquares > 0 ? (sumWeights * sumWeights) / sumSquares : 0;

    const matchedTreatedIndexes = pairs.map(pair => pair.treated);
    covariateNames.forEach((covariate, column) => {
      const allTreated = treatedIndexes.map(index => covariates[index][column]);
      const allControl = controlIndexes.map(index => covariates[index][column]);
      const matchedTreatedValues = matchedTreatedIndexes.map(index => covariates[index][column]);
      const controlAfter = weightedMean(
        covariates.map(row => row[column]),
        controlWeights
      );
      const meanTreated = mean(matchedTreatedValues);
      const meanControlBefore = mean(allControl);
      const meanTreatedAll = mean(allTreated);
      balance.push({
        covariate,
        meanTreated,
        meanControlBefore,
        meanControlAfter: controlAfter,
        smdBefore: smd(meanTreatedAll, meanControlBefore, pooledSd[column]),
        smdAfter: smd(meanTreated, controlAfter, pooledSd[column]),
      });
    });
  } else {
    const weights = fitted.map((score, index) =>
      treatment[index] === 1 ? 1 : score / (1 - score)
    );
    if (weights.some(value => !Number.isFinite(value) || value <= 0)) return null;

    const design = treatment.map(value => [1, value]);
    const regression = fitWls(outcome, design, weights);
    if (!regression) return null;

    const estimate = regression.beta[1];
    const se = regression.se[1];
    const interval = normalInterval(estimate, se, level);
    att = { estimate, se, ...interval };

    matchedTreated = nTreated;
    matchedControls = nControl;
    droppedTreated = 0;
    const sumWeights = weights.reduce((sum, value) => sum + value, 0);
    const sumSquares = weights.reduce((sum, value) => sum + value * value, 0);
    effectiveSampleSize = sumSquares > 0 ? (sumWeights * sumWeights) / sumSquares : 0;

    covariateNames.forEach((covariate, column) => {
      const allTreated = treatedIndexes.map(index => covariates[index][column]);
      const allControl = controlIndexes.map(index => covariates[index][column]);
      const weightedControl = weightedMean(
        allControl,
        controlIndexes.map(index => weights[index])
      );
      const meanControlBefore = mean(allControl);
      const meanTreated = mean(allTreated);
      balance.push({
        covariate,
        meanTreated,
        meanControlBefore,
        meanControlAfter: weightedControl,
        smdBefore: smd(meanTreated, meanControlBefore, pooledSd[column]),
        smdAfter: smd(meanTreated, weightedControl, pooledSd[column]),
      });
    });
  }

  return {
    ps: { coefficients, fitted },
    balance,
    att,
    nTreated,
    nControl,
    matchedTreated,
    matchedControls,
    droppedTreated,
    effectiveSampleSize,
    commonSupport,
    method,
    caliper,
    ratio,
  };
};
