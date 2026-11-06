import test from 'node:test';
import assert from 'node:assert/strict';
import { fitMultinomial } from './multinomial';

// A predictor on a 1e5 scale: Newton from a zero start overflowed the linear
// predictor on the first step, so the fit returned null.
const X = Array.from({ length: 60 }, (_, index) => 100_000 + index + 1);
const Y = Array.from({ length: 60 }, (_, index) => ((index + 1) * 7) % 3);

const close = (actual: number, expected: number, tolerance = 1e-8) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('a predictor on a large scale still converges', () => {
  const fit = fitMultinomial({ y: Y, x: X.map(value => [1, value]) });
  assert.ok(fit, 'fit is null');
  assert.ok(fit!.converged);
  assert.ok(fit!.coefficients.every(row => row.every(Number.isFinite)));
  close(fit!.logLik, -65.85000018302178, 1e-7);
});

test('conditioning leaves the well-scaled fit unchanged', () => {
  const scaled = fitMultinomial({ y: Y, x: X.map(value => [1, value / 100_000]) });
  assert.ok(scaled);
  close(scaled!.logLik, -65.85000018302198, 1e-7);
});
