import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVariancesOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'Weight', type: 'num' },
  { name: 'Group', type: 'cat' },
];

const rows: string[][] = [
  ...['5.1', '4.8', '5.5', '4.9', '5.2', '5.0'].map(value => [value, 'A']),
  ...['5.4', '5.9', '5.1', '5.6', '5.3', '5.7'].map(value => [value, 'B']),
  ...['4.2', '4.5', '3.9', '4.4', '4.1', '4.3'].map(value => [value, 'C']),
];

const grid: GridData = { cols, rows };

test('one variance emits the chi-square table and interval chart', () => {
  const result = buildVariancesOutput({
    grid,
    params: { ...DEFAULT_PARAMS.variances, mode: 'one', variable: 0, nullVariance: 0.25 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.tables?.map(table => table.id), ['var-one']);
  assert.equal(result.charts?.[0].kind, 'interval');
});

test('two or more variances emit the group table, the tests and a box plot', () => {
  const result = buildVariancesOutput({
    grid,
    params: { ...DEFAULT_PARAMS.variances, mode: 'two', variable: 0, group: 1 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.tables?.map(table => table.id), ['var-groups', 'var-tests']);
  assert.equal(result.tables![1].rows.length, 3);
  assert.deepEqual(result.charts?.map(chart => chart.kind), ['box', 'forest']);
  const ratio = result.charts?.[1];
  assert.equal(ratio?.id, 'var-ratio-forest');
  assert.equal((ratio?.options as { logScale?: boolean }).logScale, true);
  const point = (ratio?.data.points ?? [])[0];
  assert.ok(Number(point.lo) < Number(point.estimate));
  assert.ok(Number(point.estimate) < Number(point.hi));
});

test('variances reject missing groups and constant columns', () => {
  const missing = buildVariancesOutput({
    grid,
    params: { ...DEFAULT_PARAMS.variances, mode: 'two', variable: 0, group: -1 },
    ciLevel: 95,
  });
  assert.ok('ok' in missing && !missing.ok);

  const constant = buildVariancesOutput({
    grid: { cols, rows: [['5', 'A'], ['5', 'A'], ['5', 'B'], ['5', 'B']] },
    params: { ...DEFAULT_PARAMS.variances, mode: 'two', variable: 0, group: 1 },
    ciLevel: 95,
  });
  assert.ok('ok' in constant && !constant.ok);
});
