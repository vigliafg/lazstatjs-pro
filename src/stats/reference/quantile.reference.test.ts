import test from 'node:test';
import assert from 'node:assert/strict';
import { fitQuantile } from '../kernels/quantile';
import { assertClose, assertCloseVector, loadFixture, TOLERANCES } from './harness';

interface QuantileFixtureCase {
  name: string;
  tau: number;
  y: number[];
  x: number[][] | number[];
  coefficients: { beta: number; se: number }[];
  fitted: number[];
  residuals: number[];
  objective: number;
}

interface QuantileFixture {
  source: string;
  generatedBy: string;
  cases: QuantileFixtureCase[];
}

const fixture = loadFixture<QuantileFixture>('quantile.json');

/**
 * The fixture stores predictor rows (the intercept is added here). `jsonlite`
 * unboxes a one-column `x`, so accept both shapes.
 */
const predictorRows = (x: number[][] | number[]): number[][] =>
  Array.isArray(x[0]) ? (x as number[][]) : (x as number[]).map(value => [value]);

// Barrodale–Roberts is an exact vertex solution, so the kernel reproduces
// quantreg's coefficients to ~1e-13; the declared tolerance starts from the
// standard 1e-6 preset and leaves headroom for jStat's normal approximations
// in the Powell sparsity estimate.
const TOLERANCE = TOLERANCES.rProbability;

test('quantile regression matches the quantreg::rq fixtures', () => {
  assert.ok(fixture.cases.length >= 6);
  for (const reference of fixture.cases) {
    const rows = predictorRows(reference.x);
    const design = reference.y.map((_, row) => [1, ...rows[row]]);
    const fit = fitQuantile({ y: reference.y, x: design, tau: reference.tau });
    assert.ok(fit, `${reference.name}: model did not converge`);

    assert.equal(fit!.tau, reference.tau, `${reference.name}: tau`);
    assert.equal(fit!.n, reference.y.length, `${reference.name}: n`);
    assert.equal(fit!.p, design[0].length, `${reference.name}: p`);
    assert.equal(fit!.coefficients.length, reference.coefficients.length, `${reference.name}: parameters`);

    assertCloseVector(
      fit!.coefficients.map(coefficient => coefficient.beta),
      reference.coefficients.map(coefficient => coefficient.beta),
      TOLERANCE,
      `${reference.name} beta`
    );
    assertCloseVector(
      fit!.coefficients.map(coefficient => coefficient.se),
      reference.coefficients.map(coefficient => coefficient.se),
      TOLERANCE,
      `${reference.name} se`
    );
    assertCloseVector(fit!.fitted, reference.fitted, TOLERANCE, `${reference.name} fitted`);
    assertCloseVector(fit!.residuals, reference.residuals, TOLERANCE, `${reference.name} residuals`);
    assertClose(fit!.objective, reference.objective, TOLERANCE, `${reference.name} objective`);
  }
});

test('the quantile fixture covers the declared median and tail cases', () => {
  const taus = new Set(fixture.cases.map(reference => reference.tau));
  for (const tau of [0.25, 0.5, 0.75]) assert.ok(taus.has(tau), `missing tau ${tau}`);
  assert.equal(fixture.generatedBy, 'src/stats/reference/r/quantile.R');
  // The mtcars case has an intercept plus wt and hp; the simple case has two
  // parameters including the intercept.
  const mtcars = fixture.cases.filter(reference => reference.name.startsWith('mtcars'));
  assert.equal(mtcars.length, 3);
  for (const reference of mtcars) assert.equal(reference.coefficients.length, 3);
  const simple = fixture.cases.find(reference => reference.name === 'simple-5-tau050');
  assert.ok(simple);
  assert.equal(simple!.coefficients.length, 2);
});
