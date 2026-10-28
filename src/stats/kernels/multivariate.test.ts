import test from 'node:test';
import assert from 'node:assert/strict';
import { exploratoryFactorAnalysis } from './multivariate';

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('EFA recovers a single factor with unit communalities', () => {
  const data = Array.from({ length: 40 }, (_, index) => {
    const factor = Math.sin(index / 3) + Math.cos(index / 7);
    return [factor, factor * 2, factor * 0.5, factor + Math.sin(index) * 1e-10];
  });
  const result = exploratoryFactorAnalysis({
    data,
    variables: ['V1', 'V2', 'V3', 'V4'],
    standardize: true,
    factors: 1,
    rotation: 'none',
  });
  assert.ok(result);
  if (!result) return;
  assert.equal(result.factors, 1);
  assert.ok(result.communalities.every(value => value > 0.999));
  close(result.omega, 1, 1e-5);
  close(result.uniqueness.reduce((sum, value) => sum + value, 0), 0, 1e-5);
});

test('EFA on a two-factor structure returns valid loadings and omega', () => {
  const data = Array.from({ length: 90 }, (_, index) => {
    const f1 = Math.sin(index * 0.7);
    const f2 = Math.cos(index * 0.4);
    const noise = (k: number) => Math.sin(index * (1.3 + k));
    return [
      0.8 * f1 + 0.15 * f2 + 0.1 * noise(1),
      0.7 * f1 + 0.1 * f2 + 0.1 * noise(2),
      0.75 * f1 + 0.2 * f2 + 0.1 * noise(3),
      0.15 * f1 + 0.8 * f2 + 0.1 * noise(4),
      0.2 * f1 + 0.7 * f2 + 0.1 * noise(5),
      0.1 * f1 + 0.75 * f2 + 0.1 * noise(6),
    ];
  });
  const result = exploratoryFactorAnalysis({
    data,
    variables: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'],
    standardize: true,
    factors: 2,
    rotation: 'varimax',
  });
  assert.ok(result);
  if (!result) return;
  assert.equal(result.factors, 2);
  assert.ok(result.communalities.every(value => value > 0 && value <= 1));
  assert.ok(result.omega > 0 && result.omega <= 1);
  assert.ok(Number.isFinite(result.bartlettChi2));
  assert.ok(result.bartlettP >= 0 && result.bartlettP <= 1);
  assert.ok(result.variancePct.every(value => Number.isFinite(value) && value >= 0));
});
