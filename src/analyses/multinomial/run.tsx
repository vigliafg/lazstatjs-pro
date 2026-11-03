import { fitMultinomial } from '../../stats/kernels/multinomial';
import { addIntercept } from '../../stats/kernels/glm';
import { multinomialTables } from '../../stats/tables/multinomial';
import { multinomialReport } from '../../stats/reports/multinomial';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import type { Dataset } from '../../grid/types';
import type { MultinomialParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface MultinomialInput {
  grid: Dataset;
  params: MultinomialParams;
  ciLevel: number;
}

/**
 * Multinomial logistic regression for a nominal outcome with three or more
 * classes. The kernel works on integer codes, so the builder orders the
 * observed labels and encodes every complete row by its class index.
 */
export const buildMultinomialOutput = ({
  grid,
  params,
  ciLevel,
}: MultinomialInput): AnalysisRunResult => {
  const { outcome, predictors } = params;

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
  if (levels.length < 3) {
    return {
      ok: false,
      reason: 'The outcome needs at least three distinct values (for example low/medium/high)',
    };
  }

  const rows = grid.rows
    .map(row => {
      const label = String(row[outcome] ?? '').trim();
      const values = predictors.map(index => parseNum(row[index]));
      if (label === '' || values.some(value => !Number.isFinite(value))) return null;
      const y = levels.indexOf(label);
      return y >= 0 ? { y, values } : null;
    })
    .filter((row): row is { y: number; values: number[] } => row !== null);

  const parameterCount = (levels.length - 1) * (predictors.length + 1);
  if (rows.length <= parameterCount) {
    return {
      ok: false,
      reason: `Not enough complete rows: ${levels.length} classes with ${predictors.length} predictor(s) need more than ${parameterCount} observations`,
    };
  }

  const seen = new Set(rows.map(row => row.y));
  if (seen.size !== levels.length) {
    return {
      ok: false,
      reason: 'Every outcome class needs at least one complete row with all predictors',
    };
  }

  const y = rows.map(row => row.y);
  const design = addIntercept(rows.map(row => row.values));
  const model = fitMultinomial({ y, x: design, classes: levels });
  if (!model) {
    return {
      ok: false,
      reason:
        'The model could not be estimated: check for constant predictors or perfectly separated classes',
    };
  }

  const outcomeName = grid.cols[outcome]?.name ?? 'Y';
  const predictorNames = predictors.map(
    (index, position) => grid.cols[index]?.name ?? `X${position + 1}`
  );
  const tables = multinomialTables(model, y, predictorNames, ciLevel);

  const classAccuracy = model.classes.map((label, classIndex) => {
    const total = y.reduce((sum, value) => sum + (value === classIndex ? 1 : 0), 0);
    const correct = model.predicted.reduce(
      (sum, value, index) => sum + (value === classIndex && y[index] === classIndex ? 1 : 0),
      0
    );
    return {
      label,
      total,
      correct,
      accuracy: total > 0 ? (correct / total) * 100 : 0,
    };
  });

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'multinomial-probabilities',
      kind: 'bar',
      title: copy('Distribuzione delle classi predette'),
      subtitle: copy('N = {s1} · accuratezza {s2}%', {
        s1: model.n,
        s2: (model.accuracy * 100).toFixed(1),
      }),
      note: copy(
        'Ogni barra conta quante osservazioni sono state assegnate a una classe dal modello. Una distribuzione molto sbilanciata rispetto alle classi osservate segnala che il modello privilegia le categorie più frequenti.'
      ),
      data: {
        bars: model.classes.map((label, classIndex) => ({
          category: label,
          value: model.predicted.reduce(
            (sum, value) => sum + (value === classIndex ? 1 : 0),
            0
          ),
        })),
      },
      fields: { xLabel: copy('Classe predetta'), yLabel: copy('Osservazioni') },
      options: { valueLabels: true, referenceLine: 'none' } as never,
    }),
    makeChart({
      id: 'multinomial-accuracy',
      kind: 'bar',
      title: copy('Accuratezza per classe'),
      subtitle: copy('Accuratezza complessiva {s1}%', {
        s1: (model.accuracy * 100).toFixed(1),
      }),
      note: copy(
        'L’accuratezza per classe è la quota di osservazioni di quella classe classificate correttamente. Le classi con pochi casi hanno stime più incerte.'
      ),
      data: {
        bars: classAccuracy.map(row => ({
          category: row.label,
          value: row.accuracy,
        })),
        rules: [{ value: model.accuracy * 100 }],
      },
      fields: { xLabel: copy('Classe osservata'), yLabel: copy('Accuratezza (%)') },
      options: { valueLabels: true, referenceLine: 'none' } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Regressione logistica multinomiale: {s1}', { s1: outcomeName }),
    header: copy('Esito: {s1} · riferimento = "{s2}"', { s1: outcomeName, s2: levels[0] }),
    tables,
    report: multinomialReport(tables, ciLevel),
    charts,
  };
};
