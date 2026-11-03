import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTTestOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'Extra', type: 'num' },
  { name: 'Group', type: 'num' },
];

const rows: string[][] = [
  ['1.2', '0.0'],
  ['0.8', '0.0'],
  ['-0.3', '0.0'],
  ['1.5', '0.0'],
  ['0.2', '0.0'],
  ['0.9', '0.0'],
  ['-0.1', '0.0'],
  ['1.1', '0.0'],
  ['0.4', '0.0'],
  ['0.6', '0.0'],
  ['0.0', '0.0'],
  ['1.3', '0.0'],
];

const grid: GridData = { cols, rows };

test('the sign mode runs the paired test and emits the differences chart', () => {
  const result = buildTTestOutput({
    grid,
    ttestParams: { ...DEFAULT_PARAMS.ttest, type: 'sign', var1: 0, var2: 1 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.tables?.map(table => table.id), ['sign-test']);
  const row = result.tables![0].rows[0];
  assert.equal(row.positive, 9);
  assert.equal(row.negative, 2);
  assert.equal(row.zeros, 1);
  assert.deepEqual(result.charts?.map(chart => chart.kind), ['histogram', 'interval']);
  const ci = result.charts?.[1];
  assert.equal(ci?.id, 'sign-ci');
  const band = (ci?.data.intervals ?? [])[0];
  assert.ok(Number(band.lo) <= Number(band.estimate));
  assert.ok(Number(band.estimate) <= Number(band.hi));
});

test('the sign mode rejects all-zero differences', () => {
  const result = buildTTestOutput({
    grid: { cols, rows: [['1', '1'], ['2', '2'], ['3', '3']] },
    ttestParams: { ...DEFAULT_PARAMS.ttest, type: 'sign', var1: 0, var2: 1 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && !result.ok);
});
