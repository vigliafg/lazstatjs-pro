import { addIntercept } from '../../stats/kernels/glm';
import { fitQuantile } from '../../stats/kernels/quantile';
import { quantileTables } from '../../stats/tables/quantile';
import { quantileReport } from '../../stats/reports/quantile';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { fmtEst } from '../../stats/format';
import type { Dataset } from '../../grid/types';
import type { QuantileParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface QuantileInput {
  grid: Dataset;
  params: QuantileParams;
}

/**
 * Regressione quantilica su un singolo quantile τ.
 *
 * Il kernel risolve il problema di programmazione lineare con il simplesso
 * Barrodale–Roberts; qui si validano i parametri, si costruisce la matrice di
 * design con l'intercetta e si impacchettano tabelle, report e grafici.
 */
export const buildQuantileOutput = ({
  grid,
  params,
}: QuantileInput): AnalysisRunResult => {
  const { dep, indeps, tau } = params;

  if (!Number.isFinite(tau) || tau <= 0 || tau >= 1) {
    return { ok: false, reason: 'The target quantile must be a number between 0 and 1' };
  }
  if (indeps.length === 0) {
    return { ok: false, reason: 'Select at least one predictor' };
  }
  if (dep < 0 || dep >= grid.cols.length) {
    return { ok: false, reason: 'Select a valid dependent variable' };
  }
  if (indeps.some(index => index < 0 || index >= grid.cols.length)) {
    return { ok: false, reason: 'Select valid predictors' };
  }
  if (indeps.includes(dep)) {
    return { ok: false, reason: 'The dependent variable cannot also be a predictor' };
  }

  const complete = grid.rows
    .map((row, index) => ({ row, index }))
    .filter(entry => {
      if (!Number.isFinite(parseNum(entry.row[dep]))) return false;
      return indeps.every(index => Number.isFinite(parseNum(entry.row[index])));
    });

  const parameterCount = indeps.length + 1;
  if (complete.length < parameterCount + 2) {
    return {
      ok: false,
      reason: `Not enough complete rows: the quantile model needs at least ${parameterCount + 2} observations`,
    };
  }

  const y = complete.map(entry => parseNum(entry.row[dep]));
  const x = addIntercept(
    complete.map(entry => indeps.map(index => parseNum(entry.row[index])))
  );
  const fit = fitQuantile({ y, x, tau });
  if (!fit) {
    return {
      ok: false,
      reason:
        'The quantile regression could not be estimated: check for constant or collinear predictors',
    };
  }

  const depName = grid.cols[dep]?.name ?? 'Y';
  const predictorNames = indeps.map(
    (index, position) => grid.cols[index]?.name ?? `X${position + 1}`
  );
  const tables = quantileTables(fit, { dep: depName, predictors: predictorNames });

  const firstPredictor = indeps[0];
  const firstValues = complete.map(entry => parseNum(entry.row[firstPredictor]));
  const means = indeps.map(index => {
    const values = complete.map(entry => parseNum(entry.row[index]));
    return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
  });

  // Con più predittori un grafico a due assi non può mostrare l'iperpiano:
  // si disegna il profilo del primo predittore mantenendo gli altri alla loro
  // media (stessa scelta del logistico). Il grafico dei residui resta sempre
  // disponibile e non dipende dal numero di predittori.
  const otherMeanContribution = fit.coefficients
    .slice(2)
    .reduce((sum, coefficient, position) => sum + coefficient.beta * (means[position + 1] ?? 0), 0);
  const profileAt = (value: number): number =>
    fit.coefficients[0].beta +
    fit.coefficients[1].beta * value +
    otherMeanContribution;

  const minX = Math.min(...firstValues);
  const maxX = Math.max(...firstValues);
  const multiple = indeps.length > 1;
  const quantileLabel = fmtEst(fit.tau, 2);
  const points = complete.map((entry, index) => ({
    x: parseNum(entry.row[firstPredictor]),
    y: y[index],
    __row: String(entry.index),
  }));

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'quantile-line',
      kind: 'scatter',
      title: copy('Regressione quantilica: {s1} per {s2}', {
        s1: depName,
        s2: predictorNames[0],
      }),
      subtitle: multiple
        ? copy('{s1} · altri predittori alla media · τ = {s2}', {
            s1: predictorNames[0],
            s2: quantileLabel,
          })
        : copy('{s1} · τ = {s2}', { s1: predictorNames[0], s2: quantileLabel }),
      note: multiple
        ? copy('Punti: osservazioni. Retta: profilo del quantile τ per il primo predittore, con gli altri predittori al valore medio.')
        : copy('Punti: osservazioni. Retta: quantile τ stimato. La pendenza è la variazione del quantile per una unità in più del predittore.'),
      data: {
        points,
        fit: [
          { x: minX, y: profileAt(minX) },
          { x: maxX, y: profileAt(maxX) },
        ],
      },
      fields: { xLabel: predictorNames[0], yLabel: depName },
      stats: { tau: fit.tau, n: fit.n, p: fit.p },
      options: { fit: 'ols', band: 'none', showBand: false, showPoints: true } as never,
    }),
    makeChart({
      id: 'quantile-residuals',
      kind: 'residual',
      title: copy('Residui del modello quantilico'),
      subtitle: copy('Valori stimati vs residui · τ = {s1}', { s1: quantileLabel }),
      note: copy('I residui sono la risposta meno il quantile τ stimato: una nuvola senza struttura è coerente con il modello.'),
      data: {
        points: fit.fitted.map((value, index) => ({
          x: value,
          y: fit.residuals[index],
          __row: String(complete[index].index),
        })),
        rules: [{ y: 0 }],
      },
      fields: { xLabel: copy('Valori stimati'), yLabel: copy('Residui') },
      options: { showPoints: true, showZeroLine: true } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Regressione quantilica — {s1}', { s1: depName }),
    header: copy('Quantile τ = {s1} · {s2} osservazioni · {s3} predittori', {
      s1: quantileLabel,
      s2: fit.n,
      s3: indeps.length,
    }),
    tables,
    report: quantileReport(tables),
    charts,
  };
};
