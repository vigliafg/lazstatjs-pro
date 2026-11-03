import test from 'node:test';
import assert from 'node:assert/strict';
import { fitAlt } from '../kernels/alt';
import { assertClose, assertCloseVector, loadFixture, TOLERANCES } from './harness';

interface AltFixture {
  source: string;
  data: { time: number[]; event: number[]; stress: number[]; temperature: number[] };
  model: 'inversePower';
  useStress: number;
  referenceStress: number;
  coef: number[];
  scale: number;
  logLik: number;
  acceleration: number;
}

const fixture = loadFixture<AltFixture>('alt.json');

test('accelerated life Weibull AFT matches survival::survreg', () => {
  const fit = fitAlt({
    time: fixture.data.time,
    event: fixture.data.event,
    stress: fixture.data.stress,
    covariates: [{ name: 'temperature', values: fixture.data.temperature }],
    model: fixture.model,
    useStress: fixture.useStress,
    level: 95,
  });
  assert.ok(fit);
  assertClose(fit!.mu, fixture.coef[0], TOLERANCES.rProbability, 'ALT intercept');
  assertCloseVector(
    fit!.coefficients.map(coefficient => coefficient.beta),
    fixture.coef.slice(1),
    TOLERANCES.rProbability,
    'ALT coefficients'
  );
  assertClose(fit!.sigma, fixture.scale, TOLERANCES.rProbability, 'ALT scale');
  assertClose(fit!.logLik, fixture.logLik, TOLERANCES.rProbability, 'ALT log likelihood');
  assertClose(fit!.referenceStress, fixture.referenceStress, TOLERANCES.r, 'ALT reference stress');
  assertClose(fit!.accelerationFactor, fixture.acceleration, TOLERANCES.rProbability, 'ALT acceleration factor');
});
