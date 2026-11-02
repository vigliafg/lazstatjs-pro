import test from 'node:test';
import assert from 'node:assert/strict';
import { exactRunsPValue, runsTest } from './runs';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

const sequence = [
  12, 15, 11, 18, 14, 13, 19, 10, 16, 17, 12, 20, 11, 14, 18, 13, 15, 16, 9, 21, 12, 17, 14, 19,
];

// Reference: R 4.x, base only, reproducing randtests::runs.test(threshold =
// median(x), correct = TRUE):
//   s <- ifelse(x <= median(x), 0, 1)
//   R <- 1 + sum(s[-1] != s[-n])
//   z <- (R - E) / sqrt(V) + 0.5 * sign(E - R) / sqrt(V)
//   p <- 2 * pnorm(-abs(z))
test('runs test matches the R normal approximation with continuity correction', () => {
  const result = runsTest(sequence);
  assert.ok(result);
  assert.equal(result!.n, 24);
  close(result!.cut, 14.5, 1e-12);
  assert.equal(result!.above, 12);
  assert.equal(result!.below, 12);
  assert.equal(result!.runs, 20);
  close(result!.expected, 13, 1e-12);
  close(result!.sd, 2.3956482285140712, 1e-12);
  close(result!.z, 2.7132531072943462, 1e-12);
  close(result!.p, 0.0066626195552329332, 1e-12);
  assert.equal(result!.firstSide, 0);
});

// Reference: complete enumeration of the C(24, 12) = 2 704 156 assignments,
// counting how many have at most (and at least) the observed number of runs.
test('exact runs p-value matches the full enumeration', () => {
  const result = runsTest(sequence);
  assert.ok(result);
  close(result!.exactP!, 0.0055662469177074105, 1e-12);
});

test('exactRunsPValue uses the combinatorial run distribution', () => {
  // n1 = n2 = 5, observed 7 runs: 210 assignments below, 90 above, 252 total.
  close(exactRunsPValue(7, 5, 5)!, 0.7142857142857143, 1e-12);
  // Alternating sequence is the extreme case: only 2 of the 252 assignments
  // have ten runs, so the two-sided exact p is 4 / 252.
  close(exactRunsPValue(10, 5, 5)!, 4 / 252, 1e-12);
  assert.equal(exactRunsPValue(2, 1, 1), 1);
  assert.equal(exactRunsPValue(3, 60, 60), null);
});

test('runs test rejects short and degenerate sequences', () => {
  assert.equal(runsTest([1, 2, 3]), null);
  assert.equal(runsTest([5, 5, 5, 5, 5]), null);
  assert.equal(runsTest([Number.NaN, Number.NaN, Number.NaN, Number.NaN]), null);
});
