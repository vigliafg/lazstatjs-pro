import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLatentClassOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project/types';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'A', type: 'cat' },
  { name: 'B', type: 'cat' },
  { name: 'C', type: 'cat' },
];

const pattern = (values: string[]): string[] => values;
// Every indicator must vary: a constant column is rejected before the kernel.
const rows: string[][] = [
  ...Array.from({ length: 20 }, () => pattern(['yes', 'yes', 'no'])),
  ...Array.from({ length: 20 }, () => pattern(['no', 'no', 'yes'])),
];

const grid: GridData = { cols, rows };

test('latent class emits proportions, profiles and classification certainty', () => {
  const result = buildLatentClassOutput({
    grid,
    params: { ...DEFAULT_PARAMS.latentclass, selected: [0, 1, 2], classes: 2 },
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;

  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.ok(ids.includes('latentclass-entropy'));

  const certainty = result.charts!.find(chart => chart.id === 'latentclass-entropy');
  assert.equal(certainty?.kind, 'bar');
  const bars = certainty?.data.bars ?? [];
  assert.equal(bars.length, 2);
  for (const bar of bars) {
    const value = Number(bar.value);
    assert.ok(Number.isFinite(value) && value >= 0 && value <= 100);
  }
  assert.match(String(certainty?.subtitle), /Entropia/);
});
