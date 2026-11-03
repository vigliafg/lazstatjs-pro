import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDistributionFitOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'Value', type: 'num' },
  { name: 'Group', type: 'cat' },
];

const rows: string[][] = [
  ...['0.5', '0.8', '1.0', '1.3', '1.6'].map(value => [value, 'A']),
  ...['1.1', '1.4', '1.7', '2.0', '2.2'].map(value => [value, 'B']),
];

const grid: GridData = { cols, rows };

test('the KS mode compares two groups and emits the ECDF chart', () => {
  const result = buildDistributionFitOutput({
    grid,
    params: { ...DEFAULT_PARAMS.distfit, mode: 'ks', variable: 0, group: 1 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.tables?.map(table => table.id), ['ks-two', 'ks-stat']);
  assert.deepEqual(result.charts?.map(chart => chart.kind), ['line', 'line']);
  const diff = result.charts?.[1];
  assert.equal(diff?.id, 'ks-diff');
  assert.equal((diff?.data.markers ?? []).length, 1);
  assert.ok((diff?.data.series ?? []).length > 0);
  const p = Number(result.tables![1].rows[0].p);
  assert.ok(Math.abs(p - 0.3571428571428571) < 1e-9);
});

test('the KS mode needs exactly two groups', () => {
  const result = buildDistributionFitOutput({
    grid: {
      cols,
      rows: [...rows, ['1.0', 'C'], ['1.2', 'C']],
    },
    params: { ...DEFAULT_PARAMS.distfit, mode: 'ks', variable: 0, group: 1 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && !result.ok);
});
