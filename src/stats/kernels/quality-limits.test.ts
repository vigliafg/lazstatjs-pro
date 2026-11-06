import test from 'node:test';
import assert from 'node:assert/strict';
import { controlChart } from './quality';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

// Base R: subgroup means, pooled sd and per-point limits.
// g <- list(v[1:5], v[6:10], v[11:13]); sigma2 <- sum((n-1)*s^2)/sum(n-1).
const VALUES = [10.1, 9.8, 10.4, 10.0, 10.2, 9.9, 10.3, 10.1, 10.5, 10.2, 10.2, 10.0, 10.1];

test('an incomplete trailing subgroup keeps its own limits', () => {
  const result = controlChart(VALUES, 'xbar', 5);
  assert.ok(result);
  assert.deepEqual(result!.subgroupSizes, [5, 5, 3]);
  assert.equal(result!.points.length, 3);
  close(result!.center, 10.133333333333333);
  close(result!.sigma, 0.20493901531919184);
  assert.equal(result!.limits.length, 3);
  close(result!.limits[1].ucl, 10.408287875030682);
  close(result!.limits[2].ucl, 10.48829812031931);
  close(result!.limits[2].lcl, 9.7783685463473553);
  assert.ok(Number.isNaN(result!.rUcl), 'equal-size R limits do not exist');
});

test('equal subgroup sizes keep a single pair of limits', () => {
  const result = controlChart(VALUES.slice(0, 10), 'xbar', 5);
  assert.ok(result);
  assert.equal(result!.subgroupSizes, undefined);
  assert.equal(result!.limits.length, 0);
  close(result!.sigma, 0.25795356835769545);
});
