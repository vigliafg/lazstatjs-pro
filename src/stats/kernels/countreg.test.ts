import test from 'node:test';
import assert from 'node:assert/strict';
import { countRegressionStats } from './countreg';

const rows = [1, 0, 2, 0, 5, 1, 8, 2, 12, 3].map((value, index) => [
  String(value),
  String(index + 1),
]);

const close = (actual: number, expected: number, tolerance = 1e-5) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('Poisson regression matches the R glm reference', () => {
  const stats = countRegressionStats({ family: 'poisson', rows, depIdx: 0, indepIdxs: [1], level: 95 });
  assert.ok(stats);
  if (!stats) return;
  close(stats.coefficients[0].beta, -0.30371341, 1e-6);
  close(stats.coefficients[1].beta, 0.23732374, 1e-6);
  close(stats.coefficients[1].se, 0.068107144, 1e-5);
  close(stats.deviance, 24.07999, 1e-4);
  close(stats.aic, 52.05466, 1e-4);
  close(stats.logLik, -24.02733, 1e-4);
});

test('negative binomial regression matches the R glm.nb reference', () => {
  const stats = countRegressionStats({ family: 'negbin', rows, depIdx: 0, indepIdxs: [1], level: 95 });
  assert.ok(stats);
  if (!stats) return;
  assert.ok(stats.theta !== null);
  close(stats.theta ?? NaN, 2.29553, 1e-4);
  close(stats.coefficients[1].beta, 0.27118179, 1e-6);
  close(stats.coefficients[1].se, 0.10644882, 1e-5);
  close(stats.aic, 48.12031, 1e-4);
});

test('count regression validates counts and sample size', () => {
  assert.equal(
    countRegressionStats({ family: 'poisson', rows: [['-1', '1'], ['2', '2']], depIdx: 0, indepIdxs: [1], level: 95 }),
    null
  );
  assert.equal(
    countRegressionStats({ family: 'poisson', rows: [['1', '1']], depIdx: 0, indepIdxs: [1], level: 95 }),
    null
  );
});
