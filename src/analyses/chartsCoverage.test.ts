import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'vega-lite';
import { buildVegaSpec } from '../charts/vega/buildSpec';
import { buildLogisticOutput } from './logistic/run';
import { buildStratifiedCoxOutput } from './stratcox/run';
import { buildRepeatedAnovaOutput } from './repeatedanova/run';
import { buildAncovaOutput } from './ancova/run';
import { buildCorrelationOutput } from './correlation/run';
import { buildMiOutput } from './mi/run';
import { buildRegressionOutput } from './regression/run';
import { buildTTestOutput } from './ttest/run';
import { buildDescriptiveOutput } from './descriptive/run';
import { buildDistributionFitOutput } from './distfit/run';
import { DEFAULT_PARAMS } from '../io/project';
import { meanCI } from '../stats/distributions';
import type { AnalysisRunResult } from './types';
import type { ColType, GridData } from '../grid/types';

const numeric = (names: string[]): { name: string; type: ColType }[] =>
  names.map(name => ({ name, type: 'num' }));

const chartsOf = (result: AnalysisRunResult) => {
  assert.ok('ok' in result && result.ok, 'reason' in result ? result.reason : 'failed');
  if (!('ok' in result) || !result.ok) return [];
  for (const chart of result.charts) {
    assert.doesNotThrow(() => compile(buildVegaSpec(chart)), chart.id);
  }
  return result.charts;
};

test('logistic regression produces a profile chart with multiple predictors', () => {
  const grid: GridData = {
    cols: numeric(['Y', 'X1', 'X2']),
    rows: Array.from({ length: 30 }, (_, i) => [
      String(i % 2),
      String((i * 7) % 11),
      String((i * 5) % 13),
    ]),
  };
  const charts = chartsOf(
    buildLogisticOutput({
      grid,
      params: { outcome: 0, predictors: [1, 2], cutoff: 0.5, penalized: false },
      ciLevel: 95,
    })
  );
  assert.equal(charts[0]?.id, 'logistic-curve');
  assert.ok(Array.isArray(charts[0]?.data.series));
});

test('stratified Cox adds Kaplan-Meier curves per stratum', () => {
  const grid: GridData = {
    cols: numeric(['T', 'E', 'X']).concat([{ name: 'S', type: 'cat' }]),
    rows: Array.from({ length: 40 }, (_, i) => [
      String((i % 10) + 1),
      String(i % 3 === 0 ? 1 : 0),
      String((i % 7) / 7),
      String.fromCharCode(65 + (i % 2)),
    ]),
  };
  const charts = chartsOf(
    buildStratifiedCoxOutput({
      grid,
      params: { time: 0, event: 1, covariates: [2], stratum: 3 },
      ciLevel: 95,
    })
  );
  assert.deepEqual(charts.map(chart => chart.kind), ['forest', 'survival', 'line', 'risk']);
});

test('repeated ANOVA adds CI bars and subject trajectories', () => {
  const grid: GridData = {
    cols: numeric(['A', 'B', 'C']),
    rows: Array.from({ length: 6 }, (_, i) => [String(i + 1), String(i + 2), String(i + 3)]),
  };
  const charts = chartsOf(
    buildRepeatedAnovaOutput({ grid, params: { selected: [0, 1, 2] }, ciLevel: 95 })
  );
  assert.equal(charts.length, 3);
  const bars = charts[0].data.bars ?? [];
  assert.ok(bars.every(row => row.lo !== undefined && row.hi !== undefined));
  assert.equal(charts[1].id, 'repeated-trajectories');
  assert.equal(charts[2].id, 'repeated-change');
});

test('ANCOVA bars expose the adjusted confidence interval', () => {
  const grid: GridData = {
    cols: [
      { name: 'Y', type: 'num' },
      { name: 'G', type: 'cat' },
      { name: 'X', type: 'num' },
    ],
    rows: Array.from({ length: 20 }, (_, i) => [
      String(i + (i % 2) * 2),
      i % 2 === 0 ? 'A' : 'B',
      String(i % 5),
    ]),
  };
  const charts = chartsOf(
    buildAncovaOutput({ grid, params: { response: 0, factor: 1, covariates: [2] }, ciLevel: 95 })
  );
  const bars = charts[0].data.bars ?? [];
  assert.ok(bars.some(row => row.lo !== null && row.hi !== null));
});

test('correlation with more than two variables includes the matrix heatmap', () => {
  const grid: GridData = {
    cols: numeric(['A', 'B', 'C']),
    rows: Array.from({ length: 20 }, (_, i) => [String(i), String(i * 2), String(i * 3 + (i % 2))]),
  };
  const charts = chartsOf(
    buildCorrelationOutput({ grid, corrParams: { vars: [0, 1, 2], method: 'pearson', showSpearman: true, showKendall: false }, ciLevel: 95 })
  );
  assert.ok(charts.some(chart => chart.id === 'corr-heatmap'));
});

test('MI uses the missingness chart kind', () => {
  const grid: GridData = {
    cols: numeric(['X', 'Y']),
    rows: [['1', '2'], ['', '3'], ['3', ''], ['4', '5'], ['', '6'], ['6', '7']],
  };
  const charts = chartsOf(
    buildMiOutput({
      grid,
      params: { variables: [0, 1], imputations: 3, iterations: 2, model: 'descriptives', outcome: 0, predictors: [1] },
      ciLevel: 95,
    })
  );
  assert.ok(charts.some(chart => chart.kind === 'missingness'));
});

test('regression residual plot uses the residual chart kind', () => {
  const grid: GridData = {
    cols: numeric(['Y', 'X1', 'X2']),
    rows: Array.from({ length: 20 }, (_, i) => [String(i + i % 3), String(i), String((i * 2) % 5)]),
  };
  const charts = chartsOf(
    buildRegressionOutput({ grid, regParams: { dep: 0, indeps: [1, 2], useNonParam: false, robustEstimator: 'theilsen', robustSE: 'none' }, ciLevel: 95 })
  );
  assert.ok(charts.some(chart => chart.kind === 'residual'));
});

test('descriptive interval plot uses the t-based confidence interval', () => {
  const values = ['1', '2', '3', '4', '5'];
  const result = buildDescriptiveOutput({
    rows: values.map(value => [value]),
    columnNames: ['X'],
    indices: [0],
    level: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const chart = (result.charts ?? []).find(item => item.id === 'desc-interval');
  assert.ok(chart);
  const rows = chart!.data.intervals ?? [];
  const expected = meanCI([1, 2, 3, 4, 5], 95);
  assert.equal(rows.length, 1);
  assert.ok(Math.abs(Number(rows[0].lo) - expected.lo) < 1e-9);
  assert.ok(Math.abs(Number(rows[0].hi) - expected.hi) < 1e-9);
  // With n = 5 the t critical value (≈2.776) is wider than the normal one (1.96).
  assert.ok(Number(rows[0].lo) < 3 - 1.96 * (Math.sqrt(2.5) / Math.sqrt(5)));
});

test('distribution fit compiles the P-P, density and criteria charts', () => {
  const grid: GridData = {
    cols: numeric(['X']),
    rows: ['1', '2', '3', '4', '5', '6', '7', '8'].map(value => [value]),
  };
  const charts = chartsOf(
    buildDistributionFitOutput({ grid, params: DEFAULT_PARAMS.distfit, ciLevel: 95 })
  );
  assert.deepEqual(
    charts.map(chart => chart.id),
    ['distfit-probability', 'distfit-pp', 'distfit-density', 'distfit-criteria']
  );
});

test('one-sample t-test draws the test-value rule', () => {
  const grid: GridData = {
    cols: numeric(['X']),
    rows: Array.from({ length: 10 }, (_, i) => [String(i + 1)]),
  };
  const charts = chartsOf(
    buildTTestOutput({ grid, ttestParams: { type: 'one', var1: 0, var2: 0, mu: 5, useNonParam: true, equalVar: true }, ciLevel: 95 })
  );
  assert.deepEqual(charts[0].data.rules, [{ y: 5 }]);
});
