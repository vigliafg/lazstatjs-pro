import test from 'node:test';
import assert from 'node:assert/strict';
import { mosaicCells } from './categorical';

test('mosaic cells tile the unit square and follow row totals', () => {
  const cells = mosaicCells({
    observed: [
      [10, 30],
      [20, 40],
    ],
    rows: ['A', 'B'],
    cols: ['X', 'Y'],
  });
  assert.equal(cells.length, 4);
  const firstRow = cells.filter(cell => cell.row === 'A');
  assert.equal(firstRow[0].x0, 0);
  assert.equal(firstRow[1].x1, 1);
  assert.ok(Math.abs(Number(firstRow[0].x1) - 0.25) < 1e-12);
  assert.ok(Math.abs(Number(cells[0].y1) - 1) < 1e-12);
  assert.ok(Math.abs(Number(cells[2].y0)) < 1e-12);
  const sum = cells.reduce((total, cell) => total + Number(cell.value), 0);
  assert.equal(sum, 100);
});

test('mosaic residuals match the standardized observed-minus-expected values', () => {
  const cells = mosaicCells({
    observed: [
      [10, 30],
      [20, 40],
    ],
    rows: ['A', 'B'],
    cols: ['X', 'Y'],
  });
  const first = cells[0];
  const expected = (40 * 30) / 100;
  assert.ok(Math.abs(Number(first.expected) - expected) < 1e-12);
  assert.ok(Math.abs(Number(first.residual) - (10 - expected) / Math.sqrt(expected)) < 1e-12);
});

test('mosaicCells returns nothing for an empty table', () => {
  assert.deepEqual(mosaicCells({ observed: [[0, 0]], rows: ['A'], cols: ['X', 'Y'] }), []);
});
