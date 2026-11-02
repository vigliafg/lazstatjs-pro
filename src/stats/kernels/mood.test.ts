import test from 'node:test';
import assert from 'node:assert/strict';
import { moodMedianTest } from './mood';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

// Reference: coin::median_test(y ~ g), asymptotic Brown–Mood test.
test('Mood median test matches coin median_test', () => {
  const result = moodMedianTest([
    { name: 'A', values: [5.1, 4.8, 5.5, 4.9, 5.2, 5.0] },
    { name: 'B', values: [5.4, 5.9, 5.1, 5.6, 5.3, 5.7] },
    { name: 'C', values: [4.2, 4.5, 3.9, 4.4, 4.1, 4.3] },
  ]);
  assert.ok(result);
  close(result!.median, 5.05, 1e-12);
  assert.equal(result!.above, 9);
  assert.equal(result!.below, 9);
  assert.equal(result!.df, 2);
  close(result!.chi2, 11.333333333333334, 1e-12);
  close(result!.p, 0.0034593773364647584, 1e-12);
  assert.deepEqual(
    result!.groups.map(group => [group.name, group.above, group.below]),
    [
      ['A', 3, 3],
      ['B', 6, 0],
      ['C', 0, 6],
    ]
  );
});

test('Mood test rejects a single group or a constant side', () => {
  assert.equal(moodMedianTest([{ name: 'A', values: [1, 2, 3] }]), null);
  assert.equal(
    moodMedianTest([
      { name: 'A', values: [1, 1, 1] },
      { name: 'B', values: [1, 1] },
    ]),
    null
  );
});
