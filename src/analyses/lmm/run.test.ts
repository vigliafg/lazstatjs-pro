import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLmmOutput } from './run';

const grid = {
  cols: [
    { name: 'Y', type: 'num' as const },
    { name: 'X', type: 'num' as const },
    { name: 'G', type: 'cat' as const },
  ],
  rows: Array.from({ length: 30 }, (_, index) => {
    const group = index % 5;
    const x = (index * 3) % 7;
    const y = group * 2 + 0.5 * x + ((index % 3) - 1) * 0.2;
    return [String(y), String(x), `G${group}`];
  }),
};

test('lmm adds the random-effects caterpillar', () => {
  const result = buildLmmOutput({
    grid,
    params: { dep: 0, indeps: [1], group: 2 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const chart = (result.charts ?? []).find(item => item.id === 'lmm-random-effects');
  assert.ok(chart);
  assert.equal(chart?.kind, 'interval');
  assert.equal((chart?.data.intervals ?? []).length, 5);
  assert.ok(
    (chart?.data.intervals ?? []).every(
      row => Number.isFinite(Number(row.estimate)) && Number(row.lo) <= Number(row.hi)
    )
  );
});

const slopeGrid = {
  cols: [
    { name: 'Y', type: 'num' as const },
    { name: 'Time', type: 'num' as const },
    { name: 'Group', type: 'cat' as const },
  ],
  rows: Array.from({ length: 48 }, (_, index) => {
    const group = Math.floor(index / 8);
    const time = index % 8;
    const y = 5 + group * 1.5 + (1 + group * 0.2) * time + 0.1 * Math.sin(index);
    return [String(y), String(time), `G${group}`];
  }),
};

test('lmm random-slope mode reports the slope variance and the BLUPs', () => {
  const result = buildLmmOutput({
    grid: slopeGrid,
    params: { dep: 0, indeps: [1], group: 2, randomSlope: true },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok, 'reason' in result ? result.reason : 'failed');
  if (!('ok' in result) || !result.ok) return;

  assert.deepEqual(
    (result.tables ?? []).map(table => table.id),
    ['lmm-summary', 'lmm-fixed', 'lmm-random-effects', 'lmm-varcomp', 'lmm-fixed-tests']
  );
  const summary = result.tables!.find(table => table.id === 'lmm-summary')!.rows;
  assert.ok(summary.some(row => String(row.metric) === 'Varianza pendenza'));
  assert.deepEqual((result.charts ?? []).map(chart => chart.id), [
    'lmm-observed-fitted',
    'lmm-random-slopes',
    'lmm-random-intercepts',
    'lmm-variance-interval',
  ]);
  assert.equal(result.report?.id, 'lmm');
});
