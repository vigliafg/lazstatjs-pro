import test from 'node:test';
import assert from 'node:assert/strict';
import { fitLogistic } from '../kernels/logistic';
import { assertClose, assertCloseVector, loadFixture, TOLERANCES } from './harness';

interface ProbitCase {
  name: string;
  y: number[];
  predictors: number[][];
  coefficients: { beta: number; se: number }[];
  logLik: number;
  aic: number;
  nullDeviance: number;
  deviance: number;
}

interface ProbitFixture {
  source: string;
  generatedBy: string;
  cases: ProbitCase[];
}

const fixture = loadFixture<ProbitFixture>('probit.json');

test('probit regression matches glm(binomial(link = "probit"))', () => {
  for (const reference of fixture.cases) {
    const model = fitLogistic(
      reference.y,
      reference.predictors.map((values, index) => ({ name: `X${index + 1}`, values })),
      95,
      0.5,
      false,
      'probit'
    );
    assert.ok(model, `${reference.name}: model did not converge`);
    assert.equal(model!.link, 'probit');

    assertCloseVector(
      model!.beta,
      reference.coefficients.map(coefficient => coefficient.beta),
      TOLERANCES.rProbability,
      `${reference.name} beta`
    );
    assertCloseVector(
      model!.se,
      reference.coefficients.map(coefficient => coefficient.se),
      TOLERANCES.rProbability,
      `${reference.name} se`
    );
    assertClose(model!.logLik, reference.logLik, TOLERANCES.rProbability, `${reference.name} logLik`);
    assertClose(model!.aic, reference.aic, TOLERANCES.rProbability, `${reference.name} aic`);
  }
});
