import { miStats } from '../../stats/kernels/mi';
import { miTables } from '../../stats/tables/mi';
import { miReport } from '../../stats/reports/mi';
import { copy } from '../../stats/reportCopy';
import { makeChart, ecdfRows } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { MiParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { isFiniteNumber } from '../shared/numbers';
import { parseNum } from '../../stats/core';

export interface MiInput {
  grid: Dataset;
  params: MiParams;
  ciLevel: number;
}

/** Imputazione multipla numerica con pooling di Rubin. */
export const buildMiOutput = ({ grid, params, ciLevel }: MiInput): AnalysisRunResult => {
  if (params.variables.length === 0) {
    return { ok: false, reason: 'Select at least one variable' };
  }
  if (!isFiniteNumber(params.imputations) || params.imputations < 2) {
    return { ok: false, reason: 'Imputations must be a finite number of at least 2' };
  }
  if (!isFiniteNumber(params.iterations) || params.iterations < 1) {
    return { ok: false, reason: 'Iterations must be a finite number of at least 1' };
  }
  const stats = miStats({
    rows: grid.rows,
    variables: params.variables,
    imputations: params.imputations,
    iterations: params.iterations,
    level: ciLevel,
    model: params.model,
    outcome: params.outcome,
    predictors: params.predictors,
  });
  if (!stats) {
    return {
      ok: false,
      reason: 'Multiple imputation needs at least two observed values per selected variable',
    };
  }

  const names = params.variables.map(index => grid.cols[index]?.name ?? `V${index + 1}`);
  const predictorNames = params.predictors.map(index => grid.cols[index]?.name ?? `X${index + 1}`);
  const tables = miTables(stats, names, ciLevel, predictorNames);
  const bars = names.flatMap((name, index) => {
    const variable = stats.variables[index];
    return variable
      ? [
          { category: name, value: variable.observed, series: copy('Osservato') },
          { category: name, value: variable.missing, series: copy('Mancante') },
        ]
      : [];
  });
  const maxMatrixRows = 120;
  const step = Math.max(1, Math.ceil(grid.rows.length / maxMatrixRows));
  const matrixCells = names.flatMap((name, column) =>
    grid.rows
      .map((row, index) => ({ row, index }))
      .filter(entry => entry.index % step === 0)
      .map(entry => ({
        x: name,
        y: `#${entry.index + 1}`,
        state: Number.isFinite(parseNum(entry.row[params.variables[column] ?? -1]))
          ? copy('Osservato')
          : copy('Mancante'),
      }))
  );
  const traceRows = names.flatMap((name, index) =>
    (stats.chainMeans[index] ?? []).map((value, iteration) => ({
      x: iteration + 1,
      y: value,
      series: name,
    }))
  );
  const observedCurve = ecdfRows(stats.observedValues[0] ?? [], copy('Osservato'));
  const completedCurve = ecdfRows(stats.imputedValues[0] ?? [], copy('Completato'));
  const pooled = stats.regression
    ? stats.regression.coefficients
        .filter(row => Number.isFinite(row.beta) && Number.isFinite(row.lo) && Number.isFinite(row.hi))
        .map((row, index) => ({
          label: index === 0 ? copy('Intercetta') : predictorNames[index - 1] ?? row.term,
          estimate: row.beta,
          lo: row.lo,
          hi: row.hi,
        }))
    : [];
  const charts = [
    makeChart({
      id: 'mi-observed-density',
      kind: 'histogram',
      title: copy('Distribuzione osservata: {s1}', { s1: names[0] ?? 'V1' }),
      subtitle: copy('{s1} valori osservati', { s1: stats.observedValues[0]?.length ?? 0 }),
      data: { values: (stats.observedValues[0] ?? []).map(value => ({ value })) },
      fields: { xLabel: names[0] ?? 'V1', yLabel: copy('Frequenza') },
      options: { bins: 16 } as never,
    }),
    makeChart({
      id: 'mi-completed-density',
      kind: 'histogram',
      title: copy('Distribuzione dopo l’imputazione: {s1}', { s1: names[0] ?? 'V1' }),
      subtitle: copy('{s1} valori completati', { s1: stats.imputedValues[0]?.length ?? 0 }),
      note: copy('Confronta la distribuzione osservata con quella completata dalle imputazioni.'),
      data: { values: (stats.imputedValues[0] ?? []).map(value => ({ value })) },
      fields: { xLabel: names[0] ?? 'V1', yLabel: copy('Frequenza') },
      options: { bins: 16 } as never,
    }),
    makeChart({
      id: 'mi-missingness',
      kind: 'missingness',
      title: copy('Valori osservati e mancanti'),
      subtitle: copy('{s1} righe · {s2} imputazioni', { s1: stats.n, s2: stats.imputations }),
      note: copy('La barra grigia misura i valori mancanti per variabile: sono i valori che l’imputazione ricostruisce.'),
      data: { bars },
      fields: { xLabel: copy('Variabile'), yLabel: copy('Conteggio'), series: copy('Stato') },
      options: { showLabels: true } as never,
    }),
  ];
  charts.push(
    makeChart({
      id: 'mi-missingness-matrix',
      kind: 'missingness',
      title: copy('Matrice dei valori mancanti'),
      subtitle: copy('{s1} righe mostrate · {s2} variabili', { s1: Math.ceil(grid.rows.length / step), s2: names.length }),
      note: copy('Ogni cella è una riga del dataset: il colore distingue valori osservati e mancanti. Le righe sono campionate se il dataset è molto grande.'),
      data: { cells: matrixCells },
      fields: { xLabel: copy('Variabile'), yLabel: copy('Riga'), series: copy('Stato') },
      options: { display: 'matrix' } as never,
    })
  );
  const patternCounts = new Map<string, number>();
  grid.rows.forEach(row => {
    const key = names
      .map((name, column) =>
        Number.isFinite(parseNum(row[params.variables[column] ?? -1])) ? `${name}: O` : `${name}: M`
      )
      .join(' · ');
    patternCounts.set(key, (patternCounts.get(key) ?? 0) + 1);
  });
  if (patternCounts.size > 0) {
    charts.push(
      makeChart({
        id: 'mi-patterns',
        kind: 'bar',
        title: copy('Pattern dei valori mancanti'),
        subtitle: copy('O = osservato · M = mancante'),
        note: copy('Ogni barra conta le righe con la stessa combinazione di valori osservati e mancanti; i pattern frequenti guidano la scelta del modello di imputazione.'),
        data: {
          bars: [...patternCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([category, value]) => ({ category, value })),
        },
        fields: { xLabel: copy('Pattern'), yLabel: copy('Righe') },
        options: { valueLabels: true } as never,
      })
    );
  }
  if (stats.iterations > 1 && traceRows.length > 0) {
    charts.push(
      makeChart({
        id: 'mi-trace',
        kind: 'line',
        title: copy('Convergenza delle catene'),
        subtitle: copy('Media della catena per iterazione, mediata sulle imputazioni'),
        note: copy('Le linee devono stabilizzarsi: un andamento sistematico dopo le prime iterazioni suggerisce che il numero di iterazioni è troppo basso.'),
        data: { series: traceRows },
        fields: { xLabel: copy('Iterazione'), yLabel: copy('Media'), series: copy('Variabile') },
        options: { showMarkers: false, showBand: false } as never,
      })
    );
  }
  if (observedCurve.length > 0 && completedCurve.length > 0) {
    charts.push(
      makeChart({
        id: 'mi-observed-completed',
        kind: 'ecdf',
        title: copy('Osservati e completati: {s1}', { s1: names[0] ?? 'V1' }),
        subtitle: copy('Funzione di ripartizione empirica'),
        note: copy('Una distanza sistematica tra le due curve indica che le imputazioni spostano la distribuzione della variabile.'),
        data: { points: [...observedCurve, ...completedCurve] },
        fields: { xLabel: names[0] ?? 'V1', yLabel: copy('Frequenza cumulata'), series: copy('Serie') },
        options: { showPoints: false, showMedian: false } as never,
      })
    );
  }
  if (pooled.length > 0) {
    charts.push(
      makeChart({
        id: 'mi-pooled-forest',
        kind: 'forest',
        title: copy('Coefficienti pooled'),
        subtitle: copy('Stima e IC {s1}% dopo il pooling di Rubin', { s1: ciLevel }),
        note: copy('Punto: coefficiente pooled. Segmento: intervallo di confidenza; se attraversa lo zero il termine non è distinguibile da zero.'),
        data: { points: pooled },
        fields: { xLabel: copy('Coefficiente'), yLabel: copy('Termine') },
        options: { reference: 'zero' } as never,
      })
    );
  }
  return {
    ok: true,
    title: copy('Imputazione multipla: {s1}', { s1: names.join(', ') }),
    tables,
    report: miReport(tables, stats, names, ciLevel),
    charts,
  };
};
