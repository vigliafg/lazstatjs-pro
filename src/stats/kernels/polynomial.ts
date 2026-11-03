/**
 * Polynomial regression of a single predictor.
 *
 * The design matrix is the raw Vandermonde matrix `[1, x, x², …]`, so the
 * coefficients keep their natural interpretation (the same convention as
 * `lm(y ~ poly(x, degree, raw = TRUE))`). Fitting and inference reuse the OLS
 * core from `regression.ts`; the module only owns the basis expansion.
 */
import { fSF, tCrit, twoSidedTP } from '../distributions';
import { fitOls } from './regression';

export interface PolynomialCoefficient {
  degree: number;
  b: number;
  se: number;
  t: number;
  p: number;
  ciLo: number;
  ciHi: number;
}

export interface PolynomialFit {
  degree: number;
  n: number;
  coefficients: PolynomialCoefficient[];
  fitted: number[];
  residuals: number[];
  sse: number;
  ssr: number;
  sst: number;
  df: number;
  rmse: number;
  r2: number;
  adjR2: number;
  f: number;
  pF: number;
  aic: number;
  bic: number;
}

const MAX_DEGREE = 12;

/** Raw polynomial fit of `y` on `x` for degrees 0..degree. */
export const fitPolynomial = (
  x: number[],
  y: number[],
  degree: number,
  level = 95
): PolynomialFit | null => {
  if (x.length !== y.length || x.length === 0) return null;
  if (!Number.isInteger(degree) || degree < 1 || degree > MAX_DEGREE) return null;

  const valid = x
    .map((value, index) => ({ x: value, y: y[index] }))
    .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (valid.length < degree + 2) return null;

  const xs = valid.map(point => point.x);
  const ys = valid.map(point => point.y);
  const design = xs.map(value => {
    const row = [1];
    for (let power = 1; power <= degree; power += 1) row.push(row[power - 1] * value);
    return row;
  });

  const fit = fitOls(ys, design);
  if (!fit) return null;

  const crit = tCrit(level, fit.df);
  const coefficients: PolynomialCoefficient[] = fit.coef.map((value, power) => ({
    degree: power,
    b: value,
    se: fit.se[power],
    t: fit.tStats[power],
    p: fit.pValues[power],
    ciLo: value - crit * fit.se[power],
    ciHi: value + crit * fit.se[power],
  }));

  const msRegression = fit.ssr / degree;
  const f = msRegression / fit.mse;

  return {
    degree,
    n: fit.n,
    coefficients,
    fitted: fit.fitted,
    residuals: fit.residuals,
    sse: fit.sse,
    ssr: fit.ssr,
    sst: fit.sst,
    df: fit.df,
    rmse: Math.sqrt(fit.mse),
    r2: fit.r2,
    adjR2: fit.adjR2,
    f,
    pF: fSF(f, degree, fit.df),
    aic: fit.n * Math.log(fit.sse / fit.n) + 2 * (degree + 1),
    bic: fit.n * Math.log(fit.sse / fit.n) + Math.log(fit.n) * (degree + 1),
  };
};

/** Fitted polynomial evaluated at `value` (for charts and predictions). */
export const polynomialValue = (fit: PolynomialFit, value: number): number =>
  fit.coefficients.reduce(
    (sum, coefficient) => sum + coefficient.b * Math.pow(value, coefficient.degree),
    0
  );

/** Smooth curve over the observed range of the predictor. */
export const polynomialCurve = (
  fit: PolynomialFit,
  xValues: number[],
  points = 40
): { x: number; y: number }[] => {
  const finite = xValues.filter(Number.isFinite);
  if (finite.length === 0 || points < 2) return [];
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  if (min === max) return [{ x: min, y: polynomialValue(fit, min) }];
  const step = (max - min) / (points - 1);
  return Array.from({ length: points }, (_, index) => {
    const value = min + step * index;
    return { x: value, y: polynomialValue(fit, value) };
  });
};

/** Degrees 1..maxDegree ranked by adjusted R², to pick the curve order. */
export const polynomialDegreeScan = (
  x: number[],
  y: number[],
  maxDegree = 6
): { degree: number; r2: number; adjR2: number; aic: number; bic: number }[] => {
  const results: { degree: number; r2: number; adjR2: number; aic: number; bic: number }[] = [];
  const limit = Math.min(MAX_DEGREE, Math.max(1, maxDegree));
  for (let degree = 1; degree <= limit; degree += 1) {
    const fit = fitPolynomial(x, y, degree);
    if (!fit) continue;
    results.push({ degree, r2: fit.r2, adjR2: fit.adjR2, aic: fit.aic, bic: fit.bic });
  }
  return results;
};
