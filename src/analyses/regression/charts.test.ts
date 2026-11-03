import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRegressionOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'X', type: 'num' },
  { name: 'Y', type: 'num' },
  { name: 'Z', type: 'num' },
  { name: 'W', type: 'num' },
];

const rows: string[][] = Array.from({ length: 30 }, (_, index) => {
  const x = index;
  const y = 4 + 1.5 * x + 0.3 * Math.sin(index * 1.7);
  return [String(x), String(y), String((index * 13) % 17), String((index * 7) % 11)];
});

const grid: GridData = { cols, rows };

test('selection mode plots the selected coefficients with their intervals', () => {
  const result = buildRegressionOutput({
    grid,
    regParams: {
      ...DEFAULT_PARAMS.reg,
      mode: 'selection',
      dep: 1,
      indeps: [0, 2, 3],
      selectionDirection: 'both',
      selectionCriterion: 'bic',
    },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;

  const chart = result.charts?.find(candidate => candidate.id === 'selection-coefficients');
  assert.ok(chart);
  assert.equal(chart.kind, 'bar');
  const bars = chart.data.bars ?? [];
  assert.ok(bars.length > 0);
  for (const bar of bars) {
    assert.ok(Number.isFinite(Number(bar.value)));
    assert.ok(Number.isFinite(Number(bar.lo)) && Number.isFinite(Number(bar.hi)));
    assert.ok(Number(bar.lo) <= Number(bar.value) && Number(bar.value) <= Number(bar.hi));
  }
  assert.deepEqual(chart.data.rules, [{ value: 0 }]);

  const model = result.tables?.find(table => table.id === 'selection-model');
  assert.ok(model);
  const slopes = model!.rows
    .filter(row => String(row.predictor) !== '(Intercept)')
    .map(row => Number(row.b));
  assert.deepEqual(bars.map(bar => Number(bar.value)), slopes);
});
