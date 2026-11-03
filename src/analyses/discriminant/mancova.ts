import { parseNum } from '../../stats/core';
import { mancova } from '../../stats/kernels/mancova';
import { mancovaTables } from '../../stats/tables/mancova';
import { mancovaReport } from '../../stats/reports/mancova';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { DiscriminantParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface MancovaRunInput {
  grid: Dataset;
  params: DiscriminantParams;
  ciLevel: number;
}

/** MANCOVA: several outcomes, one factor and one or more covariates. */
export const buildMancovaOutput = ({ grid, params, ciLevel }: MancovaRunInput): AnalysisRunResult => {
  const group = params.group;
  const outcomes = Array.from(new Set(params.predictors)).filter(index => index !== group);
  const covariates = Array.from(new Set(params.covariates ?? [])).filter(
    index => index !== group && !outcomes.includes(index)
  );
  if (group < 0) return { ok: false, reason: 'Select the group column' };
  if (outcomes.length === 0) return { ok: false, reason: 'Select at least one dependent variable' };
  if (covariates.length === 0) return { ok: false, reason: 'Select at least one covariate' };

  const rows = grid.rows
    .map(row => ({
      label: String(row[group] ?? '').trim(),
      outcomes: outcomes.map(index => parseNum(row[index])),
      covariates: covariates.map(index => parseNum(row[index])),
    }))
    .filter(
      row =>
        row.label !== '' &&
        row.outcomes.every(Number.isFinite) &&
        row.covariates.every(Number.isFinite)
    );
  if (rows.length < outcomes.length + covariates.length + 6) {
    return { ok: false, reason: 'Not enough complete rows for MANCOVA' };
  }
  const labels = rows.map(row => row.label);
  if (new Set(labels).size < 2) {
    return { ok: false, reason: 'The group column needs at least two levels' };
  }

  const outcomeNames = outcomes.map((index, position) => grid.cols[index]?.name ?? `Y${position + 1}`);
  const covariateNames = covariates.map(
    (index, position) => grid.cols[index]?.name ?? `C${position + 1}`
  );
  const result = mancova({
    ys: rows.map(row => row.outcomes),
    labels,
    covariates: rows.map(row => row.covariates),
    variableNames: outcomeNames,
    covariateNames,
  });
  if (!result) {
    return {
      ok: false,
      reason:
        'MANCOVA could not be estimated: check constant covariates, groups that are too small and complete rows',
    };
  }

  const groupName = grid.cols[group]?.name ?? 'Group';
  const tables = mancovaTables(result, ciLevel);
  const charts: AnalysisChart[] = [
    makeChart({
      id: 'mancova-adjusted-means',
      kind: 'line',
      title: copy('Medie aggiustate per gruppo'),
      subtitle: copy('Al netto di {s1}', { s1: covariateNames.join(', ') }),
      data: {
        series: result.univariate.flatMap(item =>
          item.adjusted.map(entry => ({
            x: entry.group,
            y: entry.mean,
            series: item.variable,
          }))
        ),
      },
      fields: { xLabel: groupName, yLabel: copy('Media aggiustata'), series: copy('Variabile') },
      options: { showMarkers: true, showBand: false } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('MANCOVA — {s1}', { s1: groupName }),
    tables,
    report: mancovaReport(tables, groupName, covariateNames, ciLevel),
    charts,
  };
};
