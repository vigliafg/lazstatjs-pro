import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryScatter,
  VictoryTheme,
} from 'victory';
import {
  alphaReport,
  alphaTables,
  cronbachAlpha,
  pcaReport,
  pcaTables,
  principalComponents,
} from '../../stats/multivariate';
import { ResultTables } from '../../components/ResultTable';
import { parseNum } from '../../stats/core';
import type { GridData } from '../../grid/types';
import type { MultivariateParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { isNumericColumn } from '../shared/columns';
import { completeNumericRows } from '../shared/data';

export interface MultivariateInput {
  grid: GridData;
  params: MultivariateParams;
  ciLevel: number;
}

const AXIS_STYLE = {
  axis: { stroke: '#333' },
  axisLabel: { fill: '#888', fontSize: 10, padding: 38 },
  tickLabels: { fill: '#888', fontSize: 9 },
  grid: { stroke: '#222' },
};

/** PCA o alpha di Cronbach: tabelle, grafici e report. */
export const buildMultivariateOutput = ({
  grid,
  params,
  ciLevel,
}: MultivariateInput): AnalysisRunResult => {
  const { mode, standardize, selected } = params;
  const columns = selected.filter(index => isNumericColumn(grid, index));
  const minimum = 2;
  if (columns.length < minimum) {
    return {
      ok: false,
      reason:
        mode === 'pca'
          ? 'Select at least two numeric variables'
          : 'Select at least two numeric items of the scale',
    };
  }

  const names = columns.map(index => grid.cols[index]?.name ?? `Var${index + 1}`);
  // Complete-case analysis: PCA and alpha both need every selected value.
  const data = completeNumericRows(grid, columns);

  if (data.length < 3) {
    return {
      ok: false,
      reason: 'Not enough complete rows: every selected variable must be numeric and present',
    };
  }

  if (mode === 'pca') {
    const result = principalComponents(data, names, standardize);
    if (!result) {
      return {
        ok: false,
        reason: 'The components could not be computed: check constant variables and complete rows',
      };
    }
    const tables = pcaTables(result);
    const scree = result.eigenvalues.map((value, index) => ({
      x: `PC${index + 1}`,
      y: result.variancePct[index],
    }));
    const scoreData = result.scores.map((scores, index) => ({
      x: scores[0],
      y: scores[1] ?? 0,
      label: `Riga ${index + 1}`,
    }));

    return {
      ok: true,
      tables,
      report: pcaReport(tables, result, ciLevel),
      node: (
        <div className="mb-6">
          <p className="text-[10px] text-text3 font-mono mb-3">
            {`PCA · ${result.n} casi · ${result.variables.length} variabili · ${result.retained} componenti`}
          </p>
          <ResultTables specs={tables} />
          <section className="mb-6">
            <h3 className="text-[11px] text-accent2 font-semibold uppercase tracking-wider mb-2">
              Scree plot — varianza spiegata
            </h3>
            <div className="h-[240px] w-full bg-surface3/30 rounded p-2">
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={{ x: 20 }}
                padding={{ top: 15, bottom: 50, left: 55, right: 20 }}
              >
                <VictoryAxis style={AXIS_STYLE} />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(value: number) => `${value.toFixed(0)}%`}
                  style={AXIS_STYLE}
                />
                <VictoryBar
                  data={scree}
                  style={{ data: { fill: '#4f9cf9' } }}
                  labels={({ datum }) => `${datum.y.toFixed(1)}%`}
                />
              </VictoryChart>
            </div>
          </section>
          <section className="mb-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
              <h3 className="text-[11px] text-accent2 font-semibold uppercase tracking-wider">
                Punteggi dei componenti
              </h3>
              <span className="text-[10px] text-text3 font-mono">PC1 × PC2</span>
            </div>
            <div className="h-[260px] w-full bg-surface3/30 rounded p-2">
              <VictoryChart
                theme={VictoryTheme.material}
                padding={{ top: 15, bottom: 55, left: 60, right: 25 }}
              >
                <VictoryAxis label={scoreData.length ? 'PC1' : ''} style={AXIS_STYLE} />
                <VictoryAxis dependentAxis label="PC2" style={AXIS_STYLE} />
                <VictoryScatter
                  data={scoreData}
                  size={3.5}
                  style={{ data: { fill: '#34d399', opacity: 0.75 } }}
                />
              </VictoryChart>
            </div>
          </section>
        </div>
      ),
    };
  }

  const result = cronbachAlpha(data, names);
  if (!result) {
    return {
      ok: false,
      reason: 'Cronbach alpha could not be computed: check constant items and complete rows',
    };
  }
  const tables = alphaTables(result);
  return {
    ok: true,
    tables,
    report: alphaReport(tables, result),
    node: (
      <div className="mb-6">
        <p className="text-[10px] text-text3 font-mono mb-3">
          {`Cronbach α · ${result.k} item · ${result.n} casi completi`}
        </p>
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
