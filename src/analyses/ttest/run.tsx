import type { ReactNode } from 'react';
import {
  VictoryAxis,
  VictoryBoxPlot,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryTheme,
} from 'victory';
import { jStat } from '../../stats/jstat';
import { pairedValues, parseNum, pooledTTest, welchTTest } from '../../stats/core';
import { ttestTables } from '../../stats/ttest';
import { ttestReport } from '../../stats/report';
import { calcMannWhitneyU, calcWilcoxonSignedRank } from '../../statsHelpers';
import { ResultTables } from '../../components/ResultTable';
import type { TableSpec } from '../../stats/types';
import type { ReportSpec } from '../../stats/report';
import type { GridData } from '../../grid/types';
import type { TTestParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface TTestRunInput {
  grid: GridData;
  ttestParams: TTestParams;
  ciLevel: number;
}

/** T-test (un campione, indipendente, appaiato) e alternative non parametriche. */
export const buildTTestOutput = (input: TTestRunInput): AnalysisRunResult => {
  const { grid, ttestParams, ciLevel } = input;
    const { type, var1, var2, mu, useNonParam, equalVar } = ttestParams;
    const a1 = grid.rows.map(r => parseNum(r[var1])).filter(v => !isNaN(v));
    const a2 = grid.rows.map(r => parseNum(r[var2])).filter(v => !isNaN(v));

    // Paired designs need complete cases per row: filtering each column on its
    // own would pair values coming from different observations.
    const paired = pairedValues(grid.rows, var1, var2);

    if (a1.length === 0 || (type !== 'one' && a2.length === 0) || (type === 'dep' && paired.a.length === 0)) {
      return { ok: false, reason: 'Insufficient data for T-Test' };
    }

    let resultHtml: ReactNode;
    let reportSpec: ReportSpec | null = null;
    let tables: TableSpec[] = [];

    if (type === 'one') {
      const n = a1.length;
      const mean = jStat.mean(a1);
      const sd = jStat.stdev(a1, true);
      const se = sd / Math.sqrt(n);
      const t = (mean - mu) / se;
      const df = n - 1;
      const p = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));

      // Wilcoxon Signed-Rank Test
      const wilcox = calcWilcoxonSignedRank(a1, mu);
      const q = jStat.quartiles(a1);
      const boxData = [
        {
          x: grid.cols[var1].name,
          min: jStat.min(a1),
          q1: q[0],
          median: q[1],
          q3: q[2],
          max: jStat.max(a1)
        }
      ];

      tables = ttestTables({
        type: 'one',
        rows: grid.rows,
        i1: var1,
        i2: var2,
        name1: grid.cols[var1].name,
        name2: grid.cols[var2].name,
        mu,
        equalVar,
        level: ciLevel,
        useNonParam,
      });

      reportSpec = ttestReport({
        tables,
        type: 'one',
        name1: grid.cols[var1].name,
        name2: grid.cols[var2].name,
        mu,
        level: ciLevel,
        equalVar,
        useNonParam,
      });

      resultHtml = (
        <div className="output-block" key={Date.now()}>
          <div className="output-title">One-Sample T-Test & Wilcoxon Signed-Rank: {grid.cols[var1].name}</div>
          
          <ResultTables specs={tables} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div className="h-[250px] bg-surface3/30 rounded p-2">
              <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter text-center">Parametric: Sample Distribution & Test Value (μ)</p>
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={50}
                padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
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
                  data={boxData}
                  style={{
                    min: { stroke: "#f87171", strokeWidth: 1.5 },
                    max: { stroke: "#f87171", strokeWidth: 1.5 },
                    q1: { fill: "#4f9cf9", fillOpacity: 0.4 },
                    q3: { fill: "#4f9cf9", fillOpacity: 0.4 },
                    median: { stroke: "#fff", strokeWidth: 2 }
                  }}
                />
                <VictoryLine
                  y={() => mu}
                  style={{ data: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: "4 4" } }}
                  labels={["μ"]}
                  labelComponent={<VictoryLabel dx={10} style={{ fill: '#ef4444', fontSize: 9 }} />}
                />
              </VictoryChart>
            </div>

            {useNonParam && !isNaN(wilcox.wStat) && (
              <div className="h-[250px] bg-surface3/30 rounded p-2">
                <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter text-center">Non-Parametric: Boxplot & Test Value Median (H₀)</p>
                <VictoryChart
                  theme={VictoryTheme.material}
                  domainPadding={50}
                  padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
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
                    data={boxData}
                    style={{
                      min: { stroke: "#f87171", strokeWidth: 1.5 },
                      max: { stroke: "#f87171", strokeWidth: 1.5 },
                      q1: { fill: "#34d399", fillOpacity: 0.4 },
                      q3: { fill: "#34d399", fillOpacity: 0.4 },
                      median: { stroke: "#fff", strokeWidth: 2 }
                    }}
                  />
                  <VictoryLine
                    y={() => mu}
                    style={{ data: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: "4 4" } }}
                    labels={["μ₀"]}
                    labelComponent={<VictoryLabel dx={10} style={{ fill: '#ef4444', fontSize: 9 }} />}
                  />
                </VictoryChart>
              </div>
            )}
          </div>
        </div>
      );
    } else if (type === 'ind') {
      const n1 = a1.length;
      const n2 = a2.length;
      if (n1 < 2 || n2 < 2) {
        return { ok: false, reason: 'Each group needs at least 2 numeric values' };
      }
      const m1 = jStat.mean(a1);
      const m2 = jStat.mean(a2);
      const v1 = jStat.variance(a1, true);
      const v2 = jStat.variance(a2, true);

      const { t, df, p } = equalVar ? pooledTTest(a1, a2) : welchTTest(a1, a2);
      const varianceLabel = equalVar ? 'Pooled Variance' : "Welch's Unequal Variances";

      // Mann-Whitney U test
      const mw = calcMannWhitneyU(a1, a2);

      const q1 = jStat.quartiles(a1);
      const q2 = jStat.quartiles(a2);
      const boxDataInd = [
        {
          x: grid.cols[var1].name,
          min: jStat.min(a1),
          q1: q1[0],
          median: q1[1],
          q3: q1[2],
          max: jStat.max(a1)
        },
        {
          x: grid.cols[var2].name,
          min: jStat.min(a2),
          q1: q2[0],
          median: q2[1],
          q3: q2[2],
          max: jStat.max(a2)
        }
      ];

      // Non-parametric boxplot: ranks of both groups
      const combinedForRanks = [
        ...a1.map(v => ({ val: v, group: 1, rank: 0 })),
        ...a2.map(v => ({ val: v, group: 2, rank: 0 }))
      ];
      const N_comb = combinedForRanks.length;
      combinedForRanks.sort((a, b) => a.val - b.val);
      let idx_comb = 0;
      while (idx_comb < N_comb) {
        let j = idx_comb;
        while (j < N_comb - 1 && combinedForRanks[j + 1].val === combinedForRanks[idx_comb].val) {
          j++;
        }
        const sumRanks = ((j + 1) * (j + 2)) / 2 - (idx_comb * (idx_comb + 1)) / 2;
        const avgRank = sumRanks / (j - idx_comb + 1);
        for (let k_comb = idx_comb; k_comb <= j; k_comb++) {
          combinedForRanks[k_comb].rank = avgRank;
        }
        idx_comb = j + 1;
      }
      const ranks1 = combinedForRanks.filter(item => item.group === 1).map(item => item.rank);
      const ranks2 = combinedForRanks.filter(item => item.group === 2).map(item => item.rank);
      const qRanks1 = jStat.quartiles(ranks1);
      const qRanks2 = jStat.quartiles(ranks2);
      const boxDataRanks = [
        {
          x: grid.cols[var1].name,
          min: jStat.min(ranks1),
          q1: qRanks1[0],
          median: qRanks1[1],
          q3: qRanks1[2],
          max: jStat.max(ranks1)
        },
        {
          x: grid.cols[var2].name,
          min: jStat.min(ranks2),
          q1: qRanks2[0],
          median: qRanks2[1],
          q3: qRanks2[2],
          max: jStat.max(ranks2)
        }
      ];

      tables = ttestTables({
        type: 'ind',
        rows: grid.rows,
        i1: var1,
        i2: var2,
        name1: grid.cols[var1].name,
        name2: grid.cols[var2].name,
        mu,
        equalVar,
        level: ciLevel,
        useNonParam,
      });

      reportSpec = ttestReport({
        tables,
        type: 'ind',
        name1: grid.cols[var1].name,
        name2: grid.cols[var2].name,
        mu,
        level: ciLevel,
        equalVar,
        useNonParam,
      });

      resultHtml = (
        <div className="output-block" key={Date.now()}>
          <div className="output-title">Independent Samples T-Test & Mann-Whitney U</div>
          <p className="text-[11px] mb-4 text-accent2">{grid.cols[var1].name} vs {grid.cols[var2].name}</p>
          
          <ResultTables specs={tables} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div className="h-[250px] bg-surface3/30 rounded p-2">
              <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter text-center">Parametric: Group Boxplots (Values)</p>
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={40}
                padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
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
                  data={boxDataInd}
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

            {useNonParam && !isNaN(mw.uStat) && (
              <div className="h-[250px] bg-surface3/30 rounded p-2">
                <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter text-center">Non-Parametric: Group Rank Boxplots</p>
                <VictoryChart
                  theme={VictoryTheme.material}
                  domainPadding={40}
                  padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
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
                    data={boxDataRanks}
                    style={{
                      min: { stroke: "#f87171", strokeWidth: 1.5 },
                      max: { stroke: "#f87171", strokeWidth: 1.5 },
                      q1: { fill: "#818cf8", fillOpacity: 0.4 },
                      q3: { fill: "#818cf8", fillOpacity: 0.4 },
                      median: { stroke: "#fff", strokeWidth: 2 }
                    }}
                  />
                </VictoryChart>
              </div>
            )}
          </div>
        </div>
      );
    } else if (type === 'dep') {
      // Paired samples: only rows where both columns hold a numeric value
      const n = paired.a.length;
      if (n < 2) {
        return { ok: false, reason: 'Paired T-Test needs at least 2 complete pairs' };
      }
      const diffs: number[] = [];
      for (let i = 0; i < n; i++) diffs.push(paired.a[i] - paired.b[i]);

      const meanDiff = jStat.mean(diffs);
      const sdDiff = jStat.stdev(diffs, true);
      const se = sdDiff / Math.sqrt(n);
      const t = meanDiff / se;
      const df = n - 1;
      const p = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));

      // Wilcoxon Signed-Rank Test (paired differences vs 0)
      const wilcox = calcWilcoxonSignedRank(diffs, 0);

      const q1 = jStat.quartiles(paired.a);
      const q2 = jStat.quartiles(paired.b);
      const boxDataPaired = [
        {
          x: grid.cols[var1].name,
          min: jStat.min(paired.a),
          q1: q1[0],
          median: q1[1],
          q3: q1[2],
          max: jStat.max(paired.a)
        },
        {
          x: grid.cols[var2].name,
          min: jStat.min(paired.b),
          q1: q2[0],
          median: q2[1],
          q3: q2[2],
          max: jStat.max(paired.b)
        }
      ];

      const qDiffs = jStat.quartiles(diffs);
      const boxDataDiffs = [
        {
          x: 'Differences',
          min: jStat.min(diffs),
          q1: qDiffs[0],
          median: qDiffs[1],
          q3: qDiffs[2],
          max: jStat.max(diffs)
        }
      ];

      tables = ttestTables({
        type: 'dep',
        rows: grid.rows,
        i1: var1,
        i2: var2,
        name1: grid.cols[var1].name,
        name2: grid.cols[var2].name,
        mu,
        equalVar,
        level: ciLevel,
        useNonParam,
      });

      reportSpec = ttestReport({
        tables,
        type: 'dep',
        name1: grid.cols[var1].name,
        name2: grid.cols[var2].name,
        mu,
        level: ciLevel,
        equalVar,
        useNonParam,
      });

      resultHtml = (
        <div className="output-block" key={Date.now()}>
          <div className="output-title">Paired Samples T-Test & Wilcoxon Signed-Rank</div>
          <p className="text-[11px] mb-4 text-accent2">{grid.cols[var1].name} - {grid.cols[var2].name}</p>
          
          <ResultTables specs={tables} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div className="h-[250px] bg-surface3/30 rounded p-2">
              <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter text-center">Parametric: Group Boxplots (Values)</p>
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={40}
                padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
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
                  data={boxDataPaired}
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

            {useNonParam && !isNaN(wilcox.wStat) && (
              <div className="h-[250px] bg-surface3/30 rounded p-2">
                <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter text-center">Non-Parametric: Boxplot of Differences (H₀: Median = 0)</p>
                <VictoryChart
                  theme={VictoryTheme.material}
                  domainPadding={50}
                  padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
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
                    data={boxDataDiffs}
                    style={{
                      min: { stroke: "#f87171", strokeWidth: 1.5 },
                      max: { stroke: "#f87171", strokeWidth: 1.5 },
                      q1: { fill: "#a78bfa", fillOpacity: 0.4 },
                      q3: { fill: "#a78bfa", fillOpacity: 0.4 },
                      median: { stroke: "#fff", strokeWidth: 2 }
                    }}
                  />
                  <VictoryLine
                    y={() => 0}
                    style={{ data: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: "4 4" } }}
                    labels={["0"]}
                    labelComponent={<VictoryLabel dx={10} style={{ fill: '#ef4444', fontSize: 9 }} />}
                  />
                </VictoryChart>
              </div>
            )}
          </div>
        </div>
      );
    }
    return { ok: true, node: resultHtml, tables, report: reportSpec };
  };
