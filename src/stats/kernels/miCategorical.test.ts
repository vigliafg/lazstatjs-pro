import test from 'node:test';
import assert from 'node:assert/strict';
import { miCategoricalIssue, miCategoricalStats } from './miCategorical';
import { miStats } from './mi';

const rows = [
  ['1', '1', '2', '10'],
  ['1', '0', '2', '12'],
  ['0', '1', '1', '9'],
  ['', '1', '2', '11'],
  ['1', '', '1', '13'],
  ['0', '0', '2', '8'],
  ['1', '0', '', '12'],
  ['0', '1', '1', '10'],
  ['1', '1', '2', '11'],
  ['0', '', '1', '9'],
  ['1', '0', '2', '12'],
  ['', '0', '2', '10'],
];

const options = {
  rows,
  variables: [0, 1, 2],
  imputations: 4,
  iterations: 4,
  level: 95,
  model: 'categorical' as const,
  predictors: [3],
};

test('categorical MI imputes only observed category codes', () => {
  const stats = miCategoricalStats(options);
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.categories?.length, 3);
  for (const [index, variable] of (stats.categories ?? []).entries()) {
    const allowed = new Set(variable.categories);
    for (const value of stats.imputedValues[index] ?? []) {
      assert.ok(Number.isFinite(value));
      assert.ok(allowed.has(value), `value ${value} outside ${[...allowed].join(', ')}`);
    }
    assert.equal(variable.observed + variable.missing, stats.n);
  }
  for (const variable of stats.categories ?? []) {
    const total = variable.proportions.reduce((sum, entry) => sum + entry.proportion, 0);
    assert.ok(Math.abs(total - 1) < 1e-9, `proportions sum to ${total}`);
  }
});

test('categorical MI is deterministic for the same seed and settings', () => {
  const first = miCategoricalStats(options);
  const second = miCategoricalStats(options);
  assert.ok(first && second);
  assert.deepEqual(first?.imputedValues, second?.imputedValues);
  assert.deepEqual(
    first?.categories?.map(variable => variable.proportions.map(entry => entry.proportion)),
    second?.categories?.map(variable => variable.proportions.map(entry => entry.proportion))
  );
});

test('categorical MI reports two categories as binary and many as multinomial', () => {
  const stats = miCategoricalStats(options);
  assert.ok(stats);
  const sizes = (stats?.categories ?? []).map(variable => variable.categories.length);
  assert.deepEqual(sizes, [2, 2, 2]);
  const three = miCategoricalStats({
    ...options,
    rows: [
      ['0', '1'], ['1', '1'], ['2', '0'], ['', '1'], ['0', '0'],
      ['1', '1'], ['2', '0'], ['', '0'], ['1', '1'], ['0', '0'],
      ['2', '1'], ['2', '0'],
    ],
    variables: [0],
    predictors: [],
  });
  assert.ok(three);
  assert.equal(three?.categories?.[0].categories.length, 3);
  assert.ok(three?.categories?.[0].proportions.every(entry => Math.abs(entry.proportion - 1 / 3) < 0.5));
});

test('categorical issue explains unusable designs', () => {
  assert.match(
    miCategoricalIssue({ ...options, variables: [] }) ?? '',
    /at least one categorical variable/
  );
  assert.match(
    miCategoricalIssue({ ...options, rows: [['1', '1'], ['1', '0']], variables: [0], predictors: [] }) ?? '',
    /two observed categories/
  );
  assert.match(
    miCategoricalIssue({
      ...options,
      rows: [['1'], ['']],
      variables: [0],
      predictors: [],
    }) ?? '',
    /two observed values/
  );
});

test('the categorical model is reached through miStats', () => {
  const stats = miStats(options);
  assert.ok(stats?.categories);
  assert.equal(stats?.regression, null);
});
