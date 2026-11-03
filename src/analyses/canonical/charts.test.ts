import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCanonicalOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project/types';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'X1', type: 'num' },
  { name: 'X2', type: 'num' },
  { name: 'Y1', type: 'num' },
  { name: 'Y2', type: 'num' },
];

const rows: string[][] = Array.from({ length: 20 }, (_, index) => {
  const x1 = index;
  // X2 must not be a linear function of X1: a singular Sxx makes the
  // canonical whitening undefined and the builder reject the run.
  const x2 = ((index * 7) % 11) + 0.3 * Math.cos(index);
  const y1 = 2 * x1 + 0.2 * Math.sin(index);
  const y2 = 0.7 * x2 + 0.1 * Math.cos(index * 1.3);
  return [String(x1), String(x2), String(y1), String(y2)];
});

const grid: GridData = { cols, rows };

test('canonical mode emits scores, canonical correlations and loadings', () => {
  const result = buildCanonicalOutput({
    grid,
    params: { ...DEFAULT_PARAMS.canonical, x: [0, 1], y: [2, 3] },
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;

  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(ids, ['canonical-scores', 'canonical-corr', 'canonical-loadings']);

  const correlations = result.charts!.find(chart => chart.id === 'canonical-corr');
  assert.equal(correlations?.kind, 'bar');
  const bars = correlations?.data.bars ?? [];
  assert.equal(bars.length, 2);
  for (const bar of bars) {
    const value = Number(bar.value);
    assert.ok(Number.isFinite(value) && value >= 0 && value <= 1);
  }
  assert.ok(Number(bars[0].value) >= Number(bars[1].value), 'functions are ordered by strength');
});
