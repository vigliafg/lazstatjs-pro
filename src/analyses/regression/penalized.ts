import { parseNum } from '../../stats/core';
import { fitPenalized, penalizedPath } from '../../stats/kernels/penalized';
import { penalizedTables } from '../../stats/tables/penalized';
import { penalizedReport } from '../../stats/reports/penalized';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { RegParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface PenalizedRunInput {
  grid: Dataset;
  regParams: RegParams;
  ciLevel: number;
}

export const buildPenalizedOutput = ({ grid, regParams, ciLevel }: PenalizedRunInput): AnalysisRunResult => {
  const { dep, indeps } = regParams;
  if (indeps.length === 0) return { ok: false, reason: 'Select at least one predictor' };
  if (indeps.includes(dep)) return { ok: false, reason: 'The dependent variable cannot also be a predictor' };
  if (!Number.isFinite(regParams.lambda) || (regParams.lambda ?? 0) < 0) {
    return { ok: false, reason: 'λ must be a non-negative number' };
  }

  const rows = grid.rows.filter(row => {
    if (!Number.isFinite(parseNum(row[dep]))) return false;
    return indeps.every(index => Number.isFinite(parseNum(row[index])));
  });
  if (rows.length <= indeps.length + 1) {
    return { ok: false, reason: 'Insufficient complete rows for the penalized model' };
  }

  const y = rows.map(row => parseNum(row[dep]));
  const x = rows.map(row => indeps.map(index => parseNum(row[index])));
  const penalty = regParams.penalty ?? 'lasso';
  const lambda = regParams.lambda ?? 0.1;
  const alpha = penalty === 'ridge' ? 0 : penalty === 'lasso' ? 1 : regParams.penaltyAlpha ?? 0.5;

  const fit = fitPenalized({ y, x, penalty, lambda, alpha });
  if (!fit) {
    return { ok: false, reason: 'The penalized model could not be estimated' };
  }

  const depName = grid.cols[dep]?.name ?? 'Y';
  const predictorNames = indeps.map((index, position) => grid.cols[index]?.name ?? `X${position + 1}`);
  const tables = penalizedTables(fit, { dep: depName, predictors: predictorNames }, ciLevel);

  const lambdas = lambda > 0
    ? Array.from({ length: 8 }, (_, index) => lambda * Math.pow(10, 1 - index * (2 / 7)))
    : [0];
  const path = penalizedPath({ y, x, penalty, alpha }, lambdas);
  const pathSeries = predictorNames.flatMap((name, position) =>
    path.map(result => ({
      x: result.lambda,
      y: result.coefficients[position],
      series: name,
    }))
  );

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'penalized-path',
      kind: 'line',
      title: copy('Percorso dei coefficienti'),
      subtitle: copy('{s1} · α = {s2}', { s1: penalty, s2: alpha.toFixed(2) }),
      data: { series: pathSeries },
      fields: { xLabel: 'λ', yLabel: copy('Coefficiente'), series: copy('Predittore') },
      options: { showMarkers: false, showBand: false } as never,
    }),
    makeChart({
      id: 'penalized-coefficients-chart',
      kind: 'bar',
      title: copy('Coefficienti al λ scelto'),
      subtitle: `λ = ${lambda}`,
      data: {
        bars: predictorNames.map((name, index) => ({
          category: name,
          value: fit.coefficients[index],
        })),
      },
      fields: { xLabel: copy('Predittore'), yLabel: copy('Coefficiente'), series: copy('Serie') },
      options: { showMarkers: false, showBand: false } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Regressione penalizzata — {s1}', { s1: depName }),
    tables,
    report: penalizedReport(tables, depName, ciLevel),
    charts,
  };
};
