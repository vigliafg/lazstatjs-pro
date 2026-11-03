import test from 'node:test';
import assert from 'node:assert/strict';
import { fitGlmm, type GlmmFamily, type GlmmLink } from '../kernels/glmm';
import { addIntercept } from '../kernels/glm';
import { assertClose, assertCloseVector, loadFixture } from './harness';

interface FixtureCoefficient {
  term: string;
  beta: number;
  se: number;
}

interface FixtureRandomEffect {
  group: string;
  intercept: number;
  interceptSe: number;
  slope: number;
  slopeSe: number;
}

interface GlmmFixtureCase {
  name: string;
  family: GlmmFamily;
  link: GlmmLink;
  randomSlope: boolean;
  y: number[];
  /** One row per observation, without the intercept column. */
  x: number[][];
  slope: number[];
  groups: string[];
  coefficients: FixtureCoefficient[];
  random: {
    interceptVariance: number;
    slopeVariance: number;
    covariance: number;
    correlation: number;
    residualVariance: number | null;
  };
  logLik: number;
  aic: number;
  bic: number;
  fitted: number[];
  randomEffects: FixtureRandomEffect[];
}

interface GlmmFixture {
  source: string;
  generatedBy: string;
  cases: GlmmFixtureCase[];
}

const fixture = loadFixture<GlmmFixture>('glmm.json');

/**
 * lme4 reference for the Laplace GLMM kernel.
 *
 * Why the numbers can differ:
 *  - `glmer(nAGQ = 1)` is exactly the same Laplace approximation used here,
 *    and for Gaussian models Laplace is exact, so the log-likelihood must
 *    agree to optimiser accuracy.
 *  - The optimisers are different: lme4 maximises the profiled deviance with
 *    Nelder-Mead over `theta`, while the kernel runs BFGS + a Newton polish
 *    over all parameters. The fixture therefore uses `Nelder_Mead` with a
 *    large budget; on the flat variance surfaces the default optimisers stop
 *    a few 1e-5 away from the optimum.
 *  - SEs come from lme4's RX covariance (`use.hessian = FALSE`), i.e. the
 *    Hessian of the likelihood with respect to beta at fixed variance
 *    parameters. The kernel computes the same quantity numerically by
 *    re-solving the conditional modes at every perturbed beta, so the two
 *    definitions coincide; lme4's default `use.hessian = TRUE` would instead
 *    add the variance-parameter uncertainty and differ by ~3% on the flat
 *    `birthwt` surface.
 *
 * Measured worst gaps on this fixture (see the end of the test):
 * coefficients 2.2e-5, SE 7.9e-4, variance components 3.9e-5 relative,
 * logLik 1.1e-5, AIC 2.1e-5, fitted 6.2e-5.
 */
test('GLMM matches lme4::lmer and lme4::glmer (Laplace) fixtures', () => {
  assert.ok(fixture.cases.length >= 4);
  let worstCoefficient = 0;
  let worstSe = 0;
  let worstVariance = 0;
  let worstLogLik = 0;
  let worstAic = 0;
  let worstFitted = 0;
  let worstRandomEffect = 0;
  let worstRandomEffectSe = 0;

  for (const reference of fixture.cases) {
    const fit = fitGlmm({
      y: reference.y,
      x: addIntercept(reference.x),
      slope: reference.slope,
      groups: reference.groups,
      family: reference.family,
      link: reference.link,
      randomSlope: reference.randomSlope,
    });
    assert.ok(fit, `${reference.name}: the model did not converge`);
    assert.equal(fit!.family, reference.family, `${reference.name}: family`);
    assert.equal(fit!.link, reference.link, `${reference.name}: link`);
    assert.equal(fit!.randomSlope, reference.randomSlope, `${reference.name}: random slope flag`);
    assert.equal(fit!.converged, true, `${reference.name}: converged flag`);

    // Coefficients: absolute 1e-3 (different optimisers). The kernel labels
    // columns by position (`(Intercept)`, `X1`, ...) because the design matrix
    // carries no names, so only the position is compared here.
    assert.equal(fit!.coefficients.length, reference.coefficients.length, `${reference.name}: p`);
    fit!.coefficients.forEach((coefficient, index) => {
      const expected = reference.coefficients[index];
      worstCoefficient = Math.max(worstCoefficient, Math.abs(coefficient.beta - expected.beta));
      assertClose(coefficient.beta, expected.beta, 1e-3, `${reference.name} beta[${expected.term}]`);
    });

    // Standard errors: absolute 2e-3.
    fit!.coefficients.forEach((coefficient, index) => {
      worstSe = Math.max(worstSe, Math.abs(coefficient.se - reference.coefficients[index].se));
      assertClose(
        coefficient.se,
        reference.coefficients[index].se,
        2e-3,
        `${reference.name} se[${reference.coefficients[index].term}]`
      );
    });

    // Variance components: relative 5e-2 with an absolute floor of 1e-4.
    const varianceTolerance = { relative: 5e-2, absolute: 1e-4 };
    const components: [string, number, number][] = [
      ['interceptVariance', fit!.random.interceptVariance, reference.random.interceptVariance],
      ['slopeVariance', fit!.random.slopeVariance, reference.random.slopeVariance],
      ['covariance', fit!.random.covariance, reference.random.covariance],
      ['correlation', fit!.random.correlation, reference.random.correlation],
    ];
    if (reference.random.residualVariance !== null) {
      components.push(['residualVariance', fit!.random.residualVariance, reference.random.residualVariance]);
    } else {
      assert.ok(Number.isNaN(fit!.random.residualVariance), `${reference.name}: residual variance is NaN`);
    }
    for (const [label, actual, expected] of components) {
      worstVariance = Math.max(
        worstVariance,
        Math.abs(actual - expected) / Math.max(1e-12, Math.abs(expected))
      );
      assertClose(actual, expected, varianceTolerance, `${reference.name} ${label}`);
    }

    // Laplace / ML log-likelihood and AIC: absolute 1e-2.
    worstLogLik = Math.max(worstLogLik, Math.abs(fit!.logLik - reference.logLik));
    assertClose(fit!.logLik, reference.logLik, 1e-2, `${reference.name} logLik`);
    worstAic = Math.max(worstAic, Math.abs(fit!.aic - reference.aic));
    assertClose(fit!.aic, reference.aic, 1e-2, `${reference.name} AIC`);

    // Fitted values (response scale): absolute 1e-3.
    assertCloseVector(fit!.fitted, reference.fitted, 1e-3, `${reference.name} fitted`);
    fit!.fitted.forEach((value, index) => {
      worstFitted = Math.max(worstFitted, Math.abs(value - reference.fitted[index]));
    });

    // BLUPs, matched by group label (the kernel keeps first-appearance order,
    // R keeps factor-level order).
    assert.equal(fit!.randomEffects.length, reference.randomEffects.length, `${reference.name}: groups`);
    const byLabel = new Map(fit!.randomEffects.map(effect => [effect.group, effect]));
    for (const expected of reference.randomEffects) {
      const actual = byLabel.get(expected.group);
      assert.ok(actual, `${reference.name}: missing group ${expected.group}`);
      worstRandomEffect = Math.max(
        worstRandomEffect,
        Math.abs(actual!.intercept - expected.intercept),
        Math.abs(actual!.slope - expected.slope)
      );
      worstRandomEffectSe = Math.max(
        worstRandomEffectSe,
        Math.abs(actual!.interceptSe - expected.interceptSe),
        Math.abs(actual!.slopeSe - expected.slopeSe)
      );
      assertClose(actual!.intercept, expected.intercept, 2e-3, `${reference.name} BLUP ${expected.group}`);
      assertClose(actual!.slope, expected.slope, 2e-3, `${reference.name} BLUP slope ${expected.group}`);
      // lme4 reports the same `sqrt(diag(H_g^-1))` posterior standard errors.
      assertClose(actual!.interceptSe, expected.interceptSe, 2e-3, `${reference.name} BLUP se ${expected.group}`);
      assertClose(actual!.slopeSe, expected.slopeSe, 2e-3, `${reference.name} BLUP slope se ${expected.group}`);
    }
  }

  // Guard rails: keep the measured accuracy visible, so a silent regression
  // in the optimiser is noticed even if the declared tolerances still pass.
  assert.ok(worstCoefficient < 5e-3, `coefficient drift ${worstCoefficient}`);
  assert.ok(worstSe < 5e-3, `SE drift ${worstSe}`);
  assert.ok(worstVariance < 5e-2, `variance drift ${worstVariance}`);
  assert.ok(worstLogLik < 1e-2, `logLik drift ${worstLogLik}`);
  assert.ok(worstAic < 1e-2, `AIC drift ${worstAic}`);
  assert.ok(worstFitted < 1e-3, `fitted drift ${worstFitted}`);
  assert.ok(worstRandomEffect < 2e-3, `BLUP drift ${worstRandomEffect}`);
  assert.ok(worstRandomEffectSe < 2e-3, `BLUP SE drift ${worstRandomEffectSe}`);
});
