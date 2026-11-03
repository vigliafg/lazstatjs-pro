import test from 'node:test';
import assert from 'node:assert/strict';
import { goodnessOfFit } from './goodness';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

// Reference: R 4.x, chisq.test(c(30,20,25,15,10)).
test('goodness of fit with equal shares matches chisq.test', () => {
  const result = goodnessOfFit(['A', 'B', 'C', 'D', 'E'], [30, 20, 25, 15, 10]);
  assert.ok(result);
  close(result!.chi2, 12.5, 1e-12);
  assert.equal(result!.df, 4);
  close(result!.p, 0.013995792487650892, 1e-12);
  assert.deepEqual(result!.expected, [20, 20, 20, 20, 20]);
});

// Reference: chisq.test(c(30,20,25,15,10), p = c(.2,.2,.3,.2,.1)).
test('goodness of fit with custom proportions matches chisq.test', () => {
  const result = goodnessOfFit(
    ['A', 'B', 'C', 'D', 'E'],
    [30, 20, 25, 15, 10],
    [0.2, 0.2, 0.3, 0.2, 0.1]
  );
  assert.ok(result);
  close(result!.chi2, 7.083333333333333, 1e-12);
  close(result!.p, 0.13154942864148958, 1e-12);
  [20, 20, 30, 20, 10].forEach((value, index) => close(result!.expected[index], value, 1e-12));
});

test('goodness of fit normalises proportions that do not sum to one', () => {
  const result = goodnessOfFit(['A', 'B'], [30, 70], [1, 3]);
  assert.ok(result);
  close(result!.proportions[0], 0.25, 1e-12);
  close(result!.expected[0], 25, 1e-12);
  close(result!.expected[1], 75, 1e-12);
});

test('goodness of fit rejects degenerate input', () => {
  assert.equal(goodnessOfFit(['A'], [10]), null);
  assert.equal(goodnessOfFit(['A', 'B'], [10]), null);
  assert.equal(goodnessOfFit(['A', 'B'], [0, 0]), null);
  assert.equal(goodnessOfFit(['A', 'B'], [-1, 5]), null);
  assert.equal(goodnessOfFit(['A', 'B'], [5, 5], [2, 3, 4]), null);
  assert.equal(goodnessOfFit(['A', 'B'], [5, 5], [1, 0]), null);
});
