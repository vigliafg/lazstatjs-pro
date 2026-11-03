import test from 'node:test';
import assert from 'node:assert/strict';
import { bayesAnalysis } from '../kernels/bayes';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface BayesFixture {
  source: string;
  normal: { data: number[]; mean: number; sd: number; lo: number; hi: number; df: number };
  proportion: { data: number[]; mean: number; lo: number; hi: number };
  rate: { data: number[]; mean: number; lo: number; hi: number };
  regression: { x: number[]; y: number[]; coefficients: number[]; sigma: number };
}

const fixture = loadFixture<BayesFixture>('bayesW9.json');
const options = {
  priorMean: 0,
  priorSd: 10,
  iterations: 6000,
  burnin: 1000,
  chains: 2,
  seed: 20261115,
};

test('normal posterior reproduces the conjugate t posterior', () => {
  const result = bayesAnalysis(fixture.normal.data, [], { ...options, mode: 'normal' });
  assert.ok(result);
  const parameter = result!.parameters[0];
  assertClose(parameter.mean, fixture.normal.mean, { absolute: 0.03 }, 'posterior mean');
  assertClose(parameter.sd, fixture.normal.sd, { absolute: 0.03 }, 'posterior sd');
  assertClose(parameter.lo, fixture.normal.lo, { absolute: 0.05 }, 'lower bound');
  assertClose(parameter.hi, fixture.normal.hi, { absolute: 0.05 }, 'upper bound');
});

test('binomial proportion reproduces the Beta posterior', () => {
  const result = bayesAnalysis(fixture.proportion.data, [], { ...options, mode: 'proportion' });
  assert.ok(result);
  const parameter = result!.parameters[0];
  assertClose(parameter.mean, fixture.proportion.mean, { absolute: 0.02 }, 'posterior mean');
  assertClose(parameter.lo, fixture.proportion.lo, { absolute: 0.05 }, 'lower bound');
  assertClose(parameter.hi, fixture.proportion.hi, { absolute: 0.05 }, 'upper bound');
});

test('Poisson rate reproduces the Gamma posterior', () => {
  const result = bayesAnalysis(fixture.rate.data, [], { ...options, mode: 'rate' });
  assert.ok(result);
  const parameter = result!.parameters[0];
  assertClose(parameter.mean, fixture.rate.mean, { absolute: 0.08 }, 'posterior mean');
  assertClose(parameter.lo, fixture.rate.lo, { absolute: 0.15 }, 'lower bound');
  assertClose(parameter.hi, fixture.rate.hi, { absolute: 0.15 }, 'upper bound');
});

test('Gaussian regression posterior centre matches least squares', () => {
  const x = fixture.regression.x.map(value => [value]);
  const result = bayesAnalysis(fixture.regression.y, x, {
    ...options,
    mode: 'regression',
    priorSd: 100,
    variableNames: ['x'],
  });
  assert.ok(result);
  result!.parameters.forEach((parameter, index) => {
    assertClose(parameter.mean, fixture.regression.coefficients[index], { absolute: 0.15 }, `beta ${index}`);
  });
  // The residual scale is weakly identified under the Jeffreys prior: the
  // posterior median is close to the least-squares sigma, while the mean has
  // a heavy right tail. The bound checks the order of magnitude.
  assertClose(result!.sigma!.median, fixture.regression.sigma, { absolute: 0.25 }, 'sigma median');
  assert.ok(result!.rhatMax < 1.05, `Rhat too high: ${result!.rhatMax}`);
});
