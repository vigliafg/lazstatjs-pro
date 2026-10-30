import { jStat } from '../../stats/jstat';
import { parseNum } from '../../stats/core';
import { regressionTables } from '../../stats/regression';
import { regressionReport } from '../../stats/report';
import { calcNormalityTests, calcTheilSen } from '../../stats/kernels';
import { copy } from '../../stats/reportCopy';
import { makeChart, boxStats } from '../../charts/kits/common';
import type { AnalysisChart, ChartRow } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { RegParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface RegressionRunInput {
  grid: Dataset;
  regParams: RegParams;
  ciLevel: number;
}

const qqRows = (values: number[]): ChartRow[] => {
  const sorted = [...values].filter(value => Number.isFinite(value)).sort((a, b) => a - b);
  const n = sorted.length;
  if (n < 3) return [];
  return sorted.map((value, index) => {
    const p = (index + 1 - 0.375) / (n + 0.25);
    return { x: jStat.normal.inv(p, 0, 1), y: value };
  });
};

const qqReference = (points: ChartRow[]): ChartRow[] => {
  if (points.length < 2) return [];
  const xs = points.map(row => Number(row.x));
  const ys = points.map(row => Number(row.y));
  const meanX = jStat.mean(xs);
  const meanY = jStat.mean(ys);
  const sxx = xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0);
  const sxy = xs.reduce((sum, x, index) => sum + (x - meanX) * (ys[index] - meanY), 0);
  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = meanY - slope * meanX;
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  return [
    { x: min, y: intercept + slope * min },
    { x: max, y: intercept + slope * max },
  ];
};

/** Regressione lineare multipla: tabelle, diagnostica, grafici e report. */
export const buildRegressionOutput = (input: RegressionRunInput): AnalysisRunResult => {
  const { grid, regParams, ciLevel } = input;
  const { dep, indeps, useNonParam } = regParams;
  if (indeps.length === 0) return { ok: false, reason: 'Select at least one predictor' };

  const validRows = grid.rows.filter(row => {
    const y = parseNum(row[dep]);
    if (isNaN(y)) return false;
    return indeps.every(idx => !isNaN(parseNum(row[idx])));
  });

  if (validRows.length <= indeps.length + 1) {
    return { ok: false, reason: 'Insufficient data for regression' };
  }

  for (const idx of indeps) {
    const vals = validRows.map(row => parseNum(row[idx]));
    const mean = jStat.mean(vals);
    const sumSqDiff = vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0);
    if (sumSqDiff === 0) {
      return { ok: false, reason: `Predictor '${grid.cols[idx].name}' has zero variance (all values are identical).` };
    }
  }

  const Y = validRows.map(row => parseNum(row[dep]));
  const X = validRows.map(row => [1, ...indeps.map(idx => parseNum(row[idx]))]);
  const n = Y.length;
  const k = indeps.length;
  const df = n - k - 1;

  let coef: number[] = [];
  let R2 = 0;
  let se: number[] = [];
  let tStats: number[] = [];
  let pValues: number[] = [];
  let meanX = 0;
  let sxx = 1;
  let mse = 1;

  try {
    if (k === 1) {
      const xs = validRows.map(row => parseNum(row[indeps[0]]));
      const ys = Y;
      meanX = jStat.mean(xs);
      const meanY = jStat.mean(ys);
      let sumXX = 0;
      let sumYY = 0;
      let sumXY = 0;
      for (let i = 0; i < n; i++) {
        const diffX = xs[i] - meanX;
        const diffY = ys[i] - meanY;
        sumXX += diffX * diffX;
        sumYY += diffY * diffY;
        sumXY += diffX * diffY;
      }
      sxx = sumXX;
      const slope = sumXY / sumXX;
      const intercept = meanY - slope * meanX;
      coef = [intercept, slope];
      const residuals = ys.map((y, i) => y - (intercept + slope * xs[i]));
      const rss = residuals.reduce((sum, r) => sum + r * r, 0);
      mse = rss / df;
      R2 = sumYY === 0 ? 0 : 1 - (rss / sumYY);
      if (R2 < 0) R2 = 0;
      const seSlope = Math.sqrt(mse / sumXX);
      const seIntercept = Math.sqrt(mse * (1 / n + (meanX * meanX) / sumXX));
      se = [seIntercept, seSlope];
      tStats = [intercept / seIntercept, slope / seSlope];
      pValues = tStats.map(t => 2 * (1 - jStat.studentt.cdf(Math.abs(t), df)));
    } else {
      const ols = jStat.models.ols(Y, X);
      coef = ols.coef;
      R2 = ols.R2;
      const rss = ols.resid.reduce((a: number, b: number) => a + b * b, 0);
      mse = rss / df;
      const Xt = jStat.transpose(X);
      const XtX = jStat.multiply(Xt, X);
      const XtXinv = jStat.inv(XtX);
      se = coef.map((_: unknown, i: number) => Math.sqrt(mse * XtXinv[i][i]));
      tStats = coef.map((c: number, i: number) => c / se[i]);
      pValues = tStats.map(t => 2 * (1 - jStat.studentt.cdf(Math.abs(t), df)));
    }
  } catch (err) {
    console.error(err);
    return { ok: false, reason: 'Regression failed. Please check if variables are collinear or have insufficient variance.' };
  }

  const scatterData = validRows
    .map(row => ({ x: parseNum(row[indeps[0]]), y: parseNum(row[dep]) }))
    .filter(d => !isNaN(d.x) && !isNaN(d.y));

  let tsSlope = NaN;
  let tsIntercept = NaN;
  let tsLineData: { x: number; y: number }[] = [];

  if (k === 1 && scatterData.length > 0) {
    const xs = scatterData.map(d => d.x);
    const ys = scatterData.map(d => d.y);
    const tsResult = calcTheilSen(xs, ys);
    tsSlope = tsResult.slope;
    tsIntercept = tsResult.intercept;
  }

  const fitted = validRows.map((row, index) =>
    coef[0] + indeps.reduce((sum, idx, position) => sum + coef[position + 1] * parseNum(row[idx]), 0)
  );
  const olsResids = Y.map((value, index) => value - fitted[index]);
  const olsResidStats = boxStats(olsResids);
  const residualSummary: ChartRow[] = olsResidStats
    ? [{ category: 'OLS', n: olsResidStats.n, min: olsResidStats.min, q1: olsResidStats.q1, median: olsResidStats.median, q3: olsResidStats.q3, max: olsResidStats.max, mean: olsResidStats.mean }]
    : [];
  const residualPoints: ChartRow[] = olsResids.map(value => ({ category: 'OLS', value }));
  const residualOutliers: ChartRow[] = (olsResidStats?.outliers ?? []).map(value => ({ category: 'OLS', value }));

  if (useNonParam && k === 1 && Number.isFinite(tsSlope)) {
    const tsResids = scatterData.map(d => d.y - (tsIntercept + tsSlope * d.x));
    const stats = boxStats(tsResids);
    if (stats) {
      residualSummary.push({ category: 'Theil-Sen', n: stats.n, min: stats.min, q1: stats.q1, median: stats.median, q3: stats.q3, max: stats.max, mean: stats.mean });
      tsResids.forEach(value => residualPoints.push({ category: 'Theil-Sen', value }));
      stats.outliers.forEach(value => residualOutliers.push({ category: 'Theil-Sen', value }));
    }
    tsLineData = [
      { x: Math.min(...scatterData.map(d => d.x)), y: tsIntercept + tsSlope * Math.min(...scatterData.map(d => d.x)) },
      { x: Math.max(...scatterData.map(d => d.x)), y: tsIntercept + tsSlope * Math.max(...scatterData.map(d => d.x)) },
    ];
  }

  const minX = scatterData.length ? Math.min(...scatterData.map(d => d.x)) : 0;
  const maxX = scatterData.length ? Math.max(...scatterData.map(d => d.x)) : 1;
  const gridRows: ChartRow[] = [];
  if (k === 1) {
    const steps = 80;
    for (let i = 0; i < steps; i++) {
      const x = minX + ((maxX - minX) * i) / (steps - 1 || 1);
      const yhat = coef[0] + coef[1] * x;
      const seMean = Math.sqrt(mse * (1 / n + (x - meanX) ** 2 / sxx));
      const sePred = Math.sqrt(mse * (1 + 1 / n + (x - meanX) ** 2 / sxx));
      gridRows.push({ x, yhat, seMean, sePred });
    }
  }

  const depName = grid.cols[dep].name;
  const predNames = indeps.map(index => grid.cols[index].name);
  const tables = regressionTables({
    rows: grid.rows,
    depIdx: dep,
    indepIdxs: indeps,
    depName,
    predNames,
    level: ciLevel,
    robustSE: regParams.robustSE,
  });
  const report = regressionReport({ tables, depName, predNames, level: ciLevel });

  const charts: AnalysisChart[] = [];
  if (k === 1) {
    const points = scatterData;
    const fit = points.length
      ? [
          { x: minX, y: coef[0] + coef[1] * minX },
          { x: maxX, y: coef[0] + coef[1] * maxX },
        ]
      : [];
    charts.push(
      makeChart({
        id: 'reg-scatter',
        kind: 'scatter',
        title: copy('Regressione lineare: {s1} per {s2}', { s1: depName, s2: predNames[0] }),
        subtitle: copy('IC {s1}% · N = {s2}', { s1: ciLevel, s2: n }),
        note: copy('Punti: osservazioni. Linea rossa tratteggiata: OLS. Linea verde: Theil-Sen. La banda, se attiva, è l’intervallo scelto.'),
        data: { points, fit, robust: tsLineData, grid: gridRows },
        fields: { xLabel: predNames[0], yLabel: depName },
        stats: {
          df,
          equation: `y = ${coef[0].toFixed(3)} + ${coef[1].toFixed(3)}·x`,
          equationShort: `y = ${coef[0].toFixed(2)} + ${coef[1].toFixed(2)}·x`,
          r2: Number(R2.toFixed(4)),
          n,
        },
        options: {
          fit: useNonParam ? 'both' : 'ols',
          band: 'none',
        } as never,
      })
    );
  } else {
    const observedVsFitted = Y.map((value, index) => ({ x: fitted[index], y: value }));
    const residualVsFitted = fitted.map((value, index) => ({ x: value, y: olsResids[index] }));
    const all = [...fitted, ...Y];
    const min = all.length ? Math.min(...all) : 0;
    const max = all.length ? Math.max(...all) : 1;
    charts.push(
      makeChart({
        id: 'reg-observed-fitted',
        kind: 'scatter',
        title: copy('Osservati vs stimati: {s1}', { s1: depName }),
        subtitle: copy('N = {s1} · R² = {s2}', { s1: n, s2: R2.toFixed(3) }),
        note: copy('La diagonale rappresenta la corrispondenza perfetta tra valori osservati e stimati.'),
        data: { points: observedVsFitted, fit: [{ x: min, y: min }, { x: max, y: max }] },
        fields: { xLabel: copy('Valori stimati'), yLabel: copy('Valori osservati') },
        options: { fit: 'ols', band: 'none' } as never,
      }),
      makeChart({
        id: 'reg-residual-fitted',
        kind: 'residual',
        title: copy('Residui vs stimati: {s1}', { s1: depName }),
        subtitle: copy('N = {s1}', { s1: n }),
        note: copy('Una nuvola senza struttura è coerente con l’ipotesi di residui omoschedastici.'),
        data: { points: residualVsFitted, rules: [{ y: 0 }] },
        fields: { xLabel: copy('Valori stimati'), yLabel: copy('Residui') },
        options: { showPoints: true, showZeroLine: true } as never,
      })
    );
  }

  charts.push(
    makeChart({
      id: 'reg-residual-box',
      kind: 'box',
      title: copy('Distribuzione dei residui'),
      subtitle: copy('Diagnostica di accuratezza del modello'),
      note: copy('La mediana dei residui dovrebbe essere vicina a zero e le due distribuzioni simili.'),
      data: { summary: residualSummary, points: residualPoints, outliers: residualOutliers },
      fields: { xLabel: copy('Modello'), yLabel: copy('Residuo') },
    })
  );

  const qqPoints = qqRows(olsResids);
  if (qqPoints.length > 0) {
    charts.push(
      makeChart({
        id: 'reg-residual-qq',
        kind: 'qq',
        title: copy('Q-Q dei residui'),
        subtitle: copy('N = {s1}', { s1: n }),
        note: copy('I punti vicini alla diagonale indicano residui compatibili con la normalità.'),
        data: { points: qqPoints, reference: qqReference(qqPoints) },
        fields: { xLabel: copy('Quantili teorici'), yLabel: copy('Residui osservati') },
      })
    );
  }

  return {
    ok: true,
    title: copy('Regressione lineare e stimatori robusti: {s1}', { s1: depName }),
    tables,
    report,
    charts,
  };
};
