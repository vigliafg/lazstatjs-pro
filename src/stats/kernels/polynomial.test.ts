import test from 'node:test';
import assert from 'node:assert/strict';
import { fitPolynomial, polynomialCurve, polynomialDegreeScan, polynomialValue } from './polynomial';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('a quadratic is recovered exactly', () => {
  const x = [-3, -2, -1, 0, 1, 2, 3, 4];
  const y = x.map(value => 1 + 2 * value + 3 * value * value);
  const fit = fitPolynomial(x, y, 2);
  assert.ok(fit);
  close(fit!.coefficients[0].b, 1);
  close(fit!.coefficients[1].b, 2);
  close(fit!.coefficients[2].b, 3);
  close(fit!.r2, 1);
  close(fit!.sse, 0, 1e-18);
  close(polynomialValue(fit!, 5), 1 + 2 * 5 + 3 * 25);
});

test('invalid degrees and short samples return null', () => {
  const x = [1, 2, 3];
  const y = [1, 2, 3];
  assert.equal(fitPolynomial(x, y, 0), null);
  assert.equal(fitPolynomial(x, y, 13), null);
  assert.equal(fitPolynomial(x, y, 2), null);
  assert.equal(fitPolynomial([1, 2], [1, 2], 1), null);
});

test('the degree scan ranks nested models and the curve spans the data', () => {
  const x = [0, 1, 2, 3, 4, 5, 6];
  const y = x.map(value => 2 + 0.5 * value + 0.2 * value * value);
  const scan = polynomialDegreeScan(x, y, 4);
  assert.deepEqual(scan.map(entry => entry.degree), [1, 2, 3, 4]);
  assert.ok(scan[1].r2 >= scan[0].r2);

  const fit = fitPolynomial(x, y, 2)!;
  const curve = polynomialCurve(fit, x, 5);
  assert.equal(curve.length, 5);
  close(curve[0].x, 0);
  close(curve[4].x, 6);
  close(curve[2].y, polynomialValue(fit, 3));
});
