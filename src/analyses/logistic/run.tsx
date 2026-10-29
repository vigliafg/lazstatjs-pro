import { fitLogistic, logisticProfileCurve, logisticReport, logisticTables } from '../../stats/logistic';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import type { Dataset } from '../../grid/types';
import type { LogisticParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { isFiniteNumber } from '../shared/numbers';

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

  if (!isFiniteNumber(cutoff) || cutoff <= 0 || cutoff >= 1) {
    return { ok: false, reason: 'Cut-off must be a number between 0 and 1' };
  }
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
  const outcomeName = grid.cols[outcome]?.name ?? 'Y';
  const header = `Outcome: ${outcomeName} · event = "${levels[1]}"`;

  const predictorName = predictorData[0].name;
  const means = predictorData.map((predictor) =>
    predictor.values.reduce((sum, value) => sum + value, 0) / Math.max(1, predictor.values.length)
  );
  const curve = logisticProfileCurve(model, predictorData[0].values, means.slice(1), 40);
  const multiple = predictors.length > 1;
  return {
    ok: true,
    title: copy('Regressione logistica: {s1}', { s1: outcomeName }),
    header,
    tables,
    report: logisticReport(tables, ciLevel),
    charts: [
      makeChart({
        id: 'logistic-curve',
        kind: 'line',
        title: copy('Curva di probabilità'),
        subtitle: multiple
          ? copy('{s1} · altri predittori alla media', { s1: predictorName })
          : predictorName,
        note: multiple
          ? copy('La curva mostra il profilo del primo predittore mantenendo gli altri al valore medio; i punti sono le osservazioni.')
          : copy('La curva è la probabilità stimata dall’esito (0–100%); i punti in alto sono le osservazioni con esito = 1, quelli in basso con esito = 0.'),
        data: {
          series: curve.map(point => ({ x: point.x, y: point.y, series: copy('Probabilità stimata') })),
          markers: rows.map(row => ({ x: row.values[0], y: row.y * 100, series: copy('Osservazioni') })),
        },
        fields: { xLabel: predictorName, yLabel: copy('Probabilità (%)'), series: copy('Serie') },
        options: { showMarkers: true, showBand: false } as never,
      }),
    ],
  };
};
