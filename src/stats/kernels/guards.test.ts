import test from 'node:test';
import assert from 'node:assert/strict';
import { GUARD_LIMITS, guardDimensions, sampleEvenly } from './guards';

test('guardDimensions accepts inputs inside the class limits', () => {
  assert.deepEqual(guardDimensions({ rows: 100, columns: 4 }, GUARD_LIMITS.quadratic), { ok: true });
  assert.deepEqual(
    guardDimensions({ rows: 50000, columns: 500 }, GUARD_LIMITS.linear),
    { ok: true }
  );
});

test('guardDimensions reports rows, columns and groups with a readable reason', () => {
  const rows = guardDimensions({ rows: 2001, columns: 3 }, GUARD_LIMITS.quadratic);
  assert.equal(rows.ok, false);
  if (rows.ok) return;
  assert.equal(rows.dimension, 'rows');
  assert.equal(rows.requested, 2001);
  assert.equal(rows.limit, 2000);
  assert.match(rows.message, /Too many rows for this procedure \(2001 > 2000\)/);

  const columns = guardDimensions({ rows: 10, columns: 51 }, GUARD_LIMITS.quadratic);
  assert.equal(columns.ok, false);
  if (!columns.ok) assert.equal(columns.dimension, 'columns');

  const groups = guardDimensions({ rows: 10, columns: 2, groups: 21 }, GUARD_LIMITS.quadratic);
  assert.equal(groups.ok, false);
  if (!groups.ok) {
    assert.equal(groups.dimension, 'groups');
    assert.match(groups.message, /Too many groups/);
  }
});

test('sampleEvenly keeps order and endpoints while thinning', () => {
  const items = Array.from({ length: 1000 }, (_, index) => index);
  const sampled = sampleEvenly(items, 120);
  assert.equal(sampled.length, 120);
  assert.equal(sampled[0], 0);
  assert.equal(sampled.at(-1), 999);
  assert.deepEqual(sampled, [...sampled].sort((left, right) => left - right));
  assert.equal(new Set(sampled).size, sampled.length);
});

test('sampleEvenly copies inputs that already fit and handles edge sizes', () => {
  const items = [1, 2, 3];
  const copy = sampleEvenly(items, 10);
  assert.deepEqual(copy, items);
  assert.notEqual(copy, items);

  assert.deepEqual(sampleEvenly(items, 1), [1]);
  assert.deepEqual(sampleEvenly(items, 0), []);
  assert.deepEqual(sampleEvenly([], 5), []);
});
