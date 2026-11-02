import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  cholesky,
  multiply,
  pseudoInverse,
  solveLinear,
  svd,
  transpose,
  type Matrix,
} from './matrix';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

const closeMatrix = (actual: Matrix, expected: Matrix, tolerance = 1e-8) => {
  assert.equal(actual.length, expected.length);
  actual.forEach((row, i) => {
    assert.equal(row.length, expected[i].length);
    row.forEach((value, j) => close(value, expected[i][j], tolerance));
  });
};

describe('matrix primitives', () => {
  it('solves a non-singular linear system and rejects singular ones', () => {
    const solution = solveLinear(
      [
        [2, 1],
        [1, 3],
      ],
      [5, 7]
    );
    assert.ok(solution);
    close(solution![0], 1.6);
    close(solution![1], 1.8);

    assert.equal(
      solveLinear(
        [
          [1, 2],
          [2, 4],
        ],
        [1, 2]
      ),
      null
    );
  });

  it('computes a Cholesky factor that reconstructs the matrix', () => {
    const matrix = [
      [4, 2],
      [2, 3],
    ];
    const lower = cholesky(matrix);
    assert.ok(lower);
    closeMatrix(multiply(lower!, transpose(lower!)), matrix);
    assert.equal(
      cholesky([
        [1, 2],
        [2, 1],
      ]),
      null
    );
  });

  it('computes a thin SVD with descending singular values', () => {
    const result = svd([
      [1, 0],
      [0, 2],
      [0, 0],
    ]);
    close(result.s[0], 2);
    close(result.s[1], 1);
    const reconstructed = multiply(
      result.u.map(row => row.map((value, index) => value * result.s[index])),
      transpose(result.v)
    );
    closeMatrix(reconstructed, [
      [1, 0],
      [0, 2],
      [0, 0],
    ]);
  });

  it('computes a Moore–Penrose inverse for rank-deficient matrices', () => {
    const matrix = [
      [1, 2],
      [2, 4],
    ];
    const inverse = pseudoInverse(matrix);
    closeMatrix(multiply(multiply(matrix, inverse), matrix), matrix, 1e-8);
    closeMatrix(multiply(multiply(inverse, matrix), inverse), inverse, 1e-8);
  });
});
