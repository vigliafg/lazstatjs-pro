import test from 'node:test';
import assert from 'node:assert/strict';
import { buildClusterOutput } from './run';
import { silhouetteByCluster } from '../../stats/kernels/cluster';
import { DEFAULT_PARAMS } from '../../io/project/types';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'V1', type: 'num' },
  { name: 'V2', type: 'num' },
  { name: 'V3', type: 'num' },
];

const rows: string[][] = [
  ...[0, 1, 2, 3, 4, 5].map(index => [String(index), String(index * 2), String(index % 3)]),
  ...[0, 1, 2, 3, 4, 5].map(index => [String(100 + index), String(200 + index * 2), String(index % 3)]),
];

const grid: GridData = { cols, rows };

test('k-means emits size, silhouette and the two-variable scatter', () => {
  const result = buildClusterOutput({
    grid,
    params: {
      ...DEFAULT_PARAMS.cluster,
      selected: [0, 1, 2],
      method: 'kmeans',
      clusters: 2,
      standardize: true,
    },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;

  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.ok(ids.includes('cluster-silhouette'));
  assert.ok(ids.includes('cluster-scatter'));
  assert.ok(ids.includes('cluster-sizes'));
  assert.ok(ids.includes('cluster-profile'));

  const silhouette = result.charts!.find(chart => chart.id === 'cluster-silhouette');
  assert.equal(silhouette?.kind, 'bar');
  const bars = silhouette?.data.bars ?? [];
  assert.equal(bars.length, 2);
  for (const bar of bars) {
    const value = Number(bar.value);
    assert.ok(Number.isFinite(value) && value >= -1 && value <= 1);
  }

  const scatter = result.charts!.find(chart => chart.id === 'cluster-scatter');
  assert.equal(scatter?.kind, 'scatter');
  const points = scatter?.data.points ?? [];
  assert.equal(points.length, rows.length);
  assert.equal(new Set(points.map(point => String(point.group))).size, 2);
  const meanX = points.reduce((sum, point) => sum + Number(point.x), 0) / points.length;
  assert.ok(Math.abs(meanX) < 0.2, 'standardised axis should be centred on zero');
});

test('silhouette per cluster is near 1 for two separated groups', () => {
  const scores = silhouetteByCluster([[0], [0.1], [10], [10.1]], [0, 0, 1, 1], 2);
  assert.equal(scores.length, 2);
  for (const score of scores) {
    assert.ok(score > 0.9, String(score));
    assert.ok(score <= 1);
  }
});
