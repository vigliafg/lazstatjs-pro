import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProportionsOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'Outcome', type: 'cat' },
  { name: 'Group', type: 'cat' },
  { name: 'Count', type: 'int' },
];

const rows: string[][] = [
  ...Array.from({ length: 10 }, () => ['Yes', 'A', '0']),
  ...Array.from({ length: 20 }, () => ['No', 'A', '1']),
  ...Array.from({ length: 15 }, () => ['Yes', 'B', '2']),
  ...Array.from({ length: 15 }, () => ['No', 'B', '1']),
];

const grid: GridData = { cols, rows };

const build = (mode: 'oneProp' | 'twoProp' | 'oneRate' | 'twoRate') =>
  buildProportionsOutput({
    grid,
    params: { ...DEFAULT_PARAMS.proportions, mode, variable: mode.endsWith('Rate') ? 2 : 0, group: 1, successLevel: 'Yes' },
    ciLevel: 95,
  });

test('one proportion tallies the success level and emits the interval chart', () => {
  const result = build('oneProp');
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.tables?.map(table => table.id), ['prop-one']);
  const row = result.tables![0].rows[0];
  assert.equal(row.successes, 25);
  assert.equal(row.trials, 60);
  assert.equal(result.charts?.[0].kind, 'interval');
});

test('two proportions compare the two groups and report the difference', () => {
  const result = build('twoProp');
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.tables?.map(table => table.id), ['prop-two', 'prop-diff']);
  const groups = result.tables![0].rows;
  assert.deepEqual(groups.map(row => [row.group, row.successes, row.trials]), [
    ['First group', 10, 30],
    ['Second group', 15, 30],
  ]);
  assert.equal(result.charts?.[0].kind, 'interval');
});

test('one Poisson rate uses the summed counts and the declared exposure', () => {
  const result = buildProportionsOutput({
    grid,
    params: { ...DEFAULT_PARAMS.proportions, mode: 'oneRate', variable: 2, exposure: 2, nullRate: 1 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.tables?.map(table => table.id), ['rate-one']);
  const row = result.tables![0].rows[0];
  // 10*0 + 20*1 + 15*2 + 15*1 = 65 events over 60 rows × exposure 2.
  assert.equal(row.events, 65);
  assert.equal(row.exposure, 120);
});

test('two Poisson rates report the ratio and its interval', () => {
  const result = build('twoRate');
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.tables?.map(table => table.id), ['rate-two', 'rate-ratio']);
  const ratio = result.tables![1].rows[0];
  assert.ok(Number(ratio.ratio) > 0);
  assert.ok(Number(ratio.lo) < Number(ratio.ratio));
  assert.ok(Number(ratio.hi) > Number(ratio.ratio));
});

test('proportions reject missing selections and single-group data', () => {
  const missing = buildProportionsOutput({
    grid,
    params: { ...DEFAULT_PARAMS.proportions, mode: 'twoProp', variable: 0, group: -1 },
    ciLevel: 95,
  });
  assert.ok('ok' in missing && !missing.ok);

  const oneGroup = buildProportionsOutput({
    grid: { cols, rows: rows.filter(row => row[1] === 'A') },
    params: { ...DEFAULT_PARAMS.proportions, mode: 'twoProp', variable: 0, group: 1 },
    ciLevel: 95,
  });
  assert.ok('ok' in oneGroup && !oneGroup.ok);
});
