import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
} from 'victory';
import { ResultTables } from '../../components/ResultTable';
import { blandAltmanStats, iccStats, kappaStats } from '../../stats/kernels/agreement';
import { blandAltmanTables, iccTables, kappaTables } from '../../stats/tables/agreement';
import { blandAltmanReport, iccReport, kappaReport } from '../../stats/reports/agreement';
import type { Dataset } from '../../grid/types';
import type { AgreementParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface AgreementInput {
  grid: Dataset;
  params: AgreementParams;
  ciLevel: number;
}

const axisStyle = {
  axis: { stroke: '#333' },
  axisLabel: { fill: '#888', fontSize: 10, padding: 30 },
  tickLabels: { fill: '#888', fontSize: 9 },
  grid: { stroke: '#222' },
};

/** ICC, Bland–Altman e kappa. */
export const buildAgreementOutput = ({ grid, params, ciLevel }: AgreementInput): AnalysisRunResult => {
  if (params.mode === 'bland') {
    if (params.columns.length !== 2) {
      return { ok: false, reason: 'Select exactly two measurements for Bland–Altman' };
    }
    const stats = blandAltmanStats(grid.rows, params.columns[0], params.columns[1], ciLevel);
    if (!stats) {
      return { ok: false, reason: 'Bland–Altman needs at least three complete pairs' };
    }
    const tables = blandAltmanTables(stats, ciLevel);
    const min = Math.min(...stats.points.map(point => point.mean));
    const max = Math.max(...stats.points.map(point => point.mean));
    const line = [
      { x: min, y: stats.bias },
      { x: max, y: stats.bias },
    ];
    return {
      ok: true,
      tables,
      report: blandAltmanReport(stats, ciLevel),
      node: (
        <div className="mb-6">
          <ResultTables specs={tables} />
          <section className="mb-6">
            <h3 className="text-[11px] text-accent2 font-semibold uppercase tracking-wider mb-2">
              Accordo tra le due misure
            </h3>
            <div className="h-[300px] w-full bg-surface3/30 rounded p-2">
              <VictoryChart theme={VictoryTheme.material} padding={{ top: 15, bottom: 50, left: 65, right: 25 }}>
                <VictoryAxis label="Media delle due misure" style={axisStyle} />
                <VictoryAxis dependentAxis label="Differenza" style={axisStyle} />
                <VictoryLine data={line} style={{ data: { stroke: '#4f9cf9', strokeWidth: 2 } }} />
                <VictoryLine
                  data={[
                    { x: min, y: stats.loaUpper },
                    { x: max, y: stats.loaUpper },
                  ]}
                  style={{ data: { stroke: '#f87171', strokeDasharray: '4,4', strokeWidth: 1 } }}
                />
                <VictoryLine
                  data={[
                    { x: min, y: stats.loaLower },
                    { x: max, y: stats.loaLower },
                  ]}
                  style={{ data: { stroke: '#f87171', strokeDasharray: '4,4', strokeWidth: 1 } }}
                />
                <VictoryScatter data={stats.points} style={{ data: { fill: '#34d399', size: 3 } }} />
              </VictoryChart>
            </div>
            <p className="text-[10px] text-text3 mt-1">
              Blu: bias medio. Tratteggiate: limiti di accordo bias ± 1.96·SD.
            </p>
          </section>
        </div>
      ),
    };
  }

  if (params.mode === 'kappa') {
    const stats = kappaStats(grid.rows, params.columns, params.weight, ciLevel);
    if (!stats) {
      return {
        ok: false,
        reason: 'Kappa needs at least two raters with complete categorical ratings',
      };
    }
    const tables = kappaTables(stats, ciLevel);
    return {
      ok: true,
      tables,
      report: kappaReport(stats, ciLevel),
      node: (
        <div className="mb-6">
          <ResultTables specs={tables} />
        </div>
      ),
    };
  }

  const stats = iccStats(grid.rows, params.columns);
  if (!stats) {
    return { ok: false, reason: 'ICC needs at least two measurements and two complete subjects' };
  }
  const tables = iccTables(stats, ciLevel);
  return {
    ok: true,
    tables,
    report: iccReport(tables, stats, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
