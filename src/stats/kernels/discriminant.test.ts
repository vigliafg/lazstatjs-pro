import test from 'node:test';
import assert from 'node:assert/strict';
import { discriminantAnalysis } from './discriminant';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

const data = [
  ...Array.from({ length: 10 }, (_, index) => [index * 0.1, (index % 3) * 0.2 + index * 0.01]),
  ...Array.from({ length: 10 }, (_, index) => [5 + index * 0.1, 6 + (index % 2) * 0.3 + index * 0.02]),
];
const labels = [...Array(10).fill('A'), ...Array(10).fill('B')];

test('discriminant separates two clear groups and classifies them well', () => {
  const result = discriminantAnalysis({ data, labels, variableNames: ['X', 'Y'] });
  assert.ok(result);
  assert.equal(result!.groups.length, 2);
  assert.equal(result!.accuracy, 1);
  assert.equal(result!.confusion[0][0], 10);
  assert.equal(result!.confusion[1][1], 10);
  assert.ok(result!.wilks.length >= 1);
  assert.ok(result!.wilks[0].lambda < 1);
  assert.ok(result!.wilks[0].p < 0.01);
  assert.equal(result!.canonicalScores.length, data.length);
  assert.equal(result!.coefficients.length, 2);
});

test('discriminant rejects one group or too few rows', () => {
  assert.equal(
    discriminantAnalysis({
      data: data.slice(0, 10),
      labels: labels.slice(0, 10),
      variableNames: ['X', 'Y'],
    }),
    null
  );
  assert.equal(
    discriminantAnalysis({
      data: data.slice(0, 3),
      labels: labels.slice(0, 3),
      variableNames: ['X', 'Y'],
    }),
    null
  );
});

// Reference: R 4.x, MASS::lda(g ~ x + y, prior = rep(1/3, 3)) on the same
// 15 observations. `svd` holds the singular values of the sphered
// between-group means, so its squares are the canonical roots.
test('discriminant matches the MASS::lda canonical roots, Wilks and classification', () => {
  const referenceData = [
    [1.0, 1.0],
    [1.2, 0.8],
    [0.9, 1.2],
    [1.1, 1.1],
    [1.3, 0.9],
    [2.0, 3.0],
    [2.2, 3.2],
    [1.9, 2.8],
    [2.1, 2.9],
    [2.3, 3.1],
    [3.0, 1.0],
    [3.2, 0.9],
    [2.9, 1.1],
    [3.1, 1.2],
    [3.3, 0.8],
  ];
  const referenceLabels = [
    ...Array(5).fill('A'),
    ...Array(5).fill('B'),
    ...Array(5).fill('C'),
  ];
  const result = discriminantAnalysis({
    data: referenceData,
    labels: referenceLabels,
    variableNames: ['x', 'y'],
  });
  assert.ok(result);
  assert.deepEqual(result!.groups, ['A', 'B', 'C']);

  // Group means printed by lda.
  close(result!.means[0][0], 1.1, 1e-12);
  close(result!.means[0][1], 1.0, 1e-12);
  close(result!.means[1][0], 2.1, 1e-12);
  close(result!.means[1][1], 3.0, 1e-12);
  close(result!.means[2][0], 3.1, 1e-12);
  close(result!.means[2][1], 1.0, 1e-12);

  // lda$svd^2.
  close(result!.canonicalEigen[0], 313.77944737665428, 1e-9);
  close(result!.canonicalEigen[1], 179.75756789949131, 1e-9);

  // prod(1 / (1 + lda$svd^2)) and sum(roots / (1 + roots)).
  close(result!.wilks[0].lambda, 1.7575073184897145e-05, 1e-9);
  close(result!.pillai, 1.9912909006906963, 1e-12);

  // predict(lda) classifies all 15 observations correctly.
  assert.equal(result!.accuracy, 1);
  assert.deepEqual(result!.confusion, [
    [5, 0, 0],
    [0, 5, 0],
    [0, 0, 5],
  ]);
});
