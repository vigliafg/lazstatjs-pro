/**
 * Two-stage least squares (2SLS / instrumental variables).
 *
 * The design follows the classical formulation:
 *
 *   Z = [1, exog, instruments]        (instrument matrix)
 *   X = [1, exog, endog]              (structural regressors)
 *   Xhat = Z (Z'Z)^-1 Z' X            (projection of X on Z)
 *   beta = (Xhat' Xhat)^-1 Xhat' y
 *
 * which is algebraically the same as (X' P_Z X)^-1 X' P_Z y and keeps the
 * first-stage projection explicit, so the first-stage F and the Wu–Hausman
 * test can reuse the same fitted values.
 *
 * Diagnostics mirror `AER::ivreg` / `AER:::ivdiag`:
 * - first stage: each endogenous regressor on all instruments, with the
 *   partial F of the excluded instruments;
 * - Sargan: n * R² from the regression of the 2SLS residuals on all
 *   instruments (with intercept), df = #instruments - #endogenous;
 * - Wu–Hausman: F comparing OLS of y on X with the augmented regression of y
 *   on X and the first-stage fitted endogenous regressors.
 *
 * The Wu–Hausman test is always the classical (non-robust) F; the `robust`
 * flag only changes the structural standard errors.
 */

import { chi2SF, fSF, tCrit, twoSidedTP } from './distributions';
import { invert, multiply, multiplyVector, transpose, type Matrix } from './matrix';

export interface IvInput {
  /** Response, one value per row. */
  y: number[];
  /** Endogenous regressors, one column per variable. */
  endog: Matrix;
  /** Excluded instruments, one column per instrument. */
  instruments: Matrix;
  /** Included exogenous regressors (their own instruments). */
  exog?: Matrix;
  /** HC1 heteroskedasticity-robust standard errors. */
  robust?: boolean;
  /** Confidence level in percent (default 95). */
  level?: number;
}

export interface IvCoefficient {
  term: string;
  beta: number;
  se: number;
  t: number;
  p: number;
  ciLo: number;
  ciHi: number;
}

export interface IvFirstStage {
  /** Label of the endogenous regressor this stage refers to. */
  endog: string;
  /** Coefficients of the instrument matrix (intercept, exog, instruments). */
  coefficients: IvCoefficient[];
  /** Partial F of the excluded instruments. */
  f: number;
  df1: number;
  df2: number;
  p: number;
}

export interface IvSargan {
  statistic: number;
  df: number;
  p: number;
}

export interface IvWuHausman {
  statistic: number;
  df1: number;
  df2: number;
  p: number;
}

export interface IvResult {
  coefficients: IvCoefficient[];
  fitted: number[];
  residuals: number[];
  n: number;
  /** Number of structural parameters (intercept included). */
  p: number;
  dfResidual: number;
  r2: number;
  adjR2: number;
  sigma: number;
  firstStage: IvFirstStage[];
  /** `null` when the model is just identified (#instruments = #endogenous). */
  sargan: IvSargan | null;
  /** `null` when the model is just identified (no independent fitted regressor). */
  wuHausman: IvWuHausman | null;
}

const EPS = 1e-12;

const isFiniteMatrix = (matrix: Matrix, rows: number): boolean =>
  matrix.length === rows &&
  matrix.every(row => Array.isArray(row) && row.length > 0 && row.every(value => Number.isFinite(value)));

/** Build `[1, ...blocks]` for one row per observation. */
const design = (n: number, blocks: Matrix[]): Matrix =>
  Array.from({ length: n }, (_, index) => [1, ...blocks.flatMap(block => block[index] ?? [])]);

const residualSumOfSquares = (y: number[], fitted: number[]): number =>
  y.reduce((sum, value, index) => sum + (value - fitted[index]) ** 2, 0);

/** Ordinary least squares on a full-rank design; `null` if singular. */
const ols = (x: Matrix, y: number[]): { beta: number[]; rss: number } | null => {
  const xt = transpose(x);
  const inverse = invert(multiply(xt, x));
  if (!inverse) return null;
  const beta = multiplyVector(inverse, multiplyVector(xt, y));
  const fitted = multiplyVector(x, beta);
  return { beta, rss: residualSumOfSquares(y, fitted) };
};

const coefficient = (
  term: string,
  beta: number,
  se: number,
  df: number,
  level: number
): IvCoefficient => {
  const t = se > 0 ? beta / se : Number.NaN;
  const critical = tCrit(level, df);
  return {
    term,
    beta,
    se,
    t,
    p: Number.isFinite(t) ? twoSidedTP(t, df) : Number.NaN,
    ciLo: beta - critical * se,
    ciHi: beta + critical * se,
  };
};

/**
 * Fit a 2SLS model. Returns `null` for invalid inputs (no endogenous
 * regressors, no instruments, fewer instruments than endogenous regressors,
 * fewer observations than parameters) or collinear designs.
 */
export const fitIv = (input: IvInput): IvResult | null => {
  const { y, endog, instruments } = input;
  const exog = input.exog ?? [];
  const robust = input.robust ?? false;
  const level = input.level ?? 95;

  const n = y.length;
  const endogenous = endog[0]?.length ?? 0;
  const excluded = instruments[0]?.length ?? 0;
  const included = exog[0]?.length ?? 0;
  if (n === 0 || !y.every(Number.isFinite)) return null;
  if (endogenous === 0 || excluded === 0) return null;
  if (excluded < endogenous) return null;
  if (!isFiniteMatrix(endog, n) || !isFiniteMatrix(instruments, n)) return null;
  if (included > 0 && !isFiniteMatrix(exog, n)) return null;

  const p = 1 + included + endogenous;
  if (n <= p) return null;

  const z = design(n, included > 0 ? [exog, instruments] : [instruments]);
  const x = design(n, included > 0 ? [exog, endog] : [endog]);
  const zWidth = z[0].length;

  const zt = transpose(z);
  const ztzInverse = invert(multiply(zt, z));
  if (!ztzInverse) return null;

  const xhat = multiply(multiply(z, ztzInverse), multiply(zt, x));
  const xhatt = transpose(xhat);
  const xhattXhatInverse = invert(multiply(xhatt, xhat));
  if (!xhattXhatInverse) return null;

  const beta = multiplyVector(xhattXhatInverse, multiplyVector(xhatt, y));
  if (!beta.every(Number.isFinite)) return null;

  const fitted = multiplyVector(x, beta);
  const residuals = y.map((value, index) => value - fitted[index]);
  const rss = residualSumOfSquares(y, fitted);
  const mean = y.reduce((sum, value) => sum + value, 0) / n;
  const tss = y.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  if (!(rss > 0) || !(tss > 0)) return null;

  const dfResidual = n - p;
  const sigma2 = rss / dfResidual;
  const sigma = Math.sqrt(sigma2);
  const r2 = 1 - rss / tss;
  const adjR2 = 1 - (1 - r2) * ((n - 1) / dfResidual);

  let covariance = xhattXhatInverse.map(row => row.map(value => value * sigma2));
  if (robust) {
    const meat: Matrix = Array.from({ length: p }, () => new Array<number>(p).fill(0));
    for (let i = 0; i < n; i += 1) {
      const squared = residuals[i] * residuals[i];
      for (let a = 0; a < p; a += 1) {
        for (let b = 0; b < p; b += 1) {
          meat[a][b] += squared * xhat[i][a] * xhat[i][b];
        }
      }
    }
    const scaled = multiply(multiply(xhattXhatInverse, meat), xhattXhatInverse);
    const adjustment = n / dfResidual;
    covariance = scaled.map(row => row.map(value => value * adjustment));
  }

  const exogTerms = Array.from({ length: included }, (_, index) => `exog${index + 1}`);
  const endogTerms = Array.from({ length: endogenous }, (_, index) => `endog${index + 1}`);
  const instrumentTerms = Array.from({ length: excluded }, (_, index) => `instrument${index + 1}`);
  const structuralTerms = ['(Intercept)', ...exogTerms, ...endogTerms];
  const instrumentMatrixTerms = ['(Intercept)', ...exogTerms, ...instrumentTerms];

  const coefficients = beta.map((value, index) =>
    coefficient(structuralTerms[index], value, Math.sqrt(Math.max(0, covariance[index][index])), dfResidual, level)
  );

  const firstStage: IvFirstStage[] = endogTerms.map((term, position) => {
    const response = endog.map(row => row[position]);
    const ztx = multiplyVector(zt, response);
    const stageBeta = multiplyVector(ztzInverse, ztx);
    const stageFitted = multiplyVector(z, stageBeta);
    const rssFull = residualSumOfSquares(response, stageFitted);

    const restricted = design(n, included > 0 ? [exog] : []);
    const restrictedFit = ols(restricted, response);
    if (!restrictedFit) return null;
    const df2 = n - zWidth;
    if (df2 <= 0 || !(rssFull > 0)) return null;
    const f = ((restrictedFit.rss - rssFull) / excluded) / (rssFull / df2);

    const stageSigma2 = rssFull / df2;
    const stageCoefficients = stageBeta.map((value, index) =>
      coefficient(
        instrumentMatrixTerms[index],
        value,
        Math.sqrt(Math.max(0, ztzInverse[index][index] * stageSigma2)),
        df2,
        level
      )
    );

    return {
      endog: term,
      coefficients: stageCoefficients,
      f,
      df1: excluded,
      df2,
      p: fSF(f, excluded, df2),
    };
  });
  if (firstStage.some(stage => stage === null)) return null;

  let sargan: IvSargan | null = null;
  if (excluded > endogenous) {
    const residualMean = residuals.reduce((sum, value) => sum + value, 0) / n;
    const centeredRss = residuals.reduce((sum, value) => sum + (value - residualMean) ** 2, 0);
    const auxiliary = ols(z, residuals);
    if (!auxiliary || !(centeredRss > EPS)) return null;
    const statistic = n * (1 - auxiliary.rss / centeredRss);
    sargan = {
      statistic,
      df: excluded - endogenous,
      p: chi2SF(statistic, excluded - endogenous),
    };
  }

  const olsFit = ols(x, y);
  const augmented = x.map((row, index) => [...row, ...xhat[index].slice(p - endogenous)]);
  const augmentedFit = ols(augmented, y);
  if (!olsFit) return null;
  let wuHausman: IvWuHausman | null = null;
  if (augmentedFit) {
    const hausmanDf2 = n - augmented[0].length;
    if (hausmanDf2 > 0) {
      const statistic =
        ((olsFit.rss - augmentedFit.rss) / endogenous) / (augmentedFit.rss / hausmanDf2);
      wuHausman = {
        statistic,
        df1: endogenous,
        df2: hausmanDf2,
        p: fSF(statistic, endogenous, hausmanDf2),
      };
    }
  }

  return {
    coefficients,
    fitted,
    residuals,
    n,
    p,
    dfResidual,
    r2,
    adjR2,
    sigma,
    firstStage: firstStage as IvFirstStage[],
    sargan,
    wuHausman,
  };
};
