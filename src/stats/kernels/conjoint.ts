/**
 * Additive conjoint analysis with effect coding.
 *
 * Every attribute contributes L−1 columns (the last level is coded −1), so the
 * coefficients are deviations from the grand mean and the omitted level is
 * recovered as minus the sum of the others. This is the same `lm` +
 * `contr.sum` model used by `conjoint::caUtilities`, which makes the R
 * reference directly comparable.
 */

import { fSF, tSF } from '../distributions';
import { invert } from './matrix';
import type { ConjointAttribute, ConjointLevel, ConjointResult } from '../conjoint/types';

export interface ConjointInput {
  profiles: string[][];
  response: number[];
  attributeNames: string[];
  levels: string[][];
}

interface Column {
  attribute: number;
  level: number;
  term: string;
}

const buildDesign = (
  profiles: string[][],
  levels: string[][],
  attributeNames: string[]
): { matrix: number[][]; columns: Column[] } => {
  const columns: Column[] = [];
  levels.forEach((attributeLevels, attribute) => {
    for (let level = 0; level < attributeLevels.length - 1; level += 1) {
      columns.push({
        attribute,
        level,
        term: `${attributeNames[attribute] ?? `A${attribute + 1}`}=${attributeLevels[level]}`,
      });
    }
  });
  const matrix = profiles.map(profile => {
    const row = [1];
    levels.forEach((attributeLevels, attribute) => {
      const selected = attributeLevels.indexOf(profile[attribute] ?? '');
      for (let level = 0; level < attributeLevels.length - 1; level += 1) {
        if (selected === level) row.push(1);
        else if (selected === attributeLevels.length - 1) row.push(-1);
        else row.push(0);
      }
    });
    return row;
  });
  return { matrix, columns };
};

const product = (a: number[][], b: number[][]): number[][] => {
  const result = Array.from({ length: a.length }, () => new Array<number>(b[0]?.length ?? 0).fill(0));
  for (let i = 0; i < a.length; i += 1) {
    for (let k = 0; k < b.length; k += 1) {
      const value = a[i][k] ?? 0;
      if (value === 0) continue;
      for (let j = 0; j < (b[0]?.length ?? 0); j += 1) result[i][j] += value * (b[k][j] ?? 0);
    }
  }
  return result;
};

const transpose = (matrix: number[][]): number[][] =>
  (matrix[0] ?? []).map((_, column) => matrix.map(row => row[column] ?? 0));

export const conjointAnalysis = (input: ConjointInput): ConjointResult | null => {
  const n = input.profiles.length;
  const attributeCount = input.attributeNames.length;
  if (n < 4 || attributeCount < 1) return null;
  if (input.response.length !== n) return null;
  if (input.profiles.some(profile => profile.length !== attributeCount)) return null;
  if (input.response.some(value => !Number.isFinite(value))) return null;
  if (input.levels.some(levels => levels.length < 2 || new Set(levels).size !== levels.length)) return null;

  const { matrix: design, columns } = buildDesign(input.profiles, input.levels, input.attributeNames);
  const y = input.response;
  const xt = transpose(design);
  const xtx = product(xt, design);
  const covariance = invert(xtx);
  if (!covariance) return null;
  const xty = xt.map(row => row.reduce((sum, value, index) => sum + value * y[index], 0));
  const beta = covariance.map(row => row.reduce((sum, value, index) => sum + value * xty[index], 0));
  const predictions = design.map(row =>
    row.reduce((sum, value, index) => sum + value * (beta[index] ?? 0), 0)
  );
  const residuals = y.map((value, index) => value - predictions[index]);
  const rss = residuals.reduce((sum, value) => sum + value * value, 0);
  const mean = y.reduce((sum, value) => sum + value, 0) / n;
  const tss = y.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0);
  const r2 = tss > 0 ? 1 - rss / tss : 0;
  const dfResidual = n - design[0].length;
  if (dfResidual <= 0) return null;
  const sigma2 = rss / dfResidual;
  const se = beta.map((_, index) => Math.sqrt(Math.max(0, sigma2 * (covariance[index]?.[index] ?? 0))));
  const coefficients = beta.map((estimate, index) => {
    const standardError = se[index] ?? 0;
    const t = standardError > 0 ? estimate / standardError : 0;
    return {
      term: index === 0 ? '(Intercept)' : columns[index - 1]?.term ?? `x${index}`,
      estimate,
      se: standardError,
      t,
      p: 2 * tSF(Math.abs(t), dfResidual),
    };
  });
  const adjR2 = 1 - (1 - r2) * ((n - 1) / Math.max(1, dfResidual));
  const modelDf = design[0].length - 1;
  const f = modelDf > 0 && rss > 0 ? ((tss - rss) / modelDf) / (rss / dfResidual) : 0;
  const fP = modelDf > 0 ? fSF(f, modelDf, dfResidual) : 1;

  const levels: ConjointLevel[] = input.attributeNames.flatMap((attribute, index) => {
    const attributeLevels = input.levels[index] ?? [];
    const effects = attributeLevels.slice(0, -1).map((_, level) => {
      const column = columns.findIndex(item => item.attribute === index && item.level === level);
      return column >= 0 ? beta[column + 1] ?? 0 : 0;
    });
    const reference = -effects.reduce((sum, value) => sum + value, 0);
    const all = [...effects, reference];
    return attributeLevels.map((level, levelIndex) => {
      const column = columns.findIndex(item => item.attribute === index && item.level === levelIndex);
      const standardError = column >= 0 ? se[column + 1] ?? 0 : 0;
      const estimate = all[levelIndex] ?? 0;
      const t = standardError > 0 ? estimate / standardError : 0;
      return {
        attribute,
        level,
        utility: estimate,
        se: standardError,
        t,
        p: 2 * tSF(Math.abs(t), dfResidual),
      };
    });
  });

  const attributes: ConjointAttribute[] = input.attributeNames.map((attribute, index) => {
    const values = levels.filter(item => item.attribute === attribute).map(item => item.utility);
    const range = values.length > 0 ? Math.max(...values) - Math.min(...values) : 0;
    return { attribute, levels: input.levels[index] ?? [], importance: 0, range };
  });
  const totalRange = attributes.reduce((sum, item) => sum + item.range, 0);
  attributes.forEach(item => {
    item.importance = totalRange > 0 ? (item.range / totalRange) * 100 : 0;
  });

  return {
    n,
    attributes,
    levels,
    coefficients,
    r2,
    adjR2,
    rmse: Math.sqrt(sigma2),
    f,
    fP,
    intercept: beta[0] ?? 0,
    predictions,
    residuals,
  };
};
