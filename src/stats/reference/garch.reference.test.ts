import test from 'node:test';
import assert from 'node:assert/strict';
import { fitGarch } from '../kernels/garch';
import { assertClose, assertCloseVector, loadFixture } from './harness';

interface GarchFixture {
  source: string;
  returns: number[];
  omega: number;
  alpha: number;
  beta: number;
  logLik: number;
  persistence: number;
  longRunVariance: number;
  halfLife: number;
  lastVariance: number;
  forecastVariance: number[];
}

const fixture = loadFixture<GarchFixture>('garch.json');

test('GARCH(1,1) matches the independent R maximum likelihood', () => {
  const fit = fitGarch({ values: fixture.returns, horizon: fixture.forecastVariance.length });
  assert.ok(fit);
  assertClose(fit!.omega, fixture.omega, { absolute: 1e-6 }, 'omega');
  assertClose(fit!.alpha, fixture.alpha, { absolute: 1e-6 }, 'alpha');
  assertClose(fit!.beta, fixture.beta, { absolute: 1e-6 }, 'beta');
  assertClose(fit!.logLik, fixture.logLik, { absolute: 1e-6 }, 'log likelihood');
  assertClose(fit!.persistence, fixture.persistence, { absolute: 1e-6 }, 'persistence');
  assertClose(fit!.longRunVariance, fixture.longRunVariance, { absolute: 1e-6 }, 'long-run variance');
  assertClose(fit!.halfLife, fixture.halfLife, { absolute: 1e-3 }, 'half-life');
  assertClose(fit!.sigma2[fit!.sigma2.length - 1], fixture.lastVariance, { absolute: 1e-5 }, 'last variance');
  assertCloseVector(
    fit!.forecast.map(point => point.variance),
    fixture.forecastVariance,
    { absolute: 1e-4 },
    'forecast variance'
  );
});
