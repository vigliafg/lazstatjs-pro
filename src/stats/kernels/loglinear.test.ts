import test from 'node:test';
import assert from 'node:assert/strict';
import { isLoglinearTable, loglinearDesign, loglinearFit } from './loglinear';
import { assertClose, assertCloseMatrix, TOLERANCES } from '../reference/harness';

const THREE_BY_THREE = [
  [20, 15, 10],
  [25, 30, 12],
  [18, 22, 28],
];

const TWO_BY_TWO = [
  [42, 18],
  [21, 34],
];

test('independence model reproduces the row×column/N expected frequencies', () => {
  const fit = loglinearFit({
    observed: THREE_BY_THREE,
    rowLabels: ['Low', 'Medium', 'High'],
    colLabels: ['Yes', 'No', 'Undecided'],
    model: 'independence',
    level: 95,
  });
  assert.ok(fit);

  const rowTotals = THREE_BY_THREE.map(row => row.reduce((sum, value) => sum + value, 0));
  const colTotals = THREE_BY_THREE[0].map((_, column) =>
    THREE_BY_THREE.reduce((sum, row) => sum + row[column], 0)
  );
  const n = rowTotals.reduce((sum, value) => sum + value, 0);
  const expected = rowTotals.map((rowTotal, i) => colTotals.map(colTotal => (rowTotal * colTotal) / n));

  assertCloseMatrix(fit!.expected, expected, TOLERANCES.r);
  assert.equal(fit!.n, n);
  assert.equal(fit!.cells, 9);
  assert.equal(fit!.dfResidual, 4);
  assert.equal(fit!.coefficients.length, 5);
  assert.deepEqual(
    fit!.coefficients.map(coefficient => coefficient.term),
    ['(Intercept)', 'Medium', 'High', 'No', 'Undecided']
  );

  const g2 = 2 * THREE_BY_THREE.reduce(
    (sum, row, i) =>
      sum +
      row.reduce(
        (inner, value, j) =>
          value > 0 ? inner + value * Math.log(value / fit!.expected[i][j]) : inner,
        0
      ),
    0
  );
  assertClose(fit!.deviance, g2, TOLERANCES.r);
  assertClose(fit!.p, 0.022846307553995, TOLERANCES.rProbability);

  fit!.coefficients.forEach(coefficient => {
    assertClose(coefficient.expBeta, Math.exp(coefficient.beta), TOLERANCES.exact);
    assertClose(coefficient.expLo, Math.exp(coefficient.lo), TOLERANCES.exact);
    assertClose(coefficient.expHi, Math.exp(coefficient.hi), TOLERANCES.exact);
  });

  fit!.cellsTable.forEach(cell => {
    assertClose(cell.residual, (cell.observed - cell.expected) / Math.sqrt(cell.expected), TOLERANCES.r);
  });
});

test('saturated 2×2 model reproduces the table and reports the interaction odds ratio', () => {
  const fit = loglinearFit({
    observed: TWO_BY_TWO,
    rowLabels: ['Treatment', 'Control'],
    colLabels: ['Improved', 'Unchanged'],
    model: 'saturated',
    level: 95,
  });
  assert.ok(fit);

  assertCloseMatrix(fit!.expected, TWO_BY_TWO, TOLERANCES.r);
  assertClose(fit!.deviance, 0, TOLERANCES.r);
  assert.equal(fit!.dfResidual, 0);
  assert.ok(Number.isNaN(fit!.p));
  assert.equal(fit!.coefficients.length, 4);
  assert.ok(fit!.oddsRatio);

  const oddsRatio = (42 * 34) / (18 * 21);
  assertClose(fit!.oddsRatio!.oddsRatio, oddsRatio, TOLERANCES.r);
  const interaction = fit!.coefficients[3];
  assertClose(fit!.oddsRatio!.oddsRatio, Math.exp(interaction.beta), TOLERANCES.r);
  assertClose(fit!.oddsRatio!.lo, interaction.expLo, TOLERANCES.exact);
  assertClose(fit!.oddsRatio!.hi, interaction.expHi, TOLERANCES.exact);
});

test('a zero cell is estimable under independence but not in the saturated model', () => {
  const observed = [
    [10, 0],
    [5, 15],
  ];
  const independence = loglinearFit({
    observed,
    rowLabels: ['A', 'B'],
    colLabels: ['x', 'y'],
    model: 'independence',
    level: 95,
  });
  assert.ok(independence);
  assert.ok(independence!.expected.flat().every(value => value > 0));
  assert.equal(independence!.cellsTable[1].residual, -Math.sqrt(independence!.cellsTable[1].expected));

  const saturated = loglinearFit({
    observed,
    rowLabels: ['A', 'B'],
    colLabels: ['x', 'y'],
    model: 'saturated',
    level: 95,
  });
  assert.equal(saturated, null);
});

test('the design matrix uses treatment coding and the R interaction order', () => {
  const design = loglinearDesign(3, 3, 'saturated', ['Low', 'Medium', 'High'], ['Yes', 'No', 'Undecided']);
  assert.equal(design.matrix[0].length, 9);
  assert.deepEqual(design.terms, [
    '(Intercept)',
    'Medium',
    'High',
    'No',
    'Undecided',
    'Medium:No',
    'High:No',
    'Medium:Undecided',
    'High:Undecided',
  ]);
  // Second row, first column: intercept + row dummy + the first interaction.
  assert.deepEqual(design.matrix[3], [1, 1, 0, 0, 0, 0, 0, 0, 0]);
  // Second row, second column: intercept + row2 + col2 + row2:col2.
  assert.deepEqual(design.matrix[4], [1, 1, 0, 1, 0, 1, 0, 0, 0]);
});

test('invalid tables are rejected', () => {
  assert.equal(isLoglinearTable([]), false);
  assert.equal(isLoglinearTable([[1, 2]]), false);
  assert.equal(isLoglinearTable([[1, 2], [3]]), false);
  assert.equal(isLoglinearTable([[-1, 2], [3, 4]]), false);
  assert.equal(isLoglinearTable([[0, 0], [0, 0]]), false);
  assert.equal(isLoglinearTable([[0, 0], [3, 4]]), false);
  assert.equal(isLoglinearTable([[1, 0], [0, 0]]), false);
  assert.equal(isLoglinearTable([[1, 2], [3, 4]]), true);

  for (const observed of [
    [[1, 2], [3]],
    [[-1, 2], [3, 4]],
    [[0, 0], [3, 4]],
    [[1, 0], [0, 0]],
  ]) {
    assert.equal(
      loglinearFit({
        observed,
        rowLabels: ['A', 'B'],
        colLabels: ['x', 'y'],
        model: 'independence',
        level: 95,
      }),
      null
    );
  }
});

