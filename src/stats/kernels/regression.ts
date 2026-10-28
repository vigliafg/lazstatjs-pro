import { jStat } from '../jstat';
import { parseNum } from '../core';
import { calcTheilSen } from './index';
import {
  bootstrapCI,
  chi2SF,
  fSF,
  lillieforsTest,
  tCrit,
  twoSidedTP,
} from '../distributions';
import { eigenSymmetric } from '../linalg';

type Matrix = number[][];

const transpose = (matrix: Matrix): Matrix =>
  matrix[0].map((_, column) => matrix.map(row => row[column]));

const multiply = (a: Matrix, b: Matrix): Matrix =>
  a.map(row => b[0].map((_, column) => row.reduce((sum, value, i) => sum + value * b[i][column], 0)));

const multiplyVector = (matrix: Matrix, vector: number[]): number[] =>
  matrix.map(row => row.reduce((sum, value, i) => sum + value * vector[i], 0));

const dot = (a: number[], b: number[]): number =>
  a.reduce((sum, value, i) => sum + value * b[i], 0);

interface OlsFit {
  coef: number[];
  fitted: number[];
  residuals: number[];
  sse: number;
  sst: number;
  ssr: number;
  r2: number;
  adjR2: number;
  df: number;
  mse: number;
  se: number[];
  tStats: number[];
  pValues: number[];
  cov: Matrix;
  xtxInv: Matrix;
  n: number;
  k: number;
}

const fitOls = (Y: number[], X: Matrix): OlsFit | null => {
  const n = Y.length;
  const p = X[0].length;
  const k = p - 1;
  const df = n - k - 1;
  if (df <= 0) return null;

  try {
    const xt = transpose(X);
    const xtx = multiply(xt, X);
    const xtxInv = jStat.inv(xtx);
    const xty = multiplyVector(xt, Y);
    const coef = multiplyVector(xtxInv, xty);
    const fitted = multiplyVector(X, coef);
    const residuals = Y.map((value, i) => value - fitted[i]);
    const sse = residuals.reduce((sum, value) => sum + value * value, 0);
    const meanY = jStat.mean(Y);
    const sst = Y.reduce((sum, value) => sum + Math.pow(value - meanY, 2), 0);
    const ssr = sst - sse;
    const r2 = sst > 0 ? Math.min(1, Math.max(0, ssr / sst)) : NaN;
    const mse = sse / df;
    const se = coef.map((_, i) => Math.sqrt(mse * xtxInv[i][i]));
    const tStats = coef.map((value, i) => value / se[i]);
    const pValues = tStats.map(t => twoSidedTP(t, df));
    const cov = xtxInv.map(row => row.map(value => value * mse));
    return {
      coef,
      fitted,
      residuals,
      sse,
      sst,
      ssr,
      r2,
      adjR2: 1 - (1 - r2) * ((n - 1) / df),
      df,
      mse,
      se,
      tStats,
      pValues,
      cov,
      xtxInv,
      n,
      k,
    };
  } catch {
    return null;
  }
};

export interface RegressionCoefficient {
  b: number;
  se: number;
  beta: number;
  t: number;
  p: number;
  ciLo: number;
  ciHi: number;
  tol: number;
  vif: number;
}

export interface RegressionResidualStats {
  n: number;
  mean: number;
  median: number;
  sd: number;
  min: number;
  max: number;
  skew: number;
  kurt: number;
  jbP: number;
  lillieforsP: number;
  outliers: number;
}

export interface RegressionDiagnostics {
  maxLeverage: number;
  maxCook: number;
  cookOutliers: number;
  bpStat: number;
  bpP: number;
  whiteStat: number;
  whiteP: number;
  whiteDf: number;
  resetF: number;
  resetP: number;
  dfbetasMax: number;
  dfbetasCount: number;
  dfbetasThreshold: number;
  conditionIndex: number;
  conditionCount: number;
  residualOutliers: number;
}

export interface TheilSenEstimates {
  slope: number;
  intercept: number;
  lo: number;
  hi: number;
}

export interface RobustCoefficient {
  b: number;
  se: number;
  t: number;
  p: number;
  ciLo: number;
  ciHi: number;
}

export interface RegressionStats {
  n: number;
  k: number;
  df: number;
  sse: number;
  ssr: number;
  sst: number;
  mse: number;
  msRegression: number;
  r: number;
  r2: number;
  adjR2: number;
  seEstimate: number;
  f: number;
  pF: number;
  aic: number;
  bic: number;
  dw: number;
  crit: number;
  intercept: RegressionCoefficient;
  coefficients: RegressionCoefficient[];
  robust: { intercept: RobustCoefficient; coefficients: RobustCoefficient[] } | null;
  diagnostics: RegressionDiagnostics;
  residualsOls: RegressionResidualStats;
  residualsTs: RegressionResidualStats | null;
  theilSen: TheilSenEstimates | null;
  univariateSlopes: number[];
}

/** Stima OLS multipla con diagnostica del modello e dei residui. */
export const regressionStats = (
  rows: readonly (readonly string[])[],
  depIdx: number,
  indepIdxs: number[],
  level: number,
  robustSE: 'none' | 'HC1' | 'HC3' = 'none'
): RegressionStats | null => {
  const validRows = rows.filter(row => {
    if (isNaN(parseNum(row[depIdx]))) return false;
    return indepIdxs.every(index => !isNaN(parseNum(row[index])));
  });

  const k = indepIdxs.length;
  if (k === 0 || validRows.length <= k + 1) return null;

  const Y = validRows.map(row => parseNum(row[depIdx]));
  const predictors = indepIdxs.map(index => validRows.map(row => parseNum(row[index])));
  const X: Matrix = validRows.map((_, rowIndex) => [1, ...predictors.map(values => values[rowIndex])]);

  const fit = fitOls(Y, X);
  if (!fit) return null;

  const n = fit.n;
  const crit = tCrit(level, fit.df);
  const sdY = jStat.stdev(Y, true);

  const vifValues = predictors.map((values, index) => {
    if (k === 1) return 1;
    const others = predictors.filter((_, otherIndex) => otherIndex !== index);
    const auxX: Matrix = values.map((_, rowIndex) => [1, ...others.map(other => other[rowIndex])]);
    try {
      const aux = fitOls(values, auxX);
      if (!aux || !(aux.r2 < 1)) return NaN;
      return 1 / (1 - aux.r2);
    } catch {
      return NaN;
    }
  });

  const aic = n * Math.log(fit.sse / n) + 2 * (k + 1);
  const bic = n * Math.log(fit.sse / n) + Math.log(n) * (k + 1);
  const dw = fit.residuals.reduce((sum, value, index) => {
    if (index === 0) return 0;
    return sum + Math.pow(value - fit.residuals[index - 1], 2);
  }, 0) / fit.residuals.reduce((sum, value) => sum + value * value, 0);

  // Breusch-Pagan: regress squared residuals on the predictors.
  const squaredResiduals = fit.residuals.map(value => value * value);
  let bpStat = NaN;
  let bpP = NaN;
  try {
    const bpFit = fitOls(squaredResiduals, X);
    if (bpFit) {
      bpStat = n * bpFit.r2;
      bpP = chi2SF(bpStat, k);
    }
  } catch {
    // leave NaN
  }

  // Leverage and Cook's distance.
  const leverage = X.map(row => dot(row, multiplyVector(fit.xtxInv, row)));
  const cooks = fit.residuals.map((residual, i) => {
    const h = leverage[i];
    if (!(h < 1) || fit.mse <= 0) return NaN;
    return (residual * residual) / ((k + 1) * fit.mse) * (h / Math.pow(1 - h, 2));
  });
  const maxCook = Math.max(...cooks.map(value => (isFinite(value) ? value : 0)));
  const cookOutliers = cooks.filter(value => value > 1).length;
  const maxLeverage = Math.max(...leverage.map(value => (isFinite(value) ? value : 0)));

  // White test: squared residuals on the linear terms, their squares and the
  // pairwise cross-products. n·R² is asymptotically χ² with one df per
  // auxiliary regressor (intercept excluded).
  const whiteColumns: number[][] = [];
  predictors.forEach(values => whiteColumns.push(values));
  predictors.forEach(values => whiteColumns.push(values.map(value => value * value)));
  for (let i = 0; i < predictors.length; i += 1) {
    for (let j = i + 1; j < predictors.length; j += 1) {
      whiteColumns.push(predictors[i].map((value, row) => value * predictors[j][row]));
    }
  }
  let whiteStat = NaN;
  let whiteP = NaN;
  let whiteDf = NaN;
  if (whiteColumns.length + 1 < n) {
    const whiteX: Matrix = validRows.map((_, row) => [1, ...whiteColumns.map(column => column[row])]);
    const whiteFit = fitOls(squaredResiduals, whiteX);
    if (whiteFit && whiteFit.r2 >= 0) {
      whiteDf = whiteX[0].length - 1;
      whiteStat = n * whiteFit.r2;
      whiteP = chi2SF(whiteStat, whiteDf);
    }
  }

  // Ramsey RESET (RESET2): add the squared fitted values and test the gain in
  // fit with an F test against the original model.
  let resetF = NaN;
  let resetP = NaN;
  try {
    const resetX: Matrix = X.map((row, i) => [...row, fit.fitted[i] * fit.fitted[i]]);
    const resetFit = fitOls(Y, resetX);
    if (resetFit && resetFit.mse > 0 && resetFit.sse <= fit.sse) {
      resetF = (fit.sse - resetFit.sse) / resetFit.mse;
      resetP = fSF(resetF, 1, resetFit.df);
    }
  } catch {
    // leave NaN
  }

  // DFBETAS: standardized change in each coefficient when observation i is
  // dropped, using the Sherman–Morrison update for b(i) and its covariance.
  let dfbetasMax = NaN;
  let dfbetasCount = 0;
  if (fit.df > 1) {
    const threshold = 2 / Math.sqrt(n);
    let max = 0;
    let count = 0;
    let computed = false;
    for (let i = 0; i < n; i += 1) {
      const h = leverage[i];
      if (!(h < 1)) continue;
      const denom = 1 - h;
      const residual = fit.residuals[i];
      const u = multiplyVector(fit.xtxInv, X[i]);
      const mseI = (fit.sse - (residual * residual) / denom) / (fit.df - 1);
      if (!(mseI >= 0)) continue;
      for (let j = 0; j < fit.coef.length; j += 1) {
        const seI = Math.sqrt(mseI * (fit.xtxInv[j][j] + (u[j] * u[j]) / denom));
        if (!(seI > 0)) continue;
        const dfbeta = (u[j] * residual) / denom / seI;
        computed = true;
        if (Number.isFinite(dfbeta)) {
          max = Math.max(max, Math.abs(dfbeta));
          if (Math.abs(dfbeta) > threshold) count += 1;
        }
      }
    }
    if (computed) {
      dfbetasMax = max;
      dfbetasCount = count;
    }
  }

  // Belsley condition index: singular values of the unit-scaled design.
  let conditionIndex = NaN;
  let conditionCount = 0;
  try {
    const width = X[0].length;
    const norms = Array.from({ length: width }, (_, j) =>
      Math.sqrt(X.reduce((sum, row) => sum + row[j] * row[j], 0))
    );
    const scaled = X.map(row => row.map((value, j) => (norms[j] > 0 ? value / norms[j] : 0)));
    const ztz: Matrix = Array.from({ length: width }, (_, i) =>
      Array.from({ length: width }, (_, j) =>
        scaled.reduce((sum, row) => sum + row[i] * row[j], 0)
      )
    );
    const eigen = eigenSymmetric(ztz);
    if (eigen.values.length > 0 && eigen.values[0] > 0) {
      const indices = eigen.values.map(value =>
        Math.sqrt(eigen.values[0] / Math.max(value, 1e-12))
      );
      conditionIndex = Math.max(...indices);
      conditionCount = indices.filter(value => value > 30).length;
    }
  } catch {
    // leave NaN
  }

  const standardizedResiduals = fit.residuals.map((residual, i) =>
    fit.mse > 0 && leverage[i] < 1 ? residual / (Math.sqrt(fit.mse) * Math.sqrt(1 - leverage[i])) : NaN
  );
  const residualOutliers = standardizedResiduals.filter(value => Math.abs(value) > 3).length;

  const theilSen =
    k === 1
      ? (() => {
          const result = calcTheilSen(predictors[0], Y);
          const ci = bootstrapCI(rnd => {
            const sampleX: number[] = [];
            const sampleY: number[] = [];
            for (let i = 0; i < n; i++) {
              const index = Math.floor(rnd() * n);
              sampleX.push(predictors[0][index]);
              sampleY.push(Y[index]);
            }
            return calcTheilSen(sampleX, sampleY).slope;
          }, level, 600);
          return { slope: result.slope, intercept: result.intercept, lo: ci.lo, hi: ci.hi };
        })()
      : null;

  const tsResiduals =
    theilSen && isFinite(theilSen.slope)
      ? Y.map((value, i) => value - (theilSen.intercept + theilSen.slope * predictors[0][i]))
      : null;

  const residualSummary = (values: number[]): RegressionResidualStats => {
    const jb = (() => {
      if (values.length < 3) return NaN;
      const skew = jStat.skewness(values);
      const kurt = jStat.kurtosis(values);
      return chi2SF((values.length / 6) * (skew * skew + (kurt * kurt) / 4), 2);
    })();
    const lilliefors = lillieforsTest(values);
    const mean = jStat.mean(values);
    const standardDeviation = jStat.stdev(values, true);
    return {
      n: values.length,
      mean,
      median: jStat.median(values),
      sd: standardDeviation,
      min: jStat.min(values),
      max: jStat.max(values),
      skew: jStat.skewness(values),
      kurt: jStat.kurtosis(values),
      jbP: jb,
      lillieforsP: lilliefors.p,
      outliers: standardDeviation > 0
        ? values.filter(value => Math.abs((value - mean) / standardDeviation) > 3).length
        : 0,
    };
  };

  const olsSummary = residualSummary(fit.residuals);
  const tsSummary = tsResiduals ? residualSummary(tsResiduals) : null;

  const r = Math.sqrt(Math.max(0, fit.r2));
  const msRegression = fit.ssr / k;
  const fStat = msRegression / fit.mse;
  const pF = fSF(fStat, k, fit.df);
  const seEstimate = Math.sqrt(fit.mse);

  const intercept: RegressionCoefficient = {
    b: fit.coef[0],
    se: fit.se[0],
    beta: NaN,
    t: fit.tStats[0],
    p: fit.pValues[0],
    ciLo: fit.coef[0] - crit * fit.se[0],
    ciHi: fit.coef[0] + crit * fit.se[0],
    tol: NaN,
    vif: NaN,
  };

  const coefficients: RegressionCoefficient[] = predictors.map((values, index) => {
    const j = index + 1;
    const sdX = jStat.stdev(predictors[index], true);
    const beta = sdY > 0 && jStat.stdev(predictors[index], true) > 0
      ? fit.coef[j] * (sdX / sdY)
      : NaN;
    return {
      b: fit.coef[j],
      se: fit.se[j],
      beta,
      t: fit.tStats[j],
      p: fit.pValues[j],
      ciLo: fit.coef[j] - crit * fit.se[j],
      ciHi: fit.coef[j] + crit * fit.se[j],
      tol: isFinite(vifValues[index]) ? 1 / vifValues[index] : NaN,
      vif: vifValues[index],
    };
  });

  let robust: RegressionStats['robust'] = null;
  if (robustSE !== 'none') {
    const width = k + 1;
    const meat = Array.from({ length: width }, () => new Array<number>(width).fill(0));
    X.forEach((row, index) => {
      const h = Math.min(1 - 1e-12, Math.max(0, leverage[index]));
      const factor = robustSE === 'HC3' ? 1 / Math.pow(1 - h, 2) : n / fit.df;
      const weight = fit.residuals[index] * fit.residuals[index] * factor;
      for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
          meat[i][j] += weight * row[i] * row[j];
        }
      }
    });
    const cov = multiply(multiply(fit.xtxInv, meat), fit.xtxInv);
    const se = cov.map((row, index) => Math.sqrt(Math.max(0, row[index])));
    const coefficient = (index: number): RobustCoefficient => {
      const valueSe = se[index];
      const t = valueSe > 0 ? fit.coef[index] / valueSe : NaN;
      return {
        b: fit.coef[index],
        se: valueSe,
        t,
        p: twoSidedTP(t, fit.df),
        ciLo: fit.coef[index] - crit * valueSe,
        ciHi: fit.coef[index] + crit * valueSe,
      };
    };
    robust = {
      intercept: coefficient(0),
      coefficients: predictors.map((_, index) => coefficient(index + 1)),
    };
  }

  const univariateSlopes =
    k > 1 ? predictors.map(values => calcTheilSen(values, Y).slope) : [];

  return {
    n,
    k,
    df: fit.df,
    sse: fit.sse,
    ssr: fit.ssr,
    sst: fit.sst,
    mse: fit.mse,
    msRegression,
    r,
    r2: fit.r2,
    adjR2: fit.adjR2,
    seEstimate,
    f: fStat,
    pF,
    aic,
    bic,
    dw,
    crit,
    intercept,
    coefficients,
    robust,
    diagnostics: {
      maxLeverage,
      maxCook,
      cookOutliers,
      bpStat,
      bpP,
      whiteStat,
      whiteP,
      whiteDf,
      resetF,
      resetP,
      dfbetasMax,
      dfbetasCount,
      dfbetasThreshold: 2 / Math.sqrt(n),
      conditionIndex,
      conditionCount,
      residualOutliers,
    },
    residualsOls: olsSummary,
    residualsTs: tsSummary,
    theilSen,
    univariateSlopes,
  };
};
