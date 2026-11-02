import test from 'node:test';
import assert from 'node:assert/strict';
import {
  exactBinomialP,
  oneProportion,
  proportionInterval,
  twoProportions,
} from './proportions';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

// Reference: R 4.x, binom.test and prop.test(correct = FALSE).
test('one proportion matches binom.test and the Wilson interval', () => {
  const result = oneProportion(45, 100, 0.5, 95);
  assert.ok(result);
  close(result!.estimate, 0.45, 1e-12);
  close(result!.exactP, 0.36820161732669665, 1e-9);
  close(result!.interval.wilsonLo, 0.35614537979511979, 1e-9);
  close(result!.interval.wilsonHi, 0.5475539700255786, 1e-9);
  close(result!.interval.clopperLo, 0.3503202292396721, 1e-9);
  close(result!.interval.clopperHi, 0.55271981122606395, 1e-9);
  close(result!.chi2, 1, 1e-12);
  close(result!.asymptoticP, 0.31731050786291415, 1e-9);
});

test('exact binomial p-value handles the boundary cases', () => {
  assert.equal(exactBinomialP(0, 10, 0.5), 2 / 1024);
  assert.equal(exactBinomialP(10, 10, 0.5), 2 / 1024);
  assert.equal(exactBinomialP(5, 10, 0.5), 1);
  assert.equal(exactBinomialP(0, 10, 0), 1);
  assert.equal(exactBinomialP(1, 10, 0), 0);
});

test('proportionInterval returns the Clopper–Pearson bounds', () => {
  const interval = proportionInterval(12, 37, 95);
  close(interval.clopperLo, 0.18013864805205662, 1e-9);
  close(interval.clopperHi, 0.49785328351339686, 1e-9);
});

// Reference: prop.test(c(45, 30), c(100, 90), correct = FALSE).
test('two proportions match prop.test without continuity correction', () => {
  const result = twoProportions(45, 100, 30, 90, 95);
  assert.ok(result);
  close(result!.difference, 0.1166666666666667, 1e-12);
  close(result!.standardError, 0.07031454900992494, 1e-12);
  close(result!.lo, -0.021147316981962677, 1e-9);
  close(result!.hi, 0.2544806503152961, 1e-9);
  close(result!.chi2, 2.6985507246376819, 1e-9);
  close(result!.pValue, 0.10043950997963567, 1e-9);
  close(result!.riskRatio, 1.35, 1e-12);
  close(result!.oddsRatio, 1.6363636363636365, 1e-9);
});

test('proportions reject impossible counts', () => {
  assert.equal(oneProportion(11, 10, 0.5), null);
  assert.equal(oneProportion(5, 10, 0), null);
  assert.equal(twoProportions(1, 0, 2, 10), null);
  assert.equal(twoProportions(-1, 10, 2, 10), null);
});
