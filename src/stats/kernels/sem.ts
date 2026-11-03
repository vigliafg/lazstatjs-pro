/**
 * Confirmatory factor analysis and a two-factor structural model.
 *
 * The observed covariance matrix is fitted by maximum likelihood under the
 * measurement model `Sigma = Lambda Phi Lambda' + Theta`, with factor
 * variances fixed to one, free loadings and a diagonal uniqueness matrix. With
 * `structural` the second factor is regressed on the first and the factor
 * correlation is replaced by the path coefficient; without it the factors are
 * correlated. This is the same likelihood used by `lavaan` with `std.lv =
 * TRUE`, which keeps the reference comparison direct.
 */

import { chi2SF, tSF } from '../distributions';
import { bfgs } from './optimize';
import { cholesky, invert } from './matrix';
import { numericalGradient, standardizeColumns } from './latent';
import type { SemFactor, SemFit, SemLoading, SemResult, SemUniqueness } from '../sem/types';

export interface SemInput {
  data: number[][];
  variableNames: string[];
  /** Factor index (0-based) for each variable, in the same order. */
  groups: number[];
  factorNames: string[];
  structural: boolean;
  maxIterations?: number;
  tolerance?: number;
}

interface Model {
  p: number;
  k: number;
  groups: number[];
  structural: boolean;
}

const sampleCovariance = (data: number[][]): number[][] => {
  const n = data.length;
  const p = data[0]?.length ?? 0;
  const means = Array.from({ length: p }, (_, column) =>
    data.reduce((sum, row) => sum + row[column], 0) / n
  );
  return Array.from({ length: p }, (_, i) =>
    Array.from({ length: p }, (_, j) => {
      let sum = 0;
      for (let row = 0; row < n; row += 1) {
        sum += (data[row][i] - means[i]) * (data[row][j] - means[j]);
      }
      return sum / Math.max(1, n - 1);
    })
  );
};

const logDeterminant = (matrix: number[][]): number => {
  const lower = cholesky(matrix);
  if (!lower) return Number.NEGATIVE_INFINITY;
  return 2 * lower.reduce((sum, row, index) => sum + Math.log(Math.max(1e-300, row[index])), 0);
};

const implied = (loadings: number[], uniqueness: number[], phi: number[][], model: Model): number[][] => {
  const { p, k, groups } = model;
  const result = Array.from({ length: p }, () => new Array<number>(p).fill(0));
  for (let i = 0; i < p; i += 1) {
    for (let j = 0; j < p; j += 1) {
      const fi = groups[i];
      const fj = groups[j];
      result[i][j] = loadings[i] * loadings[j] * (phi[fi]?.[fj] ?? 0);
    }
    result[i][i] += uniqueness[i];
  }
  void k;
  return result;
};

const factorMatrix = (model: Model, correlations: number[]): number[][] => {
  const { k } = model;
  const phi: number[][] = Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (_, j) => (i === j ? 1 : 0))
  );
  if (model.structural) {
    const beta = correlations[0] ?? 0;
    phi[0][1] = beta;
    phi[1][0] = beta;
  } else {
    let index = 0;
    for (let i = 0; i < k; i += 1) {
      for (let j = i + 1; j < k; j += 1) {
        phi[i][j] = correlations[index] ?? 0;
        phi[j][i] = correlations[index] ?? 0;
        index += 1;
      }
    }
  }
  return phi;
};

const unpack = (values: number[], model: Model): { loadings: number[]; uniqueness: number[]; correlations: number[] } => {
  const { p } = model;
  const loadings = values.slice(0, p);
  const uniqueness = values.slice(p, 2 * p).map(value => Math.exp(value));
  const correlations = values.slice(2 * p);
  return { loadings, uniqueness, correlations };
};

const objective = (
  values: number[],
  model: Model,
  covariance: number[][],
  n: number
): number => {
  const { loadings, uniqueness, correlations } = unpack(values, model);
  const phi = factorMatrix(model, correlations);
  if (model.structural && Math.abs(correlations[0] ?? 0) >= 0.999) return 1e12;
  const sigma = implied(loadings, uniqueness, phi, model);
  const inverse = invert(sigma);
  const logDet = logDeterminant(sigma);
  if (!inverse || !Number.isFinite(logDet)) return 1e12;
  let trace = 0;
  for (let i = 0; i < model.p; i += 1) {
    for (let j = 0; j < model.p; j += 1) {
      trace += covariance[i][j] * (inverse[j]?.[i] ?? 0);
    }
  }
  // -2/n log-likelihood up to constants.
  return n * (logDet + trace);
};

const nullChiSquare = (covariance: number[][], n: number): { chi2: number; df: number } => {
  const p = covariance.length;
  const logDet = logDeterminant(covariance);
  let trace = 0;
  for (let i = 0; i < p; i += 1) trace += covariance[i][i] * (1 / Math.max(1e-300, covariance[i][i]));
  const f = logDet + trace - p;
  return { chi2: Math.max(0, (n - 1) * f), df: (p * (p - 1)) / 2 };
};

const startValues = (model: Model, covariance: number[][]): number[] => {
  const { p, groups } = model;
  const loadings = Array.from({ length: p }, (_, i) => {
    const variance = Math.max(1e-6, covariance[i][i]);
    return Math.min(0.95, Math.max(0.3, Math.sqrt(Math.max(0, 1 - 1 / variance))));
  });
  const uniqueness = loadings.map(value => Math.log(Math.max(0.05, 1 - value * value)));
  const correlationCount = model.structural ? 1 : (model.k * (model.k - 1)) / 2;
  const correlations = new Array<number>(correlationCount).fill(0.2);
  void groups;
  return [...loadings, ...uniqueness, ...correlations];
};

export const semAnalysis = (input: SemInput): SemResult | null => {
  const n = input.data.length;
  const p = input.variableNames.length;
  const k = input.factorNames.length;
  if (n < p + 2 || p < 3 || k < 1) return null;
  if (input.data.some(row => row.length !== p) || input.groups.length !== p) return null;
  if (input.groups.some(group => group < 0 || group >= k)) return null;
  if (input.factorNames.some(name => !name.trim())) return null;
  if (input.structural && k !== 2) return null;
  for (let factor = 0; factor < k; factor += 1) {
    if (input.groups.filter(group => group === factor).length < 2) return null;
  }
  const standardized = standardizeColumns(input.data);
  if (!standardized) return null;
  const covariance = sampleCovariance(standardized.data);
  const model: Model = { p, k, groups: input.groups, structural: input.structural };
  const start = startValues(model, covariance);
  const fit = bfgs(
    values => objective(values, model, covariance, n),
    values => numericalGradient(value => objective(value, model, covariance, n), values),
    start,
    {
      maxIterations: input.maxIterations ?? 250,
      tolerance: input.tolerance ?? 1e-6,
      stepTolerance: 1e-9,
    }
  );
  const { loadings, uniqueness, correlations } = unpack(fit.x, model);
  const phi = factorMatrix(model, correlations);
  const sigma = implied(loadings, uniqueness, phi, model);
  const inverse = invert(sigma);
  if (!inverse) return null;
  const logDet = logDeterminant(sigma);
  let trace = 0;
  for (let i = 0; i < p; i += 1) {
    for (let j = 0; j < p; j += 1) trace += covariance[i][j] * (inverse[j]?.[i] ?? 0);
  }
  const fMin = Math.max(0, logDet + trace - logDeterminant(covariance) - p);
  const chi2 = Math.max(0, (n - 1) * fMin);
  const parameters =
    p + p + (input.structural ? 1 : (k * (k - 1)) / 2);
  const df = Math.max(0, (p * (p + 1)) / 2 - parameters);
  const nullModel = nullChiSquare(covariance, n);
  const cfi =
    nullModel.chi2 > nullModel.df
      ? 1 - Math.max(0, chi2 - df) / Math.max(1e-9, nullModel.chi2 - nullModel.df)
      : 1;
  const tli =
    nullModel.df > 0 && nullModel.chi2 / nullModel.df > 1
      ? ((nullModel.chi2 / nullModel.df) - chi2 / Math.max(1, df)) /
        ((nullModel.chi2 / nullModel.df) - 1)
      : 1;
  const rmsea = df > 0 ? Math.sqrt(Math.max(0, (chi2 - df) / (df * (n - 1)))) : 0;
  let srmrSum = 0;
  let srmrCount = 0;
  for (let i = 0; i < p; i += 1) {
    for (let j = 0; j <= i; j += 1) {
      srmrSum += Math.pow(covariance[i][j] - sigma[i][j], 2);
      srmrCount += 1;
    }
  }
  const srmr = Math.sqrt(srmrSum / Math.max(1, srmrCount));
  const logLik = -0.5 * n * (p * Math.log(2 * Math.PI) + logDet + trace);
  const criteriaAic = -2 * logLik + 2 * parameters;
  const criteriaBic = -2 * logLik + parameters * Math.log(n);

  // Numerical Hessian of the negative log-likelihood for standard errors.
  const step = 1e-4;
  const base = objective(fit.x, model, covariance, n);
  const hessian = fit.x.map((value, i) =>
    fit.x.map((__, j) => {
      const plusI = [...fit.x];
      const minusI = [...fit.x];
      plusI[i] = value + step;
      minusI[i] = value - step;
      if (i === j) {
        return (
          (objective(plusI, model, covariance, n) -
            2 * base +
            objective(minusI, model, covariance, n)) /
          (step * step)
        );
      }
      const plus = [...fit.x];
      const minus = [...fit.x];
      plus[i] += step;
      plus[j] += step;
      minus[i] += step;
      minus[j] -= step;
      return (
        (objective(plus, model, covariance, n) - objective(minus, model, covariance, n)) /
        (2 * step * step)
      );
    })
  );
  const covarianceParameters = invert(hessian.map(row => row.map(value => -value)));
  const se = covarianceParameters
    ? covarianceParameters.map((row, index) => Math.sqrt(Math.max(0, row[index] ?? 0)))
    : new Array<number>(fit.x.length).fill(Number.NaN);

  const loadingRows: SemLoading[] = input.variableNames.map((variable, index) => {
    const estimate = loadings[index] ?? 0;
    const standardError = se[index] ?? Number.NaN;
    const z = standardError > 0 ? estimate / standardError : 0;
    const factorVariance = phi[input.groups[index]]?.[input.groups[index]] ?? 1;
    return {
      variable,
      factor: input.factorNames[input.groups[index]] ?? `F${input.groups[index] + 1}`,
      loading: estimate,
      se: standardError,
      z,
      p: 2 * tSF(Math.abs(z), Math.max(1, n - parameters)),
      standardized: estimate * Math.sqrt(factorVariance / Math.max(1e-12, covariance[index][index])),
      r2: Math.max(0, Math.min(1, Math.pow(estimate, 2) / Math.max(1e-12, covariance[index][index]))),
    };
  });
  const uniquenessRows: SemUniqueness[] = input.variableNames.map((variable, index) => ({
    variable,
    uniqueness: uniqueness[index] ?? 0,
    se: (uniqueness[index] ?? 0) * (se[p + index] ?? Number.NaN),
  }));

  const factors: SemFactor[] = input.factorNames.map((name, factor) => ({
    name,
    variance: phi[factor]?.[factor] ?? 1,
    correlations: input.factorNames
      .map((other, index) => ({ other, index }))
      .filter(item => item.index !== factor)
      .map(item => {
        const correlation = phi[factor]?.[item.index] ?? 0;
        const rawIndex = model.structural
          ? 0
          : factorIndex(model, factor, item.index);
        return {
          factor: item.other,
          correlation,
          se: Number.isFinite(se[2 * p + rawIndex]) && se[2 * p + rawIndex] > 0
          ? se[2 * p + rawIndex]
          : Number.NaN,
        };
      }),
  }));

  const pathStandardError =
    Number.isFinite(se[2 * p]) && se[2 * p] > 0 ? se[2 * p] : Number.NaN;
  const pathZ = Number.isFinite(pathStandardError)
    ? (correlations[0] ?? 0) / pathStandardError
    : Number.NaN;
  const path = input.structural
    ? {
        from: input.factorNames[0] ?? 'F1',
        to: input.factorNames[1] ?? 'F2',
        beta: correlations[0] ?? 0,
        se: pathStandardError,
        z: pathZ,
        p: 2 * tSF(Math.abs(pathZ), Math.max(1, n - parameters)),
      }
    : null;

  const residuals = covariance.map((row, i) =>
    row.map((value, j) => value - (sigma[i][j] ?? 0))
  );

  const fitResult: SemFit = {
    chi2,
    df,
    p: chi2SF(chi2, df),
    cfi,
    tli,
    rmsea,
    srmr,
    aic: criteriaAic,
    bic: criteriaBic,
    logLik,
    n,
    parameters,
    iterations: fit.iterations,
    converged: fit.converged,
  };

  return {
    variables: input.variableNames,
    factors,
    loadings: loadingRows,
    uniqueness: uniquenessRows,
    fit: fitResult,
    implied: sigma,
    observed: covariance,
    residuals,
    structural: input.structural,
    path,
  };
};

const factorIndex = (model: Model, a: number, b: number): number => {
  let index = 0;
  for (let i = 0; i < model.k; i += 1) {
    for (let j = i + 1; j < model.k; j += 1) {
      if ((i === a && j === b) || (i === b && j === a)) return index;
      index += 1;
    }
  }
  return 0;
};
