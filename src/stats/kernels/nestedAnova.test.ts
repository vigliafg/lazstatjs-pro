import test from 'node:test';
import assert from 'node:assert/strict';
import { nestedAnova } from './nestedAnova';

const row = (outer: string, inner: string, value: number): string[] => [outer, inner, String(value)];

test('balanced nested design separates outer and inner effects', () => {
  const rows = [
    row('A', 'A1', 10), row('A', 'A1', 12), row('A', 'A2', 14), row('A', 'A2', 16),
    row('B', 'B1', 11), row('B', 'B1', 13), row('B', 'B2', 15), row('B', 'B2', 17),
    row('C', 'C1', 12), row('C', 'C1', 14), row('C', 'C2', 16), row('C', 'C2', 18),
  ];
  const result = nestedAnova(rows, 2, 0, 1);
  assert.ok(result);
  assert.deepEqual(result!.outerLevels, ['A', 'B', 'C']);
  assert.equal(result!.nTotal, 12);
  assert.equal(result!.outer.df, 2);
  assert.equal(result!.inner.df, 3);
  assert.equal(result!.error.df, 6);
  assert.ok(Math.abs(result!.outer.f - 0.25) < 1e-12);
  assert.ok(Math.abs(result!.inner.f - 8) < 1e-12);
  assert.equal(result!.groupStats.length, 6);
});

test('rows with missing values are dropped', () => {
  const rows = [
    row('A', 'A1', 10), row('A', 'A1', 12), row('A', 'A2', 14), row('A', 'A2', 16),
    row('B', 'B1', 11), row('B', 'B1', 13), row('B', 'B2', 15), row('B', 'B2', 17),
    ['B', 'B2', ''],
  ];
  const result = nestedAnova(rows, 2, 0, 1);
  assert.ok(result);
  assert.equal(result!.nTotal, 8);
});

test('an inner level shared by two outer levels is rejected', () => {
  const rows = [
    row('A', 'X', 10), row('A', 'X', 12), row('A', 'Y', 14), row('A', 'Y', 16),
    row('B', 'X', 11), row('B', 'X', 13), row('B', 'Z', 15), row('B', 'Z', 17),
  ];
  assert.equal(nestedAnova(rows, 2, 0, 1), null);
});

test('degenerate designs return null', () => {
  assert.equal(nestedAnova([], 2, 0, 1), null);
  assert.equal(nestedAnova([row('A', 'A1', 1)], 2, 0, 1), null);
  assert.equal(nestedAnova([row('A', 'A1', 1), row('A', 'A2', 2)], 2, 0, 0), null);
});
