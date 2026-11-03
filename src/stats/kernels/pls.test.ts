import test from 'node:test';
import assert from 'node:assert/strict';
import { fitPls, type PlsResult } from './pls';
import type { Matrix } from './matrix';

const close = (actual: number, expected: number, tolerance = 1e-10) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} != ${expected} (tolerance ${tolerance})`
  );

const closeVector = (actual: readonly number[], expected: readonly number[], tolerance = 1e-10) =>
  actual.forEach((value, index) => close(value, expected[index], tolerance));

const transpose = (rows: Matrix): Matrix =>
  (rows[0] ?? []).map((_, column) => rows.map(row => row[column]));

/** A simple single-predictor grid where Y = 2 + 3X exactly. */
const linear = {
  y: [5, 8, 11, 14, 17, 20, 23, 26],
  x: [1, 2, 3, 4, 5, 6, 7, 8].map(value => [value]),
};

test('PLS1 recovers an exact linear relation with one component', () => {
  const fit = fitPls({ ...linear, components: 1 });
  assert.ok(fit);
  assert.equal(fit!.n, linear.y.length);
  assert.equal(fit!.p, 1);
  assert.equal(fit!.components.length, 1);
  assert.deepEqual(fit!.q2, [Number.NaN]);
  closeVector(fit!.coefficients, [2, 3]);
  closeVector(fit!.fitted, linear.y);
  closeVector(fit!.residuals, new Array(linear.y.length).fill(0));
  close(fit!.r2, 1);
  close(fit!.adjR2, 1);
  close(fit!.rmse, 0);
  close(fit!.components[0].cumulativeR2, 1);
  close(fit!.components[0].r2, 1);
  close(fit!.components[0].xVariance, 1);
  close(fit!.vip[0], 1);
});

test('two components recover an exact two-predictor linear model', () => {
  const x1 = [1, 2, 3, 4, 5, 6];
  const x2 = [1, -1, 0, 0, -1, 1];
  const y = x1.map((value, index) => 2 + 3 * value - x2[index]);
  const fit = fitPls({ y, x: x1.map((value, index) => [value, x2[index]]), components: 2 });
  assert.ok(fit);
  closeVector(fit!.coefficients, [2, 3, -1]);
  closeVector(fit!.fitted, y);
  close(fit!.r2, 1);
  assert.ok(fit!.components[1].cumulativeR2 >= fit!.components[0].cumulativeR2);
  assert.equal(fit!.vip.length, 2);
  assert.ok(fit!.vip.every(value => Number.isFinite(value) && value > 0));
});

test('component metadata has the expected shapes and ordering', () => {
  const x = [
    [1, 1],
    [2, 4],
    [3, 2],
    [4, 8],
    [5, 5],
    [6, 9],
    [7, 3],
    [8, 7],
  ];
  const y = [2.1, 4.2, 5.8, 8.1, 9.8, 12.2, 13.9, 16.1];
  const fit: PlsResult = fitPls({ y, x, components: 2, cvFolds: 4 })!;
  assert.ok(fit);
  for (const component of fit.components) {
    assert.equal(component.weight.length, 2);
    assert.equal(component.loading.length, 2);
    assert.equal(component.score.length, 8);
    assert.ok(Number.isFinite(component.r2));
    assert.ok(Number.isFinite(component.cumulativeR2));
    assert.ok(Number.isFinite(component.xVariance));
  }
  const cumulative = fit.components.map(component => component.cumulativeR2);
  for (let index = 1; index < cumulative.length; index += 1) {
    assert.ok(cumulative[index] >= cumulative[index - 1] - 1e-12);
  }
  assert.ok(fit.q2.every(value => Number.isFinite(value)), 'CV Q² should be available');
  assert.ok(fit.q2.every(value => value <= 1 + 1e-12));
});

test('Q² is deterministic and disabled with cvFolds = 0', () => {
  const x = Array.from({ length: 24 }, (_, index) => [
    (index % 7) + 1,
    ((index * 3) % 11) + 1,
  ]);
  const y = x.map((row, index) => 1.5 + 2 * row[0] - 0.7 * row[1] + Math.sin(index));
  const first = fitPls({ y, x, components: 2, cvFolds: 5 });
  const second = fitPls({ y, x, components: 2, cvFolds: 5 });
  const disabled = fitPls({ y, x, components: 2, cvFolds: 0 });
  assert.ok(first && second && disabled);
  assert.deepEqual(first!.q2, second!.q2);
  assert.ok(first!.q2.every(value => Number.isFinite(value)));
  assert.ok(disabled!.q2.every(value => Number.isNaN(value)));
});

test('fitPls rejects non-finite values and impossible shapes', () => {
  const x: Matrix = [[1], [2], [3], [4]];
  const y = [2, 4, 6, 8];
  const cases: Array<Parameters<typeof fitPls>[0]> = [
    { y: [2, 4, Number.NaN, 8], x, components: 1 },
    { y, x: [[1], [2], [Number.POSITIVE_INFINITY], [4]], components: 1 },
    { y, x: [[1], [2], [3]], components: 1 },
    { y, x, components: 0 },
    { y, x, components: 2 },
    { y, x, components: 1.5 },
    { y: [2, 4, 6], x: transpose([[1, 2, 3]]), components: 2 },
  ];
  for (const input of cases) {
    assert.equal(fitPls(input), null, JSON.stringify(input));
  }
});

test('fitPls rejects a constant response or predictor', () => {
  const x: Matrix = [[1], [2], [3], [4]];
  assert.equal(fitPls({ y: [5, 5, 5, 5], x, components: 1 }), null);
  assert.equal(
    fitPls({ y: [1, 2, 3, 4], x: [[2], [2], [2], [2]], components: 1 }),
    null
  );
  assert.equal(
    fitPls({
      y: [1, 2, 3, 4, 5, 6],
      x: [
        [1, 3],
        [2, 3],
        [3, 3],
        [4, 3],
        [5, 3],
        [6, 3],
      ],
      components: 1,
    }),
    null
  );
});

test('fitPls requires at least three observations', () => {
  assert.equal(fitPls({ y: [1, 2], x: [[1], [2]], components: 1 }), null);
  assert.ok(fitPls({ y: [1, 2, 3], x: [[1], [2], [3]], components: 1 }));
});
