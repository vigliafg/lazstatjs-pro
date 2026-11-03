import { fitNonlinear, nonlinearModelValue } from '../../stats/kernels/nonlinear';
import { nonlinearModelLabel, nonlinearTables } from '../../stats/tables/nonlinear';
import { nonlinearReport } from '../../stats/reports/nonlinear';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import type { Dataset } from '../../grid/types';
import type { NonlinearParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface NonlinearInput {
  grid: Dataset;
  params: NonlinearParams;
  ciLevel: number;
}

const CURVE_POINTS = 60;

/** Ascissa della curva stimata: griglia uniforme sull'intervallo osservato. */
const curveGrid = (values: number[]): number[] => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (max - min <= 0) return [min];
  return Array.from({ length: CURVE_POINTS }, (_, index) => min + ((max - min) * index) / (CURVE_POINTS - 1));
};

/** Regressione non lineare: parametri, curva stimata, residui e report. */
export const buildNonlinearOutput = ({
  grid,
  params,
  ciLevel,
}: NonlinearInput): AnalysisRunResult => {
  const { dep, predictor, model } = params;

  if (dep < 0 || dep >= grid.cols.length || predictor < 0 || predictor >= grid.cols.length) {
    return { ok: false, reason: 'Select a numeric dependent variable and a numeric predictor' };
  }
  if (dep === predictor) {
    return { ok: false, reason: 'The dependent variable and the predictor must be different columns' };
  }

  const pairs: Array<{ x: number; y: number }> = [];
  grid.rows.forEach(row => {
    const x = parseNum(row[predictor]);
    const y = parseNum(row[dep]);
    if (Number.isFinite(x) && Number.isFinite(y)) pairs.push({ x, y });
  });

  if (pairs.length < 4) {
    return {
      ok: false,
      reason: 'Not enough complete rows: at least 4 pairs with a finite predictor and response are needed',
    };
  }

  const x = pairs.map(pair => pair.x);
  const y = pairs.map(pair => pair.y);
  const result = fitNonlinear({ y, x, model });
  if (!result) {
    return {
      ok: false,
      reason:
        'The model did not converge or the data do not support it: try another curve, check the predictor values or collect more observations',
    };
  }

  const depName = grid.cols[dep]?.name ?? 'Y';
  const predictorName = grid.cols[predictor]?.name ?? 'X';
  const label = nonlinearModelLabel(model);
  const estimates = result.parameters.map(parameter => parameter.estimate);

  const observations = [...pairs].sort((left, right) => left.x - right.x);
  const curve = curveGrid(x)
    .map(value => ({ x: value, y: nonlinearModelValue(model, estimates, value) }))
    .filter(point => Number.isFinite(point.y));

  const tables = nonlinearTables(result, { dep: depName, predictor: predictorName });

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'nonlinear-curve',
      kind: 'scatter',
      title: copy('Curva non lineare — {s1}', { s1: depName }),
      subtitle: copy('{s1} · R² = {s2} · N = {s3}', {
        s1: label,
        s2: result.r2.toFixed(3),
        s3: result.n,
      }),
      note: copy('I punti sono le osservazioni; la curva è il modello {s1} stimato ai minimi quadrati.', {
        s1: label,
      }),
      data: {
        points: observations,
        fit: curve,
      },
      fields: { xLabel: predictorName, yLabel: depName },
      stats: { n: result.n, r2: result.r2 },
      options: { fit: 'ols', band: 'none' } as never,
    }),
    makeChart({
      id: 'nonlinear-residuals',
      kind: 'residual',
      title: copy('Residui — {s1}', { s1: depName }),
      subtitle: copy('Residui rispetto ai valori stimati · N = {s1}', { s1: result.n }),
      note: copy('Una nuvola senza struttura attorno allo zero è coerente con il modello; pattern sistematici indicano che la curva scelta non descrive i dati.'),
      data: {
        points: result.fitted.map((value, index) => ({ x: value, y: result.residuals[index] })),
        rules: [{ y: 0 }],
      },
      fields: { xLabel: copy('Valori stimati'), yLabel: copy('Residui'), series: copy('Serie') },
      stats: { n: result.n, residSd: result.rmse },
      options: { showPoints: true, showZeroLine: true } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Regressione non lineare — {s1}', { s1: depName }),
    header: copy('{s1} su {s2} · modello {s3}', {
      s1: depName,
      s2: predictorName,
      s3: label,
    }),
    tables,
    report: nonlinearReport(tables, { dep: depName, predictor: predictorName }, ciLevel),
    charts,
  };
};
