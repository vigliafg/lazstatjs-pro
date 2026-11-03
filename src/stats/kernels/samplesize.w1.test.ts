import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ratePower,
  sampleSizeOneProportion,
  sampleSizeOneRate,
  sampleSizeVariance,
  variancePower,
} from './samplesize';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

// Reference: pwr::pwr.p.test(h = ES.h(0.6, 0.5), sig.level = .05, power = .8).
test('one proportion uses the arcsine transformation like pwr.p.test', () => {
  const result = sampleSizeOneProportion(0.6, 0.5, 0.05, 0.8, 2);
  close(result.effectSize, 0.20135792079033066, 1e-12);
  assert.equal(result.nPerGroup, 194);
  close(result.achievedPower, 0.80084052445276388, 1e-12);
});

// Reference: R loop over pchisq with the exact chi-square power.
test('variance sample size matches the exact chi-square power loop', () => {
  const result = sampleSizeVariance(2, 0.05, 0.8, 2);
  assert.equal(result.nPerGroup, 32);
  close(result.achievedPower, 0.80581380470380393, 1e-9);
  close(variancePower(32, 2, 0.05, 2), 0.80581380470380393, 1e-9);

  const smaller = sampleSizeVariance(1.5, 0.05, 0.8, 2);
  assert.equal(smaller.nPerGroup, 93);
  close(smaller.achievedPower, 0.80334451859204226, 1e-9);
});

// Reference: R loop over ppois with the exact Poisson test.
test('one rate sample size matches the exact Poisson power loop', () => {
  const result = sampleSizeOneRate(2, 1, 0.05, 0.8, 2);
  assert.equal(result.nPerGroup, 12);
  close(result.achievedPower, 0.81974261149775562, 1e-12);
  close(ratePower(12, 2, 1, 0.05, 2), 0.81974261149775562, 1e-12);
});

test('the new designs reject impossible inputs', () => {
  assert.ok(Number.isNaN(sampleSizeOneProportion(0.5, 0.5).nPerGroup));
  assert.ok(Number.isNaN(sampleSizeVariance(1).nPerGroup));
  assert.ok(Number.isNaN(sampleSizeOneRate(1, 1).nPerGroup));
  assert.ok(Number.isNaN(variancePower(1, 2, 0.05)));
  assert.ok(Number.isNaN(ratePower(0, 2, 1)));
});
