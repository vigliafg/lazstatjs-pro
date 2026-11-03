import test from 'node:test';
import assert from 'node:assert/strict';
import { signTest } from './sign';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

// Reference: R 4.x, binom.test(sum(d > 0), sum(d != 0), 0.5) and the normal
// approximation with continuity correction.
test('sign test matches binom.test and the continuity-corrected z', () => {
  const differences = [1.2, 0.8, -0.3, 1.5, 0.2, 0.9, -0.1, 1.1, 0.4, 0.6, 0, 1.3];
  const result = signTest(differences);
  assert.ok(result);
  assert.equal(result!.zeros, 1);
  assert.equal(result!.positive, 9);
  assert.equal(result!.negative, 2);
  assert.equal(result!.n, 11);
  close(result!.exactP, 0.065429687500000042, 1e-12);
  close(result!.z, 1.8090680674665818, 1e-12);
  close(result!.asymptoticP, 0.07044042927208799, 1e-12);
  close(result!.median, 0.80000000000000004, 1e-12);
});

test('sign test handles all-positive and all-zero differences', () => {
  const allPositive = signTest([1, 2, 3, 4, 5]);
  assert.equal(allPositive!.positive, 5);
  close(allPositive!.exactP, 2 / 32, 1e-12);
  assert.equal(signTest([0, 0, 0]), null);
  assert.equal(signTest([]), null);
});
