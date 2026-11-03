import { fitPls } from '../../stats/kernels/pls';
import { plsTables } from '../../stats/tables/pls';
import { plsReport } from '../../stats/reports/pls';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { fmtEst } from '../../stats/format';
import type { Dataset } from '../../grid/types';
import type { PlsParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface PlsInput {
  grid: Dataset;
  params: PlsParams;
  ciLevel: number;
}

/**
 * Regressione PLS1 (partial least squares a una risposta).
 *
 * Il kernel estrae le componenti latenti con l'algoritmo orthogonal scores di
 * `pls::plsr`; qui si validano i parametri, si costruisce la matrice dei
 * predittori originali e si impacchettano tabelle, report e grafici.
 */
export const buildPlsOutput = ({ grid, params }: PlsInput): AnalysisRunResult => {
  const { dep, indeps, components, cvFolds } = params;

  if (dep < 0 || dep >= grid.cols.length) {
    return { ok: false, reason: 'Select a valid dependent variable' };
  }
  if (indeps.length === 0) {
    return { ok: false, reason: 'Select at least one predictor' };
  }
  if (indeps.some(index => index < 0 || index >= grid.cols.length)) {
    return { ok: false, reason: 'Select valid predictors' };
  }
  if (indeps.includes(dep)) {
    return { ok: false, reason: 'The dependent variable cannot also be a predictor' };
  }
  if (!Number.isFinite(components) || !Number.isInteger(components)) {
    return { ok: false, reason: 'The number of components must be an integer' };
  }
  if (components < 1 || components > indeps.length) {
    return {
      ok: false,
      reason: `The number of components must be between 1 and ${indeps.length}`,
    };
  }
  if (!Number.isFinite(cvFolds) || !Number.isInteger(cvFolds) || cvFolds < 0 || cvFolds > 10) {
    return { ok: false, reason: 'Cross-validation folds must be an integer between 0 and 10' };
  }

  const complete = grid.rows
    .map((row, index) => ({ row, index }))
    .filter(entry => {
      if (!Number.isFinite(parseNum(entry.row[dep]))) return false;
      return indeps.every(index => Number.isFinite(parseNum(entry.row[index])));
    });

  // One score degree of freedom per component, plus the intercept: this is the
  // same bound enforced by pls::plsr (`ncomp <= nrow(X) - 1`).
  const minimumRows = Math.max(3, components + 1);
  if (complete.length < minimumRows) {
    return {
      ok: false,
      reason: `Not enough complete rows: the PLS model needs at least ${minimumRows} observations`,
    };
  }

  const y = complete.map(entry => parseNum(entry.row[dep]));
  const x = complete.map(entry => indeps.map(index => parseNum(entry.row[index])));
  const fit = fitPls({ y, x, components, cvFolds });
  if (!fit) {
    return {
      ok: false,
      reason:
        'The PLS model could not be estimated: check for constant, collinear or non-finite predictors',
    };
  }

  const depName = grid.cols[dep]?.name ?? 'Y';
  const predictorNames = indeps.map(
    (index, position) => grid.cols[index]?.name ?? `X${position + 1}`
  );
  const tables = plsTables(fit, { dep: depName, predictors: predictorNames });

  const allValues = [...y, ...fit.fitted];
  const min = allValues.length ? Math.min(...allValues) : 0;
  const max = allValues.length ? Math.max(...allValues) : 1;

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'pls-observed-fitted',
      kind: 'scatter',
      title: copy('Osservati vs predetti — {s1}', { s1: depName }),
      subtitle: copy('{s1} componenti · R² = {s2} · N = {s3}', {
        s1: components,
        s2: fmtEst(fit.r2, 3),
        s3: fit.n,
      }),
      note: copy('La diagonale è la corrispondenza perfetta: punti vicini alla retta indicano predizioni accurate.'),
      data: {
        points: fit.fitted.map((value, index) => ({
          x: value,
          y: y[index],
          __row: String(complete[index].index),
        })),
        fit: [
          { x: min, y: min },
          { x: max, y: max },
        ],
      },
      fields: { xLabel: copy('Valori predetti'), yLabel: copy('Valori osservati') },
      stats: { n: fit.n, r2: fit.r2 },
      options: { fit: 'none', band: 'none', showPoints: true } as never,
    }),
    makeChart({
      id: 'pls-cumulative-r2',
      kind: 'line',
      title: copy('R² cumulato per componente'),
      subtitle: copy('{s1} componenti estratte', { s1: components }),
      note: copy('La curva sale finché le componenti aggiungono segnale; un appiattimento precoce suggerisce di fermarsi prima.'),
      data: {
        series: fit.components.map((component, index) => ({
          x: index + 1,
          y: component.cumulativeR2,
        })),
      },
      fields: {
        xLabel: copy('Componente'),
        yLabel: copy('R² cumulato'),
        xType: 'nominal',
      },
      options: { showMarkers: true, showBand: false } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Regressione PLS — {s1}', { s1: depName }),
    header: copy('{s1} componenti · {s2} predittori · {s3} osservazioni', {
      s1: components,
      s2: indeps.length,
      s3: fit.n,
    }),
    tables,
    report: plsReport(tables),
    charts,
  };
};
