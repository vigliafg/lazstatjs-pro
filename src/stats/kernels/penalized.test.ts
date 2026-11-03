import test from 'node:test';
import assert from 'node:assert/strict';
import { fitPenalized, penalizedPath } from './penalized';

const x = [
  [1, 0],
  [2, 1],
  [3, 0],
  [4, 1],
  [5, 0],
  [6, 1],
  [7, 0],
  [8, 1],
];
const y = x.map(row => 3 + 2 * row[0] - row[1]);

test('lambda = 0 reproduces ordinary least squares', () => {
  const fit = fitPenalized({ y, x, penalty: 'ridge', lambda: 0 });
  assert.ok(fit);
  assert.ok(Math.abs(fit!.coefficients[0] - 2) < 1e-8);
  assert.ok(Math.abs(fit!.coefficients[1] + 1) < 1e-8);
  assert.ok(Math.abs(fit!.intercept - 3) < 1e-8);
  assert.equal(fit!.df, 2);
});

test('ridge shrinks continuously while LASSO can drop coefficients', () => {
  const ridge = fitPenalized({ y, x, penalty: 'ridge', lambda: 1 });
  assert.ok(ridge);
  assert.ok(Math.abs(ridge!.coefficients[0]) < 2);

  const lasso = fitPenalized({ y, x, penalty: 'lasso', lambda: 100 });
  assert.ok(lasso);
  assert.deepEqual(lasso!.coefficients, [0, 0]);
  assert.equal(lasso!.df, 0);
  assert.ok(Math.abs(lasso!.intercept - 11.5) < 1e-8);
});

test('elastic net mixes the two penalties', () => {
  const ridge = fitPenalized({ y, x, penalty: 'ridge', lambda: 1 })!;
  const lasso = fitPenalized({ y, x, penalty: 'lasso', lambda: 1 })!;
  const elastic = fitPenalized({ y, x, penalty: 'elasticnet', alpha: 0.5, lambda: 1 })!;
  assert.ok(Math.abs(elastic.coefficients[0]) > Math.abs(lasso.coefficients[0]));
  assert.ok(Math.abs(elastic.coefficients[0]) < Math.abs(ridge.coefficients[0]));
});

test('the path is ordered by decreasing lambda', () => {
  const path = penalizedPath({ y, x, penalty: 'lasso' }, [1, 10, 0.1]);
  assert.deepEqual(path.map(fit => fit.lambda), [10, 1, 0.1]);
});

test('invalid inputs and negative lambda return null', () => {
  assert.equal(fitPenalized({ y, x, penalty: 'ridge', lambda: -1 }), null);
  assert.equal(fitPenalized({ y: [], x: [], penalty: 'ridge', lambda: 1 }), null);
  assert.equal(fitPenalized({ y, x: [[]], penalty: 'ridge', lambda: 1 }), null);
});
