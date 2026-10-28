import type { ReactNode } from 'react';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryLabel,
  VictoryTheme,
  VictoryTooltip,
} from 'victory';
import { jStat } from '../../stats/jstat';
import { chiSquareTables } from '../../stats/chisquare';
import { chiSquareReport } from '../../stats/report';
import { fmtEst } from '../../stats/format';
import { ResultTables } from '../../components/ResultTable';
import { calcFisherExact } from '../../stats/kernels';
import { AlertCircle } from 'lucide-react';
import type { Dataset } from '../../grid/types';
import type { ChiSqParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface ChiSquareRunInput {
  grid: Dataset;
  chisqParams: ChiSqParams;
  ciLevel: number;
}

/** Chi-quadro 2x2: tabelle, grafici e report. Estratto da App.tsx senza cambi di comportamento. */
  export const buildChiSquareOutput = (input: ChiSquareRunInput): AnalysisRunResult => {
  const { grid, chisqParams, ciLevel } = input;
    const { row1col1, row1col2, row2col1, row2col2, row1Label, row2Label, col1Label, col2Label, runFisherExact } = chisqParams;

    if (row1col1 < 0 || row1col2 < 0 || row2col1 < 0 || row2col2 < 0) {
      return { ok: false, reason: 'Frequencies must be non-negative' };
    }

    const o11 = row1col1;
    const o12 = row1col2;
    const o21 = row2col1;
    const o22 = row2col2;

    const r1 = o11 + o12;
    const r2 = o21 + o22;
    const c1 = o11 + o21;
    const c2 = o12 + o22;
    const n = r1 + r2;

    if (n === 0) {
      return { ok: false, reason: 'Grand total cannot be zero' };
    }

    const e11 = (r1 * c1) / n;
    const e12 = (r1 * c2) / n;
    const e21 = (r2 * c1) / n;
    const e22 = (r2 * c2) / n;

    if (e11 === 0 || e12 === 0 || e21 === 0 || e22 === 0) {
      return { ok: false, reason: 'Expected frequencies cannot be zero. Please check your contingency table data.' };
    }

    // Pearson Chi-Square
    const chi2 = 
      Math.pow(o11 - e11, 2) / e11 +
      Math.pow(o12 - e12, 2) / e12 +
      Math.pow(o21 - e21, 2) / e21 +
      Math.pow(o22 - e22, 2) / e22;

    // Yates Continuity Correction
    const chi2Yates = 
      Math.pow(Math.max(0, Math.abs(o11 - e11) - 0.5), 2) / e11 +
      Math.pow(Math.max(0, Math.abs(o12 - e12) - 0.5), 2) / e12 +
      Math.pow(Math.max(0, Math.abs(o21 - e21) - 0.5), 2) / e21 +
      Math.pow(Math.max(0, Math.abs(o22 - e22) - 0.5), 2) / e22;

    const df = 1;
    let pValue = 1;
    let pValueYates = 1;
    try {
      pValue = 1 - jStat.chisquare.cdf(chi2, df);
      pValueYates = 1 - jStat.chisquare.cdf(chi2Yates, df);
    } catch (e) {
      console.error(e);
    }

    const pValueFisher = runFisherExact ? calcFisherExact(o11, o12, o21, o22) : NaN;

    const phi = Math.sqrt(chi2 / n);
    let interpretation = 'Negligible';
    if (phi >= 0.5) interpretation = 'Strong association';
    else if (phi >= 0.3) interpretation = 'Moderate association';
    else if (phi >= 0.1) interpretation = 'Weak association';

    const minExpected = Math.min(e11, e12, e21, e22);
    const showCochranWarning = minExpected < 5;

    const chartDataObs = [
      { x: `${row1Label}\n(${col1Label})`, y: o11 },
      { x: `${row1Label}\n(${col2Label})`, y: o12 },
      { x: `${row2Label}\n(${col1Label})`, y: o21 },
      { x: `${row2Label}\n(${col2Label})`, y: o22 }
    ];

    const chartDataExp = [
      { x: `${row1Label}\n(${col1Label})`, y: e11 },
      { x: `${row1Label}\n(${col2Label})`, y: e12 },
      { x: `${row2Label}\n(${col1Label})`, y: e21 },
      { x: `${row2Label}\n(${col2Label})`, y: e22 }
    ];

    const tables = chiSquareTables({
      o11, o12, o21, o22,
      row1: row1Label,
      row2: row2Label,
      col1: col1Label,
      col2: col2Label,
      level: ciLevel,
      runFisher: runFisherExact,
    });
    const report = chiSquareReport({
      tables,
      level: ciLevel,
      row1: row1Label,
      row2: row2Label,
      col1: col1Label,
      col2: col2Label,
    });

    const output = (
      <div className="output-block" key={Date.now()}>
        <div className="output-title">Chi-Square (χ²) Test of Independence</div>
        
        <ResultTables specs={tables} />

        {showCochranWarning && (
          <div className="mt-4 p-2 bg-yellow/10 border border-yellow/20 rounded flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow shrink-0 mt-0.5" />
            <div className="text-[10px] text-yellow leading-normal">
              <strong>Warning (Cochran's Rule):</strong> One or more expected frequencies is less than 5 (Min expected: {fmtEst(minExpected, 2)}).
              The standard Chi-Square test may be inaccurate. Yates' Continuity Correction is strongly recommended.
            </div>
          </div>
        )}

        <div className="h-[320px] w-full mt-6 bg-surface3/30 rounded p-2">
          <p className="text-[10px] text-text3 mb-1 uppercase tracking-tighter text-center">Observed vs. Expected Frequencies (by cell)</p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-text3 mb-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: '#34d399' }} /> Observed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: '#4f9cf9' }} /> Expected</span>
          </div>
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={{ x: 60 }}
            padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
          >
            <VictoryAxis
              tickLabelComponent={<VictoryLabel style={{ fill: '#888', fontSize: 9 }} />}
              style={{ axis: { stroke: '#333' } }}
            />
            <VictoryAxis
              dependentAxis
              tickLabelComponent={<VictoryLabel style={{ fill: '#888', fontSize: 9 }} />}
              style={{ axis: { stroke: '#333' }, grid: { stroke: '#222' } }}
            />
            <VictoryGroup offset={16}>
              <VictoryBar
                data={chartDataObs}
                style={{ data: { fill: '#34d399', width: 14 } }}
                labels={({ datum }) => `Observed: ${datum.y}`}
                labelComponent={<VictoryTooltip style={{ fontSize: 9 }} flyoutStyle={{ fill: '#1e1e1e', stroke: '#333' }} />}
              />
              <VictoryBar
                data={chartDataExp}
                style={{ data: { fill: '#4f9cf9', width: 14 } }}
                labels={({ datum }) => `Expected: ${fmtEst(datum.y, 2)}`}
                labelComponent={<VictoryTooltip style={{ fontSize: 9 }} flyoutStyle={{ fill: '#1e1e1e', stroke: '#333' }} />}
              />
            </VictoryGroup>
          </VictoryChart>
        </div>
      </div>
    );
    return { ok: true, node: output, tables, report };
  };
