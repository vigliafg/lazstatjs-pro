import test from 'node:test';
import assert from 'node:assert/strict';
import { onePoissonRate, twoPoissonRates } from './poissonTests';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

// Reference: R 4.x, poisson.test(12, T = 5, r = 2).
test('one Poisson rate matches poisson.test exactly', () => {
  const result = onePoissonRate(12, 5, 2, 95);
  assert.ok(result);
  close(result!.rate, 2.3999999999999999, 1e-12);
  close(result!.exactP, 0.52344450029859246, 1e-9);
  close(result!.lo, 1.2401150217444434, 1e-9);
  close(result!.hi, 4.1923170096353903, 1e-9);
});

// Reference: poisson.test(c(12, 25), T = c(5, 8)).
test('two Poisson rates match the exact conditional test', () => {
  const result = twoPoissonRates(12, 5, 25, 8, 95);
  assert.ok(result);
  close(result!.first.rate, 2.4, 1e-12);
  close(result!.second.rate, 3.125, 1e-12);
  close(result!.ratio, 0.768, 1e-12);
  close(result!.exactP, 0.50276002586217639, 1e-9);
  close(result!.lo, 0.35154948601796154, 1e-9);
  close(result!.hi, 1.5863197497233594, 1e-6);
});

test('Poisson tests reject degenerate inputs', () => {
  assert.equal(onePoissonRate(-1, 5, 2), null);
  assert.equal(onePoissonRate(3, 0, 2), null);
  assert.equal(onePoissonRate(3, 5, 0), null);
  assert.equal(twoPoissonRates(0, 5, 0, 8), null);
  assert.equal(twoPoissonRates(1, 0, 2, 8), null);
});
