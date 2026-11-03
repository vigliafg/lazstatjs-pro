import test from 'node:test';
import assert from 'node:assert/strict';
import { regressionPower, sampleSizeLogistic, sampleSizeRegression } from './samplesize';

const close = (actual: number, expected: number, tolerance = 1e-6): void => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} != ${expected} (tolerance ${tolerance})`
  );
};

// Reference: pwr::pwr.f2.test(u, f2, sig.level, power) for each design.
test('multiple regression matches pwr.f2.test sample sizes', () => {
  const first = sampleSizeRegression(3, 0.15, 0.05, 0.8);
  assert.equal(first.nPerGroup, 77);
  assert.equal(first.total, 77);
  assert.ok(first.achievedPower >= 0.8);
  close(first.achievedPower, 0.8017655, 1e-5);

  assert.equal(sampleSizeRegression(5, 0.35, 0.01, 0.9).nPerGroup, 71);
  assert.equal(sampleSizeRegression(2, 0.02, 0.05, 0.8).nPerGroup, 485);
});

test('regression power increases with n and is monotone', () => {
  close(regressionPower(77, 3, 0.15, 0.05), 0.8017655, 1e-5);
  assert.ok(regressionPower(100, 3, 0.15, 0.05) > regressionPower(77, 3, 0.15, 0.05));
});

// Reference: Hsieh et al. (1998) closed form used by pwrss::pwrss.z.logistic.
test('logistic sample size matches the Hsieh approximation', () => {
  const first = sampleSizeLogistic(0.3, 2, 0.05, 0.8);
  assert.equal(first.nPerGroup, 78);
  assert.ok(first.achievedPower >= 0.8);
  close(first.achievedPower, 0.8010440, 1e-5);

  assert.equal(sampleSizeLogistic(0.5, 1.5, 0.05, 0.9).nPerGroup, 256);
});

test('the new designs reject impossible inputs', () => {
  assert.ok(Number.isNaN(sampleSizeRegression(3, 0, 0.05, 0.8).nPerGroup));
  assert.ok(Number.isNaN(sampleSizeLogistic(0.3, 1, 0.05, 0.8).nPerGroup));
});
