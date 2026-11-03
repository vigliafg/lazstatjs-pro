import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import {
  oneProportion,
  twoProportions,
  proportionInterval,
} from '../../stats/kernels/proportions';
import { onePoissonRate, twoPoissonRates } from '../../stats/kernels/poissonTests';
import {
  oneProportionTables,
  oneRateTables,
  twoProportionsTables,
  twoRateTables,
} from '../../stats/tables/proportions';
import { proportionsReport } from '../../stats/reports/proportions';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { ProportionParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface ProportionsInput {
  grid: Dataset;
  params: ProportionParams;
  ciLevel: number;
}

const columnName = (grid: Dataset, index: number, fallback = 'Y'): string =>
  grid.cols[index]?.name ?? fallback;

const textValues = (grid: Dataset, index: number): string[] =>
  grid.rows
    .map(row => String(row[index] ?? '').trim())
    .filter(value => value.length > 0);

const levelsOf = (values: string[]): string[] =>
  Array.from(new Set(values)).sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0
  );

const numericValues = (grid: Dataset, index: number, integer = false): number[] =>
  grid.rows
    .map(row => parseNum(row[index]))
    .filter(
      value =>
        Number.isFinite(value) &&
        value >= 0 &&
        (!integer || Math.abs(value - Math.round(value)) < 1e-9)
    );

/** Grouped string+number extraction that keeps only complete rows. */
const grouped = (
  grid: Dataset,
  groupIndex: number,
  valueMapper: (row: readonly string[]) => number | null
): { group: string; value: number }[] =>
  grid.rows.flatMap(row => {
    const group = String(row[groupIndex] ?? '').trim();
    const value = valueMapper(row);
    return group !== '' && value !== null ? [{ group, value }] : [];
  });

export const buildProportionsOutput = ({
  grid,
  params,
  ciLevel,
}: ProportionsInput): AnalysisRunResult => {
  if (params.variable < 0 || params.variable >= grid.cols.length) {
    return { ok: false, reason: 'Select a variable' };
  }
  const variableName = columnName(grid, params.variable);

  if (params.mode === 'oneProp') {
    const values = textValues(grid, params.variable);
    const levels = levelsOf(values);
    if (levels.length === 0) {
      return { ok: false, reason: 'The proportion mode needs a non-empty categorical variable' };
    }
    const successLevel = levels.includes(params.successLevel)
      ? params.successLevel
      : levels[levels.length - 1];
    const successes = values.filter(value => value === successLevel).length;
    const result = oneProportion(successes, values.length, params.nullP, ciLevel);
    if (!result) {
      return {
        ok: false,
        reason: 'The proportion test needs at least one observation and a null proportion between 0 and 1',
      };
    }
    const chart: AnalysisChart = makeChart({
      id: 'prop-one-interval',
      kind: 'interval',
      title: copy('Proporzione osservata'),
      subtitle: copy('“{s1}” in {s2}', { s1: successLevel, s2: variableName }),
      data: {
        intervals: [
          {
            category: variableName,
            estimate: result.estimate,
            lo: result.interval.wilsonLo,
            hi: result.interval.wilsonHi,
          },
        ],
      },
      fields: { xLabel: copy('Variable'), yLabel: copy('Proportion') },
      options: { valueLabels: true, showMeanDiamond: false, sort: 'none' } as never,
    });
    return {
      ok: true,
      title: copy('Proporzione — {s1}', { s1: variableName }),
      tables: oneProportionTables(result, variableName, successLevel),
      report: proportionsReport({
        mode: 'oneProp',
        result,
        variableName,
        successLevel,
        level: ciLevel,
      }),
      charts: [chart],
    };
  }

  if (params.mode === 'twoProp') {
    if (params.group < 0 || params.group >= grid.cols.length) {
      return { ok: false, reason: 'The two-sample mode needs a group column' };
    }
    const groupName = columnName(grid, params.group, 'Group');
    const pairs = grid.rows
      .map(row => ({
        group: String(row[params.group] ?? '').trim(),
        value: String(row[params.variable] ?? '').trim(),
      }))
      .filter(pair => pair.group !== '' && pair.value !== '');
    const groups = levelsOf(pairs.map(pair => pair.group));
    if (groups.length !== 2) {
      return { ok: false, reason: 'The two-sample proportion test needs exactly two groups' };
    }
    const values = pairs.map(pair => pair.value);
    const levels = levelsOf(values);
    const successLevel = levels.includes(params.successLevel)
      ? params.successLevel
      : levels[levels.length - 1];
    const counts = groups.map(group => {
      const rows = pairs.filter(pair => pair.group === group);
      return {
        group,
        successes: rows.filter(pair => pair.value === successLevel).length,
        trials: rows.length,
      };
    });
    const result = twoProportions(
      counts[0].successes,
      counts[0].trials,
      counts[1].successes,
      counts[1].trials,
      ciLevel
    );
    if (!result) {
      return { ok: false, reason: 'The two-sample proportion test could not be computed' };
    }
    const intervals = counts.map(entry => {
      const interval = proportionInterval(entry.successes, entry.trials, ciLevel);
      return {
        category: entry.group,
        estimate: interval.estimate,
        lo: interval.wilsonLo,
        hi: interval.wilsonHi,
      };
    });
    return {
      ok: true,
      title: copy('Due proporzioni — {s1} per {s2}', { s1: variableName, s2: groupName }),
      tables: twoProportionsTables(result, variableName, groupName),
      report: proportionsReport({
        mode: 'twoProp',
        result,
        variableName,
        groupName,
        level: ciLevel,
      }),
      charts: [
        makeChart({
          id: 'prop-two-interval',
          kind: 'interval',
          title: copy('Proporzioni per gruppo'),
          subtitle: copy('“{s1}” in {s2}', { s1: successLevel, s2: variableName }),
          data: { intervals },
          fields: { xLabel: groupName, yLabel: copy('Proportion') },
          options: { valueLabels: true, showMeanDiamond: false, sort: 'none' } as never,
        }),
      ],
    };
  }

  if (params.mode === 'oneRate') {
    const counts = numericValues(grid, params.variable, true);
    if (counts.length === 0) {
      return { ok: false, reason: 'The rate mode needs a non-negative integer count column' };
    }
    const events = counts.reduce((sum, value) => sum + value, 0);
    const exposure = params.exposure * counts.length;
    const result = onePoissonRate(events, exposure, params.nullRate, ciLevel);
    if (!result) {
      return { ok: false, reason: 'The Poisson rate could not be computed: check exposure and null rate' };
    }
    return {
      ok: true,
      title: copy('Tasso di Poisson — {s1}', { s1: variableName }),
      tables: oneRateTables(result, variableName),
      report: proportionsReport({ mode: 'oneRate', result, variableName, level: ciLevel }),
      charts: [
        makeChart({
          id: 'rate-one-interval',
          kind: 'interval',
          title: copy('Tasso osservato'),
          subtitle: copy('{s1} eventi su esposizione {s2}', {
            s1: events,
            s2: result.exposure.toFixed(1),
          }),
          data: {
            intervals: [
              { category: variableName, estimate: result.rate, lo: result.lo, hi: result.hi },
            ],
          },
          fields: { xLabel: copy('Variable'), yLabel: copy('Rate') },
          options: { valueLabels: true, showMeanDiamond: false, sort: 'none' } as never,
        }),
      ],
    };
  }

  if (params.group < 0 || params.group >= grid.cols.length) {
    return { ok: false, reason: 'The two-sample mode needs a group column' };
  }
  const groupName = columnName(grid, params.group, 'Group');
  const pairs = grouped(grid, params.group, row => {
    const value = parseNum(row[params.variable]);
    return Number.isFinite(value) && value >= 0 && Math.abs(value - Math.round(value)) < 1e-9
      ? value
      : null;
  });
  const groups = levelsOf(pairs.map(pair => pair.group));
  if (groups.length !== 2) {
    return { ok: false, reason: 'The two-sample rate test needs exactly two groups' };
  }
  const counts = groups.map(group => {
    const rows = pairs.filter(pair => pair.group === group);
    return {
      group,
      events: rows.reduce((sum, pair) => sum + pair.value, 0),
      exposure: params.exposure * rows.length,
    };
  });
  const result = twoPoissonRates(
    counts[0].events,
    counts[0].exposure,
    counts[1].events,
    counts[1].exposure,
    ciLevel
  );
  if (!result) {
    return { ok: false, reason: 'The two-sample rate test could not be computed' };
  }
  return {
    ok: true,
    title: copy('Due tassi — {s1} per {s2}', { s1: variableName, s2: groupName }),
    tables: twoRateTables(result, variableName, groupName),
    report: proportionsReport({
      mode: 'twoRate',
      result,
      variableName,
      groupName,
      level: ciLevel,
    }),
    charts: [
      makeChart({
        id: 'rate-two-interval',
        kind: 'interval',
        title: copy('Rapporto tra tassi'),
        subtitle: copy('Rapporto {s1}', { s1: result.ratio.toFixed(2) }),
        data: {
          intervals: [
            {
              category: copy('Rate ratio'),
              estimate: result.ratio,
              lo: result.lo,
              hi: result.hi,
            },
          ],
        },
        fields: { xLabel: groupName, yLabel: copy('Rate') },
        options: { valueLabels: true, showMeanDiamond: false, sort: 'none' } as never,
      }),
    ],
  };
};
