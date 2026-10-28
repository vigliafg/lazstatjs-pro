import test from 'node:test';
import assert from 'node:assert/strict';
import { completeNumericRows, numericColumnValues } from './data';

const grid = {
  cols: [
    { name: 'A', type: 'num' as const },
    { name: 'B', type: 'num' as const },
    { name: 'C', type: 'str' as const },
  ],
  rows: [
    ['1', '2', 'x'],
    ['3', '', 'y'],
    [' 4 ', '5', 'z'],
    ['nope', '6', 'w'],
  ],
};

test('numericColumnValues ignores empty and non-numeric cells', () => {
  assert.deepEqual(numericColumnValues(grid, 0), [1, 3, 4]);
  assert.deepEqual(numericColumnValues(grid, 1), [2, 5, 6]);
});

test('completeNumericRows keeps only rows complete on every selected column', () => {
  assert.deepEqual(completeNumericRows(grid, [0, 1]), [
    [1, 2],
    [4, 5],
  ]);
});
