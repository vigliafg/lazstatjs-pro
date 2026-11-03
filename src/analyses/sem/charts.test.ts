import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSemOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project/types';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'X1', type: 'num' },
  { name: 'X2', type: 'num' },
  { name: 'X3', type: 'num' },
  { name: 'X4', type: 'num' },
];

const rows: string[][] = Array.from({ length: 30 }, (_, index) => {
  const f1 = Math.sin(index) * 2;
  const f2 = Math.cos(index * 1.3) * 2;
  return [
    String(f1 + 0.3 * Math.sin(index * 2)),
    String(0.9 * f1 + 0.3 * Math.cos(index)),
    String(f2 + 0.3 * Math.sin(index * 3)),
    String(0.85 * f2 + 0.3 * Math.cos(index * 2)),
  ];
});

const grid: GridData = { cols, rows };

test('SEM emits the fit indices against their thresholds', () => {
  const result = buildSemOutput({
    grid,
    params: { ...DEFAULT_PARAMS.sem, selected: [0, 1, 2, 3], factors: 2, groups: [0, 0, 1, 1] },
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;

  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.ok(ids.includes('sem-fit'));
  assert.ok(ids.includes('sem-loadings'));

  const fit = result.charts!.find(chart => chart.id === 'sem-fit');
  assert.equal(fit?.kind, 'bar');
  const bars = fit?.data.bars ?? [];
  assert.equal(bars.length, 6);
  const model = bars.filter(bar => bar.series === 'Modello').map(bar => Number(bar.value));
  const thresholds = bars.filter(bar => bar.series === 'Soglia').map(bar => Number(bar.value));
  assert.deepEqual(thresholds, [0.95, 0.06, 0.08]);
  assert.ok(model.every(value => Number.isFinite(value) && value >= 0));
});
