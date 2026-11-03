import test from 'node:test';
import assert from 'node:assert/strict';
import { fitLocalStateSpace, fitMarkovStateSpace } from '../kernels/statespace';
import { assertClose, assertCloseMatrix, assertCloseVector, loadFixture } from './harness';

interface StateSpaceFixture {
  source: string;
  local: {
    data: number[];
    observationVariance: number;
    levelVariance: number;
    trendVariance: number;
    logLik: number;
    levels: number[];
    trends: number[];
    forecastMean: number[];
    forecastVariance: number[];
  };
  markov: {
    data: number[];
    means: [number, number];
    variances: [number, number];
    phi: number;
    transition: [[number, number], [number, number]];
    logLik: number;
    smoothed: number[][];
    forecastMean: number[];
  };
}

const fixture = loadFixture<StateSpaceFixture>('statespace.json');

test('local linear trend matches the Kalman/RTS reference', () => {
  const fit = fitLocalStateSpace({
    values: fixture.local.data,
    horizon: fixture.local.forecastMean.length,
    trend: true,
  });
  assert.ok(fit);
  assertClose(fit!.observationVariance, fixture.local.observationVariance, { absolute: 1e-4 }, 'observation variance');
  assertClose(fit!.levelVariance, fixture.local.levelVariance, { absolute: 1e-4 }, 'level variance');
  assertClose(fit!.trendVariance, fixture.local.trendVariance, { absolute: 1e-4 }, 'trend variance');
  assertClose(fit!.logLik, fixture.local.logLik, { absolute: 1e-4 }, 'log likelihood');
  assertCloseVector(fit!.points.map(point => point.level), fixture.local.levels, { absolute: 1e-3 }, 'smoothed level');
  assertCloseVector(fit!.points.map(point => point.trend), fixture.local.trends, { absolute: 1e-3 }, 'smoothed trend');
  assertCloseVector(
    fit!.forecast.map(point => point.mean),
    fixture.local.forecastMean,
    { absolute: 1e-3 },
    'forecast mean'
  );
  assertCloseVector(
    fit!.forecast.map(point => point.se * point.se),
    fixture.local.forecastVariance,
    { absolute: 1e-3 },
    'forecast variance'
  );
});

test('two-regime Markov switching AR(1) matches the Hamilton/Kim reference', () => {
  const fit = fitMarkovStateSpace({
    values: fixture.markov.data,
    horizon: fixture.markov.forecastMean.length,
  });
  assert.ok(fit);
  assertCloseVector(fit!.means, fixture.markov.means, { absolute: 1e-5 }, 'regime means');
  assertCloseVector(fit!.variances, fixture.markov.variances, { absolute: 1e-5 }, 'regime variances');
  assertClose(fit!.autoregressive, fixture.markov.phi, { absolute: 1e-5 }, 'AR coefficient');
  assertCloseMatrix(fit!.transition, fixture.markov.transition, { absolute: 1e-5 }, 'transition matrix');
  assertClose(fit!.logLik, fixture.markov.logLik, { absolute: 1e-4 }, 'log likelihood');
  assertCloseMatrix(fit!.smoothed, fixture.markov.smoothed, { absolute: 1e-5 }, 'smoothed probabilities');
  assertCloseVector(
    fit!.forecast.map(point => point.mean),
    fixture.markov.forecastMean,
    { absolute: 1e-4 },
    'forecast mean'
  );
});
