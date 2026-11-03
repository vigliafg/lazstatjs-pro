import test from 'node:test';
import assert from 'node:assert/strict';
import { resamplingStats } from './resampling';

const rows = [
  ['1', 'A'], ['2', 'A'], ['3', 'A'], ['4', 'A'],
  ['10', 'B'], ['11', 'B'], ['12', 'B'], ['13', 'B'],
];

test('permutation and bootstrap detect a clear group difference', () => {
  const stats = resamplingStats({
    rows,
    outcomeIdx: 0,
    groupIdx: 1,
    statistic: 'mean',
    permutations: 500,
    bootstrap: 500,
    level: 95,
  });
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.n1, 4);
  assert.equal(stats.n2, 4);
  assert.ok(stats.difference > 8);
  assert.ok(stats.pPermutation < 0.05);
  assert.ok(stats.ciLo > 0);
});

test('resampling keeps the null when the groups are identical', () => {
  const same = rows.map(row => [row[0], row[1] === 'A' ? 'A' : 'B']);
  for (let index = 8; index < 12; index++) {
    same.push([String(index - 7), 'B']);
  }
  const stats = resamplingStats({
    rows: [
      ['1', 'A'], ['2', 'A'], ['3', 'A'], ['4', 'A'],
      ['1', 'B'], ['2', 'B'], ['3', 'B'], ['4', 'B'],
    ],
    outcomeIdx: 0,
    groupIdx: 1,
    statistic: 'median',
    permutations: 300,
    bootstrap: 300,
    level: 95,
  });
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.difference, 0);
  assert.ok(stats.pPermutation > 0.2);
  assert.ok(stats.ciLo <= 0 && stats.ciHi >= 0);
});

test('resampling requires exactly two groups', () => {
  assert.equal(
    resamplingStats({
      rows: [
        ['1', 'A'], ['2', 'A'], ['3', 'B'], ['4', 'B'], ['5', 'C'], ['6', 'C'],
      ],
      outcomeIdx: 0,
      groupIdx: 1,
      statistic: 'mean',
      permutations: 200,
      bootstrap: 200,
      level: 95,
    }),
    null
  );
});

const referenceClose = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('permutation p-value equals the exact value when every split is equally extreme', () => {
  const stats = resamplingStats({
    rows: [
      ['1', 'A'], ['2', 'A'], ['3', 'A'], ['4', 'A'],
      ['1', 'B'], ['2', 'B'], ['3', 'B'], ['4', 'B'],
    ],
    outcomeIdx: 0,
    groupIdx: 1,
    statistic: 'mean',
    permutations: 500,
    bootstrap: 200,
    level: 95,
  });
  assert.ok(stats);
  // Identical groups: |permuted difference| >= 0 always, so every draw is
  // extreme and the exact permutation p-value is 1.
  assert.equal(stats!.difference, 0);
  assert.equal(stats!.pPermutation, 1);
});

test('permutation p-value agrees with the exact 4-vs-4 enumeration', () => {
  const stats = resamplingStats({
    rows: [
      ['1', 'A'], ['2', 'A'], ['3', 'A'], ['4', 'A'],
      ['10', 'B'], ['11', 'B'], ['12', 'B'], ['13', 'B'],
    ],
    outcomeIdx: 0,
    groupIdx: 1,
    statistic: 'mean',
    permutations: 20000,
    bootstrap: 200,
    level: 95,
  });
  assert.ok(stats);
  assert.equal(stats!.difference, 9);
  assert.equal(stats!.stat1, 2.5);
  assert.equal(stats!.stat2, 11.5);
  // Exact two-sided enumeration of the C(8, 4) = 70 splits: only the two
  // extreme assignments reach |difference| = 9, so p = 2 / 70.
  assert.ok(
    Math.abs(stats!.pPermutation - 2 / 70) < 0.005,
    `${stats!.pPermutation} != ${2 / 70}`
  );
});

test('bootstrap percentile interval matches R quantile(type = 7)', () => {
  const stats = resamplingStats({
    rows: [
      ['1', 'A'], ['2', 'A'], ['3', 'A'], ['4', 'A'],
      ['10', 'B'], ['11', 'B'], ['12', 'B'], ['13', 'B'],
    ],
    outcomeIdx: 0,
    groupIdx: 1,
    statistic: 'mean',
    permutations: 99,
    bootstrap: 99,
    level: 95,
  });
  assert.ok(stats);
  // Reference computed with quantile(bootstrap_differences, c(0.025, 0.975),
  // type = 7) in R on the same deterministic bootstrap sample.
  referenceClose(stats!.ciLo, 7.6125, 1e-12);
  referenceClose(stats!.ciHi, 10.25, 1e-12);
  assert.equal(stats!.bootstrapDifferences.length, 99);
});
