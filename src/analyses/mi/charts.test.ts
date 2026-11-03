import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMiOutput } from './run';
import { MAX_CHARTS_PER_OUTPUT } from '../../stats/charts';

const grid = {
  cols: [
    { name: 'X', type: 'num' as const },
    { name: 'Y', type: 'num' as const },
  ],
  rows: [
    ['1', '2'],
    ['', '3'],
    ['3', ''],
    ['4', '5'],
    ['', '6'],
    ['6', '7'],
  ],
};

const base = {
  grid,
  params: {
    variables: [0, 1],
    imputations: 3,
    iterations: 2,
    model: 'descriptives' as const,
    outcome: 0,
    predictors: [1],
  },
  ciLevel: 95,
};

test('multiple imputation stays under the chart cap', () => {
  const result = buildMiOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const charts = result.charts ?? [];
  assert.ok(
    charts.length <= MAX_CHARTS_PER_OUTPUT,
    `mi emits ${charts.length} charts, the cap is ${MAX_CHARTS_PER_OUTPUT}`
  );
  // Descriptives path: the whole diagnostic set fits without trimming Q-Q plots.
  assert.equal(charts.length, 8);
  const ids = charts.map(chart => chart.id);
  assert.deepEqual(ids, [
    'mi-observed-density',
    'mi-completed-density',
    'mi-missingness',
    'mi-missingness-matrix',
    'mi-patterns',
    'mi-trace',
    'mi-observed-completed',
    'mi-strip',
  ]);
});
