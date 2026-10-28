import test from 'node:test';
import assert from 'node:assert/strict';
import { columnStrings, distinctValues, isNumericColumn, numericColumnIndexes } from './columns';

const grid = {
  cols: [
    { name: 'Num', type: 'num' as const },
    { name: 'Mixed', type: 'str' as const },
    { name: 'Group', type: 'cat' as const },
    { name: 'Short', type: 'num' as const },
  ],
  rows: [
    ['1', '2', 'A', ''],
    ['2', 'x', 'B', '5'],
    [' 3 ', '4', 'A', ''],
  ],
};

test('columnStrings trims cells and keeps empty values out of distinct()', () => {
  assert.deepEqual(columnStrings(grid, 0), ['1', '2', '3']);
  assert.deepEqual([...distinctValues(grid, 2)].sort(), ['A', 'B']);
});

test('isNumericColumn requires at least two parsable values', () => {
  assert.equal(isNumericColumn(grid, 0), true);
  assert.equal(isNumericColumn(grid, 1), false);
  assert.equal(isNumericColumn(grid, 2), false);
  assert.equal(isNumericColumn(grid, 3), false);
});

test('numericColumnIndexes lists only fully numeric columns', () => {
  assert.deepEqual(numericColumnIndexes(grid), [0]);
});
