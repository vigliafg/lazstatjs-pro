import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'vega-lite';
import { buildVegaSpec } from '../../charts/vega/buildSpec';
import { DEFAULT_PARAMS } from '../../io/project';
import { buildTostOutput } from './run';

const grid = {
  cols: [{ name: 'X', type: 'num' as const }],
  rows: [['0.1'], ['0.3'], ['0.2'], ['0.4'], ['0.15'], ['0.25'], ['0.35'], ['0.05']],
};

test('tost-difference is an interval with margins and the equivalence region', () => {
  const result = buildTostOutput({
    grid,
    params: { ...DEFAULT_PARAMS.tost, var1: 0, var2: 0, margin: 1 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok, 'reason' in result ? result.reason : 'failed');
  if (!('ok' in result) || !result.ok) return;
  const chart = result.charts.find(item => item.id === 'tost-difference');
  assert.ok(chart, 'missing tost-difference');
  assert.equal(chart.kind, 'interval');
  assert.equal((chart.data.intervals ?? []).length, 1);
  assert.equal((chart.data.rules ?? []).length, 2);
  assert.equal((chart.data.regions ?? []).length, 1);
  const interval = (chart.data.intervals ?? [])[0];
  assert.ok(Number(interval.lo) <= Number(interval.estimate));
  assert.ok(Number(interval.hi) >= Number(interval.estimate));
  for (const item of result.charts) {
    assert.doesNotThrow(() => compile(buildVegaSpec(item)), item.id);
  }
});
