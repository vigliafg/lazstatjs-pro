import {
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
} from 'victory';
import { factorialCells, factorialReport, factorialTables } from '../../stats/factorial';
import { ResultTables } from '../../components/ResultTable';
import { parseNum } from '../../stats/core';
import { analysisRows, type Dataset } from '../../grid/types';
import type { FactorialParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { t } from '../../i18n';

export interface FactorialInput {
  grid: Dataset;
  params: FactorialParams;
  ciLevel: number;
}

const COLORS = ['#4f9cf9', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#38bdf8'];

/** ANOVA fattoriale 2×2+: tabelle, interaction plot e report. */
export const buildFactorialOutput = ({
  grid,
  params,
  ciLevel,
}: FactorialInput): AnalysisRunResult => {
  const { response, factorA, factorB, interaction } = params;

  if (factorA === factorB) {
    return { ok: false, reason: 'Choose two different factors' };
  }
  if (response === factorA || response === factorB) {
    return { ok: false, reason: 'The response must be different from the two factors' };
  }

  const responseValues: number[] = [];
  const labelsA: string[] = [];
  const labelsB: string[] = [];
  analysisRows(grid, [factorA, factorB]).forEach(row => {
    const value = parseNum(row[response]);
    if (!Number.isFinite(value)) return;
    responseValues.push(value);
    labelsA.push(String(row[factorA] ?? '').trim());
    labelsB.push(String(row[factorB] ?? '').trim());
  });

  if (responseValues.length < 4) {
    return { ok: false, reason: 'Not enough valid rows for the selected response' };
  }

  const options = {
    response: responseValues,
    factorA: labelsA,
    factorB: labelsB,
    responseName: grid.cols[response]?.name ?? 'Y',
    aName: grid.cols[factorA]?.name ?? 'Factor A',
    bName: grid.cols[factorB]?.name ?? 'Factor B',
    level: ciLevel,
    interaction,
  };

  const tables = factorialTables(options);
  if (tables.length === 0) {
    return {
      ok: false,
      reason:
        'The design is not estimable: some combination of the two factors has no observations. Include the interaction only when every cell is populated.',
    };
  }

  const cells = factorialCells(options);
  const bLevels = Array.from(new Set(cells.map(cell => cell.b))).sort();
  const aLevels = Array.from(new Set(cells.map(cell => cell.a))).sort();
  const plotGroups = aLevels.map((level, index) => ({
    level,
    color: COLORS[index % COLORS.length],
    data: bLevels
      .map((b, bIndex) => {
        const cell = cells.find(item => item.a === level && item.b === b);
        return { x: bIndex, y: cell?.mean ?? NaN };
      })
      // Cells with no observations are simply not drawn instead of passing NaN to Victory.
      .filter(point => Number.isFinite(point.y)),
  }));

  return {
    ok: true,
    tables,
    report: factorialReport(tables, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
        <section className="mb-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
            <h3 className="text-[11px] text-accent2 font-semibold uppercase tracking-wider">
              Interaction plot
            </h3>
            <span className="text-[10px] text-text3 font-mono">
              {`${grid.cols[factorA]?.name} × ${grid.cols[factorB]?.name}`}
            </span>
          </div>
          <div className="h-[280px] w-full bg-surface3/30 rounded p-2">
            <VictoryChart theme={VictoryTheme.material} padding={{ top: 15, bottom: 55, left: 65, right: 25 }}>
              <VictoryAxis
                tickValues={bLevels.map((_, index) => index)}
                tickFormat={(value: number) => bLevels[value] ?? ''}
                label={grid.cols[factorB]?.name}
                style={{
                  axis: { stroke: '#333' },
                  axisLabel: { fill: '#888', fontSize: 10, padding: 32 },
                  tickLabels: { fill: '#888', fontSize: 9 },
                  grid: { stroke: '#222' },
                }}
              />
              <VictoryAxis
                dependentAxis
                label={t('chart.mean')}
                style={{
                  axis: { stroke: '#333' },
                  axisLabel: { fill: '#888', fontSize: 10, padding: 40 },
                  tickLabels: { fill: '#888', fontSize: 9 },
                  grid: { stroke: '#222' },
                }}
              />
              {plotGroups.map(group => (
                <VictoryGroup key={group.level} data={group.data}>
                  <VictoryLine style={{ data: { stroke: group.color, strokeWidth: 2 } }} />
                  <VictoryScatter style={{ data: { fill: group.color, size: 3.5 } }} />
                </VictoryGroup>
              ))}
            </VictoryChart>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            {plotGroups.map(group => (
              <span key={group.level} className="flex items-center gap-1.5 text-[10px] text-text3 font-mono">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: group.color }} />
                {`${grid.cols[factorA]?.name} = ${group.level}`}
              </span>
            ))}
          </div>
        </section>
      </div>
    ),
  };
};
