import test from 'node:test';
import assert from 'node:assert/strict';
import { dixonTest, grubbsTest } from './outliers';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

// Reference: R 4.x, base only.
//   n <- length(x); G <- max(abs(x - mean(x))) / sd(x)
//   t <- sqrt(n * (n - 2) * G^2 / ((n - 1)^2 - n * G^2))
//   p <- 2 * n * pt(t, n - 2, lower.tail = FALSE)
//   crit <- (n - 1) / sqrt(n) * sqrt(qt(1 - 0.05 / (2n), n - 2)^2 / (n - 2 + ...))
test('grubbs flags the extreme observation and matches the R tail probability', () => {
  const result = grubbsTest([1, 2, 3, 4, 5, 6, 7, 8, 9, 100], 95);
  assert.ok(result);
  close(result!.statistic, 2.8355960483798701, 1e-12);
  close(result!.critical, 2.2899540844796027, 1e-9);
  close(result!.p, 7.9286059052027323e-09, 1e-12);
  close(result!.mean, 14.5, 1e-12);
  close(result!.sd, 30.152390728873666, 1e-12);
  assert.equal(result!.outlier, 100);
  assert.equal(result!.side, 'high');
});

test('grubbs does not flag a regular sample', () => {
  const result = grubbsTest([12.1, 12.5, 11.8, 12.9, 12.3, 12.7, 12, 11.9, 12.4, 12.6]);
  assert.ok(result);
  close(result!.statistic, 1.5910493792118159, 1e-12);
  close(result!.p, 0.92955936172605824, 1e-9);
  assert.ok(result!.statistic < result!.critical);
});

test('grubbs rejects constant, tiny or non-finite samples', () => {
  assert.equal(grubbsTest([5, 5, 5, 5]), null);
  assert.equal(grubbsTest([1, 2]), null);
  assert.equal(grubbsTest([1, 2, Number.NaN, 4]), null);
});

// Reference: R 4.x, sorted order statistics. For n = 10 the statistic is
// r11 = (x2 - x1) / (x9 - x1), and its null distribution is Beta(1, n - 3):
//   q <- max(r11low, r11high)
//   p <- min(1, 2 * pbeta(q, 1, n - 3, lower.tail = FALSE))
//   crit <- qbeta(1 - 0.05 / 2, 1, n - 3)
test('dixon r11 matches the R order-statistic ratio and the Beta tail', () => {
  const result = dixonTest([3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 5.2], 95);
  assert.ok(result);
  assert.equal(result!.type, 'r11');
  close(result!.statistic, 0.65000000000000013, 1e-12);
  close(result!.p, 0.0012867859374999964, 1e-12);
  close(result!.critical, 0.40961639722500343, 1e-9);
  assert.equal(result!.outlier, 5.2);
  assert.equal(result!.side, 'high');
});

test('dixon r10 covers samples of three to seven observations', () => {
  const result = dixonTest([10.1, 10.2, 10.3, 10.4, 11.9], 95);
  assert.ok(result);
  assert.equal(result!.type, 'r10');
  close(result!.statistic, 0.83333333333333304, 1e-12);
  close(result!.p, 0.0092592592592593091, 1e-12);
  assert.deepEqual(result!.beta, { a: 1, b: 3 });
});

test('dixon selects r21 and r22 for larger samples and rejects outside 3..30', () => {
  const r21 = dixonTest(Array.from({ length: 12 }, (_, index) => index + 1).concat(30));
  assert.equal(r21?.type, 'r21');
  const r22 = dixonTest(Array.from({ length: 20 }, (_, index) => index + 1).concat(45));
  assert.equal(r22?.type, 'r22');
  assert.equal(dixonTest([1, 2]), null);
  assert.equal(dixonTest(Array.from({ length: 31 }, (_, index) => index)), null);
});
