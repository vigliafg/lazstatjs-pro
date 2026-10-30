import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRegressionOutput } from './run';

const grid = {
  cols: [
    { name: 'Y', type: 'num' as const },
    { name: 'X1', type: 'num' as const },
    { name: 'X2', type: 'num' as const },
  ],
  rows: [
    ['12.1', '1.0', '2.0'],
    ['13.4', '2.0', '1.5'],
    ['15.2', '3.0', '2.5'],
    ['14.8', '4.0', '3.0'],
    ['17.1', '5.0', '2.2'],
    ['18.4', '6.0', '3.4'],
    ['19.2', '7.0', '2.8'],
    ['21.5', '8.0', '4.1'],
    ['22.8', '9.0', '3.6'],
    ['24.1', '10.0', '4.8'],
    ['25.4', '11.0', '4.2'],
    ['26.9', '12.0', '5.0'],
  ],
};

const base = {
  grid,
  regParams: {
    dep: 0,
    indeps: [1, 2],
    useNonParam: false,
    robustEstimator: 'theil-sen',
    robustSE: 'none' as const,
  },
  ciLevel: 95,
};

test('regression adds leverage, scale-location, Cook and partial residual diagnostics', () => {
  const result = buildRegressionOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;

  const ids = (result.charts ?? []).map(chart => chart.id);
  for (const id of [
    'reg-observed-fitted',
    'reg-residual-fitted',
    'reg-scale-location',
    'reg-residual-leverage',
    'reg-cooks',
    'reg-partial-1',
    'reg-partial-2',
    'reg-residual-box',
    'reg-residual-qq',
  ]) {
    assert.ok(ids.includes(id), `missing chart ${id}`);
  }

  const cook = (result.charts ?? []).find(chart => chart.id === 'reg-cooks');
  const cookPoints = cook?.data.points ?? [];
  assert.ok(cookPoints.length === grid.rows.length);
  assert.ok(cookPoints.every(row => Number(row.y) >= 0));
  assert.ok(cookPoints.some(row => typeof row.label === 'string'));

  const leverage = (result.charts ?? []).find(chart => chart.id === 'reg-residual-leverage');
  const leveragePoints = leverage?.data.points ?? [];
  assert.ok(leveragePoints.every(row => Number(row.x) >= 0 && Number(row.x) <= 1));
  assert.deepEqual(leverage?.data.rules?.map(row => row.y), [-2, 2]);

  const partial = (result.charts ?? []).find(chart => chart.id === 'reg-partial-1');
  assert.equal(partial?.kind, 'scatter');
  assert.ok((partial?.data.points ?? []).length > 0);
  assert.equal((partial?.data.fit ?? []).length, 2);
});

test('a single-predictor regression also exposes the full diagnostic panel', () => {
  const result = buildRegressionOutput({
    ...base,
    regParams: { ...base.regParams, indeps: [1] },
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.ok(ids.includes('reg-scatter'));
  assert.ok(ids.includes('reg-scale-location'));
  assert.ok(ids.includes('reg-partial-1'));
  assert.equal(ids.includes('reg-partial-2'), false);
});
