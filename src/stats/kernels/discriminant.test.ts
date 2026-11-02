import test from 'node:test';
import assert from 'node:assert/strict';
import { discriminantAnalysis } from './discriminant';

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
