import type { ReactNode } from 'react';
import {
  VictoryAxis,
  VictoryBoxPlot,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
} from 'victory';
import { jStat } from '../../stats/jstat';
import { parseNum } from '../../stats/core';
import { regressionTables } from '../../stats/regression';
import { regressionReport } from '../../stats/report';
import { calcNormalityTests, calcTheilSen } from '../../stats/kernels';
import { ResultTables } from '../../components/ResultTable';
import type { Dataset } from '../../grid/types';
import type { RegParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface RegressionRunInput {
  grid: Dataset;
  regParams: RegParams;
  ciLevel: number;
}

/** Regressione lineare multipla: tabelle, diagnostica, grafici e report. Estratto da App.tsx. */
  export const buildRegressionOutput = (input: RegressionRunInput): AnalysisRunResult => {
  const { grid, regParams, ciLevel } = input;
    const { dep, indeps, useNonParam } = regParams;
    if (indeps.length === 0) {
      return { ok: false, reason: 'Select at least one predictor' };
    }

    // Filter valid rows
    const validRows = grid.rows.filter(row => {
      const y = parseNum(row[dep]);
      if (isNaN(y)) return false;
      return indeps.every(idx => !isNaN(parseNum(row[idx])));
    });

    if (validRows.length <= indeps.length + 1) {
      return { ok: false, reason: 'Insufficient data for regression' };
    }

    // Check for zero variance in predictors
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

    try {
      if (k === 1) {
        // Analytical path for simple linear regression (highly stable, avoids QR decomposition instability)
        const xs = validRows.map(row => parseNum(row[indeps[0]]));
        const ys = Y;

        const meanX = jStat.mean(xs);
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

        const slope = sumXY / sumXX;
        const intercept = meanY - slope * meanX;
        coef = [intercept, slope];

        // Residual sum of squares
        const residuals = ys.map((y, i) => y - (intercept + slope * xs[i]));
        const rss = residuals.reduce((sum, r) => sum + r * r, 0);
        const mse = rss / df;

        R2 = sumYY === 0 ? 0 : 1 - (rss / sumYY);
        if (R2 < 0) R2 = 0;

        const seSlope = Math.sqrt(mse / sumXX);
        const seIntercept = Math.sqrt(mse * (1 / n + (meanX * meanX) / sumXX));
        se = [seIntercept, seSlope];

        tStats = [intercept / seIntercept, slope / seSlope];
        pValues = tStats.map(t => 2 * (1 - jStat.studentt.cdf(Math.abs(t), df)));
      } else {
        // Fallback to jStat models for multiple regression
        const ols = jStat.models.ols(Y, X);
        coef = ols.coef;
        R2 = ols.R2;
        const rss = ols.resid.reduce((a: number, b: number) => a + b * b, 0);
        const mse = rss / df;

        // X'X inverse
        const Xt = jStat.transpose(X);
        const XtX = jStat.multiply(Xt, X);
        const XtXinv = jStat.inv(XtX);

        se = coef.map((_: any, i: number) => Math.sqrt(mse * XtXinv[i][i]));
        tStats = coef.map((c: number, i: number) => c / se[i]);
        pValues = tStats.map(t => 2 * (1 - jStat.studentt.cdf(Math.abs(t), df)));
      }
    } catch (err) {
      console.error(err);
      return { ok: false, reason: 'Regression failed. Please check if variables are collinear or have insufficient variance.' };
    }

    const scatterData = validRows.map(row => ({
      x: parseNum(row[indeps[0]]),
      y: parseNum(row[dep])
    })).filter(d => !isNaN(d.x) && !isNaN(d.y));

    // Calculate Theil-Sen Robust Regression
    let tsSlope = NaN;
    let tsIntercept = NaN;
    let tsLineData: { x: number; y: number }[] = [];
    const tsEstimators: { name: string; slope: number; intercept: number }[] = [];

    if (k === 1 && scatterData.length > 0) {
      const xs = scatterData.map(d => d.x);
      const ys = scatterData.map(d => d.y);
      const tsResult = calcTheilSen(xs, ys);
      tsSlope = tsResult.slope;
      tsIntercept = tsResult.intercept;
    } else {
      // Calculate independent univariate Theil-Sen slopes for comparison
      indeps.forEach(idx => {
        const xs = validRows.map(row => parseNum(row[idx]));
        const tsResult = calcTheilSen(xs, Y);
        tsEstimators.push({
          name: grid.cols[idx].name,
          slope: tsResult.slope,
          intercept: tsResult.intercept
        });
      });
    }

    const coefData = indeps.map((idx, i) => ({
      name: grid.cols[idx].name,
      value: coef[i + 1]
    }));

    // Calculate bounds and regression line data if simple linear regression
    let regLineData: { x: number; y: number }[] = [];
    let xDomain: [number, number] | undefined = undefined;
    let yDomain: [number, number] | undefined = undefined;

    if (indeps.length === 1 && scatterData.length > 0) {
      const xs = scatterData.map(d => d.x);
      const ys = scatterData.map(d => d.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const yAtMinX = coef[0] + coef[1] * minX;
      const yAtMaxX = coef[0] + coef[1] * maxX;

      regLineData = [
        { x: minX, y: yAtMinX },
        { x: maxX, y: yAtMaxX }
      ];

      if (useNonParam && !isNaN(tsSlope)) {
        tsLineData = [
          { x: minX, y: tsIntercept + tsSlope * minX },
          { x: maxX, y: tsIntercept + tsSlope * maxX }
        ];
      }

      const xRange = maxX - minX || 1;
      const yMinVal = Math.min(minY, yAtMinX, yAtMaxX, useNonParam && !isNaN(tsSlope) ? tsIntercept + tsSlope * minX : minY);
      const yMaxVal = Math.max(maxY, yAtMinX, yAtMaxX, useNonParam && !isNaN(tsSlope) ? tsIntercept + tsSlope * maxX : maxY);
      const yRange = yMaxVal - yMinVal || 1;

      xDomain = [minX - xRange * 0.05, maxX + xRange * 0.05];
      yDomain = [yMinVal - yRange * 0.05, yMaxVal + yRange * 0.05];
    }

    const olsResids = indeps.length === 1 
      ? scatterData.map(d => d.y - (coef[0] + coef[1] * d.x))
      : Y.map((yVal, rIdx) => yVal - (coef[0] + indeps.reduce((sum, idx, i) => sum + coef[i+1] * parseNum(validRows[rIdx][idx]), 0)));

    const qOls = jStat.quartiles(olsResids);
    const regResidualsBoxPlotData = [
      {
        x: "OLS Residuals",
        min: jStat.min(olsResids),
        q1: qOls[0],
        median: qOls[1],
        q3: qOls[2],
        max: jStat.max(olsResids)
      }
    ];

    const calcResidStats = (resids: number[], name: string) => {
      const rMin = jStat.min(resids);
      const rMax = jStat.max(resids);
      const rMean = jStat.mean(resids);
      const rMedian = jStat.median(resids);
      const rStdev = jStat.stdev(resids, true);
      const rSkew = jStat.skewness(resids);
      const rKurt = jStat.kurtosis(resids);
      const rNorm = calcNormalityTests(resids);
      return {
        name,
        min: rMin,
        max: rMax,
        mean: rMean,
        median: rMedian,
        stdev: rStdev,
        skew: rSkew,
        kurt: rKurt,
        norm: rNorm
      };
    };

    const olsResidStats = calcResidStats(olsResids, "OLS Residuals");
    let tsResidStats: any = null;

    if (useNonParam) {
      if (indeps.length === 1 && !isNaN(tsSlope)) {
        const tsResids = scatterData.map(d => d.y - (tsIntercept + tsSlope * d.x));
        const qTs = jStat.quartiles(tsResids);
        regResidualsBoxPlotData.push({
          x: "Theil-Sen Residuals",
          min: jStat.min(tsResids),
          q1: qTs[0],
          median: qTs[1],
          q3: qTs[2],
          max: jStat.max(tsResids)
        });
        tsResidStats = calcResidStats(tsResids, "Theil-Sen Residuals");
      } else if (indeps.length > 1) {
        const firstTS = tsEstimators[0];
        if (firstTS) {
          const firstXs = validRows.map(row => parseNum(row[indeps[0]]));
          const tsResids = Y.map((yVal, rIdx) => yVal - (firstTS.intercept + firstTS.slope * firstXs[rIdx]));
          const qTs = jStat.quartiles(tsResids);
          regResidualsBoxPlotData.push({
            x: `Theil-Sen Resids\n(${grid.cols[indeps[0]].name})`,
            min: jStat.min(tsResids),
            q1: qTs[0],
            median: qTs[1],
            q3: qTs[2],
            max: jStat.max(tsResids)
          });
          tsResidStats = calcResidStats(tsResids, `Theil-Sen Residuals (${grid.cols[indeps[0]].name})`);
        }
      }
    }

    const tables = regressionTables({
      rows: grid.rows,
      depIdx: dep,
      indepIdxs: indeps,
      depName: grid.cols[dep].name,
      predNames: indeps.map(index => grid.cols[index].name),
      level: ciLevel,
    });
    const report = regressionReport({
      tables,
      depName: grid.cols[dep].name,
      predNames: indeps.map(index => grid.cols[index].name),
      level: ciLevel,
    });

    const output = (
      <div className="output-block" key={Date.now()}>
        <div className="output-title">Linear Regression & Robust Estimators: {grid.cols[dep].name}</div>
        <ResultTables specs={tables} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          {indeps.length === 1 && (
            <div className="h-[320px] bg-surface3/30 rounded p-2">
              <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter text-center">
                Regression Line Comparison {useNonParam && <span className="text-green font-semibold">(Solid = Theil-Sen, Red = OLS)</span>}
              </p>
              <VictoryChart
                theme={VictoryTheme.material}
                scale={{ x: "linear", y: "linear" }}
                domain={xDomain && yDomain ? { x: xDomain, y: yDomain } : undefined}
                padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
              >
                <VictoryAxis
                  label={grid.cols[indeps[0]].name}
                  style={{ 
                    axis: { stroke: '#333' }, 
                    axisLabel: { fill: '#888', fontSize: 10, padding: 30 },
                    tickLabels: { fill: '#888', fontSize: 10 }
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  label={grid.cols[dep].name}
                  style={{ 
                    axis: { stroke: '#333' }, 
                    axisLabel: { fill: '#888', fontSize: 10, padding: 35 },
                    tickLabels: { fill: '#888', fontSize: 10 },
                    grid: { stroke: '#222' }
                  }}
                />
                <VictoryScatter
                  data={scatterData}
                  style={{ data: { fill: '#4f9cf9', fillOpacity: 0.7, r: 3 } }}
                />
                <VictoryLine
                  data={regLineData}
                  style={{ data: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: "4 4" } }}
                />
                {useNonParam && tsLineData.length > 0 && (
                  <VictoryLine
                    data={tsLineData}
                    style={{ data: { stroke: '#10b981', strokeWidth: 2 } }}
                  />
                )}
              </VictoryChart>
            </div>
          )}

          <div className={`h-[320px] bg-surface3/30 rounded p-2 ${indeps.length > 1 ? 'col-span-1 lg:col-span-2' : ''}`}>
            <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter text-center">Residuals Distribution (Model Accuracy Diagnostic Boxplots)</p>
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={40}
              padding={{ top: 20, bottom: 50, left: 100, right: 20 }}
            >
              <VictoryAxis
                tickLabelComponent={<VictoryLabel style={{ fill: '#888', fontSize: 10 }} />}
                style={{ axis: { stroke: '#333' } }}
              />
              <VictoryAxis
                dependentAxis
                tickLabelComponent={<VictoryLabel style={{ fill: '#888', fontSize: 10 }} />}
                style={{ axis: { stroke: '#333' }, grid: { stroke: '#222' } }}
              />
              <VictoryBoxPlot
                data={regResidualsBoxPlotData}
                style={{
                  min: { stroke: "#f87171", strokeWidth: 1.5 },
                  max: { stroke: "#f87171", strokeWidth: 1.5 },
                  q1: { fill: "#4f9cf9", fillOpacity: 0.4 },
                  q3: { fill: "#4f9cf9", fillOpacity: 0.4 },
                  median: { stroke: "#fff", strokeWidth: 2 }
                }}
              />
            </VictoryChart>
          </div>
        </div>

              </div>
    );
    return { ok: true, node: output, tables, report };
  };
