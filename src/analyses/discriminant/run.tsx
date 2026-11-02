import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { discriminantAnalysis } from '../../stats/kernels/discriminant';
import { discriminantTables } from '../../stats/tables/discriminant';
import { discriminantReport } from '../../stats/reports/discriminant';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { DiscriminantParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface DiscriminantInput {
  grid: Dataset;
  params: DiscriminantParams;
  ciLevel: number;
}

/** LDA with canonical plot, profile plot and the one-way MANOVA table. */
export const buildDiscriminantOutput = ({
  grid,
  params,
}: DiscriminantInput): AnalysisRunResult => {
  const group = params.group;
  const predictors = Array.from(new Set(params.predictors)).filter(index => index !== group);
  if (predictors.length === 0) {
    return { ok: false, reason: 'Select at least one numeric predictor' };
  }
  if (group < 0) {
    return { ok: false, reason: 'Select the group column' };
  }

  const rows = grid.rows
    .map(row => ({
      label: String(row[group] ?? '').trim(),
      values: predictors.map(index => parseNum(row[index])),
    }))
    .filter(row => row.label !== '' && row.values.every(Number.isFinite));
  if (rows.length < 6) {
    return {
      ok: false,
      reason: 'Discriminant analysis needs at least six complete rows with a non-empty group',
    };
  }
  const labels = rows.map(row => row.label);
  const groups = Array.from(new Set(labels));
  if (groups.length < 2) {
    return { ok: false, reason: 'The group column needs at least two levels' };
  }

  const variableNames = predictors.map(index => grid.cols[index]?.name ?? `V${index + 1}`);
  const result = discriminantAnalysis({
    data: rows.map(row => row.values),
    labels,
    variableNames,
  });
  if (!result) {
    return {
      ok: false,
      reason:
        'The discriminant model could not be estimated: check constant variables, small groups and complete rows',
    };
  }

  const groupName = grid.cols[group]?.name ?? 'Gruppo';
  const tables = discriminantTables({ result, variableNames, groupName });
  const grand = variableNames.map((_, variable) =>
    rows.reduce((sum, row) => sum + row.values[variable], 0) / rows.length
  );
  const sds = variableNames.map((_, variable) => {
    const variance =
      rows.reduce((sum, row) => sum + Math.pow(row.values[variable] - grand[variable], 2), 0) /
      Math.max(1, rows.length - 1);
    return Math.sqrt(variance);
  });
  const profileRows = result.means.flatMap((mean, groupIndex) =>
    mean.map((value, variable) => ({
      x: variableNames[variable] ?? `V${variable + 1}`,
      y: sds[variable] > 0 ? (value - grand[variable]) / sds[variable] : 0,
      series: groups[groupIndex] ?? `G${groupIndex + 1}`,
    }))
  );
  const coefficientCells = variableNames.flatMap((name, variable) =>
    groups.map((label, groupIndex) => ({
      x: label,
      y: name,
      value: result.coefficients[groupIndex]?.[variable] ?? 0,
      label: (result.coefficients[groupIndex]?.[variable] ?? 0).toFixed(2),
    }))
  );

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'discriminant-canonical',
      kind: 'scatter',
      title: copy('Grafico canonico'),
      subtitle: copy('LD1 × LD2 · {s1} gruppi', { s1: groups.length }),
      note: copy('Ogni punto è un caso proiettato sulle prime due funzioni discriminanti; i gruppi lontani sono più facili da separare. Con una sola funzione il secondo asse è zero.'),
      data: {
        points: result.canonicalScores.map((score, index) => ({
          x: score[0] ?? 0,
          y: score[1] ?? 0,
          group: labels[index] ?? '',
        })),
        centroids: result.centroids.map(centroid => ({
          x: centroid.x,
          y: centroid.y,
          label: centroid.group,
        })),
      },
      fields: { xLabel: 'LD1', yLabel: 'LD2', series: groupName },
      options: { fit: 'none', band: 'none', pointLabels: false, pointOpacity: 0.7 } as never,
    }),
    makeChart({
      id: 'discriminant-profile',
      kind: 'line',
      title: copy('Profilo delle medie per gruppo'),
      subtitle: copy('Medie standardizzate delle variabili'),
      note: copy('Ogni linea è un gruppo: linee parallele indicano che i gruppi differiscono allo stesso modo su tutte le variabili; linee che si incrociano indicano un profilo diverso.'),
      data: { series: profileRows },
      fields: {
        xLabel: copy('Variabile'),
        yLabel: copy('Media standardizzata'),
        series: groupName,
        xType: 'nominal',
      },
      options: { showMarkers: true, showBand: false } as never,
    }),
    makeChart({
      id: 'discriminant-coefficients',
      kind: 'heatmap',
      title: copy('Coefficienti discriminanti'),
      subtitle: copy('Peso di ogni variabile in ogni gruppo'),
      note: copy('Il colore mostra segno e intensità del coefficiente: variabili con pesi opposti separano i gruppi in direzioni diverse. La scala è comune a tutte le celle.'),
      data: { cells: coefficientCells },
      fields: { xLabel: groupName, yLabel: copy('Variabile') },
      options: { showValues: true, diverging: true } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Analisi discriminante / MANOVA'),
    header: copy('{s1} gruppi · {s2} predittori · N = {s3}', {
      s1: groups.length,
      s2: predictors.length,
      s3: result.n,
    }),
    tables,
    report: discriminantReport(result, variableNames, groupName),
    charts,
  };
};
