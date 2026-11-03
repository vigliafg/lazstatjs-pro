import test from 'node:test';
import assert from 'node:assert/strict';
import { fitMars, marsPredict, type MarsResult } from '../kernels/mars';

/** Deterministic nonlinear surface with a change of slope at x = 0. */
const sample = (n = 24) => {
  const x1: number[] = [];
  const x2: number[] = [];
  const y: number[] = [];
  for (let index = 0; index < n; index += 1) {
    const first = -1 + (2 * index) / (n - 1);
    const second = Math.sin(index / 3);
    x1.push(first);
    x2.push(second);
    y.push(2 + 3 * Math.max(first, 0) - 2 * Math.max(-first, 0) + 0.5 * second);
  }
  return { x: x1.map((value, row) => [value, x2[row]]), y };
};

const coefficients = (fit: MarsResult): number[] => fit.terms.map(term => term.coefficient);

test('mars fits an additive hinge model and predicts the fitted values', () => {
  const { x, y } = sample();
  const fit = fitMars({ y, x, names: ['x1', 'x2'], degree: 1, maxTerms: 9, penalty: 2 });
  assert.ok(fit);
  if (!fit) return;

  assert.equal(fit.converged, true);
  assert.equal(fit.n, y.length);
  assert.equal(fit.p, fit.terms.length);
  assert.equal(fit.selectedTerms, fit.terms.length);
  assert.equal(fit.terms[0].name, '(Intercept)');
  assert.ok(fit.terms.length >= 2);
  assert.ok(fit.terms.some(term => term.hinges.length > 0));
  assert.ok(Number.isFinite(fit.rss));
  assert.ok(Number.isFinite(fit.gcv));
  assert.ok(fit.r2 >= 0 && fit.r2 <= 1);
  assert.ok(fit.adjR2 <= fit.r2);
  assert.equal(fit.knots.length, new Set(fit.knots).size);
  assert.equal(fit.coefficients.length, fit.terms.length);
  assert.deepEqual(fit.coefficients, coefficients(fit));

  fit.terms.forEach(term => {
    assert.ok(Number.isFinite(term.coefficient));
    if (term.hinges.length === 0) assert.equal(term.knot, null);
    else assert.ok(Number.isFinite(term.knot));
  });

  x.forEach((row, index) => {
    const predicted = marsPredict(fit, row);
    assert.ok(Math.abs(predicted - fit.fitted[index]) < 1e-9);
  });
  fit.residuals.forEach((residual, index) => {
    assert.ok(Math.abs(residual - (y[index] - fit.fitted[index])) < 1e-12);
  });
});

test('degree 2 allows products between a parent basis and a new hinge', () => {
  const n = 30;
  const x: number[][] = [];
  const y: number[] = [];
  for (let index = 0; index < n; index += 1) {
    const first = -1 + (2 * index) / (n - 1);
    const second = Math.cos(index / 4);
    x.push([first, second]);
    y.push(1 + 2 * first + 3 * second + 4 * Math.max(first, 0) * Math.max(second, 0));
  }
  const fit = fitMars({ y, x, names: ['x1', 'x2'], degree: 2, maxTerms: 11, penalty: 3 });
  assert.ok(fit);
  if (!fit) return;
  assert.equal(fit.degree, 2);
  assert.ok(fit.terms.some(term => term.hinges.length === 2));
  assert.ok(Number.isFinite(fit.rss));
});

test('backward pruning never increases the number of terms and keeps a valid GCV', () => {
  const { x, y } = sample();
  const full = fitMars({ y, x, names: ['x1', 'x2'], degree: 1, maxTerms: 11, penalty: 2 });
  const pruned = fitMars({
    y,
    x,
    names: ['x1', 'x2'],
    degree: 1,
    maxTerms: 11,
    penalty: 2,
    prune: true,
  });
  assert.ok(full);
  assert.ok(pruned);
  if (!full || !pruned) return;
  assert.ok(pruned.p <= full.p);
  assert.ok(Number.isFinite(pruned.gcv));
  assert.ok(pruned.gcv <= full.gcv + 1e-9);
  assert.equal(pruned.pruned, pruned.p < full.p);
});

test('the importance table attributes the drop-one RSS increase to predictors', () => {
  const { x, y } = sample();
  const fit = fitMars({ y, x, names: ['x1', 'x2'], degree: 1, maxTerms: 9, penalty: 2 });
  assert.ok(fit);
  if (!fit) return;
  assert.equal(fit.importance.length, 2);
  fit.importance.forEach(entry => {
    assert.ok(Number.isFinite(entry.reduction));
    assert.ok(entry.reduction >= 0);
    assert.ok(entry.share >= 0 && entry.share <= 1);
  });
  const total = fit.importance.reduce((sum, entry) => sum + entry.share, 0);
  assert.ok(total <= 1 + 1e-9);
});

test('mars rejects invalid inputs instead of returning a partial fit', () => {
  const { x, y } = sample(8);

  assert.equal(fitMars({ y: y.slice(0, 4), x: x.slice(0, 4) }), null);
  assert.equal(fitMars({ y: y.map((value, index) => (index === 0 ? Number.NaN : value)), x }), null);
  assert.equal(
    fitMars({ y, x: x.map(row => [Number.POSITIVE_INFINITY, row[1]]), names: ['a', 'b'] }),
    null
  );
  assert.equal(fitMars({ y, x: x.map(() => []), names: [] }), null);
  assert.equal(fitMars({ y, x, degree: 3 }), null);
  assert.equal(fitMars({ y, x, maxTerms: 2 }), null);
  assert.equal(fitMars({ y, x, maxTerms: 99 }), null);
  assert.equal(fitMars({ y, x, penalty: -1 }), null);
  assert.equal(fitMars({ y, x, names: ['only one'] }), null);

  // Constant predictors make the design singular: there is no hinge to fit.
  const constant = Array.from({ length: 8 }, () => [1, 1]);
  assert.equal(fitMars({ y, x: constant, names: ['a', 'b'] }), null);

  // Duplicate predictors are exactly collinear, so the input design is singular.
  const duplicate = x.map(row => [row[0], row[0]]);
  assert.equal(fitMars({ y, x: duplicate, names: ['a', 'b'] }), null);
});
