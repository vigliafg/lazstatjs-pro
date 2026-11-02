import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDescriptiveOutput } from './run';

const rows = Array.from({ length: 12 }, (_, index) => [
  String(1 + index * 0.7),
  String(2 + ((index * 5) % 7)),
  String(3 + (index % 4)),
]);

const result = buildDescriptiveOutput({
  rows,
  columnNames: ['A', 'B', 'C'],
  indices: [0, 1, 2],
  level: 95,
});

test('descriptive emits the L2 objects when three variables are selected', () => {
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const ids = (result.charts ?? []).map(chart => chart.id);
  for (const id of [
    'desc-diamond',
    'desc-shadow-A',
    'desc-matrix',
    'desc-bubble',
    'desc-scatter3d',
  ]) {
    assert.ok(ids.includes(id), `missing ${id}`);
  }

  const kinds = new Map((result.charts ?? []).map(chart => [chart.id, chart.kind]));
  assert.equal(kinds.get('desc-diamond'), 'diamond');
  assert.equal(kinds.get('desc-shadow-A'), 'shadowgram');
  assert.equal(kinds.get('desc-matrix'), 'scattermatrix');
  assert.equal(kinds.get('desc-bubble'), 'bubble');
  assert.equal(kinds.get('desc-scatter3d'), 'scatter3d');

  const matrix = (result.charts ?? []).find(chart => chart.id === 'desc-matrix');
  assert.equal(matrix?.stats?.dim, 3);
  assert.ok((matrix?.data.panels ?? []).length === 9);
  assert.ok((matrix?.data.points ?? []).length > 0);
  assert.ok((matrix?.data.ellipses ?? []).length > 0);

  const bubble = (result.charts ?? []).find(chart => chart.id === 'desc-bubble');
  assert.equal(bubble?.fields.sizeLabel, 'C');
  assert.ok((bubble?.data.points ?? []).every(row => Number.isFinite(Number(row.size))));

  const space = (result.charts ?? []).find(chart => chart.id === 'desc-scatter3d');
  assert.ok((space?.data.points ?? []).every(row => Number.isFinite(Number(row.z))));

  const distribution = result.panels?.[0];
  assert.equal(distribution?.kind, 'panel');
  assert.deepEqual(
    distribution?.children.map(child => child.id),
    ['desc-hist-A', 'desc-box', 'desc-qq-A', 'desc-shadow-A']
  );
  assert.ok((distribution?.tables ?? []).some(table => table.id === 'desc-location'));
});

test('two variables skip the matrix and the 3D objects', () => {
  const two = buildDescriptiveOutput({
    rows,
    columnNames: ['A', 'B'],
    indices: [0, 1],
    level: 95,
  });
  assert.ok('ok' in two && two.ok);
  if (!('ok' in two) || !two.ok) return;
  const ids = (two.charts ?? []).map(chart => chart.id);
  assert.equal(ids.includes('desc-matrix'), false);
  assert.equal(ids.includes('desc-bubble'), false);
  assert.equal(ids.includes('desc-scatter3d'), false);
  assert.ok(ids.includes('desc-shadow-A'));
});
