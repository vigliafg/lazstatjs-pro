import test from 'node:test';
import assert from 'node:assert/strict';
import { observedCoverage, toleranceInterval } from './tolerance';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

const values = [10.2, 9.8, 10.5, 9.9, 10.1, 10.3, 9.7, 10.0, 10.4, 9.6];

// Reference: R 4.x, base only.
//   z <- qnorm((1 + p) / 2)
//   k <- sqrt((n - 1) * (1 + 1 / n) * z^2 / qchisq(1 - confidence, n - 1))
test('tolerance factor and limits match the Howe formula in R', () => {
  const result = toleranceInterval(values, 0.95, 0.95);
  assert.ok(result);
  close(result!.mean, 10.050000000000001, 1e-12);
  close(result!.sd, 0.30276503540974931, 1e-12);
  close(result!.k, 3.3819134905090209, 1e-9);
  close(result!.lo, 9.0260748422933279, 1e-9);
  close(result!.hi, 11.073925157706674, 1e-9);
  assert.equal(result!.n, 10);
});

test('the factor grows with the proportion and with the confidence', () => {
  const base = toleranceInterval(values, 0.95, 0.95)!;
  const wider = toleranceInterval(values, 0.99, 0.95)!;
  const stricter = toleranceInterval(values, 0.9, 0.99)!;
  close(wider.k, 4.4445877269345591, 1e-9);
  close(stricter.k, 3.5817059668142042, 1e-9);
  assert.ok(wider.k > base.k);
  assert.ok(stricter.k > toleranceInterval(values, 0.9, 0.95)!.k);
});

test('the interval contains the whole small sample and reports its coverage', () => {
  const result = toleranceInterval(values, 0.95, 0.95)!;
  assert.equal(observedCoverage(values, result), 1);
  assert.ok(result.lo < result.mean && result.hi > result.mean);
});

test('toleranceInterval rejects degenerate inputs', () => {
  assert.equal(toleranceInterval([5, 5, 5]), null);
  assert.equal(toleranceInterval([1]), null);
  assert.equal(toleranceInterval(values, 0, 0.95), null);
  assert.equal(toleranceInterval(values, 0.95, 1), null);
});
