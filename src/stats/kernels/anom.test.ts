import test from 'node:test';
import assert from 'node:assert/strict';
import { anom } from './anom';

const rows = (groups: Record<string, number[]>): string[][] =>
  Object.entries(groups).flatMap(([group, values]) =>
    values.map(value => [group, String(value)])
  );

test('decision lines flag a group outside the limits', () => {
  const data = rows({
    a: [6, 8, 10, 12, 14],
    b: [7, 9, 11, 13, 15],
    c: [13, 15, 17, 19, 21],
  });
  const result = anom(data, 1, 0, 0.05);
  assert.ok(result);
  assert.equal(result!.k, 3);
  assert.equal(result!.dfWithin, 12);
  assert.ok(result!.groups.every(group => Number.isFinite(group.lower)));
  assert.deepEqual(result!.outOfLimits, ['c']);
  assert.equal(result!.groups.find(group => group.group === 'c')!.outside, true);
});

test('unbalanced groups get group-specific limits', () => {
  const data = rows({
    a: [1, 2, 3, 4],
    b: [2, 3, 4, 5, 6, 7, 8],
  });
  const result = anom(data, 1, 0, 0.05);
  assert.ok(result);
  assert.notEqual(result!.groups[0].lower, result!.groups[1].lower);
  assert.equal(result!.groups[0].n, 4);
  assert.equal(result!.groups[1].n, 7);
});

test('invalid alpha and degenerate groups return null', () => {
  const data = rows({ a: [1, 2, 3], b: [2, 3, 4] });
  assert.equal(anom(data, 1, 0, 0), null);
  assert.equal(anom(data, 1, 0, 1), null);
  assert.equal(anom(rows({ a: [1, 2, 3] }), 1, 0), null);
  assert.equal(anom([], 1, 0), null);
  assert.equal(anom(data, 0, 0), null);
});
