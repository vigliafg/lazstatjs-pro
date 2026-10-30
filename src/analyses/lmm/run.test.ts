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
