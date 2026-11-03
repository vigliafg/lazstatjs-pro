import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'vega-lite';
import { buildVegaSpec } from '../../charts/vega/buildSpec';
import { buildFactorialOutput } from './run';

const grid = {
  cols: [
    { name: 'Y', type: 'num' as const },
    { name: 'A', type: 'cat' as const },
    { name: 'B', type: 'cat' as const },
  ],
  rows: [
    ['10', 'A1', 'B1'],
    ['11', 'A1', 'B1'],
    ['12', 'A1', 'B2'],
    ['13', 'A1', 'B2'],
    ['20', 'A2', 'B1'],
    ['21', 'A2', 'B1'],
    ['22', 'A2', 'B2'],
    ['23', 'A2', 'B2'],
  ],
};

const chartsOf = (result: ReturnType<typeof buildFactorialOutput>) => {
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return [];
  for (const chart of result.charts) {
    assert.doesNotThrow(() => compile(buildVegaSpec(chart)), chart.id);
  }
  return result.charts;
};

test('factorial emits the cell-mean interval chart', () => {
  const charts = chartsOf(
    buildFactorialOutput({
      grid,
      params: { response: 0, factorA: 1, factorB: 2, interaction: true },
      ciLevel: 95,
    })
  );
  assert.deepEqual(charts.map(chart => chart.id), ['factorial-interaction', 'factorial-cells']);
  const cells = charts[1];
  assert.equal(cells.kind, 'interval');
  const intervals = cells.data.intervals ?? [];
  assert.equal(intervals.length, 4, 'one interval per populated cell');
  for (const row of intervals) {
    assert.ok(Number(row.lo) < Number(row.estimate), `${row.category}: lo`);
    assert.ok(Number(row.hi) > Number(row.estimate), `${row.category}: hi`);
  }
});
