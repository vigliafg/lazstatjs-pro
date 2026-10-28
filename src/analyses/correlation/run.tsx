import type { ReactNode } from 'react';
import {
  VictoryAxis,
  VictoryBoxPlot,
  VictoryChart,
  VictoryLabel,
  VictoryScatter,
  VictoryTheme,
} from 'victory';
import { jStat } from '../../stats/jstat';
import { parseNum } from '../../stats/core';
import { correlationTables } from '../../stats/correlation';
import { correlationReport } from '../../stats/report';
import { calcKendallTau } from '../../statsHelpers';
import { ResultTables } from '../../components/ResultTable';
import type { GridData } from '../../grid/types';
import type { CorrParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface CorrelationRunInput {
  grid: GridData;
  corrParams: CorrParams;
  ciLevel: number;
}

/** Correlazioni: tabelle, grafici e report. Estratto da App.tsx senza cambi di comportamento. */
  export const buildCorrelationOutput = (input: CorrelationRunInput): AnalysisRunResult => {
  const { grid, corrParams, ciLevel } = input;
    const { vars, method, showSpearman, showKendall } = corrParams;
    if (vars.length < 2) {
      return { ok: false, reason: 'Select at least 2 variables' };
    }

    const matrixPearson: number[][] = [];
    const matrixSpearman: number[][] = [];
    const matrixKendall: number[][] = [];

    for (let i = 0; i < vars.length; i++) {
      matrixPearson[i] = [];
      matrixSpearman[i] = [];
      matrixKendall[i] = [];

      for (let j = 0; j < vars.length; j++) {
        if (i === j) {
          matrixPearson[i][j] = 1;
          matrixSpearman[i][j] = 1;
          matrixKendall[i][j] = 1;
          continue;
        }
        
        const v1 = vars[i];
        const v2 = vars[j];
        
        // Pairwise deletion
        const pairs = grid.rows.map(row => [parseNum(row[v1]), parseNum(row[v2])])
          .filter(p => !isNaN(p[0]) && !isNaN(p[1]));
        
        if (pairs.length < 3) {
          matrixPearson[i][j] = NaN;
          matrixSpearman[i][j] = NaN;
          matrixKendall[i][j] = NaN;
          continue;
        }

        const x = pairs.map(p => p[0]);
        const y = pairs.map(p => p[1]);

        // Pearson
        matrixPearson[i][j] = jStat.corrcoeff(x, y);

        // Spearman
        const rankX = jStat.rank(x);
        const rankY = jStat.rank(y);
        matrixSpearman[i][j] = jStat.corrcoeff(rankX, rankY);

        // Kendall's Tau
        matrixKendall[i][j] = calcKendallTau(x, y);
      }
    }

    const corrChartDataPearson = vars.slice(1).map((vIdx, i) => ({
      name: grid.cols[vIdx].name,
      value: matrixPearson[0][i + 1]
    }));

    const corrChartDataSpearman = vars.slice(1).map((vIdx, i) => ({
      name: grid.cols[vIdx].name,
      value: matrixSpearman[0][i + 1]
    }));

    const corrChartDataKendall = vars.slice(1).map((vIdx, i) => ({
      name: grid.cols[vIdx].name,
      value: matrixKendall[0][i + 1]
    }));

    const corrBoxPlotData = vars.map(idx => {
      const vals = grid.rows.map(row => parseNum(row[idx])).filter(v => !isNaN(v));
      const quartiles = jStat.quartiles(vals);
      return {
        x: grid.cols[idx].name,
        min: jStat.min(vals),
        q1: quartiles[0],
        median: quartiles[1],
        q3: quartiles[2],
        max: jStat.max(vals)
      };
    });

    // Scatter and Rank Scatter data for 2-variable case
    const rawScatterData = grid.rows.map(r => ({
      x: parseNum(r[vars[0]]),
      y: parseNum(r[vars[1]])
    })).filter(p => !isNaN(p.x) && !isNaN(p.y));

    let rankScatterData: { x: number; y: number }[] = [];
    if (vars.length === 2 && rawScatterData.length >= 3) {
      const xs = rawScatterData.map(d => d.x);
      const ys = rawScatterData.map(d => d.y);
      const rx = jStat.rank(xs);
      const ry = jStat.rank(ys);
      rankScatterData = rx.map((val, idx) => ({
        x: val,
        y: ry[idx]
      }));
    }

    const tables = correlationTables({
      rows: grid.rows,
      varIdxs: vars,
      varNames: vars.map(index => grid.cols[index].name),
      level: ciLevel,
      method: method as any,
      showSpearman,
      showKendall,
    });
    const report = correlationReport({
      tables,
      method: method as 'pearson' | 'spearman' | 'kendall',
      level: ciLevel,
    });

    const output = (
      <div className="output-block" key={Date.now()}>
        <div className="output-title">Correlation Analysis Suite</div>

        <ResultTables specs={tables} />

        {vars.length === 2 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div className="h-[280px] bg-surface3/30 rounded p-2">
              <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter text-center">Parametric: Raw Scatter Plot</p>
              <VictoryChart
                theme={VictoryTheme.material}
                padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
              >
                <VictoryAxis
                  label={grid.cols[vars[0]].name}
                  style={{ 
                    axis: { stroke: '#333' }, 
                    axisLabel: { fill: '#888', fontSize: 10, padding: 30 },
                    tickLabels: { fill: '#888', fontSize: 10 }
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  label={grid.cols[vars[1]].name}
                  style={{ 
                    axis: { stroke: '#333' }, 
                    axisLabel: { fill: '#888', fontSize: 10, padding: 35 },
                    tickLabels: { fill: '#888', fontSize: 10 },
                    grid: { stroke: '#222' }
                  }}
                />
                <VictoryScatter
                  data={rawScatterData}
                  style={{ data: { fill: '#fb923c', r: 3 } }}
                />
              </VictoryChart>
            </div>

            {showSpearman && rankScatterData.length > 0 && (
              <div className="h-[280px] bg-surface3/30 rounded p-2">
                <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter text-center text-green">Non-Parametric: Spearman Rank Space Scatter Plot</p>
                <VictoryChart
                  theme={VictoryTheme.material}
                  padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
                >
                  <VictoryAxis
                    label={`Rank: ${grid.cols[vars[0]].name}`}
                    style={{ 
                      axis: { stroke: '#333' }, 
                      axisLabel: { fill: '#888', fontSize: 10, padding: 30 },
                      tickLabels: { fill: '#888', fontSize: 10 }
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    label={`Rank: ${grid.cols[vars[1]].name}`}
                    style={{ 
                      axis: { stroke: '#333' }, 
                      axisLabel: { fill: '#888', fontSize: 10, padding: 35 },
                      tickLabels: { fill: '#888', fontSize: 10 },
                      grid: { stroke: '#222' }
                    }}
                  />
                  <VictoryScatter
                    data={rankScatterData}
                    style={{ data: { fill: '#34d399', r: 3 } }}
                  />
                </VictoryChart>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[340px] w-full mt-6 bg-surface3/30 rounded p-2">
            <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter text-center">
              Selected Variables Distribution (Boxplots)
            </p>
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
                data={corrBoxPlotData}
                style={{
                  min: { stroke: "#f87171", strokeWidth: 1.5 },
                  max: { stroke: "#f87171", strokeWidth: 1.5 },
                  q1: { fill: "#fb923c", fillOpacity: 0.4 },
                  q3: { fill: "#fb923c", fillOpacity: 0.4 },
                  median: { stroke: "#fff", strokeWidth: 2 }
                }}
              />
            </VictoryChart>
          </div>
        )}
      </div>
    );
    return { ok: true, node: output, tables, report };
  };
