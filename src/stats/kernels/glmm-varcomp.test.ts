import test from 'node:test';
import assert from 'node:assert/strict';
import { fitGlmm } from './glmm';

const groups: string[] = [];
const x: number[][] = [];
const y: number[] = [];
let seed = 7;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
for (let group = 0; group < 10; group += 1) {
  const effect = (random() - 0.5) * 2;
  for (let row = 0; row < 6; row += 1) {
    const value = (row - 2.5) / 2.5;
    const eta = -0.4 + 0.9 * value + effect;
    y.push(random() < 1 / (1 + Math.exp(-eta)) ? 1 : 0);
    x.push([1, value]);
    groups.push(`g${group}`);
  }
}

const fit = (level: number) => fitGlmm({ y, x, groups, family: 'binomial', link: 'logit', level })!;

test('GLMM variance components carry a Wald interval on the log scale', () => {
  const result = fit(95);
  const intercept = result.varianceComponents.find(entry => entry.component === 'intercept')!;
  assert.ok(intercept.estimate > 0);
  assert.ok(intercept.se > 0 && Number.isFinite(intercept.se));
  assert.ok(intercept.lo < intercept.estimate && intercept.estimate < intercept.hi);
  const narrow = fit(90).varianceComponents.find(entry => entry.component === 'intercept')!;
  assert.ok(narrow.lo > intercept.lo && narrow.hi < intercept.hi);
});

test('GLMM fixed effects tests mirror the Wald z of each coefficient', () => {
  const result = fit(95);
  assert.equal(result.fixedTests.length, result.coefficients.length);
  result.fixedTests.forEach((entry, index) => {
    const coefficient = result.coefficients[index];
    assert.ok(Math.abs(entry.chiSquare - coefficient.z * coefficient.z) < 1e-9);
    assert.equal(entry.p, coefficient.p);
    assert.equal(entry.df, 1);
  });
});
