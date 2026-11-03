import test from 'node:test';
import assert from 'node:assert/strict';
import { ksDistance, twoSampleKs } from './ks';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

// Reference: R 4.x, ks.test(a, b) with the exact two-sample distribution.
test('two-sample KS matches ks.test on a small exact case', () => {
  const result = twoSampleKs([0.5, 0.8, 1.0, 1.3, 1.6], [1.1, 1.4, 1.7, 2.0, 2.2]);
  assert.ok(result);
  close(result!.d, 0.60000000000000009, 1e-12);
  close(result!.p, 0.3571428571428571, 1e-12);
  assert.equal(result!.method, 'exact');
});

test('two-sample KS matches the exact p on a larger sample', () => {
  const a = [1.2, 1.5, 1.1, 1.8, 1.3, 1.6, 1.4, 1.7, 1.2, 1.9, 1.0, 1.5];
  const b = [2.1, 2.4, 2.0, 2.6, 2.2, 2.5, 1.9, 2.7, 2.3, 2.4, 2.2, 2.8];
  const result = twoSampleKs(a, b);
  assert.ok(result);
  close(result!.d, 0.91666666666666663, 1e-12);
  close(result!.p, 1.7750455225216299e-5, 1e-12);
});

test('the distance is zero for identical samples and the p is one', () => {
  const values = [1, 2, 3, 4, 5];
  assert.equal(ksDistance(values, values), 0);
  const result = twoSampleKs(values, values);
  assert.equal(result!.p, 1);
  assert.equal(result!.d, 0);
});

test('two-sample KS rejects tiny samples', () => {
  assert.equal(twoSampleKs([1], [2, 3]), null);
  assert.equal(twoSampleKs([1, 2], []), null);
});
