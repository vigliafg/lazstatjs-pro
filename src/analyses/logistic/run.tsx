import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
} from 'victory';
import { fitLogistic, logisticCurve, logisticReport, logisticTables } from '../../stats/logistic';
import { ResultTables } from '../../components/ResultTable';
import { parseNum } from '../../stats/core';
import type { Dataset } from '../../grid/types';
import type { LogisticParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface LogisticInput {
  grid: Dataset;
  params: LogisticParams;
  ciLevel: number;
}

/** Regressione logistica: tabelle, curva (un predittore) e report. */
export const buildLogisticOutput = ({
  grid,
  params,
  ciLevel,
}: LogisticInput): AnalysisRunResult => {
  const { outcome, predictors, cutoff, penalized } = params;

  if (predictors.length === 0) {
    return { ok: false, reason: 'Select at least one predictor' };
  }
  if (predictors.includes(outcome)) {
    return { ok: false, reason: 'The outcome cannot also be a predictor' };
  }

  const levels = Array.from(
    new Set(
      grid.rows
        .map(row => String(row[outcome] ?? '').trim())
        .filter(value => value !== '')
    )
  ).sort();
  if (levels.length !== 2) {
    return {
      ok: false,
      reason: 'The outcome needs exactly two distinct values (for example 0/1 or yes/no)',
    };
  }

  const rows = grid.rows
    .map(row => {
      const label = String(row[outcome] ?? '').trim();
      const values = predictors.map(index => parseNum(row[index]));
      if (label === '' || values.some(value => !Number.isFinite(value))) return null;
      return { y: label === levels[1] ? 1 : 0, values };
    })
    .filter((row): row is { y: number; values: number[] } => row !== null);

  if (rows.length < 5) {
    return {
      ok: false,
      reason: 'Not enough complete rows: the outcome and all predictors must be numeric and present',
    };
  }

  const y = rows.map(row => row.y);
  const predictorData = predictors.map((index, position) => ({
    name: grid.cols[index]?.name ?? `X${position + 1}`,
    values: rows.map(row => row.values[position]),
  }));

  const model = fitLogistic(y, predictorData, ciLevel, cutoff, penalized);
  if (!model) {
    return {
      ok: false,
      reason: 'The model could not be estimated: check for constant predictors or a single outcome class',
    };
  }

  const tables = logisticTables(model, ciLevel, cutoff);

  if (predictors.length === 1) {
    const curve = logisticCurve(model, predictorData[0].values, 40);
    return {
      ok: true,
      tables,
      report: logisticReport(tables, ciLevel),
      node: (
        <div className="mb-6">
          <p className="text-[10px] text-text3 font-mono mb-3">
            {`Outcome: ${grid.cols[outcome]?.name} · event = "${levels[1]}" · predictor: ${predictorData[0].name}`}
          </p>
          <ResultTables specs={tables} />
          <section className="mb-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
              <h3 className="text-[11px] text-accent2 font-semibold uppercase tracking-wider">
                Curva di probabilità
              </h3>
              <span className="text-[10px] text-text3 font-mono">{predictorData[0].name}</span>
            </div>
            <div className="h-[280px] w-full bg-surface3/30 rounded p-2">
              <VictoryChart theme={VictoryTheme.material} padding={{ top: 15, bottom: 50, left: 65, right: 25 }} domain={{ y: [0, 100] }}>
                <VictoryAxis
                  label={predictorData[0].name}
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
                <VictoryLine data={curve} style={{ data: { stroke: '#4f9cf9', strokeWidth: 2 } }} />
                <VictoryScatter
                  data={rows.map(row => ({
                    x: row.values[0],
                    y: row.y * 100,
                  }))}
                  style={{ data: { fill: '#34d399', size: 2, fillOpacity: 0.5 } }}
                />
              </VictoryChart>
            </div>
            <p className="text-[10px] text-text3 mt-1">
              La curva è la probabilità stimata dall’esito (0–100%); i punti verdi in alto sono le osservazioni con esito = 1, quelli in basso con esito = 0.
            </p>
          </section>
        </div>
      ),
    };
  }

  return {
    ok: true,
    tables,
    report: logisticReport(tables, ciLevel),
    node: (
      <div className="mb-6">
        <p className="text-[10px] text-text3 font-mono mb-3">
          {`Outcome: ${grid.cols[outcome]?.name} · event = "${levels[1]}"`}
        </p>
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
