import type { ReactNode } from 'react';
import {
  VictoryAxis,
  VictoryBar,
  VictoryBoxPlot,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory';
import { jStat } from '../../stats/jstat';
import { buildHistogram, parseNum } from '../../stats/core';
import { calcNormalityTests } from '../../statsHelpers';
import { lillieforsTest } from '../../stats/distributions';
import { descriptiveTables } from '../../stats/descriptive';
import { descriptiveReport } from '../../stats/report';
import { fmtEst } from '../../stats/format';
import type { ReportSpec } from '../../stats/report';
import type { TableSpec } from '../../stats/types';
import type { AnalysisRunResult } from '../types';
import { ResultTables } from '../../components/ResultTable';

export interface DescriptiveInput {
  rows: string[][];
  columnNames: string[];
  /** Indici di colonna selezionati dall'utente. */
  indices: number[];
  /** Livello di confidenza (90, 95, 99). */
  level: number;
}

export type DescriptiveOutputResult = AnalysisRunResult;

/**
 * Calcolo + grafici + tabelle + report dell'analisi descrittiva.
 *
 * Estratto da `App.tsx` senza cambiarne il comportamento: l'output prodotto è
 * identico a quello che l'app mostrava prima (vedi golden test `descriptive`).
 */
export const buildDescriptiveOutput = (input: DescriptiveInput): DescriptiveOutputResult => {
    const results = input.indices.map(vIdx => {
      const name = input.columnNames[vIdx] ?? `Var${vIdx + 1}`;
      const data = input.rows.map(r => parseNum(r[vIdx])).filter(v => !isNaN(v));
      if (data.length === 0) return null;

      const n = data.length;
      const mean = jStat.mean(data);
      const median = jStat.median(data);
      const stdev = jStat.stdev(data, true); // sample SD
      const min = jStat.min(data);
      const max = jStat.max(data);
      const range = max - min;
      const sum = jStat.sum(data);
      const variance = jStat.variance(data, true);
      const skewness = jStat.skewness(data);
      const kurtosis = jStat.kurtosis(data);
      const quartiles = jStat.quartiles(data); // [Q1, Q2, Q3]

      // Histogram data: single source of truth for bin count, edges and counts
      const histogram = buildHistogram(data);

      // Normality calculations
      const normality = calcNormalityTests(data);
      const lilliefors = lillieforsTest(data);

      // Q-Q Plot calculations
      const sortedData = [...data].sort((a, b) => a - b);
      const qqData = sortedData.map((val, idx) => {
        const p = (idx + 1 - 0.375) / (n + 0.25);
        const theoreticalQuantile = jStat.normal.inv(p, 0, 1);
        return {
          x: theoreticalQuantile,
          y: val
        };
      });

      const q25 = jStat.normal.inv(0.25, 0, 1);
      const q75 = jStat.normal.inv(0.75, 0, 1);
      const x25 = quartiles[0];
      const x75 = quartiles[2];
      const qqSlope = (isNaN(stdev) || stdev === 0) ? 0 : (x75 - x25) / (q75 - q25);
      const qqIntercept = x25 - qqSlope * q25;

      // Keep the reference line inside the observed theoretical quantiles: the
      // old fixed ±3 range stretched the y domain far beyond the actual data.
      const qqXMin = Math.min(...qqData.map(d => d.x));
      const qqXMax = Math.max(...qqData.map(d => d.x));
      const qqSpan = (qqXMax - qqXMin) || 1;
      const xMin = qqXMin - qqSpan * 0.05;
      const xMax = qqXMax + qqSpan * 0.05;
      const qqLineData = [
        { x: xMin, y: qqSlope * xMin + qqIntercept },
        { x: xMax, y: qqSlope * xMax + qqIntercept }
      ];

      return { 
        name, n, mean, median, stdev, min, max, range, sum, variance, skewness, kurtosis,
        q1: quartiles[0], q3: quartiles[2], histData: histogram.data, histBins: histogram.bins,
        normality, lilliefors, qqData, qqLineData
      };
    }).filter(r => r !== null);

    if (results.length === 0) {
      return { ok: false, reason: 'No valid numeric data selected' };
    }

    const descTables = descriptiveTables(
      input.rows,
      input.indices,
      input.columnNames,
      input.level
    );
    const descReport = descriptiveReport(descTables, input.level);

    const node = (
      <div className="output-block" key={Date.now()}>
        <div className="output-title">Descriptive Statistics</div>
        <ResultTables specs={descTables} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div className="h-[300px] bg-surface3/30 rounded p-2">
            <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter">Means Comparison</p>
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={20}
              padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
              containerComponent={<VictoryVoronoiContainer />}
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
              <VictoryBar
                data={results.map(r => ({ x: r.name, y: r.mean }))}
                style={{ data: { fill: '#4f9cf9', width: 25 } }}
                labels={({ datum }) => `Mean: ${fmtEst(datum.y)}`}
                labelComponent={<VictoryTooltip style={{ fontSize: 10 }} flyoutStyle={{ fill: '#1e1e1e', stroke: '#333' }} />}
              />
            </VictoryChart>
          </div>

          <div className="h-[300px] bg-surface3/30 rounded p-2">
            <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter">Box & Whisker Plot</p>
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
                data={results.map(r => ({
                  x: r.name,
                  min: r.min,
                  q1: r.q1,
                  median: r.median,
                  q3: r.q3,
                  max: r.max
                }))}
                style={{
                  min: { stroke: "#f87171", strokeWidth: 2 },
                  max: { stroke: "#f87171", strokeWidth: 2 },
                  q1: { fill: "#4f9cf9", fillOpacity: 0.5 },
                  q3: { fill: "#4f9cf9", fillOpacity: 0.5 },
                  median: { stroke: "#fff", strokeWidth: 2 }
                }}
              />
            </VictoryChart>
          </div>
        </div>

        {results.length > 0 && (
          <div className="h-[300px] w-full mt-4 bg-surface3/30 rounded p-2">
            <p className="text-[10px] text-text3 mb-2 uppercase tracking-tighter">Distribution (Histogram): {results[0].name}</p>
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={{ x: results[0].histBins > 1 ? 190 / results[0].histBins : 20 }}
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
              <VictoryBar
                data={results[0].histData}
                style={{ data: { fill: '#34d399', width: results[0].histBins > 1 ? 380 / results[0].histBins : 40 } }}
                labels={({ datum }) => `Freq: ${datum.y}`}
                labelComponent={<VictoryTooltip style={{ fontSize: 10 }} flyoutStyle={{ fill: '#1e1e1e', stroke: '#333' }} />}
              />
            </VictoryChart>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8 border-t border-border/40 pt-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-text2 mb-4">Normality Diagnostics & Q-Q Plots</h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {results.map((r, rIdx) => {
                const isNormalJB = r.normality.jbPValue > 0.05;
                const isNormalKS = r.lilliefors.p > 0.05;
                
                return (
                  <div key={rIdx} className="bg-surface3/30 border border-border2 rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-accent mb-3 font-mono tracking-wider">{r.name}</h4>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-[11px] font-mono text-text2 bg-surface2/40 rounded p-3 border border-border/40">
                        <div>
                          <div className="text-[9px] text-text3 uppercase mb-1 font-semibold tracking-tighter font-sans">Jarque-Bera Test</div>
                          <div>JB Stat: <span className="text-text font-semibold">{fmtEst(r.normality.jbStat)}</span></div>
                          <div>p-value: <span className={`font-bold ${isNormalJB ? 'text-green' : 'text-red/90'}`}>{fmtEst(r.normality.jbPValue)}</span></div>
                          <div className="text-[10px] mt-1 text-text3 font-sans">
                            {isNormalJB ? '✓ Normal' : '✗ Non-Normal'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] text-text3 uppercase mb-1 font-semibold tracking-tighter font-sans">Kolmogorov-Smirnov (Lilliefors)</div>
                          <div>D Stat: <span className="text-text font-semibold">{fmtEst(r.lilliefors.d)}</span></div>
                          <div>p-value: <span className={`font-bold ${isNormalKS ? 'text-green' : 'text-red/90'}`}>{fmtEst(r.lilliefors.p)}</span></div>
                          <div className="text-[10px] mt-1 text-text3 font-sans">
                            {isNormalKS ? '✓ Normal' : '✗ Non-Normal'}
                          </div>
                        </div>
                        <div className="col-span-2 border-t border-border/30 pt-2 mt-1 grid grid-cols-2 font-sans">
                          <div>Skewness: <span className="text-text font-semibold font-mono">{fmtEst(r.skewness)}</span></div>
                          <div>Kurtosis (ex): <span className="text-text font-semibold font-mono">{fmtEst(r.kurtosis)}</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="h-[260px] w-full bg-surface2/20 rounded p-1">
                      <p className="text-[9px] text-text3 uppercase tracking-tighter text-center mb-1 font-mono">Normal Q-Q Plot</p>
                      <VictoryChart
                        theme={VictoryTheme.material}
                        padding={{ top: 15, bottom: 40, left: 55, right: 15 }}
                      >
                        <VictoryAxis
                          label="Theoretical Quantiles"
                          style={{ 
                            axis: { stroke: '#444' }, 
                            axisLabel: { fill: '#888', fontSize: 9, padding: 25 },
                            tickLabels: { fill: '#888', fontSize: 8 },
                            grid: { stroke: '#333', strokeDasharray: '3 3' }
                          }}
                        />
                        <VictoryAxis
                          dependentAxis
                          label="Observed Values"
                          style={{ 
                            axis: { stroke: '#444' }, 
                            axisLabel: { fill: '#888', fontSize: 9, padding: 35 },
                            tickLabels: { fill: '#888', fontSize: 8 },
                            grid: { stroke: '#333', strokeDasharray: '3 3' }
                          }}
                        />
                        <VictoryScatter
                          data={r.qqData}
                          style={{ data: { fill: '#4f9cf9', fillOpacity: 0.8, r: 3 } }}
                          labels={({ datum }) => `Obs: ${fmtEst(datum.y)}\nTh: ${fmtEst(datum.x)}`}
                          labelComponent={<VictoryTooltip style={{ fontSize: 9 }} flyoutStyle={{ fill: '#1e1e1e', stroke: '#444' }} />}
                        />
                        <VictoryLine
                          data={r.qqLineData}
                          style={{ data: { stroke: '#ef4444', strokeWidth: 1.5 } }}
                        />
                      </VictoryChart>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
    return { ok: true, node, tables: descTables, report: descReport };
  };
