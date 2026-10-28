import test from 'node:test';
import assert from 'node:assert/strict';
import { benjaminiHochberg } from './multiple';

const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);

test('BH keeps the monotone adjusted p-values of the original example', () => {
  const adjusted = benjaminiHochberg([0.01, 0.02, 0.03, 0.04, 0.05]);
  for (const value of adjusted) close(value, 0.05);
});

test('BH handles unsorted p-values and ignores non-finite inputs', () => {
  const adjusted = benjaminiHochberg([0.04, 0.01, NaN, 0.03, 0.02]);
  close(adjusted[1], 0.04);
  close(adjusted[4], 0.04);
  close(adjusted[3], 0.04);
  close(adjusted[0], 0.04);
  assert.ok(Number.isNaN(adjusted[2]));
});

test('BH caps adjusted p-values at 1 and keeps them ordered', () => {
  const adjusted = benjaminiHochberg([0.5, 0.9, 0.99]);
  assert.ok(adjusted.every(value => value <= 1));
  assert.ok(adjusted[0] <= adjusted[1] && adjusted[1] <= adjusted[2]);
});
