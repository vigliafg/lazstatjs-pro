import test from 'node:test';
import assert from 'node:assert/strict';
import { columnCountAfter, mapColumnIndex, mapColumnIndexes } from './columnOps';

test('insert shifts indexes at and after the insertion point', () => {
  const op = { kind: 'insert' as const, at: 2, count: 1 };
  assert.equal(mapColumnIndex(0, op), 0);
  assert.equal(mapColumnIndex(1, op), 1);
  assert.equal(mapColumnIndex(2, op), 3);
  assert.deepEqual(mapColumnIndexes([0, 2, 3], op), [0, 3, 4]);
  assert.equal(mapColumnIndex(-1, op), -1);
});

test('delete invalidates the removed column and shifts the rest', () => {
  const op = { kind: 'delete' as const, at: 1, count: 1 };
  assert.equal(mapColumnIndex(0, op), 0);
  assert.equal(mapColumnIndex(1, op), -1);
  assert.equal(mapColumnIndex(2, op), 1);
  assert.deepEqual(mapColumnIndexes([0, 1, 2], op), [0, 1]);
});

test('move remaps a permutation in both directions', () => {
  const right = { kind: 'move' as const, from: 0, to: 2 };
  assert.equal(mapColumnIndex(0, right), 2);
  assert.equal(mapColumnIndex(1, right), 0);
  assert.equal(mapColumnIndex(2, right), 1);
  const left = { kind: 'move' as const, from: 2, to: 0 };
  assert.equal(mapColumnIndex(0, left), 1);
  assert.equal(mapColumnIndex(2, left), 0);
});

test('split invalidates the original column and shifts the columns after it', () => {
  const op = { kind: 'split' as const, at: 1 };
  assert.equal(mapColumnIndex(0, op), 0);
  assert.equal(mapColumnIndex(1, op), -1);
  assert.equal(mapColumnIndex(2, op), 3);
});

test('split all shifts columns after the source by every inserted part', () => {
  const op = { kind: 'split' as const, at: 1, count: 3 };
  assert.equal(mapColumnIndex(0, op), 0);
  assert.equal(mapColumnIndex(1, op), -1);
  assert.equal(mapColumnIndex(2, op), 5);
  assert.equal(columnCountAfter(4, op), 7);
  assert.equal(columnCountAfter(4, { kind: 'split', at: 1 }), 5);
});

test('merge invalidates both sources and shifts columns after the high index', () => {
  const op = { kind: 'merge' as const, a: 1, b: 3 };
  assert.equal(mapColumnIndex(0, op), 0);
  assert.equal(mapColumnIndex(1, op), -1);
  assert.equal(mapColumnIndex(2, op), 2);
  assert.equal(mapColumnIndex(3, op), -1);
  assert.equal(mapColumnIndex(4, op), 3);
});

test('reset invalidates every reference', () => {
  assert.equal(mapColumnIndex(0, { kind: 'reset' }), -1);
  assert.deepEqual(mapColumnIndexes([0, 1, 2], { kind: 'reset' }), []);
});
