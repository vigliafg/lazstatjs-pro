import test from 'node:test';
import assert from 'node:assert/strict';
import { buildIrtOutput } from './run';
import { iccProbability } from '../../stats/kernels/irt';
import { DEFAULT_PARAMS } from '../../io/project/types';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'I1', type: 'cat' },
  { name: 'I2', type: 'cat' },
  { name: 'I3', type: 'cat' },
];

// Three items with different difficulty: I1 easy, I2 medium, I3 hard.
const rows: string[][] = Array.from({ length: 30 }, (_, index) => [
  String(index < 24 ? 1 : 0),
  String(index % 3 === 0 ? 0 : 1),
  String(index < 9 ? 1 : 0),
]);

const grid: GridData = { cols, rows };

test('the ICC is 0.5 at the difficulty and increases with ability', () => {
  assert.equal(iccProbability(1, 0, 0), 0.5);
  assert.ok(iccProbability(2, 0, 0) === 0.5);
  assert.ok(iccProbability(1, 0, -2) < 0.2);
  assert.ok(iccProbability(1, 0, 2) > 0.8);
  assert.ok(iccProbability(1, 0, 1) > iccProbability(1, 0, 0));
  assert.ok(iccProbability(2, 0, -1) < iccProbability(1, 0, -1), 'sharper items separate more');
});

test('IRT emits one characteristic curve per item', () => {
  const result = buildIrtOutput({
    grid,
    params: { ...DEFAULT_PARAMS.irt, selected: [0, 1, 2], model: '2pl' },
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;

  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.ok(ids.includes('irt-icc'));

  const icc = result.charts!.find(chart => chart.id === 'irt-icc');
  assert.equal(icc?.kind, 'line');
  const series = icc?.data.series ?? [];
  assert.ok(series.length > 0);
  assert.equal(series.length % 3, 0, 'one curve per item on the same theta grid');
  assert.deepEqual(
    [...new Set(series.map(point => String(point.series)))].sort(),
    ['I1', 'I2', 'I3']
  );
  assert.ok(series.every(point => Number(point.y) >= 0 && Number(point.y) <= 1));
});
