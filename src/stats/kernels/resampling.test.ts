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
