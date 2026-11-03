import test from 'node:test';
import assert from 'node:assert/strict';
import { fitGlmm, GLMM_LINKS, type GlmmInput } from './glmm';

/**
 * Deterministic pseudo-random numbers (LCG + Box–Muller). The tests build
 * their own data so they never depend on `Math.random`.
 */
const lcg = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const normal = (random: () => number): number => {
  const u = Math.max(random(), 1e-12);
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const poisson = (random: () => number, lambda: number): number => {
  const limit = Math.exp(-lambda);
  let product = 1;
  let count = 0;
  do {
    count += 1;
    product *= random();
  } while (product > limit && count < 1000);
  return count - 1;
};

const close = (actual: number, expected: number, tolerance: number, label: string): void => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: ${actual} vs ${expected} (tolerance ${tolerance})`
  );
};

interface Sample {
  y: number[];
  x: number[][];
  slope: number[];
  groups: string[];
}

/** Gaussian random intercept, balanced groups, true beta = (2, 3), sd_u = 1.5, sd_e = 1. */
const gaussianInterceptSample = (): Sample => {
  const random = lcg(20240101);
  const sample: Sample = { y: [], x: [], slope: [], groups: [] };
  const effects = Array.from({ length: 10 }, () => 1.5 * normal(random));
  // Centre the realised effects so the population intercept is exactly 2.
  const center = effects.reduce((sum, value) => sum + value, 0) / effects.length;
  for (let group = 0; group < 10; group += 1) {
    const effect = effects[group] - center;
    for (let row = 0; row < 10; row += 1) {
      const predictor = (row - 4.5) / 5;
      sample.y.push(2 + 3 * predictor + effect + normal(random));
      sample.x.push([1, predictor]);
      sample.slope.push(predictor);
      sample.groups.push(`g${group}`);
    }
  }
  return sample;
};

/** Gaussian random slope: true beta = (1, 2), sd_u = 1, sd_v = 0.6, sd_e = 0.7. */
const gaussianSlopeSample = (): Sample => {
  const random = lcg(987654);
  const sample: Sample = { y: [], x: [], slope: [], groups: [] };
  const interceptEffects = Array.from({ length: 12 }, () => normal(random));
  const slopeEffects = Array.from({ length: 12 }, () => 0.6 * normal(random));
  const centerIntercept = interceptEffects.reduce((sum, value) => sum + value, 0) / 12;
  const centerSlope = slopeEffects.reduce((sum, value) => sum + value, 0) / 12;
  for (let group = 0; group < 12; group += 1) {
    const interceptEffect = interceptEffects[group] - centerIntercept;
    const slopeEffect = slopeEffects[group] - centerSlope;
    for (let row = 0; row < 8; row += 1) {
      const predictor = (row - 3.5) / 3;
      sample.y.push(
        1 + 2 * predictor + interceptEffect + slopeEffect * predictor + 0.7 * normal(random)
      );
      sample.x.push([1, predictor]);
      sample.slope.push(predictor);
      sample.groups.push(`g${group}`);
    }
  }
  return sample;
};

/** Binomial random intercept: true beta = (-0.5, 1), sd_u = 0.8. */
const binomialSample = (): Sample => {
  const random = lcg(424242);
  const sample: Sample = { y: [], x: [], slope: [], groups: [] };
  const effects = Array.from({ length: 40 }, () => 0.8 * normal(random));
  const center = effects.reduce((sum, value) => sum + value, 0) / effects.length;
  for (let group = 0; group < 40; group += 1) {
    const effect = effects[group] - center;
    for (let row = 0; row < 20; row += 1) {
      const predictor = (row - 9.5) / 10;
      const eta = -0.5 + predictor + effect;
      const probability = 1 / (1 + Math.exp(-eta));
      sample.y.push(random() < probability ? 1 : 0);
      sample.x.push([1, predictor]);
      sample.slope.push(predictor);
      sample.groups.push(`g${group}`);
    }
  }
  return sample;
};

/** Poisson random intercept: true beta = (0.3, 0.5), sd_u = 0.4. */
const poissonSample = (): Sample => {
  const random = lcg(13579);
  const sample: Sample = { y: [], x: [], slope: [], groups: [] };
  const effects = Array.from({ length: 30 }, () => 0.4 * normal(random));
  const center = effects.reduce((sum, value) => sum + value, 0) / effects.length;
  for (let group = 0; group < 30; group += 1) {
    const effect = effects[group] - center;
    for (let row = 0; row < 20; row += 1) {
      const predictor = (row - 9.5) / 10;
      sample.y.push(poisson(random, Math.exp(0.3 + 0.5 * predictor + effect)));
      sample.x.push([1, predictor]);
      sample.slope.push(predictor);
      sample.groups.push(`g${group}`);
    }
  }
  return sample;
};

const input = (sample: Sample, overrides: Partial<GlmmInput>): GlmmInput => ({
  y: sample.y,
  x: sample.x,
  slope: sample.slope,
  groups: sample.groups,
  family: 'gaussian',
  link: 'identity',
  ...overrides,
});

test('gaussian identity without random slope recovers beta and the variance components', () => {
  const sample = gaussianInterceptSample();
  const fit = fitGlmm(input(sample, {}));
  assert.ok(fit);
  assert.equal(fit!.converged, true);
  close(fit!.coefficients[1].beta, 3, 0.4, 'slope beta');
  close(fit!.coefficients[0].beta, 2, 0.2, 'intercept beta');
  assert.ok(fit!.random.interceptVariance > 0.2, 'intercept variance should be positive');
  assert.ok(
    fit!.random.residualVariance > 0.5 && fit!.random.residualVariance < 2,
    `residual variance ${fit!.random.residualVariance}`
  );
  assert.equal(fit!.random.slopeVariance, 0);
  assert.equal(fit!.random.correlation, 0);
  close(fit!.icc, fit!.random.interceptVariance / (fit!.random.interceptVariance + fit!.random.residualVariance), 1e-12, 'icc');
});

test('gaussian with a random slope recovers the mean slope and a positive slope variance', () => {
  const sample = gaussianSlopeSample();
  const fit = fitGlmm(input(sample, { randomSlope: true }));
  assert.ok(fit);
  close(fit!.coefficients[1].beta, 2, 0.3, 'mean slope');
  assert.ok(fit!.random.slopeVariance > 0.01, `slope variance ${fit!.random.slopeVariance}`);
  assert.ok(fit!.random.interceptVariance > 0.05, `intercept variance ${fit!.random.interceptVariance}`);
  assert.ok(fit!.random.correlation >= -0.999 && fit!.random.correlation <= 0.999);
  // A random slope changes the interpretation of the ICC, but it must stay in (0, 1).
  assert.ok(fit!.icc > 0 && fit!.icc < 1, `icc ${fit!.icc}`);
});

test('binomial logit recovers the sign and size of beta on seeded data', () => {
  const sample = binomialSample();
  const fit = fitGlmm(input(sample, { family: 'binomial', link: 'logit' }));
  assert.ok(fit);
  assert.equal(fit!.converged, true);
  close(fit!.coefficients[1].beta, 1, 0.4, 'binomial slope');
  close(fit!.coefficients[0].beta, -0.5, 0.5, 'binomial intercept');
  assert.ok(Number.isNaN(fit!.random.residualVariance), 'residual variance is not defined');
  assert.ok(fit!.icc > 0 && fit!.icc < 1, `icc ${fit!.icc}`);
  assert.ok(fit!.fitted.every(value => value > 0 && value < 1), 'fitted probabilities must be inside (0, 1)');
});

test('poisson log recovers beta on seeded counts', () => {
  const sample = poissonSample();
  const fit = fitGlmm(input(sample, { family: 'poisson', link: 'log' }));
  assert.ok(fit);
  assert.equal(fit!.converged, true);
  close(fit!.coefficients[1].beta, 0.5, 0.15, 'poisson slope');
  close(fit!.coefficients[0].beta, 0.3, 0.15, 'poisson intercept');
  assert.ok(fit!.fitted.every(value => value > 0), 'Poisson means must be positive');
  assert.ok(Number.isNaN(fit!.random.residualVariance));
});

test('BLUPs: intercept effects are centred and their standard errors are positive', () => {
  const sample = gaussianInterceptSample();
  const fit = fitGlmm(input(sample, {}));
  assert.ok(fit);
  assert.equal(fit!.randomEffects.length, 10);
  const total = fit!.randomEffects.reduce((sum, effect) => sum + effect.intercept, 0);
  close(total, 0, 0.5, 'sum of BLUP intercepts');
  for (const effect of fit!.randomEffects) {
    assert.ok(effect.interceptSe > 0, `${effect.group}: intercept se`);
    assert.ok(Number.isFinite(effect.intercept));
    assert.equal(effect.n, 10);
    assert.equal(effect.slope, 0);
  }

  const slopeFit = fitGlmm(input(gaussianSlopeSample(), { randomSlope: true }));
  assert.ok(slopeFit);
  for (const effect of slopeFit!.randomEffects) {
    assert.ok(effect.interceptSe > 0, `${effect.group}: intercept se`);
    assert.ok(effect.slopeSe > 0, `${effect.group}: slope se`);
  }
});

test('invalid family/link combinations and malformed responses return null', () => {
  const sample = gaussianInterceptSample();
  assert.equal(fitGlmm(input(sample, { family: 'gamma' as never })), null);
  assert.equal(fitGlmm(input(sample, { link: 'probit' as never })), null);
  assert.equal(fitGlmm(input(sample, { family: 'binomial', link: 'log' })), null);
  assert.equal(fitGlmm(input(sample, { family: 'poisson', link: 'identity' })), null);
  assert.deepEqual(GLMM_LINKS.gaussian, ['identity']);
  assert.deepEqual(GLMM_LINKS.binomial, ['logit']);
  assert.deepEqual(GLMM_LINKS.poisson, ['log']);

  // Binomial responses must be 0/1.
  const nonBinary = { ...sample, y: sample.y.map(value => (value > 2 ? 1 : 0.5)) };
  assert.equal(fitGlmm(input(nonBinary, { family: 'binomial', link: 'logit' })), null);

  // Poisson responses cannot be negative.
  const negative = { ...sample, y: sample.y.map((value, index) => (index === 0 ? -1 : value)) };
  assert.equal(fitGlmm(input(negative, { family: 'poisson', link: 'log' })), null);
});

test('structural guards return null: misaligned rows, one group, tiny or unbalanced groups, singular design', () => {
  const sample = gaussianInterceptSample();

  // Misaligned group labels / slope vector.
  assert.equal(fitGlmm(input(sample, { groups: sample.groups.slice(1) })), null);
  assert.equal(fitGlmm(input({ ...sample, slope: undefined }, { randomSlope: true })), null);

  // Fewer than two groups.
  assert.equal(fitGlmm(input(sample, { groups: sample.groups.map(() => 'single') })), null);

  // A group with a single observation.
  const tiny = { ...sample, groups: sample.groups.map((label, index) => (index === 0 ? 'lonely' : label)) };
  assert.equal(fitGlmm(input(tiny, {})), null);

  // Too few observations for the design.
  const shortSample = { ...sample, y: sample.y.slice(0, 2), x: sample.x.slice(0, 2), groups: ['a', 'b'], slope: [0, 1] };
  assert.equal(fitGlmm(input(shortSample, {})), null);

  // Rank-deficient design (duplicated column).
  const singular = { ...sample, x: sample.x.map(row => [row[0], row[1], row[1]]) };
  assert.equal(fitGlmm(input(singular, {})), null);

  // Empty labels are rejected.
  const emptyLabel = { ...sample, groups: sample.groups.map((label, index) => (index === 0 ? '  ' : label)) };
  assert.equal(fitGlmm(input(emptyLabel, {})), null);

  // Exhausted iteration budget.
  assert.equal(fitGlmm(input(sample, { maxIterations: 1 })), null);
});

test('AIC, k and the parameter count are coherent on a converged Gaussian fit', () => {
  const sample = gaussianInterceptSample();
  const fit = fitGlmm(input(sample, {}));
  assert.ok(fit);
  const p = sample.x[0].length;
  // Fixed effects + one random-effect variance + the residual variance.
  assert.equal(fit!.k, p + 1 + 1);
  assert.equal(fit!.n, sample.y.length);
  assert.equal(fit!.groups, 10);
  assert.equal(fit!.df, fit!.n - fit!.k);
  close(fit!.aic, -2 * fit!.logLik + 2 * fit!.k, 1e-9, 'AIC');
  close(fit!.bic, -2 * fit!.logLik + fit!.k * Math.log(fit!.n), 1e-9, 'BIC');

  const slopeFit = fitGlmm(input(gaussianSlopeSample(), { randomSlope: true }));
  assert.ok(slopeFit);
  // beta (2) + intercept variance + slope variance + correlation + residual.
  assert.equal(slopeFit!.k, 2 + 3 + 1);

  const binomialFit = fitGlmm(input(binomialSample(), { family: 'binomial', link: 'logit' }));
  assert.ok(binomialFit);
  // beta (2) + intercept variance (no residual variance).
  assert.equal(binomialFit!.k, 3);
});

test('repeated calls are deterministic', () => {
  const sample = gaussianSlopeSample();
  const first = fitGlmm(input(sample, { randomSlope: true }));
  const second = fitGlmm(input(sample, { randomSlope: true }));
  assert.ok(first && second);
  assert.deepEqual(first, second);
});
