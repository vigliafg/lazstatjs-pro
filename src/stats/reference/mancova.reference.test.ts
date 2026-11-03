import test from 'node:test';
import assert from 'node:assert/strict';
import { mancova } from '../kernels/mancova';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface MancovaFixture {
  source: string;
  generatedBy: string;
  ys: number[][];
  labels: string[];
  covariates: number[][];
  variableNames: string[];
  covariateNames: string[];
  wilks: { lambda: number; f: number; df1: number; df2: number; p: number };
  univariate: { variable: string; f: number; df1: number; df2: number; p: number }[];
}

const fixture = loadFixture<MancovaFixture>('mancova.json');

test('MANCOVA matches car::Anova on iris', () => {
  const result = mancova({
    ys: fixture.ys,
    labels: fixture.labels,
    covariates: fixture.covariates,
    variableNames: fixture.variableNames,
    covariateNames: fixture.covariateNames,
  });
  assert.ok(result);

  // car prints seven significant digits, so the fixture itself is rounded.
  assertClose(result!.wilks.lambda, fixture.wilks.lambda, 1e-6, 'Wilks lambda');
  assertClose(result!.wilks.f, fixture.wilks.f, 1e-5, 'Wilks F');
  assert.equal(result!.wilks.df1, fixture.wilks.df1);
  assert.equal(result!.wilks.df2, fixture.wilks.df2);
  if (fixture.wilks.p < 1e-16) {
    assert.ok(result!.wilks.p < 1e-16, `Wilks p: ${result!.wilks.p} should be far below 1e-16`);
  } else {
    assertClose(result!.wilks.p, fixture.wilks.p, TOLERANCES.rProbability, 'Wilks p');
  }

  assert.equal(result!.univariate.length, fixture.univariate.length);
  result!.univariate.forEach((item, index) => {
    const expected = fixture.univariate[index];
    assert.equal(item.variable, expected.variable);
    assertClose(item.f, expected.f, 1e-8, `${expected.variable} F`);
    assert.equal(item.df1, expected.df1);
    assert.equal(item.df2, expected.df2);
    if (expected.p < 1e-16) {
      assert.ok(item.p < 1e-16, `${expected.variable} p: ${item.p} should be far below 1e-16`);
    } else {
      assertClose(item.p, expected.p, TOLERANCES.rProbability, `${expected.variable} p`);
    }
  });
});
