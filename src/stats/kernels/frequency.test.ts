import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FREQUENCY_MAX_LEVELS,
  equalShareChiSquare,
  frequencyTable,
  wilsonInterval,
} from './frequency';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('frequencyTable tallies values in numeric order and reports the mode', () => {
  const result = frequencyTable(['2', '10', '2', '', '1', '10', '2']);
  assert.ok(result);
  assert.equal(result!.total, 6);
  assert.equal(result!.missing, 1);
  assert.equal(result!.distinct, 3);
  assert.equal(result!.mode, '2');
  assert.deepEqual(
    result!.rows.map(row => [row.value, row.count, row.cumCount]),
    [
      ['1', 1, 1],
      ['2', 3, 4],
      ['10', 2, 6],
    ]
  );
  close(result!.rows[1].percent, 50);
  close(result!.rows[2].cumPercent, 100);
});

test('frequencyTable keeps text levels in lexicographic order', () => {
  const result = frequencyTable(['beta', 'alpha', 'beta', 'gamma']);
  assert.deepEqual(result!.rows.map(row => row.value), ['alpha', 'beta', 'gamma']);
  assert.equal(result!.mode, 'beta');
});

test('frequencyTable refuses empty or continuous columns', () => {
  assert.equal(frequencyTable([]), null);
  assert.equal(frequencyTable(['', ' ']), null);
  const many = Array.from({ length: FREQUENCY_MAX_LEVELS + 1 }, (_, index) => String(index));
  assert.equal(frequencyTable(many), null);
  assert.ok(frequencyTable(many.slice(0, FREQUENCY_MAX_LEVELS)));
});

// Reference: R 4.x, prop.test(k, n, correct = FALSE)$conf.int * 100.
test('Wilson interval matches prop.test without continuity correction', () => {
  const cases: [number, number, number, number][] = [
    [50, 150, 26.288764832387599, 41.210243313214946],
    [3, 10, 10.779126740630105, 60.322185253885451],
    [7, 10, 39.677814746114535, 89.22087325936991],
  ];
  for (const [successes, total, lo, hi] of cases) {
    const interval = wilsonInterval(successes, total, 95);
    close(interval.lo, lo, 1e-9);
    close(interval.hi, hi, 1e-9);
  }
  assert.ok(Number.isNaN(wilsonInterval(0, 0).lo));
});

test('equalShareChiSquare compares the tally with uniform shares', () => {
  const result = frequencyTable(['a', 'a', 'a', 'b', 'b', 'c']);
  const gof = equalShareChiSquare(result!);
  assert.ok(gof);
  // expected = 2, so chi2 = (1 + 0 + 1) / 2 = 1 with 2 df.
  close(gof!.chi2, 1);
  assert.equal(gof!.df, 2);
  close(gof!.p, Math.exp(-0.5), 1e-9);
});
