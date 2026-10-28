import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryTheme,
} from 'victory';
import { survivalReport, survivalTables } from '../../stats/survival';
import { ResultTables } from '../../components/ResultTable';
import { parseNum } from '../../stats/core';
import { analysisRows, type Dataset } from '../../grid/types';
import type { SurvivalParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface SurvivalInput {
  grid: Dataset;
  params: SurvivalParams;
  ciLevel: number;
}

const COLORS = ['#4f9cf9', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#38bdf8'];

/** Kaplan–Meier: tabelle, curve per gruppo e report. */
export const buildSurvivalOutput = ({
  grid,
  params,
  ciLevel,
}: SurvivalInput): AnalysisRunResult => {
  const { timeVariable, eventVariable, groupVariable } = params;

  if (timeVariable === eventVariable) {
    return { ok: false, reason: 'Time and event must be different columns' };
  }

  const eventLevels = Array.from(
    new Set(
      grid.rows
        .map(row => String(row[eventVariable] ?? '').trim())
        .filter(value => value !== '')
    )
  ).sort();
  if (eventLevels.length !== 2) {
    return {
      ok: false,
      reason: 'The event column needs exactly two values (for example 0/1 or no/yes)',
    };
  }

  const rows: { time: number; event: number; group: string }[] = [];
  const rowsForAnalysis = groupVariable >= 0 ? analysisRows(grid, [groupVariable]) : grid.rows;
  rowsForAnalysis.forEach(row => {
    const time = parseNum(row[timeVariable]);
    const label = String(row[eventVariable] ?? '').trim();
    if (!Number.isFinite(time) || time < 0 || label === '') return;
    rows.push({
      time,
      event: label === eventLevels[1] ? 1 : 0,
      group: groupVariable >= 0 ? String(row[groupVariable] ?? '').trim() || 'All' : 'All',
    });
  });

  if (rows.length < 3) {
    return { ok: false, reason: 'Not enough complete rows: time must be numeric and non-negative' };
  }

  const tables = survivalTables({
    time: rows.map(row => row.time),
    event: rows.map(row => row.event),
    groups: rows.map(row => row.group),
    level: ciLevel,
  });

  if (tables.length === 0) {
    return { ok: false, reason: 'The survival analysis needs at least three observations' };
  }

  const kmRows = tables.find(spec => spec.id === 'surv-km')?.rows ?? [];
  const groups = Array.from(new Set(kmRows.map(row => String(row.group))));
  const curves = groups.map((group, index) => ({
    group,
    color: COLORS[index % COLORS.length],
    data: [
      { x: 0, y: 100 },
      ...kmRows
        .filter(row => String(row.group) === group)
        .map(row => ({ x: Number(row.time), y: Number(row.survival) * 100 })),
    ],
  }));

  return {
    ok: true,
    tables,
    report: survivalReport(tables, ciLevel),
    node: (
      <div className="mb-6">
        <p className="text-[10px] text-text3 font-mono mb-3">
          {`Time: ${grid.cols[timeVariable]?.name} · event: ${grid.cols[eventVariable]?.name} = "${eventLevels[1]}" · ${rows.length} observations`}
        </p>
        <ResultTables specs={tables} />

        <section className="mb-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
            <h3 className="text-[11px] text-accent2 font-semibold uppercase tracking-wider">
              Curve di Kaplan–Meier
            </h3>
            <span className="text-[10px] text-text3 font-mono">{`CI ${ciLevel}%`}</span>
          </div>
          <div className="h-[300px] w-full bg-surface3/30 rounded p-2">
            <VictoryChart theme={VictoryTheme.material} padding={{ top: 15, bottom: 50, left: 65, right: 25 }} domain={{ y: [0, 100] }}>
              <VictoryAxis
                label="Tempo"
                style={{
                  axis: { stroke: '#333' },
                  axisLabel: { fill: '#888', fontSize: 10, padding: 30 },
                  tickLabels: { fill: '#888', fontSize: 9 },
                  grid: { stroke: '#222' },
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={value => `${value}%`}
                style={{
                  axis: { stroke: '#333' },
                  tickLabels: { fill: '#888', fontSize: 9 },
                  grid: { stroke: '#222' },
                }}
              />
              {curves.map(curve => (
                <VictoryLine
                  key={curve.group}
                  data={curve.data}
                  interpolation="stepAfter"
                  style={{ data: { stroke: curve.color, strokeWidth: 2 } }}
                />
              ))}
            </VictoryChart>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            {curves.map(curve => (
              <span key={curve.group} className="flex items-center gap-1.5 text-[10px] text-text3 font-mono">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: curve.color }} />
                {curve.group}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-text3 mt-1">
            Ogni gradino è un evento; i tratti piatti indicano che in quell’intervallo non ci sono stati eventi.
          </p>
        </section>
      </div>
    ),
  };
};
