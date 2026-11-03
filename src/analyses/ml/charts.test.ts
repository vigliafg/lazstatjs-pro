import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMlOutput } from './run';
import type { MlParams } from '../../io/project';

const numericGrid = {
  cols: [
    { name: 'Y', type: 'num' as const },
    { name: 'X1', type: 'num' as const },
    { name: 'X2', type: 'num' as const },
  ],
  rows: Array.from({ length: 12 }, (_, index) => [
    String(10 + index * 1.5 + (index % 3)),
    String(index % 5),
    String((index * 2) % 7),
  ]),
};

const params = (overrides: Partial<MlParams> = {}): MlParams => ({
  mode: 'rf',
  task: 'regression',
  outcome: 0,
  predictors: [1, 2],
  trees: 10,
  minNode: 1,
  mtry: 0,
  shrinkage: 0.05,
  hidden: 4,
  iterations: 200,
  seed: 20261109,
  ...overrides,
});

test('the regression task pairs observed vs predicted with residuals and importance', () => {
  const result = buildMlOutput({ grid: numericGrid, params: params() });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const charts = result.charts ?? [];
  assert.deepEqual(charts.map(chart => chart.id), [
    'ml-observed-predicted',
    'ml-residuals',
    'ml-importance',
  ]);
  assert.equal(charts[0]?.kind, 'scatter');
  assert.equal(charts[0]?.fields.xLabel, 'Osservato');
  assert.equal(charts[0]?.fields.yLabel, 'Predetto');
  assert.equal(charts[1]?.kind, 'scatter');
  assert.equal(charts[1]?.fields.xLabel, 'Predetto');
  assert.equal(charts[1]?.fields.yLabel, 'Residuo');
  assert.equal(charts[2]?.kind, 'bar');
});

test('the classification task pairs the confusion matrix with recall', () => {
  const grid = {
    cols: [
      { name: 'Group', type: 'cat' as const },
      { name: 'X1', type: 'num' as const },
      { name: 'X2', type: 'num' as const },
    ],
    rows: Array.from({ length: 12 }, (_, index) => [
      index % 2 === 0 ? 'A' : 'B',
      String(index % 4),
      String((index * 3) % 5),
    ]),
  };
  const result = buildMlOutput({
    grid,
    params: params({ task: 'classification', predictors: [1, 2] }),
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const charts = result.charts ?? [];
  assert.deepEqual(charts.map(chart => chart.id), ['ml-confusion', 'ml-recall', 'ml-importance']);
  assert.equal(charts[0]?.kind, 'heatmap');
  assert.equal(charts[0]?.fields.xLabel, 'Predetta');
  assert.equal(charts[0]?.fields.yLabel, 'Osservata');
  assert.equal((charts[0]?.data.cells ?? []).length, 4);
  assert.equal(charts[1]?.kind, 'bar');
});
