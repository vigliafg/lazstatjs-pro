import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
} from 'victory';
import {
  DISTRIBUTION_LABEL,
  distributionFitReport,
  distributionFitTables,
  fitDistributions,
  probabilityPlotData,
} from '../../stats/distfit';
import { ResultTables } from '../../components/ResultTable';
import { parseNum } from '../../stats/core';
import { numericColumnValues } from '../shared/data';
import type { GridData } from '../../grid/types';
import type { DistributionFitParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface DistributionFitInput {
  grid: GridData;
  params: DistributionFitParams;
  ciLevel: number;
}

/** Calcolo, probability plot e tabelle del fit delle distribuzioni. */
export const buildDistributionFitOutput = ({
  grid,
  params,
  ciLevel,
}: DistributionFitInput): AnalysisRunResult => {
  const values = numericColumnValues(grid, params.variable);

  if (values.length < 3) {
    return { ok: false, reason: 'Select a numeric variable with at least three valid values' };
  }
  if (params.selected.length === 0) {
    return { ok: false, reason: 'Select at least one distribution to fit' };
  }

  const tables = distributionFitTables(values, params.selected, ciLevel);
  if (tables.length === 0) {
    return {
      ok: false,
      reason: 'No distribution could be fitted: positive-support models need values greater than zero',
    };
  }

  const fits = fitDistributions(values, params.selected);
  const best = fits[0];
  const plot = probabilityPlotData(best, values);
  const min = Math.min(...plot.flatMap(point => [point.x, point.y]));
  const max = Math.max(...plot.flatMap(point => [point.x, point.y]));
  const reference = [
    { x: min, y: min },
    { x: max, y: max },
  ];

  return {
    ok: true,
    tables,
    report: distributionFitReport(tables, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
        <section className="mb-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
            <h3 className="text-[11px] text-accent2 font-semibold uppercase tracking-wider">
              Probability plot
            </h3>
            <span className="text-[10px] text-text3 font-mono">
              {`${DISTRIBUTION_LABEL[best.name]} · ${grid.cols[params.variable]?.name ?? 'Y'}`}
            </span>
          </div>
          <div className="h-[280px] w-full bg-surface3/30 rounded p-2">
            <VictoryChart theme={VictoryTheme.material} padding={{ top: 15, bottom: 50, left: 65, right: 25 }}>
              <VictoryAxis
                label="Quantili teorici"
                style={{
                  axis: { stroke: '#333' },
                  axisLabel: { fill: '#888', fontSize: 10, padding: 30 },
                  tickLabels: { fill: '#888', fontSize: 9 },
                  grid: { stroke: '#222' },
                }}
              />
              <VictoryAxis
                dependentAxis
                label="Valori osservati"
                style={{
                  axis: { stroke: '#333' },
                  axisLabel: { fill: '#888', fontSize: 10, padding: 40 },
                  tickLabels: { fill: '#888', fontSize: 9 },
                  grid: { stroke: '#222' },
                }}
              />
              <VictoryLine
                data={reference}
                style={{ data: { stroke: '#555', strokeDasharray: '4,4', strokeWidth: 1 } }}
              />
              <VictoryScatter
                data={plot}
                style={{ data: { fill: '#4f9cf9', size: 3 } }}
              />
            </VictoryChart>
          </div>
          <p className="text-[10px] text-text3 mt-1">
            Più i punti stanno sulla diagonale, meglio la distribuzione descrive i dati. Le deviazioni alle estremità indicano code mal descritte.
          </p>
        </section>
      </div>
    ),
  };
};
