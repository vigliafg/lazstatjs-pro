import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { addIntercept, glmFit } from './glm';

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

const x = [[1], [2], [3], [4], [5]];

describe('GLM via IRLS', () => {
  it('matches the Gaussian identity fit', () => {
    const model = glmFit({
      y: [2.1, 3.9, 6.2, 7.8, 10.1],
      x: addIntercept(x),
      family: 'gaussian',
      link: 'identity',
    });
    assert.ok(model);
    close(model!.coefficients[0].beta, 0.05, 1e-6);
    close(model!.coefficients[1].beta, 1.99, 1e-6);
    close(model!.coefficients[0].se, 0.19807406, 1e-6);
    close(model!.coefficients[1].se, 0.05972158, 1e-6);
    close(model!.deviance, 0.107, 1e-6);
    close(model!.nullDeviance, 39.708, 1e-6);
    close(model!.logLik, 2.516218, 1e-5);
    close(model!.aic, 0.9675635, 1e-5);
  });

  it('matches the binomial logit fit', () => {
    const model = glmFit({
      y: [0, 0, 0, 1, 0, 1, 1, 1, 1, 1],
      x: addIntercept([[-2], [-1.5], [-1], [-0.5], [0], [0.5], [1], [1.5], [2], [2.5]]),
      family: 'binomial',
      link: 'logit',
    });
    assert.ok(model);
    close(model!.coefficients[0].beta, 0.6525847, 1e-5);
    close(model!.coefficients[1].beta, 2.5908742, 1e-5);
    close(model!.coefficients[0].se, 1.211553119678, 1e-6);
    close(model!.coefficients[1].se, 1.690184826312, 1e-6);
    close(model!.deviance, 5.013792, 1e-5);
    close(model!.nullDeviance, 13.46023, 1e-5);
    close(model!.logLik, -2.506896, 1e-5);
  });

  it('matches the binomial probit fit', () => {
    const model = glmFit({
      y: [0, 0, 0, 1, 0, 1, 1, 1, 1, 1],
      x: addIntercept([[-2], [-1.5], [-1], [-0.5], [0], [0.5], [1], [1.5], [2], [2.5]]),
      family: 'binomial',
      link: 'probit',
    });
    assert.ok(model);
    close(model!.coefficients[0].beta, 0.39066385, 1e-4);
    close(model!.coefficients[1].beta, 1.56117735, 1e-4);
    close(model!.coefficients[0].se, 0.69722822, 1e-4);
    close(model!.coefficients[1].se, 0.93552186, 1e-4);
    close(model!.deviance, 4.851848, 1e-5);
  });

  it('matches the Poisson log fit', () => {
    const model = glmFit({
      y: [1, 2, 2, 4, 3, 6, 7, 9],
      x: addIntercept([[0], [1], [2], [3], [4], [5], [6], [7]]),
      family: 'poisson',
      link: 'log',
    });
    assert.ok(model);
    close(model!.coefficients[0].beta, 0.2756272, 1e-5);
    close(model!.coefficients[1].beta, 0.2786809, 1e-5);
    close(model!.coefficients[0].se, 0.44321037, 1e-4);
    close(model!.coefficients[1].se, 0.08421394, 1e-4);
    close(model!.deviance, 0.8137706, 1e-5);
    close(model!.nullDeviance, 13.13061, 1e-5);
    close(model!.logLik, -12.90868, 1e-4);
    close(model!.aic, 29.81736, 1e-4);
  });

  it('matches the Gamma log fit', () => {
    const model = glmFit({
      y: [0.8, 1.2, 1.9, 2.4, 3.5, 4.1],
      x: addIntercept([[1], [2], [3], [4], [5], [6]]),
      family: 'gamma',
      link: 'log',
    });
    assert.ok(model);
    close(model!.coefficients[0].beta, -0.4695553227, 1e-6);
    close(model!.coefficients[1].beta, 0.3322025263, 1e-6);
    close(model!.coefficients[0].se, 0.0899365429, 1e-5);
    close(model!.coefficients[1].se, 0.0230935723, 1e-5);
    close(model!.deviance, 0.03734109, 1e-6);
    close(model!.nullDeviance, 1.801051, 1e-5);
    close(model!.dispersion, 0.00933297895, 1e-8);
    close(model!.logLik, 2.581267714, 1e-4);
  });

  it('rejects invalid designs and responses', () => {
    assert.equal(glmFit({ y: [], x: [], family: 'gaussian', link: 'identity' }), null);
    assert.equal(
      glmFit({
        y: [1, 2, 3],
        x: addIntercept([[1], [1], [1]]),
        family: 'gaussian',
        link: 'identity',
      }),
      null
    );
    assert.equal(
      glmFit({
        y: [0, 1, 2],
        x: addIntercept([[1], [2], [3]]),
        family: 'gamma',
        link: 'log',
      }),
      null
    );
  });
});
