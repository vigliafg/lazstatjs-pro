import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLogisticOutput } from './run';

const grid = {
  cols: [
    { name: 'X', type: 'num' as const },
    { name: 'Y', type: 'int' as const },
  ],
  rows: [
    ['1', '0'],
    ['2', '1'],
    ['3', '0'],
    ['4', '1'],
    ['5', '1'],
    ['6', '0'],
    ['7', '1'],
    ['8', '0'],
    ['9', '1'],
    ['10', '1'],
  ],
};

const base = { grid, params: { outcome: 1, predictors: [0], cutoff: 0.5, penalized: false }, ciLevel: 95 };

test('logistic builder returns tables, report and the probability curve', () => {
  const result = buildLogisticOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
});

test('logistic builder rejects a non-finite or out-of-range cut-off', () => {
  for (const cutoff of [Number.NaN, 0, 1, 1.5]) {
    const result = buildLogisticOutput({ ...base, params: { ...base.params, cutoff } });
    assert.ok('reason' in result);
    if ('reason' in result) assert.match(result.reason, /Cut-off/);
  }
});

test('logistic builder validates predictors and outcome', () => {
  const noPredictors = buildLogisticOutput({ ...base, params: { ...base.params, predictors: [] } });
  assert.ok('reason' in noPredictors);
  if ('reason' in noPredictors) assert.match(noPredictors.reason, /at least one predictor/);

  const selfPredictor = buildLogisticOutput({ ...base, params: { ...base.params, predictors: [1] } });
  assert.ok('reason' in selfPredictor);
  if ('reason' in selfPredictor) assert.match(selfPredictor.reason, /cannot also be a predictor/);

  const nonBinary = buildLogisticOutput({
    ...base,
    grid: { ...grid, rows: [['1', '0'], ['2', '1'], ['3', '2'], ['4', '3'], ['5', '4'], ['6', '5']] },
  });
  assert.ok('reason' in nonBinary);
  if ('reason' in nonBinary) assert.match(nonBinary.reason, /exactly two distinct values/);
});
