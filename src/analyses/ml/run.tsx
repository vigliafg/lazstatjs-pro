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
  const classification = params.task === 'classification';
  const x: number[][] = [];
  const y: number[] = [];
  const rawOutcomes: string[] = [];
  grid.rows.forEach(row => {
    const values = predictors.map(index => parseNum(row[index]));
    if (values.some(value => !Number.isFinite(value))) return;
    if (classification) {
      const label = String(row[params.outcome] ?? '').trim();
      if (label === '') return;
      rawOutcomes.push(label);
      y.push(0);
    } else {
      const outcome = parseNum(row[params.outcome]);
      if (!Number.isFinite(outcome)) return;
      y.push(outcome);
    }
    x.push(values);
  });
  if (y.length < 6) {
    return { ok: false, reason: 'Machine learning needs at least six complete rows' };
  }
  const classes = classification
    ? [...new Set(rawOutcomes)].sort((a, b) => a.localeCompare(b))
    : [];
  if (classification && classes.length < 2) {
    return { ok: false, reason: 'Classification needs an outcome with at least two observed classes' };
  }
  const codes = classification
    ? rawOutcomes.map(label => classes.indexOf(label))
    : [];
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
    task: params.task,
    classes,
    classCodes: codes,
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

  const charts: AnalysisChart[] = classification
    ? [
        makeChart({
          id: 'ml-confusion',
          kind: 'heatmap',
          title: copy('Matrice di confusione'),
          subtitle: copy('Classi osservate e classi predette'),
          note: copy('La diagonale contiene le classificazioni corrette; le celle fuori diagonale sono gli errori, con la classe osservata sulla riga e quella predetta sulla colonna.'),
          data: {
            cells: result.confusion.flatMap((row, actual) =>
              row.map((value, predicted) => ({
                x: classes[predicted] ?? `C${predicted + 1}`,
                y: classes[actual] ?? `C${actual + 1}`,
                value,
                label: String(value),
              }))
            ),
          },
          fields: { xLabel: copy('Predetta'), yLabel: copy('Osservata') },
          options: { showValues: true } as never,
        }),
        makeChart({
          id: 'ml-recall',
          kind: 'bar',
          title: copy('Sensibilità per classe'),
          subtitle: copy('Quota di osservazioni corrette dentro ogni classe'),
          note: copy('La sensibilità è la quota di casi di una classe riconosciuti dal modello; classi rare con sensibilità bassa vanno lette insieme alla matrice di confusione.'),
          data: {
            bars: result.confusion.map((row, index) => {
              const total = row.reduce((sum, value) => sum + value, 0);
              return {
                category: classes[index] ?? `C${index + 1}`,
                value: total > 0 ? (100 * row[index]) / total : 0,
              };
            }),
          },
          fields: { xLabel: copy('Classe'), yLabel: copy('Sensibilità %') },
          options: { valueLabels: true } as never,
        }),
      ]
    : [
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
    header: classification
      ? copy('{s1} osservazioni · {s2} predittori · accuratezza {s3}%', {
          s1: result.n,
          s2: result.p,
          s3: (100 * result.accuracy).toFixed(1),
        })
      : copy('{s1} osservazioni · {s2} predittori · R² {s3}', {
          s1: result.n,
          s2: result.p,
          s3: result.r2.toFixed(3),
        }),
    tables: mlTables(result, variableNames, classes),
    report: mlReport(result, variableNames, outcomeName, classes),
    charts,
  };
};
