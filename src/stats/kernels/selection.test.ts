import test from 'node:test';
import assert from 'node:assert/strict';
import { bestSubsets, selectionF, stepwiseSelection } from './selection';

// Deterministic pseudo-random columns: one true linear predictor plus two
// unrelated columns. The sample is large enough that BIC rejects the noise.
let seed = 42;
// mulberry32: small deterministic generator without the lattice structure of
// a plain LCG, so the noise columns are genuinely unrelated to the trend.
const random = (): number => {
  seed = (seed + 0x6d2b79f5) | 0;
  let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};
const n = 40;
const x0 = Array.from({ length: n }, (_, index) => index / 4 + random());
const x1 = Array.from({ length: n }, () => random());
const noise = Array.from({ length: n }, () => random());
const y = x0.map(value => 3 + 2 * value + 0.4 * (random() - 0.5));
const predictors = [x0, x1, noise];

test('best subsets finds the true single predictor first', () => {
  const models = bestSubsets(y, predictors, 'bic');
  assert.ok(models);
  assert.deepEqual(models![0].variables, [0]);
  assert.deepEqual(models![models!.length - 1].variables, [0, 1, 2]);
  const full = models![models!.length - 1];
  assert.ok(Number.isFinite(full.cp));
});

test('forward stepwise keeps the true predictor and stops', () => {
  const result = stepwiseSelection(y, predictors, 'forward', 'bic');
  assert.ok(result);
  assert.deepEqual(result!.selected, [0]);
  assert.equal(result!.steps[0].action, 'start');
  assert.equal(result!.steps[result!.steps.length - 1].action, 'stop');
});

test('backward stepwise removes the noise predictors', () => {
  const result = stepwiseSelection(y, predictors, 'backward', 'bic');
  assert.ok(result);
  assert.deepEqual(result!.selected, [0]);
});

test('the p-value criterion accepts a significant predictor only', () => {
  const cleanY = x0.map((value, index) => 3 + 2 * value + 0.1 * Math.sin(index * 3));
  const significant = stepwiseSelection(cleanY, [x0], 'forward', 'p', 5);
  assert.deepEqual(significant!.selected, [0]);

  const orthogonal = Array.from({ length: n }, (_, index) => (index % 2 === 0 ? 1 : -1));
  const trend = Array.from({ length: n }, (_, index) => index + 1);
  const none = stepwiseSelection(trend, [orthogonal], 'forward', 'p', 5);
  assert.deepEqual(none!.selected, []);
  assert.equal(none!.steps[none!.steps.length - 1].action, 'stop');
});

test('selectionF reports the overall model test', () => {
  const models = bestSubsets(y, predictors, 'bic')!;
  const stats = selectionF(models[0], y.length);
  assert.ok(stats.f > 1);
  assert.ok(stats.p < 0.001);
});

test('degenerate inputs return null', () => {
  assert.equal(bestSubsets([], predictors), null);
  assert.equal(bestSubsets([1, 2], []), null);
  assert.equal(stepwiseSelection([1, 2], [], 'forward'), null);
  assert.equal(stepwiseSelection([1, 2], [[1], [2]], 'forward'), null);
});
