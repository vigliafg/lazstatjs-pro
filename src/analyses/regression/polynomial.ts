import { parseNum } from '../../stats/core';
import { fitPolynomial, polynomialCurve } from '../../stats/kernels/polynomial';
import { polynomialTables } from '../../stats/tables/polynomial';
import { polynomialReport } from '../../stats/reports/polynomial';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { RegParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface PolynomialRunInput {
  grid: Dataset;
  regParams: RegParams;
  ciLevel: number;
}

export const buildPolynomialOutput = ({ grid, regParams, ciLevel }: PolynomialRunInput): AnalysisRunResult => {
  const { dep, indeps } = regParams;
  const degree = Math.min(12, Math.max(1, Math.round(regParams.degree ?? 2)));
  const predictor = indeps[0];
  if (predictor === undefined || predictor < 0) {
    return { ok: false, reason: 'Select one predictor for the polynomial curve' };
  }
  if (predictor === dep) {
    return { ok: false, reason: 'The predictor must differ from the dependent variable' };
  }

  const points = grid.rows
    .map(row => ({ x: parseNum(row[predictor]), y: parseNum(row[dep]) }))
    .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (points.length < degree + 2) {
    return { ok: false, reason: 'Not enough complete rows for this polynomial degree' };
  }

  const fit = fitPolynomial(
    points.map(point => point.x),
    points.map(point => point.y),
    degree,
    ciLevel
  );
  if (!fit) {
    return { ok: false, reason: 'The polynomial model could not be estimated' };
  }

  const depName = grid.cols[dep]?.name ?? 'Y';
  const predictorName = grid.cols[predictor]?.name ?? 'X';
  const names = { dep: depName, predictor: predictorName };
  const tables = polynomialTables(fit, names, ciLevel);
  const curve = polynomialCurve(
    fit,
    points.map(point => point.x),
    60
  );

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'polynomial-curve',
      kind: 'scatter',
      title: copy('Curva polinomiale'),
      subtitle: copy('Grado {s1} · R² = {s2}', { s1: degree, s2: fit.r2.toFixed(3) }),
      data: {
        series: [
          ...points.map(point => ({ x: point.x, y: point.y, series: copy('Osservazioni') })),
          ...curve.map(point => ({ x: point.x, y: point.y, series: copy('Curva stimata') })),
        ],
      },
      fields: { xLabel: predictorName, yLabel: depName, series: copy('Serie') },
      options: { showMarkers: true, showBand: false } as never,
    }),
    makeChart({
      id: 'polynomial-residuals',
      kind: 'residual',
      title: copy('Residui'),
      subtitle: copy('Residui rispetto ai valori stimati'),
      data: {
        series: fit.fitted.map((value, index) => ({
          x: value,
          y: fit.residuals[index],
          series: copy('Residui'),
        })),
      },
      fields: { xLabel: copy('Valori stimati'), yLabel: copy('Residuo'), series: copy('Serie') },
      options: { showMarkers: true, showBand: false } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Regressione polinomiale — {s1}', { s1: depName }),
    tables,
    report: polynomialReport(tables, names, ciLevel),
    charts,
  };
};
