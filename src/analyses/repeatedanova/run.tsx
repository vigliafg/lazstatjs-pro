import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTheme,
} from 'victory';
import {
  repeatedAnovaReport,
  repeatedAnovaTables,
  repeatedMeasuresAnova,
} from '../../stats/repeatedAnova';
import { ResultTables } from '../../components/ResultTable';
import { parseNum } from '../../stats/core';
import type { GridData } from '../../grid/types';
import type { RepeatedAnovaParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { isNumericColumn } from '../shared/columns';

export interface RepeatedAnovaInput {
  grid: GridData;
  params: RepeatedAnovaParams;
  ciLevel: number;
}

/** ANOVA per misure ripetute: tabelle, medie per condizione e report. */
export const buildRepeatedAnovaOutput = ({
  grid,
  params,
  ciLevel,
}: RepeatedAnovaInput): AnalysisRunResult => {
  const columns = params.selected.filter(index => isNumericColumn(grid, index));
  if (columns.length < 3) {
    return {
      ok: false,
      reason: 'Select at least three numeric columns measured on the same rows',
    };
  }

  const blocks: number[][] = [];
  grid.rows.forEach(row => {
    const values = columns.map(index => parseNum(row[index]));
    if (values.every(value => Number.isFinite(value))) blocks.push(values);
  });
  if (blocks.length < 3) {
    return {
      ok: false,
      reason: 'Not enough complete rows: every condition must be numeric and present',
    };
  }

  const result = repeatedMeasuresAnova(blocks);
  if (!result) {
    return {
      ok: false,
      reason: 'The model could not be estimated: check the selected columns and complete rows',
    };
  }

  const names = columns.map(index => grid.cols[index]?.name ?? `Var${index + 1}`);
  const tables = repeatedAnovaTables(result, names, ciLevel);
  const data = names.map((name, index) => ({ x: name, y: result.means[index] }));

  return {
    ok: true,
    tables,
    report: repeatedAnovaReport(tables, names, ciLevel),
    node: (
      <div className="mb-6">
        <p className="text-[10px] text-text3 font-mono mb-3">
          {`Repeated-measures ANOVA · ${result.n} soggetti · ${result.k} condizioni`}
        </p>
        <ResultTables specs={tables} />
        <section className="mb-6">
          <h3 className="text-[11px] text-accent2 font-semibold uppercase tracking-wider mb-2">
            Medie per condizione
          </h3>
          <div className="h-[260px] w-full bg-surface3/30 rounded p-2">
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={{ x: 30 }}
              padding={{ top: 15, bottom: 55, left: 55, right: 20 }}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: '#333' },
                  tickLabels: { fill: '#888', fontSize: 9 },
                  grid: { stroke: '#222' },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: '#333' },
                  tickLabels: { fill: '#888', fontSize: 9 },
                  grid: { stroke: '#222' },
                }}
              />
              <VictoryBar
                data={data}
                style={{ data: { fill: '#4f9cf9' } }}
                labels={({ datum }) => datum.y.toFixed(2)}
              />
            </VictoryChart>
          </div>
        </section>
      </div>
    ),
  };
};
