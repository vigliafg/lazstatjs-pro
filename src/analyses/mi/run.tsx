import { miStats } from '../../stats/kernels/mi';
import { miTables } from '../../stats/tables/mi';
import { miReport } from '../../stats/reports/mi';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { MiParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { isFiniteNumber } from '../shared/numbers';

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
  return {
    ok: true,
    title: copy('Imputazione multipla: {s1}', { s1: names.join(', ') }),
    tables,
    report: miReport(tables, stats, names, ciLevel),
    charts: [
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
        kind: 'bar',
        title: copy('Valori osservati e mancanti'),
        subtitle: copy('{s1} righe · {s2} imputazioni', { s1: stats.n, s2: stats.imputations }),
        note: copy('La barra grigia misura i valori mancanti per variabile: sono i valori che l’imputazione ricostruisce.'),
        data: { bars },
        fields: { xLabel: copy('Variabile'), yLabel: copy('Conteggio'), series: copy('Stato') },
        options: { valueLabels: true } as never,
      }),
    ],
  };
};
