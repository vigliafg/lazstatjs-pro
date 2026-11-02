import { copy } from '../../stats/reportCopy';
import { boxRows, makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { oneVariance, severalVariances } from '../../stats/kernels/variances';
import { oneVarianceTables, twoVarianceTables } from '../../stats/tables/variances';
import { variancesReport } from '../../stats/reports/variances';
import type { Dataset } from '../../grid/types';
import type { VarianceParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface VariancesInput {
  grid: Dataset;
  params: VarianceParams;
  ciLevel: number;
}

export const buildVariancesOutput = ({
  grid,
  params,
  ciLevel,
}: VariancesInput): AnalysisRunResult => {
  if (params.variable < 0 || params.variable >= grid.cols.length) {
    return { ok: false, reason: 'Select a numeric variable' };
  }
  const variableName = grid.cols[params.variable]?.name ?? 'Y';
  const values = grid.rows
    .map(row => parseNum(row[params.variable]))
    .filter(value => Number.isFinite(value));

  if (params.mode === 'one') {
    const result = oneVariance(values, params.nullVariance, ciLevel);
    if (!result) {
      return {
        ok: false,
        reason:
          'The variance test needs at least two observations with a positive variance and a positive null variance',
      };
    }
    return {
      ok: true,
      title: copy('Varianza — {s1}', { s1: variableName }),
      tables: oneVarianceTables(result, variableName),
      report: variancesReport({ mode: 'one', result, variableName, level: ciLevel }),
      charts: [
        makeChart({
          id: 'var-one-interval',
          kind: 'interval',
          title: copy('Varianza e intervallo'),
          subtitle: copy('{s1} osservazioni', { s1: result.n }),
          data: {
            intervals: [
              { category: variableName, estimate: result.variance, lo: result.lo, hi: result.hi },
            ],
          },
          fields: { xLabel: copy('Variable'), yLabel: copy('Variance') },
          options: { valueLabels: true, showMeanDiamond: false, sort: 'none' } as never,
        }),
      ],
    };
  }

  if (params.group < 0 || params.group >= grid.cols.length) {
    return { ok: false, reason: 'The equality test needs a group column' };
  }
  const groupName = grid.cols[params.group]?.name ?? 'Group';
  const buckets = new Map<string, number[]>();
  grid.rows.forEach(row => {
    const label = String(row[params.group] ?? '').trim();
    const value = parseNum(row[params.variable]);
    if (label === '' || !Number.isFinite(value)) return;
    const bucket = buckets.get(label) ?? [];
    bucket.push(value);
    buckets.set(label, bucket);
  });
  const groups = [...buckets.entries()]
    .sort((left, right) => (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0))
    .map(([name, groupValues]) => ({ name, values: groupValues }));
  const result = severalVariances(groups, ciLevel);
  if (!result) {
    return {
      ok: false,
      reason: 'The equality test needs at least two groups with at least two observations each',
    };
  }

  const boxes = boxRows(
    groups.map(group => ({
      category: group.name,
      values: group.values,
      keys: group.values.map((_, index) => String(index)),
    })),
    { level: ciLevel }
  );

  return {
    ok: true,
    title: copy('Varianze — {s1} per {s2}', { s1: variableName, s2: groupName }),
    tables: twoVarianceTables(result, variableName, groupName),
    report: variancesReport({ mode: 'two', result, variableName, groupName, level: ciLevel }),
    charts: [
      makeChart({
        id: 'var-box',
        kind: 'box',
        title: copy('Dispersione per gruppo'),
        subtitle: copy('{s1} gruppi', { s1: result.groups.length }),
        note: copy('Confronta l’altezza delle scatole e la lunghezza dei baffi: varianze uguali danno dispersioni simili.'),
        data: { summary: boxes.summary, points: boxes.points, outliers: boxes.outliers },
        fields: { xLabel: groupName, yLabel: variableName },
        options: { showPoints: true, showMean: true } as never,
      }),
    ],
  };
};
