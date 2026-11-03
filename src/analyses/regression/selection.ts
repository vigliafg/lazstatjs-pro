import { parseNum } from '../../stats/core';
import { regressionStats } from '../../stats/kernels/regression';
import { bestSubsets, stepwiseSelection } from '../../stats/kernels/selection';
import { selectionTables } from '../../stats/tables/selection';
import { selectionReport } from '../../stats/reports/selection';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { RegParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface SelectionRunInput {
  grid: Dataset;
  regParams: RegParams;
  ciLevel: number;
}

export const buildSelectionOutput = ({ grid, regParams, ciLevel }: SelectionRunInput): AnalysisRunResult => {
  const { dep, indeps } = regParams;
  if (indeps.length < 1) {
    return { ok: false, reason: 'Select at least one candidate predictor' };
  }
  if (indeps.includes(dep)) {
    return { ok: false, reason: 'The dependent variable cannot also be a predictor' };
  }

  const validRows = grid.rows.filter(row => {
    if (!Number.isFinite(parseNum(row[dep]))) return false;
    return indeps.every(index => Number.isFinite(parseNum(row[index])));
  });
  if (validRows.length <= indeps.length + 1) {
    return { ok: false, reason: 'Insufficient complete rows for variable selection' };
  }

  const y = validRows.map(row => parseNum(row[dep]));
  const predictors = indeps.map(index => validRows.map(row => parseNum(row[index])));
  const names = indeps.map((index, position) => grid.cols[index]?.name ?? `X${position + 1}`);
  const criterion = regParams.selectionCriterion ?? 'bic';
  const direction = regParams.selectionDirection ?? 'both';

  const models = bestSubsets(y, predictors, criterion, Math.min(indeps.length, 8));
  const stepwise = stepwiseSelection(y, predictors, direction, criterion);
  if (!models || !stepwise) {
    return {
      ok: false,
      reason: 'Variable selection failed: check constant predictors or too few observations',
    };
  }

  const selectedColumns = stepwise.selected.map(index => indeps[index]);
  const final =
    selectedColumns.length > 0
      ? regressionStats(validRows, dep, selectedColumns, ciLevel, regParams.robustSE)
      : null;

  const tables = selectionTables(models, stepwise, names, final, ciLevel);
  const steps = stepwise.steps.filter(step => step.action !== 'start');

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'selection-criterion',
      kind: 'line',
      title: copy('Percorso del criterio'),
      subtitle: copy('{s1} a ogni passo della selezione', { s1: criterion.toUpperCase() }),
      data: {
        series: steps.map(step => ({
          x: step.step,
          y: criterion === 'aic' ? step.aic : criterion === 'bic' ? step.bic : step.adjR2,
          series: copy('Criterio'),
        })),
      },
      fields: { xLabel: copy('Passo'), yLabel: criterion.toUpperCase(), series: copy('Serie') },
      options: { showMarkers: true, showBand: false } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Selezione delle variabili — {s1}', { s1: grid.cols[dep]?.name ?? 'Y' }),
    tables,
    report: selectionReport(tables, ciLevel),
    charts,
  };
};
