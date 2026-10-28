import type { ReactNode } from 'react';
import {
  VictoryAxis,
  VictoryBoxPlot,
  VictoryChart,
  VictoryLabel,
  VictoryTheme,
} from 'victory';
import { jStat } from '../../stats/jstat';
import { parseNum } from '../../stats/core';
import { anovaTables } from '../../stats/anova';
import { anovaReport } from '../../stats/report';
import { calcKruskalWallis, calcMannWhitneyU } from '../../stats/kernels';
import { ResultTables } from '../../components/ResultTable';
import { analysisRows } from '../../grid/types';
import type { GridData } from '../../grid/types';
import type { AnovaParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface AnovaRunInput {
  grid: GridData;
  anovaParams: AnovaParams;
  ciLevel: number;
}

/** ANOVA a una via (e Kruskal-Wallis): tabelle, grafici e report. Estratto da App.tsx. */
  export const buildAnovaOutput = (input: AnovaRunInput): AnalysisRunResult => {
  const { grid, anovaParams, ciLevel } = input;
    const { dep, grp, posthoc, useNonParam, kwPosthoc } = anovaParams;

    // Group labels are what tables and charts show; the codes stay in the grid.
    const rowsForAnalysis = analysisRows(grid, [grp]);

    // Group data
    const groups: { [key: string]: number[] } = {};
    rowsForAnalysis.forEach(row => {
      const d = parseNum(row[dep]);
      const g = row[grp];
      if (!isNaN(d) && g !== '') {
        if (!groups[g]) groups[g] = [];
        groups[g].push(d);
      }
    });

    const groupKeys = Object.keys(groups);
    if (groupKeys.length < 2) {
      return { ok: false, reason: 'Need at least 2 groups for ANOVA' };
    }

    const allData = Object.values(groups).flat();
    const grandMean = jStat.mean(allData);
    const nTotal = allData.length;
    const k = groupKeys.length;

    let ssBetween = 0;
    let ssWithin = 0;

    groupKeys.forEach(key => {
      const gData = groups[key];
      const gMean = jStat.mean(gData);
      const gN = gData.length;
      ssBetween += gN * Math.pow(gMean - grandMean, 2);
      gData.forEach(v => {
        ssWithin += Math.pow(v - gMean, 2);
      });
    });

    const dfBetween = k - 1;
    const dfWithin = nTotal - k;
    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;
    const f = msBetween / msWithin;
    const p = 1 - jStat.centralF.cdf(f, dfBetween, dfWithin);

    // Post-Hoc Analysis
    let postHocResults: any[] = [];
    if (posthoc !== 'none') {
      const numComps = (k * (k - 1)) / 2;
      for (let i = 0; i < groupKeys.length; i++) {
        for (let j = i + 1; j < groupKeys.length; j++) {
          const g1 = groupKeys[i];
          const g2 = groupKeys[j];
          const n1 = groups[g1].length;
          const n2 = groups[g2].length;
          const m1 = jStat.mean(groups[g1]);
          const m2 = jStat.mean(groups[g2]);
          const diff = m1 - m2;
          
          let pVal = 1;
          let testName = "";

          if (posthoc === 'tukey') {
            testName = "Tukey HSD (approx)";
            if (msWithin > 0) {
              const t = diff / (Math.sqrt(msWithin * (1/n1 + 1/n2)));
              pVal = 2 * (1 - jStat.studentt.cdf(Math.abs(t), dfWithin));
              pVal = Math.min(1, pVal * (k - 1));
            } else {
              pVal = diff === 0 ? 1 : 0;
            }
          } else if (posthoc === 'bonferroni') {
            testName = "Bonferroni";
            if (msWithin > 0) {
              const t = diff / (Math.sqrt(msWithin * (1/n1 + 1/n2)));
              pVal = 2 * (1 - jStat.studentt.cdf(Math.abs(t), dfWithin));
              pVal = Math.min(1, pVal * numComps);
            } else {
              pVal = diff === 0 ? 1 : 0;
            }
          }

          postHocResults.push({
            comp: `${g1} vs ${g2}`,
            diff,
            p: pVal,
            testName
          });
        }
      }
    }

    // Kruskal-Wallis Non-Parametric ANOVA Alternative
    const kw = calcKruskalWallis(groups);
    let kwPostHocResults: any[] = [];
    if (useNonParam && kwPosthoc === 'bonferroni' && k > 2) {
      const numComps = (k * (k - 1)) / 2;
      for (let i = 0; i < groupKeys.length; i++) {
        for (let j = i + 1; j < groupKeys.length; j++) {
          const g1 = groupKeys[i];
          const g2 = groupKeys[j];
          const vals1 = groups[g1];
          const vals2 = groups[g2];
          const mwu = calcMannWhitneyU(vals1, vals2);
          const adjP = Math.min(1.0, mwu.pValue * numComps);
          kwPostHocResults.push({
            comp: `${g1} vs ${g2}`,
            uStat: mwu.uStat,
            zStat: mwu.zStat,
            p: adjP
          });
        }
      }
    }

    const anovaBoxPlotData = groupKeys.map(key => {
      const vals = groups[key];
      const quartiles = jStat.quartiles(vals);
      return {
        x: key,
        min: jStat.min(vals),
        q1: quartiles[0],
        median: quartiles[1],
        q3: quartiles[2],
        max: jStat.max(vals)
      };
    });

    const kwCombined: { val: number; gKey: string; rank: number }[] = [];
    groupKeys.forEach(key => {
      groups[key].forEach(v => {
        kwCombined.push({ val: v, gKey: key, rank: 0 });
      });
    });
    const kwN = kwCombined.length;
    kwCombined.sort((a, b) => a.val - b.val);
    let kwIdx = 0;
    while (kwIdx < kwN) {
      let j = kwIdx;
      while (j < kwN - 1 && kwCombined[j + 1].val === kwCombined[kwIdx].val) {
        j++;
      }
      const sumRanks = ((j + 1) * (j + 2)) / 2 - (kwIdx * (kwIdx + 1)) / 2;
      const avgRank = sumRanks / (j - kwIdx + 1);
      for (let k_comb = kwIdx; k_comb <= j; k_comb++) {
        kwCombined[k_comb].rank = avgRank;
      }
      kwIdx = j + 1;
    }

    const kwBoxPlotData = groupKeys.map(key => {
      const ranksOfGroup = kwCombined.filter(item => item.gKey === key).map(item => item.rank);
      if (ranksOfGroup.length === 0) {
        return { x: key, min: 0, q1: 0, median: 0, q3: 0, max: 0 };
      }
      const quartiles = jStat.quartiles(ranksOfGroup);
      return {
        x: key,
        min: jStat.min(ranksOfGroup),
        q1: quartiles[0],
        median: quartiles[1],
        q3: quartiles[2],
        max: jStat.max(ranksOfGroup)
      };
    });

    const kwMeanRanksData = groupKeys.map(key => ({
      x: key,
      y: kw.groupMeanRanks[key] || 0
    }));

    const tables = anovaTables({
      rows: rowsForAnalysis,
      depIdx: dep,
      grpIdx: grp,
      depName: grid.cols[dep].name,
      grpName: grid.cols[grp].name,
      posthoc: posthoc as any,
      kwPosthoc,
      level: ciLevel,
      useNonParam,
    });
    const report = anovaReport({
      tables,
      depName: grid.cols[dep].name,
      grpName: grid.cols[grp].name,
      level: ciLevel,
      postHoc: posthoc,
      useNonParam,
    });

    const output = (
      <div className="output-block" key={Date.now()}>
        <div className="output-title">One-Way ANOVA & Kruskal-Wallis: {grid.cols[dep].name} by {grid.cols[grp].name}</div>
        
        <ResultTables specs={tables} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <div className="h-[300px] bg-surface3/30 rounded p-2">
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
                data={anovaBoxPlotData}
                style={{
                  min: { stroke: "#f87171", strokeWidth: 1.5 },
                  max: { stroke: "#f87171", strokeWidth: 1.5 },
                  q1: { fill: "#34d399", fillOpacity: 0.4 },
                  q3: { fill: "#34d399", fillOpacity: 0.4 },
                  median: { stroke: "#fff", strokeWidth: 2 }
                }}
              />
            </VictoryChart>
          </div>

          {useNonParam && !isNaN(kw.hStat) && (
            <div className="h-[300px] bg-surface3/30 rounded p-2">
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
                  data={kwBoxPlotData}
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
    return { ok: true, node: output, tables, report };
  };
