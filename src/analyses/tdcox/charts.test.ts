import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTdCoxOutput } from './run';

// Start-stop rows with unequal follow-up lengths: equal ones give a singular
// information matrix once the covariate is centred.
const rows: string[][] = [];
for (let index = 0; index < 80; index += 1) {
  rows.push([
    String(index),
    String(index + 1 + (index % 3)),
    index % 2 === 0 ? '1' : '0',
    String((index % 40) / 40),
  ]);
}

const base = {
  grid: {
    cols: [
      { name: 'Start', type: 'num' as const },
      { name: 'Stop', type: 'num' as const },
      { name: 'Event', type: 'int' as const },
      { name: 'X', type: 'num' as const },
    ],
    rows,
  },
  params: { start: 0, stop: 1, event: 2, covariates: [3] },
  ciLevel: 95,
};

test('time-dependent Cox keeps a single log-scale hazard-ratio forest', () => {
  const result = buildTdCoxOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const charts = result.charts ?? [];
  assert.equal(charts.length, 1);
  const [forest] = charts;
  assert.equal(forest.id, 'tdcox-forest');
  assert.equal(forest.kind, 'forest');
  assert.equal(forest.options.kind === 'forest' && forest.options.logScale, true);
  assert.equal(forest.options.kind === 'forest' && forest.options.reference, 'one');
  assert.ok((forest.data.points ?? []).length > 0);
});

test('time-dependent Cox rejects a degenerate start/stop pair', () => {
  const result = buildTdCoxOutput({ ...base, params: { ...base.params, start: 1 } });
  assert.ok('reason' in result);
  if ('reason' in result) assert.match(result.reason, /different columns/);
});
