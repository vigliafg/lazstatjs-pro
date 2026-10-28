import test from 'node:test';
import assert from 'node:assert/strict';
import { regressionStats } from './regression';

const rows = [
  ['2', '1'],
  ['3', '2'],
  ['2', '3'],
  ['5', '4'],
  ['9', '8'],
];

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('regressionStats keeps the OLS result when robustSE is none', () => {
  const stats = regressionStats(rows, 0, [1], 95);
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.robust, null);
  close(stats.intercept.b, 0.452054794520548, 1e-9);
  close(stats.coefficients[0].b, 1.041095890410959, 1e-9);
});

test('regressionStats HC1 matches the sandwich reference', () => {
  const stats = regressionStats(rows, 0, [1], 95, 'HC1');
  assert.ok(stats?.robust);
  if (!stats?.robust) return;
  close(stats.robust.intercept.se, 0.70604458, 1e-6);
  close(stats.robust.coefficients[0].se, 0.08994685, 1e-6);
  assert.ok(Number.isFinite(stats.robust.coefficients[0].p));
  assert.ok(stats.robust.coefficients[0].ciLo < stats.robust.coefficients[0].ciHi);
});

test('regressionStats HC3 is finite and wider than OLS on these data', () => {
  const ols = regressionStats(rows, 0, [1], 95);
  const hc3 = regressionStats(rows, 0, [1], 95, 'HC3');
  assert.ok(ols && hc3?.robust);
  if (!ols || !hc3?.robust) return;
  assert.ok(Number.isFinite(hc3.robust.coefficients[0].se));
  assert.ok(hc3.robust.coefficients[0].se > ols.coefficients[0].se);
});
