import test from 'node:test';
import assert from 'node:assert/strict';
import type { GridData } from './types';
import {
  columnIndex,
  evalFormula,
  formulaReferencesColumn,
  recalculateFormulas,
  renameFormulaReferences,
} from './formulas';
import { computeColumn, renameColumn } from './ops';

const grid = (): GridData => ({
  cols: [
    { id: 'a', name: 'Pre', type: 'num' },
    { id: 'b', name: 'Post', type: 'num' },
    { id: 'c', name: 'Diff', type: 'num', formula: 'Post - Pre' },
  ],
  rows: [
    ['5', '9', '4'],
    ['2', '10', '8'],
  ],
});

test('evalFormula reads columns by name and blanks missing numbers', () => {
  const g = grid();
  const { values, error } = evalFormula('Post - Pre', g.rows, columnIndex(g.cols));
  assert.equal(error, undefined);
  assert.deepEqual(values, ['4', '8']);

  const missing = evalFormula('Post - Pre', [['', '3']], columnIndex(g.cols));
  assert.deepEqual(missing.values, ['']);
  assert.equal(evalFormula('Sum(Post)', g.rows, columnIndex(g.cols)).error, 'Unknown column in expression');
  assert.equal(evalFormula('Nope + 1', g.rows, columnIndex(g.cols)).error, 'Unknown column in expression');
});

test('recalculateFormulas re-derives formula columns after a data edit', () => {
  const g = grid();
  const edited: GridData = { cols: g.cols, rows: [['6', '9', '4'], ['2', '10', '8']] };
  const next = recalculateFormulas(edited);
  assert.equal(next.rows[0][2], '3');
  assert.equal(next.rows[1][2], '8');
  assert.equal(recalculateFormulas(g), g);
});

test('formula dependency detects the edited column by name', () => {
  const g = grid();
  assert.equal(formulaReferencesColumn('Post - Pre', g.cols, 0), true);
  assert.equal(formulaReferencesColumn('Post - Pre', g.cols, 1), true);
  assert.equal(formulaReferencesColumn('Post - Pre', g.cols, 2), false);
  assert.equal(formulaReferencesColumn('PrePost - 1', g.cols, 0), false);
});

test('recalculating skips when the edited column is not referenced', () => {
  const g = grid();
  const edited: GridData = {
    cols: g.cols,
    rows: [['5', '9', '4', '100'], ['2', '10', '8', '200']],
  };
  const withExtra: GridData = {
    ...edited,
    cols: [...g.cols, { id: 'd', name: 'Extra', type: 'num' }],
  };
  const untouched = recalculateFormulas(withExtra, 3);
  assert.equal(untouched, withExtra);
  const touched = recalculateFormulas(withExtra, 0);
  assert.equal(touched.rows[0][2], '4');
});

test('editing a computed column still restores its formula', () => {
  const g = grid();
  const edited: GridData = {
    cols: g.cols,
    rows: [['5', '9', '999'], ['2', '10', '8']],
  };
  const next = recalculateFormulas(edited, 2);
  assert.equal(next.rows[0][2], '4');
});

test('formulas can reference an earlier computed column', () => {
  const g: GridData = {
    cols: [
      { id: 'a', name: 'A', type: 'num' },
      { id: 'b', name: 'B', type: 'num', formula: 'A * 2' },
      { id: 'c', name: 'C', type: 'num', formula: 'B + 1' },
    ],
    rows: [['3', '', '']],
  };
  const next = recalculateFormulas(g);
  assert.deepEqual(next.rows[0], ['3', '6', '7']);
});

test('a broken formula keeps its last values instead of blanking the column', () => {
  const g = grid();
  const broken: GridData = {
    cols: g.cols.map(col => (col.formula ? { ...col, formula: 'Gone + 1' } : col)),
    rows: g.rows,
  };
  const next = recalculateFormulas(broken);
  assert.deepEqual(next.rows.map(row => row[2]), ['4', '8']);
});

test('computeColumn stores an optional persistent formula', () => {
  const g = grid();
  const index = columnIndex(g.cols);
  const oneShot = computeColumn(g, 'Post - Pre', 'Delta', index);
  assert.equal(oneShot.grid.cols[3].formula, undefined);
  assert.equal(oneShot.grid.rows[0][3], '4');

  const persistent = computeColumn(g, 'Post - Pre', 'Delta', index, 'Post - Pre');
  assert.equal(persistent.grid.cols[3].formula, 'Post - Pre');
  assert.equal(persistent.grid.rows[1][3], '8');
});

test('renaming a column rewrites formula references', () => {
  assert.equal(renameFormulaReferences('Post - Pre', 'Pre', 'Baseline'), 'Post - Baseline');
  assert.equal(renameFormulaReferences('PrePost - Pre', 'Pre', 'Baseline'), 'PrePost - Baseline');

  const g = grid();
  const renamed = renameColumn(g, 0, 'Baseline');
  assert.equal(renamed.cols[2].formula, 'Post - Baseline');
});
