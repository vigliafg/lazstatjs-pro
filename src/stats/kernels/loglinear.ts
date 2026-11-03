/**
 * Poisson log-linear model for a two-way contingency table.
 *
 * The table is expanded into one observation per cell and fitted with the
 * shared IRLS core (`glmFit`, Poisson/log). Two specifications are available:
 *
 * - `independence`: intercept + row dummies + column dummies (main effects);
 * - `saturated`: adds every row×column interaction dummy, so the fitted table
 *   reproduces the observed counts exactly.
 *
 * The saturated fit has as many parameters as cells (p = R·C), so the shared
 * `glmFit` guard (`p < n`) rejects it by design. For that specification the
 * maximum-likelihood equations reduce to the square linear system
 * Xβ = log(y); the kernel solves it directly and builds the covariance from
 * the same (X'WX)⁻¹ used by IRLS. A zero count has no finite saturated
 * estimate, so the fit returns `null` in that case.
 */

import { chi2SF, zCrit } from '../distributions';
import { jStat } from '../jstat';
import { glmFit } from '../kernels/glm';
import { invert, solveLinear, transpose, type Matrix } from '../kernels/matrix';
import type {
  LoglinearCell,
  LoglinearCoefficient,
  LoglinearModel,
  LoglinearOptions,
  LoglinearStats,
} from '../loglinear/types';

interface Design {
  matrix: Matrix;
  terms: string[];
}

const EPS = 1e-12;

export const isLoglinearTable = (observed: number[][]): boolean => {
  if (observed.length < 2) return false;
  const width = observed[0]?.length ?? 0;
  if (width < 2) return false;
  if (!observed.every(row => row.length === width)) return false;
  if (!observed.every(row => row.every(value => Number.isFinite(value) && value >= 0))) {
    return false;
  }
  const total = observed.reduce((sum, row) => sum + row.reduce((inner, value) => inner + value, 0), 0);
  if (!(total > 0)) return false;
  const rowTotals = observed.map(row => row.reduce((sum, value) => sum + value, 0));
  const colTotals = Array.from({ length: width }, (_, column) =>
    observed.reduce((sum, row) => sum + row[column], 0)
  );
  return rowTotals.every(value => value > 0) && colTotals.every(value => value > 0);
};

/** Treatment-coding design: intercept, row dummies, column dummies, interactions. */
export const loglinearDesign = (
  rows: number,
  cols: number,
  model: LoglinearModel,
  rowLabels: string[] = [],
  colLabels: string[] = []
): Design => {
  const rowName = (index: number) => rowLabels[index] ?? `Row ${index + 1}`;
  const colName = (index: number) => colLabels[index] ?? `Col ${index + 1}`;

  const terms: string[] = ['(Intercept)'];
  for (let i = 1; i < rows; i += 1) terms.push(rowName(i));
  for (let j = 1; j < cols; j += 1) terms.push(colName(j));
  if (model === 'saturated') {
    // R's `row*col` expansion cycles the first factor fastest: row2:col2,
    // row3:col2, row2:col3, ... — keep that order so fixtures line up.
    for (let j = 1; j < cols; j += 1) {
      for (let i = 1; i < rows; i += 1) terms.push(`${rowName(i)}:${colName(j)}`);
    }
  }

  const matrix: Matrix = [];
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      const row: number[] = [1];
      for (let r = 1; r < rows; r += 1) row.push(i === r ? 1 : 0);
      for (let c = 1; c < cols; c += 1) row.push(j === c ? 1 : 0);
      if (model === 'saturated') {
        for (let c = 1; c < cols; c += 1) {
          for (let r = 1; r < rows; r += 1) row.push(i === r && j === c ? 1 : 0);
        }
      }
      matrix.push(row);
    }
  }
  return { matrix, terms };
};

const toCoefficients = (
  beta: number[],
  covariance: Matrix,
  terms: string[],
  level: number
): LoglinearCoefficient[] => {
  const crit = zCrit(level);
  return beta.map((value, index) => {
    const se = Math.sqrt(Math.max(0, covariance[index]?.[index] ?? Number.NaN));
    const z = se > 0 ? value / se : Number.NaN;
    const p = Number.isFinite(z) ? 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1)) : Number.NaN;
    const lo = value - crit * se;
    const hi = value + crit * se;
    return {
      term: terms[index] ?? `b${index}`,
      beta: value,
      se,
      z,
      p,
      expBeta: Math.exp(value),
      lo,
      hi,
      expLo: Math.exp(lo),
      expHi: Math.exp(hi),
    };
  });
};

const toGlmCoefficients = (
  fit: { coefficients: { beta: number; se: number; z: number; p: number }[] },
  terms: string[],
  level: number
): LoglinearCoefficient[] => {
  const crit = zCrit(level);
  return fit.coefficients.map((coefficient, index) => ({
    term: terms[index] ?? `b${index}`,
    beta: coefficient.beta,
    se: coefficient.se,
    z: coefficient.z,
    p: coefficient.p,
    expBeta: Math.exp(coefficient.beta),
    lo: coefficient.beta - crit * coefficient.se,
    hi: coefficient.beta + crit * coefficient.se,
    expLo: Math.exp(coefficient.beta - crit * coefficient.se),
    expHi: Math.exp(coefficient.beta + crit * coefficient.se),
  }));
};

const poissonLogLik = (observed: number[], expected: number[]): number =>
  observed.reduce((sum, value, index) => {
    const mu = Math.max(EPS, expected[index] ?? EPS);
    return sum + value * Math.log(mu) - mu - jStat.gammaln(value + 1);
  }, 0);

const nullDeviance = (observed: number[]): number => {
  const mean = observed.reduce((sum, value) => sum + value, 0) / Math.max(1, observed.length);
  return 2 * observed.reduce((sum, value) => sum + (value > 0 ? value * Math.log(value / mean) : 0), 0);
};

interface SaturatedSolution {
  coefficients: LoglinearCoefficient[];
  logLik: number;
}

const solveSaturated = (
  design: Design,
  observed: number[],
  level: number
): SaturatedSolution | null => {
  if (observed.some(value => !(value > 0))) return null;
  const beta = solveLinear(design.matrix, observed.map(value => Math.log(value)));
  if (!beta || beta.some(value => !Number.isFinite(value))) return null;

  // Covariance: (X' W X)⁻¹ with W = diag(μ) = diag(observed) for Poisson/log.
  const xt = transpose(design.matrix);
  const xtwx: Matrix = Array.from({ length: beta.length }, () => new Array(beta.length).fill(0));
  for (let a = 0; a < beta.length; a += 1) {
    for (let b = 0; b < beta.length; b += 1) {
      let sum = 0;
      for (let i = 0; i < observed.length; i += 1) {
        sum += xt[a][i] * observed[i] * design.matrix[i][b];
      }
      xtwx[a][b] = sum;
    }
  }
  const covariance = invert(xtwx);
  if (!covariance) return null;

  return {
    coefficients: toCoefficients(beta, covariance, design.terms, level),
    logLik: poissonLogLik(observed, observed),
  };
};

/** Fit the selected log-linear model; `null` when the fit is not estimable. */
export const loglinearFit = (options: LoglinearOptions): LoglinearStats | null => {
  const { observed, rowLabels, colLabels, model, level } = options;
  if (!isLoglinearTable(observed)) return null;

  const rows = observed.length;
  const cols = observed[0].length;
  const flat = observed.flat();
  const design = loglinearDesign(rows, cols, model, rowLabels, colLabels);

  let finalCoefficients: LoglinearCoefficient[];
  let expectedFlat: number[];
  let deviance: number;
  let dfResidual: number;
  let p: number;
  let logLik: number;
  let aic: number;
  let nullDev: number;

  if (model === 'saturated') {
    const solution = solveSaturated(design, flat, level);
    if (!solution) return null;
    finalCoefficients = solution.coefficients;
    expectedFlat = flat.slice();
    deviance = 0;
    dfResidual = 0;
    p = Number.NaN;
    logLik = solution.logLik;
    aic = -2 * logLik + 2 * design.terms.length;
    nullDev = nullDeviance(flat);
  } else {
    const fit = glmFit({ y: flat, x: design.matrix, family: 'poisson', link: 'log' });
    if (!fit) return null;
    finalCoefficients = toGlmCoefficients(fit, design.terms, level);
    expectedFlat = fit.fitted;
    deviance = fit.deviance;
    dfResidual = fit.dfResidual;
    p = dfResidual > 0 ? chi2SF(deviance, dfResidual) : Number.NaN;
    logLik = fit.logLik;
    aic = fit.aic;
    nullDev = fit.nullDeviance;
  }

  const expected: number[][] = [];
  const standardized: number[][] = [];
  const cellsTable: LoglinearCell[] = [];
  let cursor = 0;
  for (let i = 0; i < rows; i += 1) {
    const expectedRow: number[] = [];
    const residualRow: number[] = [];
    for (let j = 0; j < cols; j += 1) {
      const value = observed[i][j];
      const mu = expectedFlat[cursor] ?? Number.NaN;
      const residual = mu > 0 ? (value - mu) / Math.sqrt(mu) : Number.NaN;
      const contribution = value > 0 && mu > 0 ? 2 * value * Math.log(value / mu) : 0;
      expectedRow.push(mu);
      residualRow.push(residual);
      cellsTable.push({
        row: rowLabels[i] ?? `Row ${i + 1}`,
        col: colLabels[j] ?? `Col ${j + 1}`,
        rowIndex: i,
        colIndex: j,
        observed: value,
        expected: mu,
        residual,
        contribution,
      });
      cursor += 1;
    }
    expected.push(expectedRow);
    standardized.push(residualRow);
  }

  let oddsRatio: LoglinearStats['oddsRatio'];
  if (model === 'saturated' && rows === 2 && cols === 2) {
    const interaction = finalCoefficients[finalCoefficients.length - 1];
    if (interaction && Number.isFinite(interaction.beta)) {
      oddsRatio = {
        oddsRatio: Math.exp(interaction.beta),
        lo: interaction.expLo,
        hi: interaction.expHi,
      };
    }
  }

  return {
    model,
    rows,
    cols,
    n: flat.reduce((sum, value) => sum + value, 0),
    cells: rows * cols,
    coefficients: finalCoefficients,
    deviance,
    dfResidual,
    p,
    nullDeviance: nullDev,
    dfNull: rows * cols - 1,
    logLik,
    aic,
    expected,
    standardized,
    cellsTable,
    oddsRatio,
  };
};
