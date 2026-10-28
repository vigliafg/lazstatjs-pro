import test from 'node:test';
import assert from 'node:assert/strict';
import type { GridData } from './types';
import {
  isMissingCell,
  isMissingCode,
  maskMissingCodes,
  missingCellCount,
  missingCodeCount,
} from './types';

const grid = (): GridData => ({
  cols: [
    { id: 'a', name: 'Score', type: 'num', missing: ['-9', 'NA'] },
    { id: 'b', name: 'Plain', type: 'num' },
  ],
  rows: [
    ['-9', '1'],
    ['NA', ''],
    [' 12 ', '3'],
    ['', '4'],
  ],
});

test('declared codes are missing, blanks are missing, real values are not', () => {
  const g = grid();
  assert.equal(isMissingCode(g.cols[0], '-9'), true);
  assert.equal(isMissingCode(g.cols[0], 'NA'), true);
  assert.equal(isMissingCode(g.cols[0], '12'), false);
  assert.equal(isMissingCode(g.cols[1], '-9'), false);

  assert.equal(isMissingCell(g.cols[0], '-9'), true);
  assert.equal(isMissingCell(g.cols[0], ''), true);
  assert.equal(isMissingCell(g.cols[1], ''), true);
  assert.equal(isMissingCell(g.cols[0], '12'), false);
});

test('missing counts include declared codes per column and overall', () => {
  const g = grid();
  assert.equal(missingCodeCount(g), 2);
  assert.equal(missingCellCount(g, 0), 3);
  assert.equal(missingCellCount(g, 1), 1);
  assert.equal(missingCellCount(g), 4);
});

test('masking blanks only the declared codes, leaving blanks and values intact', () => {
  const masked = maskMissingCodes(grid());
  assert.deepEqual(masked.rows[0][0], '');
  assert.deepEqual(masked.rows[1][0], '');
  assert.equal(masked.rows[2][0], ' 12 ');
  assert.equal(masked.rows[3][0], '');
  assert.equal(masked.rows[0][1], '1');

  const untouched = grid();
  untouched.cols.forEach(col => delete col.missing);
  assert.equal(maskMissingCodes(untouched), untouched);
});
