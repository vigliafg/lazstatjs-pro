import test from 'node:test';
import assert from 'node:assert/strict';
import { cusumChart } from './cusum';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

const values = [
  10.1, 9.8, 10.2, 9.9, 10.0, 10.3, 9.7, 10.1, 9.9, 10.2, 10.0, 9.8, 10.1, 10.2, 9.9, 10.0, 10.3,
  9.8, 10.1, 9.9, 10.9, 11.1, 10.8, 11.2, 11.0, 10.9, 11.3, 10.8, 11.1, 11.0,
];

// Reference: R 4.x, base loop.
//   cp <- max(0, cp + (x[i] - mean(x)) - 0.5 * sd(x))
//   cm <- max(0, cm + (mean(x) - x[i]) - 0.5 * sd(x))
test('CUSUM matches the base-R accumulation and detects the upward shift', () => {
  const result = cusumChart(values);
  assert.ok(result);
  close(result!.center, 10.346666666666668, 1e-12);
  close(result!.sigma, 0.50632777535106055, 1e-12);
  close(result!.upper, 2.0253111014042422, 1e-9);
  assert.equal(result!.firstHigh, 26);
  assert.equal(result!.firstLow, null);

  assert.equal(result!.points.length, 30);
  close(result!.points[20].cplus, 0.3001694, 1e-6);
  close(result!.points[20].cminus, 0.7700556, 1e-6);
  close(result!.points[29].cplus, 4.1016945, 1e-6);
  assert.equal(result!.points[25].signal, 'high');
});

test('CUSUM stays quiet on a stable process', () => {
  const stable = Array.from({ length: 20 }, (_, index) => 10 + (index % 3) * 0.1);
  const result = cusumChart(stable);
  assert.ok(result);
  assert.equal(result!.firstHigh, null);
  assert.equal(result!.firstLow, null);
  assert.ok(result!.points.every(point => point.cplus < result!.upper));
});

test('CUSUM accepts an explicit target and rejects degenerate input', () => {
  const result = cusumChart(values, { target: 10, k: 0.5, h: 5 });
  assert.ok(result);
  assert.equal(result!.center, 10);
  assert.ok(result!.firstHigh !== null);
  assert.equal(cusumChart([1, 2, 3]), null);
  assert.equal(cusumChart([5, 5, 5, 5]), null);
  assert.equal(cusumChart(values, { k: 0 }), null);
});
