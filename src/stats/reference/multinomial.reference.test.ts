import test from 'node:test';
import assert from 'node:assert/strict';
import { fitMultinomial } from '../kernels/multinomial';
import {
  assertClose,
  assertCloseMatrix,
  loadFixture,
  TOLERANCES,
} from './harness';

interface MultinomialFixtureCase {
  name: string;
  classes: string[];
  referenceClass: number;
  y: number[];
  x: number[][];
  coefficients: number[][];
  standardErrors: number[][];
  logLik: number;
  deviance: number;
  aic: number;
  fitted: number[][];
  predicted: number[];
  accuracy: number;
}

interface MultinomialFixture {
  source: string;
  generatedBy: string;
  cases: MultinomialFixtureCase[];
}

const fixture = loadFixture<MultinomialFixture>('multinomial.json');

// nnet::multinom() stops on a relative log-likelihood criterion; the fixture is
// generated with reltol = 1e-16 so the reference is numerically exhausted. The
// largest observed disagreement with this kernel's independent Newton fit is
// 1.3e-6 on an iris coefficient (magnitude ~19), i.e. ~7e-8 relative. A combined
// 1e-5 absolute / 1e-6 relative tolerance leaves headroom for nnet's stopping
// rule without hiding a real difference. Fitted probabilities agree to 2.2e-8,
// so they use the tighter 1e-7 absolute bound.
const coefficientTolerance = { absolute: 1e-5, relative: 1e-6 } as const;
const probabilityTolerance = { absolute: 1e-7, relative: 1e-6 } as const;

test('multinomial logistic regression matches the nnet::multinom fixtures', () => {
  assert.ok(fixture.cases.length >= 4);
  assert.equal(fixture.source, 'R nnet::multinom()');

  for (const reference of fixture.cases) {
    const fit = fitMultinomial({
      y: reference.y,
      x: reference.x,
      classes: reference.classes,
    });
    assert.ok(fit, `${reference.name}: model did not converge`);

    assert.deepEqual(fit!.classes, reference.classes, `${reference.name} classes`);
    assert.equal(fit!.referenceClass, reference.referenceClass, `${reference.name} referenceClass`);
    assert.equal(fit!.referenceClass, 0, `${reference.name}: the kernel uses the first class as reference`);
    assert.equal(fit!.n, reference.y.length, `${reference.name} n`);
    assert.equal(fit!.p, reference.x[0].length, `${reference.name} p`);
    assert.equal(fit!.coefficients.length, reference.classes.length - 1, `${reference.name} rows`);
    assert.equal(fit!.standardErrors.length, reference.classes.length - 1, `${reference.name} se rows`);
    assert.equal(fit!.fitted.length, reference.y.length, `${reference.name} fitted rows`);
    assert.equal(fit!.fitted[0].length, reference.classes.length, `${reference.name} fitted columns`);

    assertCloseMatrix(
      fit!.coefficients,
      reference.coefficients,
      coefficientTolerance,
      `${reference.name} coefficients`
    );
    assertCloseMatrix(
      fit!.standardErrors,
      reference.standardErrors,
      coefficientTolerance,
      `${reference.name} standard errors`
    );

    assertClose(fit!.logLik, reference.logLik, TOLERANCES.r, `${reference.name} logLik`);
    assertClose(fit!.deviance, reference.deviance, TOLERANCES.r, `${reference.name} deviance`);
    assertClose(fit!.aic, reference.aic, TOLERANCES.r, `${reference.name} AIC`);

    assertCloseMatrix(
      fit!.fitted,
      reference.fitted,
      probabilityTolerance,
      `${reference.name} fitted`
    );
    assert.deepEqual(fit!.predicted, reference.predicted, `${reference.name} predicted`);
    assertClose(fit!.accuracy, reference.accuracy, TOLERANCES.exact, `${reference.name} accuracy`);
  }
});

test('the multinomial fixture covers both iris and multi-predictor designs', () => {
  const names = fixture.cases.map(item => item.name);
  assert.ok(names.some(name => name.startsWith('iris-')));
  assert.ok(names.some(name => name === 'synthetic-two-predictors'));
  assert.ok(names.some(name => name === 'synthetic-four-predictors'));
  const widths = new Set(fixture.cases.map(item => item.x[0].length));
  assert.ok(widths.has(3));
  assert.ok(widths.has(5));
});
