import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSpatialOutput } from './run';
import { variogram } from '../../stats/kernels/spatial';
import type { SpatialParams } from '../../io/project';

const grid = {
  cols: [
    { name: 'Y', type: 'num' as const },
    { name: 'X', type: 'num' as const },
    { name: 'N', type: 'num' as const },
  ],
  rows: Array.from({ length: 16 }, (_, index) => [
    String(index),
    String(index % 4),
    String(Math.floor(index / 4)),
  ]),
};

const params = (overrides: Partial<SpatialParams> = {}): SpatialParams => ({
  mode: 'moran',
  variable: 0,
  predictors: [],
  x: 1,
  y: 2,
  k: 4,
  permutations: 99,
  seed: 20261109,
  ...overrides,
});

test('the spatial output adds the experimental variogram to the value map', () => {
  const result = buildSpatialOutput({ grid, params: params() });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(ids, ['spatial-map', 'spatial-variogram']);
  const chart = (result.charts ?? []).find(item => item.id === 'spatial-variogram');
  assert.equal(chart?.kind, 'line');
  const series = chart?.data.series ?? [];
  assert.ok(series.length > 0);
  assert.ok(series.every(row => Number(row.y) >= 0));
  assert.ok(series.every(row => Number(row.x) > 0));
  assert.equal(chart?.fields?.yLabel, 'Semivarianza');
  assert.match(chart?.subtitle ?? '', /classi di distanza/);
  assert.match(chart?.note ?? '', /metà della distanza massima/);
});

test('the variogram bins only the pairs within half the maximum distance', () => {
  const points = [
    { x: 0, y: 0, value: 0 },
    { x: 1, y: 0, value: 1 },
    { x: 2, y: 0, value: 2 },
    { x: 3, y: 0, value: 3 },
  ];
  const bins = variogram(points);
  assert.equal(bins.length, 1);
  assert.equal(bins[0].distance, 1);
  assert.equal(bins[0].pairs, 3);
  assert.ok(Math.abs(bins[0].semivariance - 0.5) < 1e-12);
});
