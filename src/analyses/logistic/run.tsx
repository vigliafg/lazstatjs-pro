import {
  calibrationCurve,
  fitLogistic,
  logisticProfileCurve,
  logisticReport,
  logisticTables,
  rocCurve,
} from '../../stats/logistic';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { jStat } from '../../stats/jstat';
import type { Dataset } from '../../grid/types';
import type { LogisticParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
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
  const charts: AnalysisChart[] = [
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
  ];
  const roc = rocCurve(y, model.fitted);
  if (roc.length > 2) {
    charts.push(
      makeChart({
        id: 'logistic-roc',
        kind: 'line',
        title: copy('Curva ROC'),
        subtitle: copy('Sensibilità vs 1 − specificità · AUC = {s1}', { s1: model.auc.toFixed(3) }),
        note: copy('La diagonale rappresenta l’assenza di discriminazione; una curva più alta verso l’angolo superiore sinistro indica maggiore capacità discriminante.'),
        data: {
          series: [
            ...roc.map(point => ({
              x: point.fpr * 100,
              y: point.tpr * 100,
              series: copy('Curva ROC'),
            })),
            { x: 0, y: 0, series: copy('Nessuna discriminazione'), step: 0 },
            { x: 100, y: 100, series: copy('Nessuna discriminazione'), step: 0 },
          ],
        },
        fields: {
          xLabel: copy('1 − specificità (%)'),
          yLabel: copy('Sensibilità (%)'),
          series: copy('Serie'),
        },
        options: { showMarkers: false, showBand: false, step: true } as never,
      })
    );
  }
  const calibration = calibrationCurve(y, model.fitted);
  if (calibration.length > 0) {
    charts.push(
      makeChart({
        id: 'logistic-calibration',
        kind: 'line',
        title: copy('Calibrazione del modello'),
        subtitle: copy('Probabilità osservata vs probabilità stimata'),
        note: copy('I punti sono i decili di probabilità stimata; la diagonale indica calibrazione perfetta.'),
        data: {
          series: [
            ...calibration.map(point => ({
              x: point.predicted * 100,
              y: point.observed * 100,
              series: copy('Calibrazione'),
            })),
            { x: 0, y: 0, series: copy('Calibrazione perfetta') },
            { x: 100, y: 100, series: copy('Calibrazione perfetta') },
          ],
        },
        fields: {
          xLabel: copy('Probabilità stimata (%)'),
          yLabel: copy('Probabilità osservata (%)'),
          series: copy('Serie'),
        },
        options: { showMarkers: true, showBand: false } as never,
      })
    );
  }
  const predicted = model.fitted.map(value => (value >= cutoff ? 1 : 0));
  const counts = [
    { observed: 0, predicted: 0, value: 0 },
    { observed: 0, predicted: 1, value: 0 },
    { observed: 1, predicted: 0, value: 0 },
    { observed: 1, predicted: 1, value: 0 },
  ];
  y.forEach((value, index) => {
    const cell = counts.find(item => item.observed === value && item.predicted === predicted[index]);
    if (cell) cell.value += 1;
  });
  charts.push(
    makeChart({
      id: 'logistic-confusion',
      kind: 'heatmap',
      title: copy('Matrice di confusione'),
      subtitle: copy('Soglia {s1}', { s1: cutoff }),
      note: copy('Righe: esito osservato. Colonne: classe predetta. La diagonale contiene le classificazioni corrette.'),
      data: {
        cells: counts.map(cell => ({
          x: cell.predicted === 1 ? copy('Predetto 1') : copy('Predetto 0'),
          y: cell.observed === 1 ? copy('Osservato 1') : copy('Osservato 0'),
          value: cell.value,
          label: String(cell.value),
        })),
      },
      fields: { xLabel: copy('Classe predetta'), yLabel: copy('Esito osservato') },
      options: { showValues: true, diverging: false } as never,
    })
  );
  const zCritical = jStat.normal.inv(1 - (1 - ciLevel / 100) / 2, 0, 1);
  const orPoints = model.names
    .map((name, index) => ({
      label: name,
      beta: model.beta[index],
      se: model.se[index],
    }))
    .slice(1)
    .filter(row => Number.isFinite(row.beta) && Number.isFinite(row.se))
    .map(row => ({
      label: row.label,
      estimate: Math.exp(row.beta),
      lo: Math.exp(row.beta - zCritical * row.se),
      hi: Math.exp(row.beta + zCritical * row.se),
    }));
  if (orPoints.length > 0) {
    charts.push(
      makeChart({
        id: 'logistic-or-forest',
        kind: 'forest',
        title: copy('Odds ratio per predittore'),
        subtitle: copy('IC {s1}% · riferimento OR = 1', { s1: ciLevel }),
        note: copy('Punto: odds ratio. Segmento: intervallo di confidenza. Se l’intervallo contiene 1 il predittore non è distinguibile da nessun effetto.'),
        data: { points: orPoints },
        fields: { xLabel: copy('Odds ratio'), yLabel: copy('Predittore') },
        options: { reference: 'one' } as never,
      })
    );
  }
  const scale = model.fitted.reduce((sum, value) => sum + value * (1 - value), 0) / Math.max(1, model.fitted.length);
  const marginalBars = model.names
    .map((name, index) => ({ name, beta: model.beta[index] }))
    .slice(1)
    .filter(row => Number.isFinite(row.beta))
    .map(row => ({ category: row.name, value: scale * row.beta }));
  if (marginalBars.length > 0) {
    charts.push(
      makeChart({
        id: 'logistic-marginal',
        kind: 'bar',
        title: copy('Effetti marginali medi'),
        subtitle: copy('Variazione media della probabilità per una unità in più'),
        note: copy('L’effetto marginale medio approssima di quanto cambia la probabilità predetta quando il predittore aumenta di una unità, mediando sulle osservazioni.'),
        data: { bars: marginalBars, rules: [{ value: 0 }] },
        fields: { xLabel: copy('Predittore'), yLabel: copy('Effetto marginale') },
        options: { valueLabels: true, referenceLine: 'none' } as never,
      })
    );
  }
  return {
    ok: true,
    title: copy('Regressione logistica: {s1}', { s1: outcomeName }),
    header,
    tables,
    report: logisticReport(tables, ciLevel),
    charts,
  };
};
