import test from 'node:test';
import assert from 'node:assert/strict';
import { boxRows, boxStats, confidenceEllipse, detrendedQqRows, kernelDensity, survivalMedians, violinRows } from './common';

const values = (start: number, step: number, count: number): number[] =>
  Array.from({ length: count }, (_, index) => start + index * step);

test('boxStats counts only finite values and exposes n', () => {
  const stats = boxStats([1, 2, Number.NaN, 3, 4, Number.POSITIVE_INFINITY]);
  assert.ok(stats);
  assert.equal(stats!.n, 4);
  assert.equal(stats!.min, 1);
  assert.equal(stats!.max, 4);
});

test('boxRows carries n into every summary row', () => {
  const rows = boxRows([{ category: 'A', values: values(1, 1, 5) }]);
  assert.equal(rows.summary[0].n, 5);
});

test('violinRows builds one symmetric density per group, in category and y order', () => {
  const points = [
    ...values(1, 0.5, 12).map(value => ({ category: 'A', value })),
    ...values(5, 0.4, 12).map(value => ({ category: 'B', value })),
  ];
  const result = violinRows(points, ['A', 'B'], new Map([['A', 0], ['B', 1]]));
  assert.deepEqual(result.skipped, []);
  assert.equal(result.rows.length, 120);

  result.rows.forEach((row, index) => {
    const expected = index < 60 ? 'A' : 'B';
    const center = expected === 'A' ? 0 : 1;
    assert.equal(row.category, expected);
    assert.ok(Number(row.value) >= (expected === 'A' ? 1 : 5));
    assert.ok(Math.abs((Number(row.x1) + Number(row.x2)) / 2 - center) < 1e-9);
    assert.ok(Number(row.x2) - Number(row.x1) <= 0.76 + 1e-9);
  });
  for (let index = 1; index < 60; index += 1) {
    assert.ok(Number(result.rows[index].value) >= Number(result.rows[index - 1].value));
  }
  for (let index = 61; index < 120; index += 1) {
    assert.ok(Number(result.rows[index].value) >= Number(result.rows[index - 1].value));
  }
});

test('violinRows skips singleton and constant groups and reports them', () => {
  const points = [
    { category: 'A', value: 1 },
    { category: 'B', value: 2 },
    { category: 'B', value: 2 },
    { category: 'C', value: 2 },
    { category: 'C', value: 3 },
  ];
  const result = violinRows(points, ['A', 'B', 'C'], new Map([['A', 0], ['B', 1], ['C', 2]]));
  assert.deepEqual(result.skipped, ['A', 'B']);
  assert.equal(result.rows.length, 60);
  assert.ok(result.rows.every(row => row.category === 'C'));
});

test('confidenceEllipse returns 60 finite outline points around the centre', () => {
  const points = [
    { x: -1, y: -1 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: 0, y: 0 },
  ];
  const ellipse = confidenceEllipse(points);
  assert.equal(ellipse.length, 60);
  assert.ok(ellipse.every(row => Number.isFinite(Number(row.x)) && Number.isFinite(Number(row.y))));
  const meanX = ellipse.reduce((sum, row) => sum + Number(row.x), 0) / ellipse.length;
  const meanY = ellipse.reduce((sum, row) => sum + Number(row.y), 0) / ellipse.length;
  assert.ok(Math.abs(meanX) < 0.1);
  assert.ok(Math.abs(meanY) < 0.1);
});

test('survivalMedians finds the first time each curve reaches 50%', () => {
  const medians = survivalMedians([
    { x: 1, y: 1, series: 'A' },
    { x: 2, y: 0.6, series: 'A' },
    { x: 3, y: 0.4, series: 'A' },
    { x: 1, y: 1, series: 'B' },
    { x: 2, y: 0.8, series: 'B' },
    { x: 3, y: 0.5, series: 'B' },
  ]);
  assert.deepEqual(medians, [
    { x: 3, series: 'A' },
    { x: 3, series: 'B' },
  ]);
});

test('kernelDensity returns a finite non-negative curve', () => {
  const curve = kernelDensity([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(curve.length, 60);
  assert.ok(curve.every(point => Number.isFinite(point.x) && Number.isFinite(point.y)));
  assert.ok(curve.every(point => point.y >= 0));
});

test('detrendedQqRows subtracts the reference line', () => {
  const rows = detrendedQqRows(
    [{ x: 1, y: 2 }, { x: 2, y: 3 }],
    [{ x: 0, y: 0 }, { x: 2, y: 2 }]
  );
  assert.deepEqual(rows, [{ x: 1, y: 1 }, { x: 2, y: 1 }]);
});
