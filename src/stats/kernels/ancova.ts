import { jStat } from '../jstat';
import { fSF, holmAdjust, tCrit, twoSidedTP } from '../distributions';
import type { AncovaOptions } from '../ancova/types';

type Matrix = number[][];

const transpose = (matrix: Matrix): Matrix =>
  matrix[0].map((_, column) => matrix.map((row) => row[column]));

const multiply = (a: Matrix, b: Matrix): Matrix =>
  a.map((row) => b[0].map((_, column) => row.reduce((sum, value, i) => sum + value * b[i][column], 0)));

const multiplyVector = (matrix: Matrix, vector: number[]): number[] =>
  matrix.map((row) => row.reduce((sum, value, i) => sum + value * vector[i], 0));

const quadratic = (matrix: Matrix, vector: number[]): number => {
  const product = multiplyVector(matrix, vector);
  return vector.reduce((sum, value, index) => sum + value * product[index], 0);
};

interface Fit {
  coef: number[];
  sse: number;
  df: number;
  mse: number;
  inverse: Matrix;
}

const fitOls = (X: Matrix, y: number[]): Fit | null => {
  const n = y.length;
  const p = X[0]?.length ?? 0;
  const df = n - p;
  if (p === 0 || df <= 0) return null;
  try {
    const xt = transpose(X);
    const xtx = multiply(xt, X);
    const inverse = jStat.inv(xtx) as Matrix;
    if (!inverse || inverse.length !== p || inverse.some((row) => row.some((value) => !Number.isFinite(value)))) {
      return null;
    }
    const xty = multiplyVector(xt, y);
    const coef = multiplyVector(inverse, xty);
    const fitted = multiplyVector(X, coef);
    const sse = y.reduce((sum, value, index) => sum + (value - fitted[index]) ** 2, 0);
    if (!Number.isFinite(sse)) return null;
    return { coef, sse, df, mse: sse / df, inverse };
  } catch {
    return null;
  }
};

const keepColumns = (X: Matrix, keep: number[]): Matrix => X.map((row) => keep.map((index) => row[index]));

const mean = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;



interface AncovaCore {
  groups: string[];
  n: number;
  k: number;
  m: number;
  factorSS: number;
  factorDf: number;
  factorF: number;
  factorP: number;
  covariateSS: number[];
  covariateF: number[];
  covariateP: number[];
  sse: number;
  dfError: number;
  mse: number;
  sst: number;
  r2: number;
  adjR2: number;
  rmse: number;
  modelF: number;
  modelP: number;
  modelDf: number;
  adjustedMeans: number[];
  adjustedSe: number[];
  rawMeans: number[];
  rawSds: number[];
  groupNs: number[];
  coef: number[];
  coefSe: number[];
  coefT: number[];
  coefP: number[];
  slopesF: number;
  slopesDf1: number;
  slopesDf2: number;
  slopesP: number;
  posthoc: { a: string; b: string; difference: number; se: number; t: number; p: number; pHolm: number }[];
}

export const build = (options: AncovaOptions): AncovaCore | null => {
  const { response, factor, covariates, factorName, covariateNames, level } = options;
  const m = covariates.length;
  if (m === 0 || response.length !== factor.length) return null;
  if (covariates.some((values) => values.length !== response.length)) return null;

  const observed = Array.from(new Set(factor.filter((value) => value.trim() !== '')));
  const declared = options.levels ?? [];
  const levels = [
    ...declared.filter((value) => observed.includes(value)),
    ...observed.filter((value) => !declared.includes(value)).sort(),
  ];
  const k = levels.length;
  if (k < 2) return null;

  const groups: string[] = [];
  const y: number[] = [];
  const covRows: number[][] = [];
  response.forEach((value, row) => {
    const level = factor[row]?.trim() ?? '';
    if (level === '' || !Number.isFinite(value)) return;
    const values = covariates.map((column) => column[row]);
    if (values.some((cell) => !Number.isFinite(cell))) return;
    groups.push(level);
    y.push(value);
    covRows.push(values);
  });

  const n = y.length;
  const p = 1 + (k - 1) + m;
  if (n <= p) return null;

  const covMeans = Array.from({ length: m }, (_, column) => mean(covRows.map((row) => row[column])));
  const centered = covRows.map((row) => row.map((value, column) => value - covMeans[column]));
  const dummy = groups.map((level) => {
    const index = levels.indexOf(level);
    return Array.from({ length: k - 1 }, (_, column) => (index === column + 1 ? 1 : 0));
  });
  const X: Matrix = y.map((_, row) => [1, ...dummy[row], ...centered[row]]);

  const full = fitOls(X, y);
  if (!full) return null;

  const factorKeep = [0, ...Array.from({ length: m }, (_, column) => k + column)];
  const reducedFactor = fitOls(keepColumns(X, factorKeep), y);
  if (!reducedFactor) return null;
  const factorSS = Math.max(0, reducedFactor.sse - full.sse);
  const factorDf = k - 1;
  const factorF = (factorSS / factorDf) / full.mse;
  const factorP = fSF(factorF, factorDf, full.df);

  const covariateSS: number[] = [];
  const covariateF: number[] = [];
  const covariateP: number[] = [];
  for (let column = 0; column < m; column += 1) {
    const keep = Array.from({ length: p }, (_, index) => index).filter((index) => index !== k + column);
    const reduced = fitOls(keepColumns(X, keep), y);
    if (!reduced) return null;
    const ss = Math.max(0, reduced.sse - full.sse);
    const f = ss / full.mse;
    covariateSS.push(ss);
    covariateF.push(f);
    covariateP.push(fSF(f, 1, full.df));
  }

  const yMean = mean(y);
  const sst = y.reduce((sum, value) => sum + (value - yMean) ** 2, 0);
  const modelSS = Math.max(0, sst - full.sse);
  const modelDf = p - 1;
  const modelF = (modelSS / modelDf) / full.mse;
  const modelP = fSF(modelF, modelDf, full.df);
  const r2 = sst > 0 ? modelSS / sst : NaN;

  const crit = tCrit(level, full.df);
  const adjustedMeans: number[] = [];
  const adjustedSe: number[] = [];
  const rawMeans: number[] = [];
  const rawSds: number[] = [];
  const groupNs: number[] = [];
  levels.forEach((levelName, index) => {
    const values = y.filter((_, row) => groups[row] === levelName);
    groupNs.push(values.length);
    rawMeans.push(mean(values));
    rawSds.push(values.length > 1 ? jStat.stdev(values, true) : NaN);
    const contrast = new Array<number>(p).fill(0);
    contrast[0] = 1;
    if (index > 0) contrast[index] = 1;
    adjustedMeans.push(contrast.reduce((sum, value, column) => sum + value * full.coef[column], 0));
    adjustedSe.push(Math.sqrt(Math.max(0, quadratic(full.inverse, contrast) * full.mse)));
  });

  const coefSe = full.coef.map((_, index) => Math.sqrt(Math.max(0, full.inverse[index][index] * full.mse)));
  const coefT = full.coef.map((value, index) => value / coefSe[index]);
  const coefP = coefT.map((value) => twoSidedTP(value, full.df));

  // Homogeneity of regression slopes: add every factor × covariate product.
  let slopesF = NaN;
  let slopesDf1 = (k - 1) * m;
  let slopesDf2 = NaN;
  let slopesP = NaN;
  const interactions: Matrix = y.map((_, row) =>
    Array.from({ length: k - 1 }, (_, groupColumn) =>
      Array.from({ length: m }, (_, covColumn) => dummy[row][groupColumn] * centered[row][covColumn])
    ).flat()
  );
  const Xint: Matrix = X.map((row, index) => [...row, ...interactions[index]]);
  const interactionFit = fitOls(Xint, y);
  if (interactionFit && interactionFit.df > 0) {
    slopesDf1 = (k - 1) * m;
    slopesDf2 = interactionFit.df;
    const ss = Math.max(0, full.sse - interactionFit.sse);
    slopesF = (ss / slopesDf1) / interactionFit.mse;
    slopesP = fSF(slopesF, slopesDf1, slopesDf2);
  }

  const posthoc: AncovaCore['posthoc'] = [];
  const rawP: number[] = [];
  for (let a = 0; a < k; a += 1) {
    for (let b = a + 1; b < k; b += 1) {
      const contrast = new Array<number>(p).fill(0);
      if (a > 0) contrast[a] = 1;
      if (b > 0) contrast[b] = -1;
      const difference = contrast.reduce((sum, value, column) => sum + value * full.coef[column], 0);
      const se = Math.sqrt(Math.max(0, quadratic(full.inverse, contrast) * full.mse));
      const t = se > 0 ? difference / se : NaN;
      const pValue = twoSidedTP(t, full.df);
      posthoc.push({ a: levels[a], b: levels[b], difference, se, t, p: pValue, pHolm: NaN });
      rawP.push(pValue);
    }
  }
  const adjusted = holmAdjust(rawP);
  const byPair = new Map<string, number>();
  posthoc.forEach((pair, index) => byPair.set(`${pair.a}\u0000${pair.b}`, adjusted[index]));
  posthoc.forEach((pair) => {
    pair.pHolm = byPair.get(`${pair.a}\u0000${pair.b}`) ?? NaN;
  });

  return {
    groups: levels,
    n,
    k,
    m,
    factorSS,
    factorDf,
    factorF,
    factorP,
    covariateSS,
    covariateF,
    covariateP,
    sse: full.sse,
    dfError: full.df,
    mse: full.mse,
    sst,
    r2,
    adjR2: 1 - (1 - r2) * ((n - 1) / full.df),
    rmse: Math.sqrt(full.mse),
    modelF,
    modelP,
    modelDf,
    adjustedMeans,
    adjustedSe,
    rawMeans,
    rawSds,
    groupNs,
    coef: full.coef,
    coefSe,
    coefT,
    coefP,
    slopesF,
    slopesDf1,
    slopesDf2,
    slopesP,
    posthoc,
  };
};
