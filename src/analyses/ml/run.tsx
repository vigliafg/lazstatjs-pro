import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { mlAnalysis } from '../../stats/kernels/ml';
import { GUARD_LIMITS, guardDimensions } from '../../stats/kernels/guards';
import { mlTables } from '../../stats/tables/ml';
import { mlReport } from '../../stats/reports/ml';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { MlParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface MlInput {
  grid: Dataset;
  params: MlParams;
}

export const buildMlOutput = ({ grid, params }: MlInput): AnalysisRunResult => {
  const predictors = Array.from(new Set(params.predictors)).filter(
    index => index !== params.outcome
  );
  if (predictors.length === 0) {
    return { ok: false, reason: 'Select at least one predictor different from the outcome' };
  }
  if (predictors.includes(params.outcome)) {
    return { ok: false, reason: 'The outcome cannot also be a predictor' };
  }
  const x: number[][] = [];
  const y: number[] = [];
  grid.rows.forEach(row => {
    const outcome = parseNum(row[params.outcome]);
    const values = predictors.map(index => parseNum(row[index]));
    if (!Number.isFinite(outcome) || values.some(value => !Number.isFinite(value))) return;
    y.push(outcome);
    x.push(values);
  });
  if (y.length < 6) {
    return { ok: false, reason: 'Machine learning needs at least six complete rows' };
  }
  const guard = guardDimensions(
    { rows: y.length, columns: predictors.length + 1 },
    GUARD_LIMITS.linear
  );
  if (guard.ok === false) return { ok: false, reason: guard.message };

  const variableNames = predictors.map(
    index => grid.cols[index]?.name ?? `X${index + 1}`
  );
  const outcomeName = grid.cols[params.outcome]?.name ?? 'Y';
  const result = mlAnalysis(x, y, {
    mode: params.mode,
    trees: params.trees,
    minNode: params.minNode,
    mtry: params.mtry,
    shrinkage: params.shrinkage,
    hidden: params.hidden,
    iterations: params.iterations,
    seed: params.seed,
    variableNames,
  });
  if (!result) {
    return { ok: false, reason: 'The model could not be fitted: check the outcome and the predictors' };
  }

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'ml-observed-predicted',
      kind: 'scatter',
      title: copy('Osservato e predetto'),
      subtitle: copy('{s1} osservazioni complete', { s1: result.n }),
      note: copy('Punti vicini alla diagonale indicano buone predizioni; la nuvola mostra dove il modello sbaglia di più.'),
      data: {
        points: result.predictions.map((predicted, index) => ({
          x: y[index],
          y: predicted,
        })),
      },
      fields: { xLabel: copy('Osservato'), yLabel: copy('Predetto') },
      options: { fit: 'none', band: 'none' } as never,
    }),
    makeChart({
      id: 'ml-residuals',
      kind: 'scatter',
      title: copy('Residui e valori predetti'),
      subtitle: copy('RMSE {s1}', { s1: result.rmse.toFixed(3) }),
      note: copy('Una nuvola senza struttura indica che il modello non lascia pattern sistematici; curve o imbuti suggeriscono nonlinearità o eteroschedasticità.'),
      data: {
        points: result.predictions.map((predicted, index) => ({
          x: predicted,
          y: result.residuals[index],
        })),
      },
      fields: { xLabel: copy('Predetto'), yLabel: copy('Residuo') },
      options: { fit: 'none', band: 'none', showMeanLine: true } as never,
    }),
  ];
  if (result.importance.length > 0) {
    charts.push(
      makeChart({
        id: 'ml-importance',
        kind: 'bar',
        title: copy('Importanza delle variabili'),
        subtitle: copy('Quota sulla riduzione totale'),
        note: copy('Barre più lunghe indicano variabili che riducono di più l’errore nei nodi; non implicano causalità.'),
        data: {
          bars: result.importance.map(item => ({
            category: variableNames[item.variable] ?? `X${item.variable + 1}`,
            value: item.pct,
          })),
        },
        fields: { xLabel: copy('Variabile'), yLabel: copy('Importanza %') },
        options: { valueLabels: true } as never,
      })
    );
  }

  return {
    ok: true,
    title: copy('Machine learning: {s1}', { s1: outcomeName }),
    header: copy('{s1} osservazioni · {s2} predittori · R² {s3}', {
      s1: result.n,
      s2: result.p,
      s3: result.r2.toFixed(3),
    }),
    tables: mlTables(result, variableNames),
    report: mlReport(result, variableNames, outcomeName),
    charts,
  };
};
