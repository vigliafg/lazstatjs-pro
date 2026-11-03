import test from 'node:test';
import assert from 'node:assert/strict';
import { oneVariance, severalVariances } from './variances';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

const x = [10.2, 9.8, 10.5, 9.9, 10.1, 10.3, 9.7, 10.0, 10.4, 9.6];
const y = [12.1, 11.8, 12.6, 12.3, 11.9, 12.5, 12.0, 12.2];

// Reference: R 4.x, pchisq((n-1)s2/mu0, n-1) and the chi-square interval.
test('one variance matches the chi-square test and interval', () => {
  const result = oneVariance(x, 0.25, 95);
  assert.ok(result);
  close(result!.n, 10);
  close(result!.variance, 0.091666666666666743, 1e-12);
  close(result!.chi2, 3.3000000000000029, 1e-9);
  close(result!.p, 0.097590618631806181, 1e-9);
  close(result!.lo, 0.043369083233981955, 1e-9);
  close(result!.hi, 0.30551148269758921, 1e-9);
});

// Reference: var.test(x, y).
test('the F test and interval match var.test', () => {
  const result = severalVariances(
    [
      { name: 'A', values: x },
      { name: 'B', values: y },
    ],
    95
  );
  assert.ok(result);
  close(result!.ratio, 1.1561561561561589, 1e-9);
  assert.equal(result!.df1, 9);
  assert.equal(result!.df2, 7);
  close(result!.fP, 0.86778216779072004, 1e-9);
  close(result!.fLo, 0.23970643159358085, 1e-9);
  close(result!.fHi, 4.8524413069790562, 1e-9);
});

// Reference: bartlett.test(z, g) and car::leveneTest(z ~ g, center = median).
test('Bartlett and Levene match their R references on three groups', () => {
  const groups = [
    { name: 'A', values: [5.1, 4.8, 5.5, 4.9, 5.2, 5.0] },
    { name: 'B', values: [5.4, 5.9, 5.1, 5.6, 5.3, 5.7] },
    { name: 'C', values: [4.2, 4.5, 3.9, 4.4, 4.1, 4.3] },
  ];
  const result = severalVariances(groups, 95);
  assert.ok(result);
  close(result!.bartlett.statistic, 0.39610376780013579, 1e-9);
  assert.equal(result!.bartlett.df, 2);
  close(result!.bartlett.p, 0.82032729025452589, 1e-9);
  close(result!.levene.statistic, 0.39393939393939292, 1e-9);
  assert.equal(result!.levene.df1, 2);
  assert.equal(result!.levene.df2, 15);
  close(result!.levene.p, 0.68117086999622845, 1e-9);
});

test('variance tests reject constant or single-group input', () => {
  assert.equal(oneVariance([5, 5, 5], 1), null);
  assert.equal(oneVariance(x, 0), null);
  assert.equal(severalVariances([{ name: 'A', values: x }]), null);
  assert.equal(
    severalVariances([
      { name: 'A', values: x },
      { name: 'B', values: [1, 1, 1] },
    ]),
    null
  );
});
