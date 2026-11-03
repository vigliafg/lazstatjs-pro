import test from 'node:test';
import assert from 'node:assert/strict';
import { fitPolynomial } from '../kernels/polynomial';
import { assertClose, assertCloseVector, loadFixture, TOLERANCES } from './harness';

interface PolynomialCase {
  name: string;
  x: number[];
  y: number[];
  degree: number;
  coefficients: { degree: number; beta: number; se: number }[];
  r2: number;
  adjR2: number;
  f: number;
  pF: number;
  sse: number;
  rmse: number;
  aic: number;
  bic: number;
}

interface PolynomialFixture {
  source: string;
  generatedBy: string;
  cases: PolynomialCase[];
}

const fixture = loadFixture<PolynomialFixture>('polynomial.json');

test('polynomial regression matches the R raw-polynomial lm fixtures', () => {
  for (const reference of fixture.cases) {
    const fit = fitPolynomial(reference.x, reference.y, reference.degree);
    assert.ok(fit, `${reference.name}: fit returned null`);

    assertCloseVector(
      fit!.coefficients.map(coefficient => coefficient.b),
      reference.coefficients.map(coefficient => coefficient.beta),
      TOLERANCES.r,
      `${reference.name} beta`
    );
    assertCloseVector(
      fit!.coefficients.map(coefficient => coefficient.se),
      reference.coefficients.map(coefficient => coefficient.se),
      TOLERANCES.r,
      `${reference.name} se`
    );
    assertClose(fit!.r2, reference.r2, TOLERANCES.r, `${reference.name} r2`);
    assertClose(fit!.adjR2, reference.adjR2, TOLERANCES.r, `${reference.name} adjR2`);
    assertClose(fit!.f, reference.f, TOLERANCES.r, `${reference.name} F`);
    assertClose(fit!.pF, reference.pF, TOLERANCES.rProbability, `${reference.name} pF`);
    assertClose(fit!.sse, reference.sse, TOLERANCES.r, `${reference.name} sse`);
    assertClose(fit!.rmse, reference.rmse, TOLERANCES.r, `${reference.name} rmse`);
    assertClose(fit!.aic, reference.aic, TOLERANCES.r, `${reference.name} aic`);
    assertClose(fit!.bic, reference.bic, TOLERANCES.r, `${reference.name} bic`);
  }
});
