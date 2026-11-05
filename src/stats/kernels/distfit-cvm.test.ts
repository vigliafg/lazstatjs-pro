import test from 'node:test';
import assert from 'node:assert/strict';
import { fitDistributions } from './distfit';

test('normal Cramér–von Mises matches the reference value', () => {
  const values = [2.1, 2.8, 3.2, 3.6, 4.1, 4.4, 5.0, 5.3];
  const fit = fitDistributions(values, ['normal'])[0];
  assert.ok(fit);
  // R: 1/(12n) + sum((pnorm(sort(x), mean(x), sd(x)*sqrt((n-1)/n)) - (2*i-1)/(2*n))^2)
  const expected = 0.0203743838;
  assert.ok(Math.abs(fit.cvm - expected) < 1e-8, `${fit.cvm} != ${expected}`);
});

test('CvM is finite and positive for every fitted distribution', () => {
  const values = [2.1, 2.8, 3.2, 3.6, 4.1, 4.4, 5.0, 5.3, 6.2, 7.1];
  const fits = fitDistributions(values);
  assert.ok(fits.length >= 4);
  assert.ok(fits.every(fit => Number.isFinite(fit.cvm) && fit.cvm > 0));
});
