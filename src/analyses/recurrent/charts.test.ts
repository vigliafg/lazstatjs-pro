import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'vega-lite';
import { buildVegaSpec } from '../../charts/vega/buildSpec';
import { buildRecurrentOutput } from './run';

const grid = {
  cols: [
    { name: 'ID', type: 'num' as const },
    { name: 'START', type: 'num' as const },
    { name: 'STOP', type: 'num' as const },
    { name: 'EVENT', type: 'num' as const },
  ],
  rows: [
    ['1', '0', '2', '1'],
    ['1', '2', '5', '1'],
    ['2', '0', '3', '1'],
    ['2', '3', '6', '1'],
    ['3', '0', '4', '0'],
    ['3', '4', '7', '1'],
  ],
};

test('recurrent emits the mean cumulative function chart', () => {
  const result = buildRecurrentOutput({
    grid,
    params: { id: 0, start: 1, stop: 2, event: 3, covariates: [], model: 'ag' },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok, 'reason' in result ? result.reason : 'failed');
  if (!('ok' in result) || !result.ok) return;
  const chart = result.charts.find(item => item.id === 'recurrent-mcf');
  assert.ok(chart, 'missing recurrent-mcf');
  assert.equal(chart.kind, 'line');
  const series = chart.data.series ?? [];
  assert.ok(series.length > 0, 'empty MCF series');
  for (const item of result.charts) {
    assert.doesNotThrow(() => compile(buildVegaSpec(item)), item.id);
  }
});
